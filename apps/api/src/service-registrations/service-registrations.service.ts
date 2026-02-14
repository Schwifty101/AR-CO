import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
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
  safepay_tracker_id: string | null;
  safepay_transaction_id: string | null;
  status: ServiceRegistrationStatus;
  client_profile_id: string | null;
  assigned_to_id: string | null;
  staff_notes: string | null;
  created_at: string;
  updated_at: string;
  /** Joined assigned user profile from user_profiles via assigned_to_id */
  assigned_to: { full_name: string } | null;
}

/** Database row shape for the services table (for validation) */
interface ServiceRow {
  id: string;
  name: string;
  registration_fee: number;
  is_active: boolean;
}

/**
 * Supabase select clause that joins assigned user profile
 * Uses a foreign-key relationship: service_registrations.assigned_to_id -> user_profiles.id
 */
const REGISTRATION_SELECT_WITH_JOINS =
  '*, assigned_to:user_profiles!service_registrations_assigned_to_id_fkey(full_name)' as const;

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
 * Payment initiation is handled by ServiceRegistrationsPaymentService.
 *
 * @class ServiceRegistrationsService
 */
@Injectable()
export class ServiceRegistrationsService {
  private readonly logger = new Logger(ServiceRegistrationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

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
      staffNotes: row.staff_notes ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
