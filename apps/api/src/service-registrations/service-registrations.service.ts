import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { LemonSqueezyService } from '../payments/lemonsqueezy.service';
import { STAFF_ROLES } from '../common/constants/roles';
import { validateSortColumn } from '../common/utils/query-helpers';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  ServiceRegistrationStatus,
  ServiceRegistrationPaymentStatus,
  type CreateServiceRegistrationData,
  type GuestStatusCheckData,
  type UpdateRegistrationStatusData,
  type AssignToData,
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
    private readonly lemonsqueezyService: LemonSqueezyService,
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
      throw new InternalServerErrorException('Failed to save document metadata');
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
   * Initiates a LemonSqueezy checkout for a service registration fee.
   *
   * Fetches the registration and its associated service fee, creates a
   * one-time checkout via LemonSqueezy, persists the checkout ID, and
   * returns the hosted checkout URL for the client to complete payment.
   *
   * @param registrationId - The service registration UUID
   * @returns Hosted checkout URL to redirect the user to
   * @throws {NotFoundException} If the registration does not exist
   *
   * @example
   * ```typescript
   * const { checkoutUrl } = await service.initiatePayment('reg-uuid');
   * // Redirect user to checkoutUrl
   * ```
   */
  async initiatePayment(registrationId: string): Promise<{ checkoutUrl: string }> {
    this.logger.log(`Initiating LemonSqueezy payment for registration: ${registrationId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data: registration, error } = await adminClient
      .from('service_registrations')
      .select('*, services!inner(registration_fee, name)')
      .eq('id', registrationId)
      .single();

    if (error || !registration) {
      throw new NotFoundException('Registration not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reg = registration as any;
    const serviceFee: number = reg.services?.registration_fee ?? 0;
    const serviceName: string = reg.services?.name ?? 'Service Registration';

    const { checkoutUrl, checkoutId } =
      await this.lemonsqueezyService.createOneTimeCheckout({
        variantId: 0, // placeholder — replaced with real variantId in Task 10F
        customPrice: serviceFee * 100, // convert PKR to cents
        email: reg.email,
        name: reg.full_name,
        customData: {
          payment_type: 'service',
          reference_id: reg.reference_number,
          registration_id: reg.id,
        },
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?type=service&ref=${reg.reference_number}`,
        productName: `${serviceName} - Registration Fee`,
      });

    await adminClient
      .from('service_registrations')
      .update({ lemonsqueezy_checkout_id: checkoutId })
      .eq('id', registrationId);

    this.logger.log(
      `LemonSqueezy checkout created for registration ${reg.reference_number}: ${checkoutId}`,
    );

    return { checkoutUrl };
  }

  /**
   * Handle LemonSqueezy order_created webhook for service registration payments.
   *
   * Stub — implemented in Task 10F.
   *
   * @param payload - LemonSqueezy webhook payload
   */
  async handlePaymentConfirmed(_payload: unknown): Promise<void> {
    this.logger.log('handlePaymentConfirmed: stub (Task 10F)');
  }

  /**
   * Handle LemonSqueezy order_refunded webhook for service registration payments.
   *
   * Stub — implemented in Task 10F.
   *
   * @param payload - LemonSqueezy webhook payload
   */
  async handlePaymentRefunded(_payload: unknown): Promise<void> {
    this.logger.log('handlePaymentRefunded: stub (Task 10F)');
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
