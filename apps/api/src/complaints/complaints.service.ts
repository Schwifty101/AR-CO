import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { STAFF_ROLES } from '../common/constants/roles';
import {
  validateSortColumn,
  sanitizePostgrestFilter,
} from '../common/utils/query-helpers';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  ComplaintStatus,
  type CreateComplaintData,
  type UpdateComplaintStatusData,
  type AssignComplaintData,
  type ComplaintFilters,
  type ComplaintResponse,
  type PaginatedComplaintsResponse,
  type PaginationParams,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for the complaints table with joined staff profile */
interface ComplaintRow {
  id: string;
  complaint_number: string;
  client_profile_id: string;
  title: string;
  description: string;
  target_organization: string;
  location: string | null;
  category: string | null;
  evidence_urls: string[];
  status: ComplaintStatus;
  assigned_staff_id: string | null;
  staff_notes: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  /** Joined staff profile from user_profiles via assigned_staff_id */
  assigned_staff: { first_name: string; last_name: string } | null;
}

/**
 * Supabase select clause that joins assigned staff profile
 * Uses a foreign-key relationship: complaints.assigned_staff_id -> user_profiles.id
 */
const COMPLAINT_SELECT_WITH_STAFF =
  '*, assigned_staff:user_profiles!assigned_staff_id(first_name, last_name)' as const;


/** Allowed sort columns for complaints */
const ALLOWED_COMPLAINT_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'complaint_number',
  'status',
] as const;


/**
 * Service responsible for managing citizen complaints lifecycle
 * Handles submission, tracking, assignment, and resolution of complaints
 *
 * @remarks
 * This service integrates with Supabase for persistence and enforces
 * subscription-based access control. Only clients with active subscriptions
 * can submit new complaints.
 *
 * @example
 * ```typescript
 * const complaint = await complaintsService.submitComplaint(clientUser, {
 *   title: 'Road Damage',
 *   description: 'Severe potholes on Main Street',
 *   targetOrganization: 'City Public Works Department',
 *   location: 'Main Street, Downtown',
 *   category: ComplaintCategory.INFRASTRUCTURE,
 *   evidenceUrls: ['https://example.com/photo1.jpg']
 * });
 * ```
 */
@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Submits a new complaint on behalf of a client
   * Requires an active subscription to submit
   *
   * @param user - The authenticated client user
   * @param dto - The complaint creation data
   * @returns The created complaint with auto-generated complaint number
   * @throws {ForbiddenException} If client does not have an active subscription
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const result = await service.submitComplaint(clientUser, {
   *     title: 'Water Supply Issue',
   *     description: 'No water for 3 days in our area',
   *     targetOrganization: 'Water & Sanitation Authority',
   *     location: 'Block 5, Gulshan-e-Iqbal',
   *     category: ComplaintCategory.UTILITIES
   *   });
   * } catch (error) {
   *   if (error instanceof ForbiddenException) {
   *     // Handle subscription requirement
   *   }
   * }
   * ```
   */
  async submitComplaint(
    user: AuthUser,
    dto: CreateComplaintData,
  ): Promise<ComplaintResponse> {
    if (!user.clientProfileId) {
      throw new BadRequestException('Client profile not found');
    }

    this.logger.log(`Client ${user.clientProfileId} submitting complaint`);

    // CRITICAL: Check subscription first
    const isActive = await this.subscriptionsService.isSubscriptionActive(
      user.clientProfileId,
    );

    if (!isActive) {
      this.logger.warn(
        `Client ${user.clientProfileId} attempted to submit complaint without active subscription`,
      );
      throw new ForbiddenException(
        'Active subscription required to submit complaints',
      );
    }

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('complaints')
      .insert({
        client_profile_id: user.clientProfileId,
        title: dto.title,
        description: dto.description,
        target_organization: dto.targetOrganization,
        location: dto.location ?? null,
        category: dto.category ?? null,
        evidence_urls: dto.evidenceUrls ?? [],
      })
      .select(COMPLAINT_SELECT_WITH_STAFF)
      .single()) as DbResult<ComplaintRow>;

    if (error || !data) {
      this.logger.error(
        `Failed to submit complaint for client ${user.clientProfileId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to submit complaint');
    }

    this.logger.log(
      `Complaint ${data.complaint_number} submitted successfully`,
    );
    return this.mapComplaintRow(data);
  }

  /**
   * Retrieves complaints with pagination and filtering
   * Clients see only their own complaints, staff see all complaints
   *
   * @param user - The authenticated user
   * @param pagination - Pagination parameters (page, limit, sort, order)
   * @param filters - Optional filters (status, targetOrganization, category)
   * @returns Paginated list of complaints with total count
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * // Client viewing their own complaints
   * const result = await service.getComplaints(
   *   clientUser,
   *   { page: 1, limit: 10, sort: 'created_at', order: 'desc' },
   *   { status: ComplaintStatus.UNDER_REVIEW }
   * );
   *
   * // Staff viewing all complaints
   * const allComplaints = await service.getComplaints(
   *   staffUser,
   *   { page: 1, limit: 20, sort: 'created_at', order: 'desc' },
   *   { targetOrganization: 'Municipal Corporation' }
   * );
   * ```
   */
  async getComplaints(
    user: AuthUser,
    pagination: PaginationParams,
    filters: ComplaintFilters,
  ): Promise<PaginatedComplaintsResponse> {
    this.logger.log(`Fetching complaints for user ${user.id}`);

    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit, sort, order } = pagination;
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('complaints')
      .select(COMPLAINT_SELECT_WITH_STAFF, { count: 'exact' });

    // If user is CLIENT, filter by their client_profile_id
    if (!STAFF_ROLES.includes(user.userType)) {
      if (!user.clientProfileId) {
        throw new BadRequestException('Client profile not found');
      }
      query = query.eq('client_profile_id', user.clientProfileId);
    }

    // Apply optional filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.targetOrganization) {
      const sanitized = sanitizePostgrestFilter(filters.targetOrganization);
      query = query.ilike('target_organization', `%${sanitized}%`);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Validate and apply pagination and sorting
    const validSort = validateSortColumn(sort, ALLOWED_COMPLAINT_SORT_COLUMNS);
    query = query
      .order(validSort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = (await query) as DbListResult<ComplaintRow>;

    if (error) {
      this.logger.error(
        `Failed to fetch complaints for user ${user.id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch complaints');
    }

    const complaints = (data ?? []).map((row) => this.mapComplaintRow(row));

    return {
      data: complaints,
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Retrieves a single complaint by ID
   * Clients can only view their own complaints, staff can view all
   *
   * @param complaintId - The complaint ID
   * @param user - The authenticated user
   * @returns The complaint details
   * @throws {NotFoundException} If complaint does not exist
   * @throws {ForbiddenException} If client tries to access another client's complaint
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const complaint = await service.getComplaintById('complaint-uuid-123', clientUser);
   * } catch (error) {
   *   if (error instanceof NotFoundException) {
   *     // Handle not found
   *   } else if (error instanceof ForbiddenException) {
   *     // Handle unauthorized access
   *   }
   * }
   * ```
   */
  async getComplaintById(
    complaintId: string,
    user: AuthUser,
  ): Promise<ComplaintResponse> {
    this.logger.log(`Fetching complaint ${complaintId} for user ${user.id}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('complaints')
      .select(COMPLAINT_SELECT_WITH_STAFF)
      .eq('id', complaintId)
      .single()) as DbResult<ComplaintRow>;

    if (error || !data) {
      this.logger.warn(`Complaint ${complaintId} not found`);
      throw new NotFoundException('Complaint not found');
    }

    const complaint = this.mapComplaintRow(data);

    // If user is CLIENT, verify they own this complaint
    if (!STAFF_ROLES.includes(user.userType)) {
      if (complaint.clientProfileId !== user.clientProfileId) {
        this.logger.warn(
          `Client ${user.clientProfileId} attempted to access complaint ${complaintId} owned by ${complaint.clientProfileId}`,
        );
        throw new ForbiddenException('Access denied to this complaint');
      }
    }

    return complaint;
  }

  /**
   * Updates the status of a complaint (staff only)
   * Automatically sets resolved_at timestamp when status is RESOLVED
   *
   * @param complaintId - The complaint ID
   * @param dto - The status update data (status, staffNotes, resolutionNotes)
   * @returns The updated complaint
   * @throws {NotFoundException} If complaint does not exist
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * // Mark complaint as resolved
   * const resolved = await service.updateComplaintStatus('complaint-uuid-123', {
   *   status: ComplaintStatus.RESOLVED,
   *   staffNotes: 'Issue verified and escalated to department head',
   *   resolutionNotes: 'Road repair scheduled for next week'
   * });
   *
   * // Update to under review
   * const reviewing = await service.updateComplaintStatus('complaint-uuid-456', {
   *   status: ComplaintStatus.UNDER_REVIEW,
   *   staffNotes: 'Documents received, verifying details'
   * });
   * ```
   */
  async updateComplaintStatus(
    complaintId: string,
    dto: UpdateComplaintStatusData,
  ): Promise<ComplaintResponse> {
    this.logger.log(
      `Updating status for complaint ${complaintId} to ${dto.status}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    const updateData: Record<string, unknown> = {
      status: dto.status,
    };

    if (dto.staffNotes !== undefined) {
      updateData.staff_notes = dto.staffNotes;
    }

    if (dto.resolutionNotes !== undefined) {
      updateData.resolution_notes = dto.resolutionNotes;
    }

    // If status is RESOLVED, set resolved_at timestamp
    if (dto.status === ComplaintStatus.RESOLVED) {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = (await adminClient
      .from('complaints')
      .update(updateData)
      .eq('id', complaintId)
      .select(COMPLAINT_SELECT_WITH_STAFF)
      .single()) as DbResult<ComplaintRow>;

    if (error || !data) {
      this.logger.error(`Failed to update complaint ${complaintId}`, error);
      throw new NotFoundException('Complaint not found');
    }

    this.logger.log(`Complaint ${complaintId} status updated successfully`);
    return this.mapComplaintRow(data);
  }

  /**
   * Assigns a complaint to a staff member (staff only)
   * Automatically updates status to UNDER_REVIEW if currently SUBMITTED
   *
   * @param complaintId - The complaint ID
   * @param dto - The assignment data (staffId)
   * @returns The updated complaint
   * @throws {NotFoundException} If complaint does not exist
   * @throws {InternalServerErrorException} If database operation fails
   *
   * @example
   * ```typescript
   * // Assign complaint to staff attorney
   * const assigned = await service.assignComplaint('complaint-uuid-123', {
   *   staffId: 'staff-uuid-789'
   * });
   * ```
   */
  async assignComplaint(
    complaintId: string,
    dto: AssignComplaintData,
  ): Promise<ComplaintResponse> {
    this.logger.log(
      `Assigning complaint ${complaintId} to staff ${dto.staffId}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    // First fetch the complaint to check current status
    const { data: currentComplaint, error: fetchError } = (await adminClient
      .from('complaints')
      .select('status')
      .eq('id', complaintId)
      .single()) as DbResult<{ status: ComplaintStatus }>;

    if (fetchError || !currentComplaint) {
      this.logger.error(`Failed to fetch complaint ${complaintId}`, fetchError);
      throw new NotFoundException('Complaint not found');
    }

    const updateData: Record<string, unknown> = {
      assigned_staff_id: dto.staffId,
    };

    // If complaint status is 'submitted', also update to 'under_review'
    if (currentComplaint.status === ComplaintStatus.SUBMITTED) {
      updateData.status = ComplaintStatus.UNDER_REVIEW;
    }

    const { data, error } = (await adminClient
      .from('complaints')
      .update(updateData)
      .eq('id', complaintId)
      .select(COMPLAINT_SELECT_WITH_STAFF)
      .single()) as DbResult<ComplaintRow>;

    if (error || !data) {
      this.logger.error(`Failed to assign complaint ${complaintId}`, error);
      throw new InternalServerErrorException('Failed to assign complaint');
    }

    this.logger.log(`Complaint ${complaintId} assigned successfully`);
    return this.mapComplaintRow(data);
  }

  /**
   * Maps a database row (snake_case) to a ComplaintResponse object (camelCase)
   * Includes the joined staff profile name when available
   *
   * @param row - The raw database row with optional joined staff profile
   * @returns The mapped complaint response object
   * @private
   */
  private mapComplaintRow(row: ComplaintRow): ComplaintResponse {
    const staffProfile = row.assigned_staff;
    const assignedStaffName = staffProfile
      ? `${staffProfile.first_name} ${staffProfile.last_name}`.trim()
      : null;

    return {
      id: row.id,
      complaintNumber: row.complaint_number,
      clientProfileId: row.client_profile_id,
      title: row.title,
      description: row.description,
      targetOrganization: row.target_organization,
      location: row.location ?? null,
      category: row.category ?? null,
      evidenceUrls: row.evidence_urls ?? [],
      status: row.status,
      assignedStaffId: row.assigned_staff_id ?? null,
      assignedStaffName,
      staffNotes: row.staff_notes ?? null,
      resolutionNotes: row.resolution_notes ?? null,
      resolvedAt: row.resolved_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
