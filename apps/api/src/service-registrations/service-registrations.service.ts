import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../payments/mailer.service';
import { SupabaseService } from '../database/supabase.service';
import { PaymentProofService } from '../payments/payment-proof.service';
import { PaymentEmailService } from '../payments/payment-email.service';
import { InvoicesService } from '../payments/invoices.service';
import { STAFF_ROLES } from '../common/constants/roles';
import { validateSortColumn } from '../common/utils/query-helpers';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import type { Configuration } from '../config/configuration';
import {
  ServiceRegistrationStatus,
  ServiceRegistrationPaymentStatus,
  UserType,
  InvoiceStatus,
  type CreateServiceRegistrationData,
  type GuestStatusCheckData,
  type UpdateRegistrationStatusData,
  type AssignToData,
  type ReviewPaymentData,
  type ServiceRegistrationResponse,
  type ServiceRegistrationDocumentResponse,
  type GuestStatusResponse,
  type PaginatedServiceRegistrationsResponse,
  type PaginationParams,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for the service_registrations table with joined assigned user */
interface ServiceRegistrationRow {
  id: string;
  reference_number: string;
  service_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  cnic: string | null;
  address: string | null;
  description_of_need: string | null;
  payment_status: ServiceRegistrationPaymentStatus;
  lemonsqueezy_checkout_id: string | null;
  lemonsqueezy_order_id: string | null;
  payment_proof_path: string | null;
  payment_review_note: string | null;
  payment_confirmed_at: string | null;
  status: ServiceRegistrationStatus;
  client_profile_id: string | null;
  assigned_to_id: string | null;
  staff_notes: string | null;
  created_at: string;
  updated_at: string;
  case_id: string | null;
  /** Joined assigned user profile from user_profiles via assigned_to_id */
  assigned_to: { full_name: string } | null;
  /** Joined case data */
  case: { case_number: string } | null;
}

/** Database row shape for the services table (for validation) */
interface ServiceRow {
  id: string;
  name: string;
  registration_fee: number;
  is_active: boolean;
}

/** DB row for service_registration_documents */
interface ServiceRegistrationDocumentRow {
  id: string;
  registration_id: string;
  document_type_id: string;
  document_type_name: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  uploaded_at: string;
}

/**
 * Supabase select clause that joins assigned user profile
 * Uses a foreign-key relationship: service_registrations.assigned_to_id -> user_profiles.id
 */
const REGISTRATION_SELECT_WITH_JOINS =
  '*, assigned_to:user_profiles!service_registrations_assigned_to_id_fkey(full_name), case:cases!service_registrations_case_id_fkey(case_number)' as const;

/** Allowed sort columns for service registrations */
const ALLOWED_REGISTRATION_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'reference_number',
  'status',
  'payment_status',
] as const;

/**
 * Service for managing facilitation service registration lifecycle
 * Handles guest registration, status tracking, and staff management.
 *
 * @class ServiceRegistrationsService
 */
@Injectable()
export class ServiceRegistrationsService {
  private readonly logger = new Logger(ServiceRegistrationsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly paymentProofService: PaymentProofService,
    private readonly paymentEmailService: PaymentEmailService,
    private readonly invoicesService: InvoicesService,
    private readonly configService: ConfigService<Configuration>,
    private readonly mailerService: MailerService,
  ) {}

  /** Creates a new service registration (guest/unauthenticated access) */
  async createRegistration(
    dto: CreateServiceRegistrationData,
  ): Promise<ServiceRegistrationResponse> {
    this.logger.log(
      `Guest user creating registration for service ${dto.serviceId}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    // Validate service exists and is active
    const { data: service, error: serviceError } = (await adminClient
      .from('services')
      .select('id, name, registration_fee, is_active')
      .eq('id', dto.serviceId)
      .single()) as DbResult<ServiceRow>;

    if (serviceError || !service || !service.is_active) {
      this.logger.warn(
        `Service ${dto.serviceId} not found or inactive`,
        serviceError,
      );
      throw new NotFoundException('Service not found or inactive');
    }

    // Insert registration with snake_case mapping
    const { data, error } = (await adminClient
      .from('service_registrations')
      .insert({
        service_id: dto.serviceId,
        full_name: dto.fullName,
        email: dto.email,
        phone_number: dto.phoneNumber,
        cnic: dto.cnic ?? null,
        address: dto.address ?? null,
        description_of_need: dto.descriptionOfNeed ?? null,
      })
      .select(REGISTRATION_SELECT_WITH_JOINS)
      .single()) as DbResult<ServiceRegistrationRow>;

    if (error || !data) {
      this.logger.error(
        `Failed to create registration for service ${dto.serviceId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to create service registration',
      );
    }

    this.logger.log(
      `Registration ${data.reference_number} created successfully`,
    );

    // Notify the firm mailbox of the new registration (best-effort)
    await this.mailerService.sendToAdmin(
      `New service registration: ${data.reference_number} — ${service.name}`,
      `
        <h2>New Service Registration</h2>
        <p><strong>Reference:</strong> ${data.reference_number}</p>
        <p><strong>Service:</strong> ${service.name}</p>
        <p><strong>Name:</strong> ${data.full_name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone_number}</p>
        ${data.cnic ? `<p><strong>CNIC:</strong> ${data.cnic}</p>` : ''}
        ${data.description_of_need ? `<p><strong>Need:</strong> ${data.description_of_need}</p>` : ''}
        <p>Review it in the admin panel.</p>
      `,
      data.email,
    );

    return this.mapRegistrationRow(data);
  }

  /** Retrieves minimal status for a guest user (requires ref + email match) */
  async getRegistrationStatus(
    dto: GuestStatusCheckData,
  ): Promise<GuestStatusResponse> {
    this.logger.log(
      `Guest checking status for reference ${dto.referenceNumber}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('service_registrations')
      .select('reference_number, status, payment_status, created_at')
      .eq('reference_number', dto.referenceNumber)
      .eq('email', dto.email)
      .single()) as DbResult<{
      reference_number: string;
      status: ServiceRegistrationStatus;
      payment_status: ServiceRegistrationPaymentStatus;
      created_at: string;
    }>;

    if (error || !data) {
      this.logger.warn(
        `Registration ${dto.referenceNumber} not found or email mismatch`,
        error,
      );
      throw new NotFoundException('Registration not found');
    }

    return {
      referenceNumber: data.reference_number,
      status: data.status,
      paymentStatus: data.payment_status,
      createdAt: data.created_at,
    };
  }

  /** Retrieves service registrations with pagination (clients see own, staff see all) */
  async getRegistrations(
    user: AuthUser,
    pagination: PaginationParams,
  ): Promise<PaginatedServiceRegistrationsResponse> {
    this.logger.log(`Fetching registrations for user ${user.id}`);

    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit, sort, order } = pagination;
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('service_registrations')
      .select(REGISTRATION_SELECT_WITH_JOINS, { count: 'exact' });

    // If user is CLIENT, filter by their client_profile_id
    if (!STAFF_ROLES.includes(user.userType)) {
      if (!user.clientProfileId) {
        throw new BadRequestException('Client profile not found');
      }
      // Self-heal: link any of the client's email-matched guest registrations to
      // their profile before listing. Under manual payment a registration stays
      // unlinked (client_profile_id = null) until an admin confirms payment, which
      // can be days later — so without this the client cannot see their own
      // pending registration in the portal. claimRegistrations is best-effort and
      // idempotent (WHERE client_profile_id IS NULL AND email = user.email).
      await this.claimRegistrations(user);
      query = query.eq('client_profile_id', user.clientProfileId);
    }

    // Validate and apply pagination and sorting
    const validSort = validateSortColumn(
      sort,
      ALLOWED_REGISTRATION_SORT_COLUMNS,
    );
    query = query
      .order(validSort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } =
      (await query) as DbListResult<ServiceRegistrationRow>;

    if (error) {
      this.logger.error(
        `Failed to fetch registrations for user ${user.id}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch service registrations',
      );
    }

    const registrations = (data ?? []).map((row) =>
      this.mapRegistrationRow(row),
    );

    return {
      data: registrations,
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /** Retrieves a single service registration by ID (clients see own only) */
  async getRegistrationById(
    registrationId: string,
    user: AuthUser,
  ): Promise<ServiceRegistrationResponse> {
    this.logger.log(
      `Fetching registration ${registrationId} for user ${user.id}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('service_registrations')
      .select(REGISTRATION_SELECT_WITH_JOINS)
      .eq('id', registrationId)
      .single()) as DbResult<ServiceRegistrationRow>;

    if (error || !data) {
      this.logger.warn(`Registration ${registrationId} not found`);
      throw new NotFoundException('Registration not found');
    }

    const registration = this.mapRegistrationRow(data);

    // If user is CLIENT, verify they own this registration
    if (!STAFF_ROLES.includes(user.userType)) {
      if (registration.clientProfileId !== user.clientProfileId) {
        this.logger.warn(
          `Client ${user.clientProfileId} attempted to access registration ${registrationId} owned by ${registration.clientProfileId}`,
        );
        throw new ForbiddenException('Access denied to this registration');
      }
    }

    return registration;
  }

  /** Updates the status of a service registration (staff only) */
  async updateRegistrationStatus(
    registrationId: string,
    dto: UpdateRegistrationStatusData,
  ): Promise<ServiceRegistrationResponse> {
    this.logger.log(
      `Updating status for registration ${registrationId} to ${dto.status}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    const updateData: Record<string, unknown> = {
      status: dto.status,
    };

    if (dto.staffNotes !== undefined) {
      updateData.staff_notes = dto.staffNotes;
    }

    const { data, error } = (await adminClient
      .from('service_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .select(REGISTRATION_SELECT_WITH_JOINS)
      .single()) as DbResult<ServiceRegistrationRow>;

    if (error || !data) {
      this.logger.error(
        `Failed to update registration ${registrationId}`,
        error,
      );
      throw new NotFoundException('Registration not found');
    }

    this.logger.log(
      `Registration ${registrationId} status updated successfully`,
    );
    return this.mapRegistrationRow(data);
  }

  /**
   * Assigns a service registration to a user (staff/attorney).
   * Auto-transitions status to IN_PROGRESS if currently PENDING_PAYMENT or PAID.
   *
   * @param registrationId - The registration UUID
   * @param dto - Assignment data containing the assignee's user profile ID
   * @returns The updated registration
   * @throws {NotFoundException} If registration not found
   * @throws {InternalServerErrorException} If assignment fails
   *
   * @example
   * ```typescript
   * const assigned = await service.assignRegistration(
   *   'reg-uuid',
   *   { assignedToId: 'user-profile-uuid' }
   * );
   * ```
   */
  async assignRegistration(
    registrationId: string,
    dto: AssignToData,
  ): Promise<ServiceRegistrationResponse> {
    this.logger.log(
      `Assigning registration ${registrationId} to user ${dto.assignedToId}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    // First fetch the registration to check current status
    const { data: currentRegistration, error: fetchError } = (await adminClient
      .from('service_registrations')
      .select('status')
      .eq('id', registrationId)
      .single()) as DbResult<{ status: ServiceRegistrationStatus }>;

    if (fetchError || !currentRegistration) {
      this.logger.error(
        `Failed to fetch registration ${registrationId}`,
        fetchError,
      );
      throw new NotFoundException('Registration not found');
    }

    const updateData: Record<string, unknown> = {
      assigned_to_id: dto.assignedToId,
    };

    // If registration status is 'pending_payment' or 'paid', auto-transition to 'in_progress'
    if (
      currentRegistration.status ===
        ServiceRegistrationStatus.PENDING_PAYMENT ||
      currentRegistration.status === ServiceRegistrationStatus.PAID
    ) {
      updateData.status = ServiceRegistrationStatus.IN_PROGRESS;
    }

    const { data, error } = (await adminClient
      .from('service_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .select(REGISTRATION_SELECT_WITH_JOINS)
      .single()) as DbResult<ServiceRegistrationRow>;

    if (error || !data) {
      this.logger.error(
        `Failed to assign registration ${registrationId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to assign registration');
    }

    this.logger.log(`Registration ${registrationId} assigned successfully`);
    return this.mapRegistrationRow(data);
  }

  /**
   * Uploads a document file to Supabase Storage and saves metadata to DB.
   * The endpoint is public — UUID registrationId acts as the access token.
   */
  async uploadDocument(
    registrationId: string,
    file: Express.Multer.File,
    documentTypeId: string,
    documentTypeName: string,
  ): Promise<ServiceRegistrationDocumentResponse> {
    this.logger.log(`Uploading document for registration ${registrationId}`);

    const adminClient = this.supabaseService.getAdminClient();

    // Verify registration exists
    const { data: reg, error: regError } = (await adminClient
      .from('service_registrations')
      .select('id')
      .eq('id', registrationId)
      .single()) as DbResult<{ id: string }>;

    if (regError || !reg) {
      throw new NotFoundException('Registration not found');
    }

    // Build storage path: registrationId/documentTypeId/timestamp-filename
    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${registrationId}/${documentTypeId}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await adminClient.storage
      .from('service-registration-documents')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      this.logger.error(
        `Storage upload failed for registration ${registrationId}`,
        uploadError,
      );
      throw new InternalServerErrorException('Failed to upload document');
    }

    const { data, error } = (await adminClient
      .from('service_registration_documents')
      .insert({
        registration_id: registrationId,
        document_type_id: documentTypeId,
        document_type_name: documentTypeName,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        storage_path: storagePath,
      })
      .select()
      .single()) as DbResult<ServiceRegistrationDocumentRow>;

    if (error || !data) {
      this.logger.error(
        `Failed to save document metadata for registration ${registrationId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to save document metadata',
      );
    }

    this.logger.log(
      `Document uploaded for registration ${registrationId}: ${data.id}`,
    );
    return this.mapDocumentRow(data);
  }

  /** Lists all documents for a service registration (staff/admin only) */
  async listDocuments(
    registrationId: string,
  ): Promise<ServiceRegistrationDocumentResponse[]> {
    this.logger.log(`Listing documents for registration ${registrationId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('service_registration_documents')
      .select('*')
      .eq('registration_id', registrationId)
      .order('uploaded_at', {
        ascending: true,
      })) as DbListResult<ServiceRegistrationDocumentRow>;

    if (error) {
      this.logger.error(
        `Failed to list documents for registration ${registrationId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch documents');
    }

    return (data ?? []).map((row) => this.mapDocumentRow(row));
  }

  /** Generates a signed download URL for a document (staff/admin only, 1hr expiry) */
  async getDocumentDownloadUrl(
    registrationId: string,
    docId: string,
  ): Promise<{ url: string; fileName: string }> {
    this.logger.log(`Generating download URL for document ${docId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data: doc, error: docError } = (await adminClient
      .from('service_registration_documents')
      .select('storage_path, file_name')
      .eq('id', docId)
      .eq('registration_id', registrationId)
      .single()) as DbResult<{ storage_path: string; file_name: string }>;

    if (docError || !doc) {
      throw new NotFoundException('Document not found');
    }

    const { data, error } = await adminClient.storage
      .from('service-registration-documents')
      .createSignedUrl(doc.storage_path, 3600);

    if (error || !data?.signedUrl) {
      this.logger.error(
        `Failed to generate signed URL for doc ${docId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to generate download URL');
    }

    return { url: data.signedUrl, fileName: doc.file_name };
  }

  /**
   * Links all guest registrations matching the authenticated user's email
   * to their client profile. Safe to call on every login — already-linked
   * registrations are ignored by the WHERE clause.
   *
   * @param user - The authenticated user
   * @returns Number of registrations claimed
   *
   * @example
   * ```typescript
   * const result = await service.claimRegistrations(user);
   * // result.claimed === 2 means two guest registrations were linked
   * ```
   */
  async claimRegistrations(user: AuthUser): Promise<{ claimed: number }> {
    this.logger.log(
      `Claiming guest registrations for user ${user.id} (${user.email})`,
    );

    if (!user.email) {
      return { claimed: 0 };
    }

    if (!user.clientProfileId) {
      this.logger.warn(
        `User ${user.id} has no clientProfileId — skipping claim`,
      );
      return { claimed: 0 };
    }

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient
      .from('service_registrations')
      .update({ client_profile_id: user.clientProfileId })
      .eq('email', user.email)
      .is('client_profile_id', null)
      .select('id');

    if (error) {
      this.logger.error(
        `Failed to claim registrations for user ${user.id}`,
        error,
      );
      // Non-fatal — don't throw, just return 0
      return { claimed: 0 };
    }

    const claimed = data?.length ?? 0;
    if (claimed > 0) {
      this.logger.log(
        `Claimed ${claimed} guest registration(s) for user ${user.id}`,
      );
    }
    return { claimed };
  }

  /**
   * Uploads a manual payment screenshot for a registration.
   *
   * Stores the screenshot in the private `payment-proofs` bucket and advances
   * the registration to `awaiting_confirmation` for admin review. Re-upload is
   * allowed while payment is not yet confirmed.
   *
   * @param registrationId - The service registration UUID
   * @param file - Uploaded screenshot (jpg/png/webp/pdf)
   * @returns Updated registration
   * @throws {NotFoundException} If the registration does not exist
   * @throws {BadRequestException} If payment already confirmed
   *
   * @example
   * ```typescript
   * const reg = await service.uploadPaymentProof('reg-uuid', file);
   * // reg.paymentStatus → 'awaiting_confirmation'
   * ```
   */
  async uploadPaymentProof(
    registrationId: string,
    file: Express.Multer.File,
  ): Promise<ServiceRegistrationResponse> {
    this.logger.log(
      `Uploading payment proof for registration: ${registrationId}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    const { data: reg, error } = (await adminClient
      .from('service_registrations')
      .select('id, payment_status')
      .eq('id', registrationId)
      .single()) as DbResult<{
      id: string;
      payment_status: ServiceRegistrationPaymentStatus;
    }>;

    if (error || !reg) {
      throw new NotFoundException('Registration not found');
    }
    if (reg.payment_status === ServiceRegistrationPaymentStatus.PAID) {
      throw new BadRequestException('Payment already confirmed');
    }

    const { storagePath } = await this.paymentProofService.uploadProof(
      `service-registrations/${registrationId}`,
      file,
    );

    const { data: updated, error: updateError } = (await adminClient
      .from('service_registrations')
      .update({
        payment_proof_path: storagePath,
        payment_status: ServiceRegistrationPaymentStatus.AWAITING_CONFIRMATION,
      })
      .eq('id', registrationId)
      .select(REGISTRATION_SELECT_WITH_JOINS)
      .single()) as DbResult<ServiceRegistrationRow>;

    if (updateError || !updated) {
      this.logger.error('Failed to record payment proof', updateError);
      throw new BadRequestException('Failed to record payment proof');
    }

    this.logger.log(
      `Payment proof recorded for registration ${registrationId}`,
    );
    return this.mapRegistrationRow(updated);
  }

  /**
   * Generates a short-lived signed URL for an admin to view the payment proof.
   *
   * @param registrationId - The service registration UUID
   * @returns `{ url }` — signed URL valid for 1 hour
   * @throws {NotFoundException} If registration or proof not found
   */
  async getPaymentProofUrl(registrationId: string): Promise<{ url: string }> {
    const adminClient = this.supabaseService.getAdminClient();
    const { data: reg, error } = (await adminClient
      .from('service_registrations')
      .select('payment_proof_path')
      .eq('id', registrationId)
      .single()) as DbResult<{ payment_proof_path: string | null }>;

    if (error || !reg) {
      throw new NotFoundException('Registration not found');
    }
    if (!reg.payment_proof_path) {
      throw new NotFoundException(
        'No payment proof uploaded for this registration',
      );
    }

    const url = await this.paymentProofService.getSignedProofUrl(
      reg.payment_proof_path,
    );
    return { url };
  }

  /**
   * Reviews a manually-uploaded payment (admin action): confirm or flag.
   *
   * - `confirm`: marks the registration paid (payment_status + status = paid),
   *   records who/when, auto-creates the client account if needed, creates a
   *   PAID invoice, and emails the client. Idempotent — a no-op if already paid.
   * - `flag`: marks payment `flagged`, stores the admin note, and emails the
   *   client. The registration itself continues unchanged.
   *
   * @param registrationId - The service registration UUID
   * @param admin - Authenticated admin/staff user
   * @param dto - Review action + optional note/amount
   * @returns Updated registration
   * @throws {NotFoundException} If the registration does not exist
   *
   * @example
   * ```typescript
   * await service.reviewPayment('reg-uuid', admin, { action: 'confirm', amount: 5400 });
   * ```
   */
  async reviewPayment(
    registrationId: string,
    admin: AuthUser,
    dto: ReviewPaymentData,
  ): Promise<ServiceRegistrationResponse> {
    this.logger.log(
      `Admin ${admin.id} reviewing payment for registration ${registrationId} (${dto.action})`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    const { data: registration, error } = (await adminClient
      .from('service_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()) as DbResult<ServiceRegistrationRow>;

    if (error || !registration) {
      throw new NotFoundException('Registration not found');
    }

    // Idempotent confirm: already paid → return as-is.
    if (
      dto.action === 'confirm' &&
      registration.payment_status === ServiceRegistrationPaymentStatus.PAID
    ) {
      this.logger.log(
        `Registration ${registrationId} already paid — confirm is a no-op`,
      );
      const { data: current } = (await adminClient
        .from('service_registrations')
        .select(REGISTRATION_SELECT_WITH_JOINS)
        .eq('id', registrationId)
        .single()) as DbResult<ServiceRegistrationRow>;
      return this.mapRegistrationRow(current ?? registration);
    }

    if (dto.action === 'confirm') {
      const paidAmount = dto.amount ?? undefined;
      const update: Record<string, unknown> = {
        payment_status: ServiceRegistrationPaymentStatus.PAID,
        status: ServiceRegistrationStatus.PAID,
        payment_confirmed_by: admin.id,
        payment_confirmed_at: new Date().toISOString(),
        payment_review_note: dto.note ?? null,
      };
      if (paidAmount !== undefined) update.paid_amount = paidAmount;

      const { data: updated, error: updateError } = (await adminClient
        .from('service_registrations')
        .update(update)
        .eq('id', registrationId)
        .select(REGISTRATION_SELECT_WITH_JOINS)
        .single()) as DbResult<ServiceRegistrationRow>;

      if (updateError || !updated) {
        throw new BadRequestException('Failed to confirm payment');
      }

      // Auto-create user account if not already linked
      if (!registration.client_profile_id) {
        await this.createUserAccount(registration);
      }

      await this.createPaidInvoice(registrationId);
      await this.paymentEmailService.send('confirmed', {
        to: updated.email,
        fullName: updated.full_name,
        referenceNumber: updated.reference_number,
        subject: 'Service Registration',
      });

      this.logger.log(
        `Registration ${registrationId} payment confirmed by admin ${admin.id}`,
      );
      return this.mapRegistrationRow(updated);
    }

    // action === 'flag'
    const { data: flagged, error: flagError } = (await adminClient
      .from('service_registrations')
      .update({
        payment_status: ServiceRegistrationPaymentStatus.FLAGGED,
        payment_review_note: dto.note ?? null,
      })
      .eq('id', registrationId)
      .select(REGISTRATION_SELECT_WITH_JOINS)
      .single()) as DbResult<ServiceRegistrationRow>;

    if (flagError || !flagged) {
      throw new BadRequestException('Failed to flag payment');
    }

    await this.paymentEmailService.send('flagged', {
      to: flagged.email,
      fullName: flagged.full_name,
      referenceNumber: flagged.reference_number,
      subject: 'Service Registration',
      note: dto.note,
    });

    this.logger.log(
      `Registration ${registrationId} payment flagged by admin ${admin.id}`,
    );
    return this.mapRegistrationRow(flagged);
  }

  /**
   * Auto-creates a PAID invoice for a confirmed service registration.
   * Links to the client profile if one exists; otherwise stores by email.
   * Best-effort — failures are logged, not thrown.
   *
   * @param registrationId - The service registration UUID
   */
  private async createPaidInvoice(registrationId: string): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();
    const { data: reg } = (await adminClient
      .from('service_registrations')
      .select(
        'email, paid_amount, client_profile_id, reference_number, services(name)',
      )
      .eq('id', registrationId)
      .maybeSingle()) as DbResult<{
      email: string;
      paid_amount: number | null;
      client_profile_id: string | null;
      reference_number: string | null;
      services: { name: string } | null;
    }>;

    if (!reg) return;
    const amount = Number(reg.paid_amount ?? 0);
    if (amount <= 0) return;

    const serviceName = reg.services?.name ?? 'Facilitation Service';
    const dueDate = new Date().toISOString().split('T')[0];
    try {
      const invoice = await this.invoicesService.createInvoice({
        clientProfileId: reg.client_profile_id ?? undefined,
        email: reg.email,
        dueDate,
        taxAmount: 0,
        discountAmount: 0,
        items: [{ description: serviceName, quantity: 1, unitPrice: amount }],
        notes: reg.reference_number
          ? `Reference: ${reg.reference_number}`
          : undefined,
      });
      await this.invoicesService.updateInvoice(invoice.id, {
        status: InvoiceStatus.PAID,
      });
      this.logger.log(
        `Auto-created service invoice for registration ${registrationId}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to auto-create service invoice for ${registrationId}: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Auto-creates a Supabase auth user + client profile for a paid service registrant.
   *
   * Flow:
   * 1. Check if user already exists in user_profiles by email
   * 2. If not: create Supabase auth user (admin), create user_profile (CLIENT), create client_profile
   * 3. Link service_registration.client_profile_id to new client profile
   * 4. Send welcome email with portal access instructions via SendGrid
   *
   * @param registration - The paid service registration row
   */
  private async createUserAccount(
    registration: ServiceRegistrationRow,
  ): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    // Check if an auth user with this email already exists
    const { data: authUsersData } = await adminClient.auth.admin.listUsers();
    const existingAuthUser = (authUsersData?.users ?? []).find(
      (u: { email?: string; id: string }) => u.email === registration.email,
    );

    let userId: string;

    if (existingAuthUser) {
      userId = existingAuthUser.id;
      this.logger.log(
        `Auth user already exists for ${registration.email}: ${userId}`,
      );
    } else {
      // Generate a temporary password — user will reset on first login
      const tempPassword = `Arco${Math.random().toString(36).slice(2, 10)}!`;

      const { data: newAuthUser, error: authError } =
        await adminClient.auth.admin.createUser({
          email: registration.email,
          password: tempPassword,
          email_confirm: true,
        });

      if (authError || !newAuthUser?.user) {
        this.logger.error(
          `Failed to create auth user for ${registration.email}: ${authError?.message ?? 'no user'}`,
        );
        return; // Non-fatal — registration is already marked paid
      }

      userId = newAuthUser.user.id;

      // Send welcome email with temporary credentials
      await this.sendWelcomeEmail(
        registration.email,
        registration.full_name,
        tempPassword,
      );
    }

    // Check if user_profile already exists (e.g. OAuth signup race)
    const { data: existingUserProfile } = (await adminClient
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()) as DbResult<{ id: string } | null>;

    if (!existingUserProfile) {
      const { error: profileError } = await adminClient
        .from('user_profiles')
        .insert({
          id: userId,
          full_name: registration.full_name,
          user_type: UserType.CLIENT,
          phone_number: registration.phone_number ?? null,
        });

      if (profileError) {
        this.logger.error(
          `Failed to create user_profile for ${userId}: ${profileError.message}`,
        );
        return;
      }
    }

    // Create or fetch client_profile
    const { data: clientProfile, error: clientProfileError } =
      (await adminClient
        .from('client_profiles')
        .upsert({ user_profile_id: userId }, { onConflict: 'user_profile_id' })
        .select('id')
        .single()) as DbResult<{ id: string }>;

    if (clientProfileError || !clientProfile) {
      this.logger.error(
        `Failed to create client_profile for ${userId}: ${clientProfileError?.message ?? 'no data'}`,
      );
      return;
    }

    // Link registration to the new client profile
    await adminClient
      .from('service_registrations')
      .update({ client_profile_id: clientProfile.id })
      .eq('id', registration.id);

    // Link any guest invoices stored by email to this new client profile
    const { error: invoiceLinkError } = await adminClient
      .from('invoices')
      .update({ client_profile_id: clientProfile.id })
      .eq('email', registration.email)
      .is('client_profile_id', null);
    if (invoiceLinkError) {
      this.logger.warn(
        `Failed to link guest invoices for ${registration.email}: ${invoiceLinkError.message}`,
      );
    }

    this.logger.log(
      `Auto-created client account for ${registration.email} (userId: ${userId}, clientProfileId: ${clientProfile.id})`,
    );
  }

  /**
   * Sends a welcome email with portal access instructions via SendGrid.
   *
   * @param email - Recipient email address
   * @param fullName - Recipient full name
   * @param tempPassword - Temporary password for first login
   */
  private async sendWelcomeEmail(
    email: string,
    fullName: string,
    tempPassword: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'lemonsqueezy.frontendUrl',
      {
        infer: true,
      },
    );

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to AR&CO — Your Client Portal Access',
      html: `
          <h2>Welcome to AR&CO, ${fullName}!</h2>
          <p>Your service registration payment has been confirmed. We have created a client portal account for you.</p>
          <p><strong>Login Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p>Please <a href="${frontendUrl}/auth/signin">sign in</a> and change your password on first login.</p>
          <p>Our team will be in touch shortly to process your registration.</p>
          <p>Best regards,<br/>AR&CO Team</p>
        `,
    });
  }

  /** Maps a database row (snake_case) to ServiceRegistrationResponse (camelCase) */
  private mapRegistrationRow(
    row: ServiceRegistrationRow,
  ): ServiceRegistrationResponse {
    return {
      id: row.id,
      referenceNumber: row.reference_number,
      serviceId: row.service_id,
      fullName: row.full_name,
      email: row.email,
      phoneNumber: row.phone_number,
      cnic: row.cnic ?? null,
      address: row.address ?? null,
      descriptionOfNeed: row.description_of_need ?? null,
      paymentStatus: row.payment_status,
      status: row.status,
      clientProfileId: row.client_profile_id ?? null,
      assignedToId: row.assigned_to_id ?? null,
      assignedToName: row.assigned_to?.full_name ?? null,
      caseId: row.case_id ?? null,
      caseNumber: row.case?.case_number ?? null,
      staffNotes: row.staff_notes ?? null,
      paymentProofPath: row.payment_proof_path ?? null,
      paymentReviewNote: row.payment_review_note ?? null,
      paymentConfirmedAt: row.payment_confirmed_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /** Maps a DB document row to ServiceRegistrationDocumentResponse */
  private mapDocumentRow(
    row: ServiceRegistrationDocumentRow,
  ): ServiceRegistrationDocumentResponse {
    return {
      id: row.id,
      registrationId: row.registration_id,
      documentTypeId: row.document_type_id,
      documentTypeName: row.document_type_name,
      fileName: row.file_name,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      storagePath: row.storage_path,
      uploadedAt: row.uploaded_at,
    };
  }
}
