import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { SafepayService } from '../payments/safepay.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  ServiceRegistrationStatus,
  ServiceRegistrationPaymentStatus,
  type CreateServiceRegistrationData,
  type GuestStatusCheckData,
  type UpdateRegistrationStatusData,
  type ServiceRegistrationResponse,
  type GuestStatusResponse,
  type PaginatedServiceRegistrationsResponse,
  type PaginationParams,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for the service_registrations table */
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
  safepay_tracker_id: string | null;
  safepay_transaction_id: string | null;
  status: ServiceRegistrationStatus;
  client_profile_id: string | null;
  assigned_staff_id: string | null;
  staff_notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Database row shape for the services table (for validation) */
interface ServiceRow {
  id: string;
  name: string;
  registration_fee: number;
  is_active: boolean;
}

/**
 * Staff roles that have access to all service registrations (not just client's own)
 */
const STAFF_ROLES: string[] = [
  UserType.ADMIN,
  UserType.STAFF,
  UserType.ATTORNEY,
];

/** Allowed sort columns for service registrations */
const ALLOWED_REGISTRATION_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'reference_number',
  'status',
  'payment_status',
] as const;

/**
 * Validate sort column against allowed list, defaulting to created_at
 *
 * @param sort - The sort column to validate
 * @param allowed - Array of allowed column names
 * @returns Valid sort column (original if allowed, 'created_at' otherwise)
 */
function validateSortColumn(sort: string, allowed: readonly string[]): string {
  return allowed.includes(sort) ? sort : 'created_at';
}

/**
 * Service responsible for managing facilitation service registration lifecycle
 * Handles guest registration, payment initiation, status tracking, and staff management
 *
 * @remarks
 * This service integrates with Supabase for persistence and Safepay for payments.
 * Unique feature: Allows GUEST (unauthenticated) users to register and pay for services.
 * After payment confirmation, user accounts are auto-created via webhook (future implementation).
 *
 * @example
 * ```typescript
 * // Guest user registers for service
 * const registration = await serviceRegistrationsService.createRegistration({
 *   serviceId: 'service-uuid-123',
 *   fullName: 'Ahmed Khan',
 *   email: 'ahmed@example.com',
 *   phoneNumber: '+923001234567',
 *   cnic: '42101-1234567-1',
 *   address: 'Block 5, Gulshan-e-Iqbal, Karachi',
 *   descriptionOfNeed: 'Need SECP company registration'
 * });
 *
 * // Guest initiates payment
 * const { checkoutUrl } = await serviceRegistrationsService.initiatePayment(
 *   registration.id,
 *   'https://arco.pk/payment/success',
 *   'https://arco.pk/payment/cancel'
 * );
 *
 * // Guest checks status
 * const status = await serviceRegistrationsService.getRegistrationStatus(
 *   'REG-2026-0001',
 *   'ahmed@example.com'
 * );
 * ```
 */
@Injectable()
export class ServiceRegistrationsService {
  private readonly logger = new Logger(ServiceRegistrationsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly safepayService: SafepayService,
  ) {}

  /**
   * Creates a new service registration (guest/unauthenticated access)
   * Validates that the requested service exists and is active
   *
   * @param dto - The registration creation data
   * @returns The created registration with auto-generated reference number
   * @throws {NotFoundException} If service does not exist or is inactive
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const result = await service.createRegistration({
   *     serviceId: 'service-uuid-123',
   *     fullName: 'Sara Ahmed',
   *     email: 'sara@example.com',
   *     phoneNumber: '+923001234567',
   *     cnic: '42101-1234567-1',
   *     address: 'DHA Phase 5, Karachi',
   *     descriptionOfNeed: 'Need business NTN registration'
   *   });
   * } catch (error) {
   *   if (error instanceof NotFoundException) {
   *     // Handle service not found
   *   }
   * }
   * ```
   */
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
      .select('*')
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

  /**
   * Initiates payment for a service registration
   * Creates a Safepay checkout session and updates registration with tracker ID
   *
   * @param registrationId - The registration ID
   * @param returnUrl - URL to redirect after successful payment
   * @param cancelUrl - URL to redirect after cancelled payment
   * @returns Checkout URL and registration ID
   * @throws {NotFoundException} If registration does not exist
   * @throws {BadRequestException} If payment already completed
   * @throws {InternalServerErrorException} If payment creation fails
   *
   * @example
   * ```typescript
   * try {
   *   const result = await service.initiatePayment(
   *     'registration-uuid-123',
   *     'https://arco.pk/payment/success',
   *     'https://arco.pk/payment/cancel'
   *   );
   *   // Redirect user to result.checkoutUrl
   * } catch (error) {
   *   if (error instanceof BadRequestException) {
   *     // Payment already completed
   *   }
   * }
   * ```
   */
  async initiatePayment(
    registrationId: string,
    returnUrl: string,
    cancelUrl: string,
  ): Promise<{ checkoutUrl: string; registrationId: string }> {
    this.logger.log(`Initiating payment for registration ${registrationId}`);

    const adminClient = this.supabaseService.getAdminClient();

    // Fetch registration with service details
    const { data: registration, error: fetchError } = (await adminClient
      .from('service_registrations')
      .select('*, services(registration_fee)')
      .eq('id', registrationId)
      .single()) as DbResult<
      ServiceRegistrationRow & { services: { registration_fee: number } }
    >;

    if (fetchError || !registration) {
      this.logger.warn(`Registration ${registrationId} not found`, fetchError);
      throw new NotFoundException('Registration not found');
    }

    // Check if already paid
    if (registration.payment_status === ServiceRegistrationPaymentStatus.PAID) {
      this.logger.warn(
        `Registration ${registrationId} already paid, cannot initiate payment`,
      );
      throw new BadRequestException('Payment already completed');
    }

    // Get service fee
    const serviceFee = registration.services.registration_fee;

    // Create Safepay checkout session
    let checkoutUrl: string;
    let trackerToken: string;

    try {
      const result = await this.safepayService.createCheckoutSession({
        amount: serviceFee,
        currency: 'PKR',
        orderId: registrationId,
        metadata: {
          type: 'service',
          referenceId: registrationId,
        },
        returnUrl,
        cancelUrl,
      });

      checkoutUrl = result.checkoutUrl;
      trackerToken = result.token;
    } catch (error) {
      this.logger.error(
        `Failed to create Safepay checkout for registration ${registrationId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to initiate payment');
    }

    // Update registration with tracker ID
    const { error: updateError } = await adminClient
      .from('service_registrations')
      .update({ safepay_tracker_id: trackerToken })
      .eq('id', registrationId);

    if (updateError) {
      this.logger.error(
        `Failed to update registration ${registrationId} with tracker ID`,
        updateError,
      );
      throw new InternalServerErrorException('Failed to update registration');
    }

    this.logger.log(
      `Payment initiated for registration ${registrationId}, tracker: ${trackerToken}`,
    );

    return {
      checkoutUrl,
      registrationId,
    };
  }

  /**
   * Retrieves minimal status information for a guest user
   * Requires both reference number AND email to match for security
   *
   * @param dto - Guest status check data (reference number + email)
   * @returns Minimal registration status (no sensitive info)
   * @throws {NotFoundException} If registration not found or email mismatch
   *
   * @example
   * ```typescript
   * try {
   *   const status = await service.getRegistrationStatus({
   *     ref: 'REG-2026-0001',
   *     email: 'sara@example.com'
   *   });
   *   console.log(status.status); // 'pending_payment' | 'paid' | 'in_progress' | ...
   * } catch (error) {
   *   if (error instanceof NotFoundException) {
   *     // Invalid reference or email
   *   }
   * }
   * ```
   */
  async getRegistrationStatus(
    dto: GuestStatusCheckData,
  ): Promise<GuestStatusResponse> {
    this.logger.log(`Guest checking status for reference ${dto.ref}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('service_registrations')
      .select('reference_number, status, payment_status, created_at')
      .eq('reference_number', dto.ref)
      .eq('email', dto.email)
      .single()) as DbResult<{
      reference_number: string;
      status: ServiceRegistrationStatus;
      payment_status: ServiceRegistrationPaymentStatus;
      created_at: string;
    }>;

    if (error || !data) {
      this.logger.warn(
        `Registration ${dto.ref} not found or email mismatch`,
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

  /**
   * Retrieves service registrations with pagination
   * Clients see only their own registrations, staff see all registrations
   *
   * @param user - The authenticated user
   * @param pagination - Pagination parameters (page, limit, sort, order)
   * @returns Paginated list of registrations with total count
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * // Client viewing their own registrations
   * const result = await service.getRegistrations(
   *   clientUser,
   *   { page: 1, limit: 10, sort: 'created_at', order: 'desc' }
   * );
   *
   * // Staff viewing all registrations
   * const allRegistrations = await service.getRegistrations(
   *   staffUser,
   *   { page: 1, limit: 20, sort: 'created_at', order: 'desc' }
   * );
   * ```
   */
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
      .select('*', { count: 'exact' });

    // If user is CLIENT, filter by their client_profile_id
    if (!STAFF_ROLES.includes(user.userType)) {
      query = query.eq('client_profile_id', user.clientProfileId as string);
    }

    // Validate and apply pagination and sorting
    const validSort = validateSortColumn(sort, ALLOWED_REGISTRATION_SORT_COLUMNS);
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

  /**
   * Retrieves a single service registration by ID
   * Clients can only view their own registrations, staff can view all
   *
   * @param registrationId - The registration ID
   * @param user - The authenticated user
   * @returns The registration details
   * @throws {NotFoundException} If registration does not exist
   * @throws {ForbiddenException} If client tries to access another client's registration
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const registration = await service.getRegistrationById(
   *     'registration-uuid-123',
   *     clientUser
   *   );
   * } catch (error) {
   *   if (error instanceof NotFoundException) {
   *     // Handle not found
   *   } else if (error instanceof ForbiddenException) {
   *     // Handle unauthorized access
   *   }
   * }
   * ```
   */
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
      .select('*')
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

  /**
   * Updates the status of a service registration (staff only)
   * Allows updating status and adding staff notes
   *
   * @param registrationId - The registration ID
   * @param dto - The status update data (status, staffNotes)
   * @returns The updated registration
   * @throws {NotFoundException} If registration does not exist
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * // Mark registration as completed
   * const completed = await service.updateRegistrationStatus('registration-uuid-123', {
   *   status: ServiceRegistrationStatus.COMPLETED,
   *   staffNotes: 'NTN certificate issued and emailed to client'
   * });
   *
   * // Update to in progress
   * const inProgress = await service.updateRegistrationStatus('registration-uuid-456', {
   *   status: ServiceRegistrationStatus.IN_PROGRESS,
   *   staffNotes: 'Documents submitted to SECP, awaiting approval'
   * });
   * ```
   */
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
      .select('*')
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
   * Assigns a service registration to a staff member (staff only)
   * Automatically updates status to IN_PROGRESS if currently PENDING_PAYMENT or PAID
   *
   * @param registrationId - The registration ID
   * @param staffId - The staff member ID to assign
   * @returns The updated registration
   * @throws {NotFoundException} If registration does not exist
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * // Assign registration to staff attorney
   * const assigned = await service.assignRegistration(
   *   'registration-uuid-123',
   *   'staff-uuid-789'
   * );
   * ```
   */
  async assignRegistration(
    registrationId: string,
    staffId: string,
  ): Promise<ServiceRegistrationResponse> {
    this.logger.log(
      `Assigning registration ${registrationId} to staff ${staffId}`,
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
      assigned_staff_id: staffId,
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
      .select('*')
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
   * Maps a database row (snake_case) to a ServiceRegistrationResponse object (camelCase)
   *
   * @remarks
   * Note: safepay_tracker_id and safepay_transaction_id are intentionally excluded
   * from the response for security reasons. They are internal payment tracking fields.
   *
   * @param row - The raw database row
   * @returns The mapped service registration response object
   * @private
   */
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
      assignedStaffId: row.assigned_staff_id ?? null,
      staffNotes: row.staff_notes ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
