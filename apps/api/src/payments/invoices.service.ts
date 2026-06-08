/**
 * Invoices Service
 *
 * Handles CRUD operations for invoices and invoice line items.
 * Supports staff-created invoices with automatic totals calculation,
 * and sends invoices to clients via SendGrid email.
 *
 * @module PaymentsModule
 *
 * @example
 * ```typescript
 * const invoice = await invoicesService.createInvoice({
 *   clientProfileId: 'uuid',
 *   dueDate: '2026-04-01',
 *   items: [{ description: 'Legal consultation', quantity: 1, unitPrice: 50000 }],
 * });
 * ```
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { SupabaseService } from '../database/supabase.service';
import { STAFF_ROLES } from '../common/constants/roles';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import type { Configuration } from '../config/configuration';
import {
  InvoiceStatus,
  type CreateInvoiceData,
  type UpdateInvoiceData,
  type AddInvoiceItemData,
  type InvoiceFilters,
  type InvoiceItem,
  type InvoiceResponse,
  type PaginatedInvoicesResponse,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** DB row shape for the invoices table */
interface InvoiceRow {
  id: string;
  invoice_number: string | null;
  client_profile_id: string | null;
  email: string | null;
  case_id: string | null;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  payment_terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** DB row shape for invoice_items table */
interface InvoiceItemRow {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
}

/** Invoice row joined with its items */
interface InvoiceWithItemsRow extends InvoiceRow {
  invoice_items: InvoiceItemRow[];
}

/**
 * Manages invoice lifecycle: creation, updates, line items, totals, and email delivery.
 *
 * @class InvoicesService
 */
@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService<Configuration>,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Creates a new invoice with line items.
   *
   * Inserts the invoice header, inserts all line items, then recalculates
   * and saves totals. Returns the full invoice with items.
   *
   * @param dto - Invoice creation data including items
   * @returns Created invoice with line items
   * @throws {BadRequestException} If insert fails
   *
   * @example
   * ```typescript
   * const invoice = await invoicesService.createInvoice({
   *   clientProfileId: 'uuid',
   *   dueDate: '2026-04-01',
   *   items: [{ description: 'Document review', quantity: 2, unitPrice: 15000 }],
   * });
   * ```
   */
  async createInvoice(dto: CreateInvoiceData): Promise<InvoiceResponse> {
    this.logger.log(`Creating invoice for client: ${dto.clientProfileId}`);
    const adminClient = this.supabaseService.getAdminClient();

    const { data: invoice, error: invoiceError } = (await adminClient
      .from('invoices')
      .insert({
        client_profile_id: dto.clientProfileId ?? null,
        email: dto.email ?? null,
        case_id: dto.caseId ?? null,
        due_date: dto.dueDate,
        tax_amount: dto.taxAmount ?? 0,
        discount_amount: dto.discountAmount ?? 0,
        payment_terms: dto.paymentTerms ?? null,
        notes: dto.notes ?? null,
      })
      .select()
      .single()) as DbResult<InvoiceRow>;

    if (invoiceError || !invoice) {
      this.logger.error('Failed to create invoice', invoiceError);
      throw new BadRequestException('Failed to create invoice');
    }

    // Insert all line items
    const itemRows = dto.items.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    }));

    const { error: itemsError } = await adminClient
      .from('invoice_items')
      .insert(itemRows);

    if (itemsError) {
      this.logger.error('Failed to insert invoice items', itemsError);
      throw new BadRequestException('Failed to create invoice items');
    }

    // Recalculate totals
    await this.calculateAndSaveTotals(
      invoice.id,
      invoice.tax_amount,
      invoice.discount_amount,
    );

    return this.getInvoiceById(invoice.id, {
      id: '',
      userType: 'admin',
    } as AuthUser);
  }

  /**
   * Returns a paginated list of invoices.
   *
   * Clients see only their own invoices; staff see all.
   * Supports optional status and clientProfileId filters.
   *
   * @param filters - Pagination and filter params
   * @param user - Authenticated user
   * @returns Paginated invoice list
   *
   * @example
   * ```typescript
   * const result = await invoicesService.getInvoices({ page: 1, limit: 20 }, user);
   * ```
   */
  async getInvoices(
    filters: InvoiceFilters,
    user: AuthUser,
  ): Promise<PaginatedInvoicesResponse> {
    this.logger.log(`Fetching invoices for user ${user.id}`);
    const adminClient = this.supabaseService.getAdminClient();
    const { page = 1, limit = 20, status, clientProfileId } = filters;
    const offset = (page - 1) * limit;

    let query = adminClient.from('invoices').select('*', { count: 'exact' });

    // Clients see their own invoices: linked by clientProfileId OR unlinked by email
    if (!STAFF_ROLES.includes(user.userType)) {
      if (user.clientProfileId) {
        query = query.or(
          `client_profile_id.eq.${user.clientProfileId},and(email.eq.${user.email},client_profile_id.is.null)`,
        );
      } else if (user.email) {
        query = query.eq('email', user.email).is('client_profile_id', null);
      } else {
        return { data: [], total: 0, page, limit };
      }
    } else if (clientProfileId) {
      query = query.eq('client_profile_id', clientProfileId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = (await query) as DbListResult<InvoiceRow>;

    if (error) {
      this.logger.error('Failed to fetch invoices', error);
      throw new BadRequestException('Failed to fetch invoices');
    }

    return {
      data: (data ?? []).map((row) => this.mapInvoiceRow(row)),
      total: count ?? 0,
      page,
      limit,
    };
  }

  /**
   * Returns a single invoice with all its line items.
   *
   * Clients can only view their own invoices.
   *
   * @param id - Invoice UUID
   * @param user - Authenticated user
   * @returns Invoice with items
   * @throws {NotFoundException} If invoice not found
   * @throws {ForbiddenException} If client tries to access another's invoice
   *
   * @example
   * ```typescript
   * const invoice = await invoicesService.getInvoiceById('invoice-uuid', user);
   * ```
   */
  async getInvoiceById(id: string, user: AuthUser): Promise<InvoiceResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', id)
      .single()) as DbResult<InvoiceWithItemsRow>;

    if (error || !data) {
      throw new NotFoundException('Invoice not found');
    }

    // Client access check: must own by clientProfileId or matching email (unlinked)
    if (!STAFF_ROLES.includes(user.userType)) {
      const ownedByProfile =
        user.clientProfileId && data.client_profile_id === user.clientProfileId;
      const ownedByEmail = !data.client_profile_id && data.email === user.email;
      if (!ownedByProfile && !ownedByEmail) {
        throw new ForbiddenException('Access denied to this invoice');
      }
    }

    return this.mapInvoiceRow(data, data.invoice_items);
  }

  /**
   * Updates mutable fields on an invoice.
   *
   * @param id - Invoice UUID
   * @param dto - Fields to update
   * @returns Updated invoice
   * @throws {NotFoundException} If invoice not found
   *
   * @example
   * ```typescript
   * const updated = await invoicesService.updateInvoice('uuid', { status: InvoiceStatus.SENT });
   * ```
   */
  async updateInvoice(
    id: string,
    dto: UpdateInvoiceData,
  ): Promise<InvoiceResponse> {
    this.logger.log(`Updating invoice ${id}`);
    const adminClient = this.supabaseService.getAdminClient();

    const updateData: Record<string, unknown> = {};
    if (dto.dueDate !== undefined) updateData.due_date = dto.dueDate;
    if (dto.taxAmount !== undefined) updateData.tax_amount = dto.taxAmount;
    if (dto.discountAmount !== undefined)
      updateData.discount_amount = dto.discountAmount;
    if (dto.paymentTerms !== undefined)
      updateData.payment_terms = dto.paymentTerms;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { error } = await adminClient
      .from('invoices')
      .update(updateData)
      .eq('id', id);

    if (error) {
      this.logger.error(`Failed to update invoice ${id}`, error);
      throw new NotFoundException('Invoice not found or update failed');
    }

    // Recalculate totals if tax or discount changed
    if (dto.taxAmount !== undefined || dto.discountAmount !== undefined) {
      const { data: inv } = (await adminClient
        .from('invoices')
        .select('tax_amount, discount_amount')
        .eq('id', id)
        .single()) as DbResult<{ tax_amount: number; discount_amount: number }>;
      if (inv) {
        await this.calculateAndSaveTotals(
          id,
          inv.tax_amount,
          inv.discount_amount,
        );
      }
    }

    return this.getInvoiceById(id, { id: '', userType: 'admin' } as AuthUser);
  }

  /**
   * Adds a single line item to an existing invoice and recalculates totals.
   *
   * @param invoiceId - Invoice UUID
   * @param dto - Line item data
   * @returns Newly created invoice item
   * @throws {BadRequestException} If insert fails
   *
   * @example
   * ```typescript
   * const item = await invoicesService.addInvoiceItem('invoice-uuid', {
   *   description: 'Filing fee', quantity: 1, unitPrice: 5000,
   * });
   * ```
   */
  async addInvoiceItem(
    invoiceId: string,
    dto: AddInvoiceItemData,
  ): Promise<InvoiceItem> {
    this.logger.log(`Adding item to invoice ${invoiceId}`);
    const adminClient = this.supabaseService.getAdminClient();
    const amount = dto.quantity * dto.unitPrice;

    const { data, error } = (await adminClient
      .from('invoice_items')
      .insert({
        invoice_id: invoiceId,
        description: dto.description,
        quantity: dto.quantity,
        unit_price: dto.unitPrice,
        amount,
      })
      .select()
      .single()) as DbResult<InvoiceItemRow>;

    if (error || !data) {
      this.logger.error(`Failed to add item to invoice ${invoiceId}`, error);
      throw new BadRequestException('Failed to add invoice item');
    }

    // Fetch current tax/discount, then recalculate
    const { data: inv } = (await adminClient
      .from('invoices')
      .select('tax_amount, discount_amount')
      .eq('id', invoiceId)
      .single()) as DbResult<{ tax_amount: number; discount_amount: number }>;

    if (inv) {
      await this.calculateAndSaveTotals(
        invoiceId,
        inv.tax_amount,
        inv.discount_amount,
      );
    }

    return this.mapItemRow(data);
  }

  /**
   * Sends an invoice to the client via email and marks status as 'sent'.
   *
   * Fetches client email from user_profiles, then sends HTML email via SendGrid.
   *
   * @param invoiceId - Invoice UUID
   * @returns Updated invoice with status 'sent'
   * @throws {NotFoundException} If invoice or client profile not found
   * @throws {BadRequestException} If already paid or cancelled
   *
   * @example
   * ```typescript
   * const sent = await invoicesService.sendInvoice('invoice-uuid');
   * // sent.status === 'sent'
   * ```
   */
  async sendInvoice(invoiceId: string): Promise<InvoiceResponse> {
    this.logger.log(`Sending invoice ${invoiceId}`);
    const adminClient = this.supabaseService.getAdminClient();

    const { data: invoice, error } = (await adminClient
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', invoiceId)
      .single()) as DbResult<InvoiceWithItemsRow>;

    if (error || !invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (
      invoice.status === InvoiceStatus.PAID ||
      invoice.status === InvoiceStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot send invoice with status: ${invoice.status}`,
      );
    }

    // Fetch client email via client_profiles → user_profiles join
    const { data: clientProfile } = (await adminClient
      .from('client_profiles')
      .select('user_profile_id, user_profiles(full_name)')
      .eq('id', invoice.client_profile_id)
      .single()) as DbResult<{
      user_profile_id: string;
      user_profiles: { full_name: string } | null;
    }>;

    const { data: authUser } = clientProfile?.user_profile_id
      ? await adminClient.auth.admin.getUserById(clientProfile.user_profile_id)
      : { data: null };

    const clientEmail = authUser?.user?.email;
    const clientName =
      clientProfile?.user_profiles?.full_name ?? 'Valued Client';

    if (clientEmail) {
      await this.sendInvoiceEmail(
        invoice,
        invoice.invoice_items ?? [],
        clientEmail,
        clientName,
      );
    } else {
      this.logger.warn(
        `No email found for client profile ${invoice.client_profile_id}`,
      );
    }

    // Update status to sent
    await adminClient
      .from('invoices')
      .update({ status: InvoiceStatus.SENT })
      .eq('id', invoiceId);

    return this.getInvoiceById(invoiceId, {
      id: '',
      userType: 'admin',
    } as AuthUser);
  }

  /**
   * Recalculates subtotal from invoice items and updates invoice totals.
   *
   * @param invoiceId - Invoice UUID
   * @param taxAmount - Current tax amount
   * @param discountAmount - Current discount amount
   */
  private async calculateAndSaveTotals(
    invoiceId: string,
    taxAmount: number,
    discountAmount: number,
  ): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: items } = (await adminClient
      .from('invoice_items')
      .select('amount')
      .eq('invoice_id', invoiceId)) as DbListResult<{ amount: number }>;

    const subtotal = (items ?? []).reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );
    const totalAmount = subtotal + Number(taxAmount) - Number(discountAmount);

    await adminClient
      .from('invoices')
      .update({ subtotal, total_amount: Math.max(0, totalAmount) })
      .eq('id', invoiceId);
  }

  /**
   * Sends an HTML invoice email via the shared SMTP mailer.
   */
  private async sendInvoiceEmail(
    invoice: InvoiceRow,
    items: InvoiceItemRow[],
    toEmail: string,
    toName: string,
  ): Promise<void> {
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td>${item.description}</td>
            <td style="text-align:right">${item.quantity}</td>
            <td style="text-align:right">PKR ${Number(item.unit_price).toLocaleString()}</td>
            <td style="text-align:right">PKR ${Number(item.amount).toLocaleString()}</td>
          </tr>`,
      )
      .join('');

    await this.mailerService.sendMail({
      to: toEmail,
      subject: `Invoice ${invoice.invoice_number ?? invoice.id} from AR&CO`,
      html: `
          <h2>Invoice from AR&CO Law Firm</h2>
          <p>Dear ${toName},</p>
          <p>Please find your invoice details below.</p>
          <p><strong>Invoice #:</strong> ${invoice.invoice_number ?? 'N/A'}</p>
          <p><strong>Issue Date:</strong> ${invoice.issue_date}</p>
          <p><strong>Due Date:</strong> ${invoice.due_date}</p>
          <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="text-align:right"><strong>Subtotal: PKR ${Number(invoice.subtotal).toLocaleString()}</strong></p>
          <p style="text-align:right">Tax: PKR ${Number(invoice.tax_amount).toLocaleString()}</p>
          <p style="text-align:right">Discount: PKR ${Number(invoice.discount_amount).toLocaleString()}</p>
          <p style="text-align:right"><strong>Total: PKR ${Number(invoice.total_amount).toLocaleString()}</strong></p>
          ${invoice.payment_terms ? `<p><strong>Payment Terms:</strong> ${invoice.payment_terms}</p>` : ''}
          ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
          <p>Best regards,<br/>AR&CO Team</p>
        `,
    });
  }

  /**
   * Links all guest invoices (no client_profile_id) for a given email to a client profile.
   * Called when a guest registers or logs in for the first time.
   *
   * @param email - The guest's email address
   * @param clientProfileId - The newly created client profile UUID
   *
   * @example
   * ```typescript
   * await invoicesService.linkInvoicesByEmail('guest@example.com', 'client-profile-uuid');
   * ```
   */
  async linkInvoicesByEmail(
    email: string,
    clientProfileId: string,
  ): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();
    const { error } = await adminClient
      .from('invoices')
      .update({ client_profile_id: clientProfileId })
      .eq('email', email)
      .is('client_profile_id', null);

    if (error) {
      this.logger.warn(
        `Failed to link invoices for ${email}: ${error.message}`,
      );
    } else {
      this.logger.log(
        `Linked guest invoices for ${email} to client ${clientProfileId}`,
      );
    }
  }

  /** Maps an invoices DB row to InvoiceResponse (camelCase) */
  private mapInvoiceRow(
    row: InvoiceRow,
    items?: InvoiceItemRow[],
  ): InvoiceResponse {
    return {
      id: row.id,
      invoiceNumber: row.invoice_number,
      clientProfileId: row.client_profile_id,
      email: row.email,
      caseId: row.case_id,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      subtotal: Number(row.subtotal),
      taxAmount: Number(row.tax_amount),
      discountAmount: Number(row.discount_amount),
      totalAmount: Number(row.total_amount),
      status: row.status as InvoiceStatus,
      paymentTerms: row.payment_terms,
      notes: row.notes,
      items: items?.map((i) => this.mapItemRow(i)),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /** Maps an invoice_items DB row to InvoiceItem (camelCase) */
  private mapItemRow(row: InvoiceItemRow): InvoiceItem {
    return {
      id: row.id,
      invoiceId: row.invoice_id,
      description: row.description,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
      amount: Number(row.amount),
      createdAt: row.created_at,
    };
  }
}
