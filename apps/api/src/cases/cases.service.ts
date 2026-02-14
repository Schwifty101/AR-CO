/**
 * Cases Service
 *
 * Handles CRUD operations for legal cases with role-based access control,
 * pagination, filtering, and automatic activity logging.
 *
 * @module CasesService
 *
 * @example
 * ```typescript
 * // Create a case (staff)
 * const newCase = await casesService.createCase(dto, user);
 *
 * // List cases (role-filtered)
 * const cases = await casesService.getCases(pagination, filters, user);
 *
 * // Update status with auto-activity
 * const updated = await casesService.updateCaseStatus(caseId, { status: CaseStatus.ACTIVE }, user);
 * ```
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CaseActivitiesService } from './case-activities.service';
import { STAFF_ROLES } from '../common/constants/roles';
import {
  validateSortColumn,
  sanitizePostgrestFilter,
} from '../common/utils/query-helpers';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  CaseStatus,
  CasePriority,
  CaseActivityType,
  type PaginationParams,
  type CreateCaseData,
  type UpdateCaseData,
  type UpdateCaseStatusData,
  type AssignToData,
  type CaseFilters,
  type CaseResponse,
  type PaginatedCasesResponse,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for cases with joined relationships */
interface CaseRow {
  id: string;
  case_number: string;
  client_profile_id: string;
  assigned_to_id: string | null;
  practice_area_id: string;
  service_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  case_type: string | null;
  filing_date: string | null;
  closing_date: string | null;
  created_at: string;
  updated_at: string;
  /** Joined client name via client_profiles -> user_profiles */
  client_profile: { user_profile: { full_name: string } | null } | null;
  /** Joined assigned user name via user_profiles (direct FK) */
  assigned_to: { full_name: string } | null;
  /** Joined practice area name */
  practice_area: { name: string } | null;
  /** Joined service name */
  service: { name: string } | null;
}

/**
 * PostgREST select query with FK joins for case detail.
 * Joins through profile tables to user_profiles for display names.
 */
const CASE_SELECT_WITH_JOINS = [
  '*',
  'client_profile:client_profiles!cases_client_profile_id_fkey(user_profile:user_profiles!client_profiles_user_profile_id_fkey(full_name))',
  'assigned_to:user_profiles!cases_assigned_to_id_fkey(full_name)',
  'practice_area:practice_areas!cases_practice_area_id_fkey(name)',
  'service:services!cases_service_id_fkey(name)',
].join(',');

/** Allowed sort columns for cases list */
const ALLOWED_CASE_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'case_number',
  'status',
  'priority',
  'filing_date',
] as const;

/**
 * Service for managing legal cases with role-based access control
 *
 * @class CasesService
 */
@Injectable()
export class CasesService {
  private readonly logger = new Logger(CasesService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly caseActivitiesService: CaseActivitiesService,
  ) {}

  /**
   * Create a new case. Case number is auto-generated via DB trigger (CASE-YYYY-NNNN).
   * Auto-creates a "case_created" activity entry.
   *
   * @param dto - Case creation data
   * @param user - The staff user creating the case
   * @returns The created case with joined data
   * @throws {InternalServerErrorException} If database insert fails
   *
   * @example
   * ```typescript
   * const newCase = await service.createCase(
   *   { clientProfileId: '...', practiceAreaId: '...', title: 'Contract dispute' },
   *   staffUser
   * );
   * ```
   */
  async createCase(dto: CreateCaseData, user: AuthUser): Promise<CaseResponse> {
    this.logger.log(`Creating case "${dto.title}" by user ${user.id}`);
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('cases')
      .insert({
        client_profile_id: dto.clientProfileId,
        practice_area_id: dto.practiceAreaId,
        service_id: dto.serviceId ?? null,
        title: dto.title,
        description: dto.description ?? null,
        priority: dto.priority ?? CasePriority.LOW,
        case_type: dto.caseType ?? null,
        filing_date: dto.filingDate ?? null,
      })
      .select(CASE_SELECT_WITH_JOINS)
      .single()) as DbResult<CaseRow>;

    if (error || !data) {
      this.logger.error('Failed to create case', error);
      throw new InternalServerErrorException('Failed to create case');
    }

    await this.caseActivitiesService.createAutoActivity(
      data.id,
      CaseActivityType.CASE_CREATED,
      'Case created',
      `Case "${dto.title}" was created`,
      user.id,
    );

    this.logger.log(`Case ${data.case_number} created successfully`);
    return this.mapCaseRow(data);
  }

  /**
   * Get paginated list of cases with role-based filtering.
   * Staff sees all cases. Clients see only their own.
   *
   * @param pagination - Pagination parameters
   * @param filters - Filter criteria (status, priority, search, etc.)
   * @param user - The authenticated user
   * @returns Paginated cases list
   * @throws {BadRequestException} If client has no profile ID
   * @throws {InternalServerErrorException} If database query fails
   *
   * @example
   * ```typescript
   * const cases = await service.getCases(
   *   { page: 1, limit: 20, sort: 'created_at', order: 'desc' },
   *   { status: CaseStatus.ACTIVE },
   *   user
   * );
   * ```
   */
  async getCases(
    pagination: PaginationParams,
    filters: CaseFilters,
    user: AuthUser,
  ): Promise<PaginatedCasesResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const sort = validateSortColumn(
      pagination.sort ?? 'created_at',
      ALLOWED_CASE_SORT_COLUMNS,
    );
    const order = pagination.order ?? 'desc';
    const offset = (page - 1) * limit;

    let countQuery = adminClient
      .from('cases')
      .select('*', { count: 'exact', head: true });

    let dataQuery = adminClient
      .from('cases')
      .select(CASE_SELECT_WITH_JOINS, { count: 'exact' });

    // Role-based filtering: clients only see own cases
    if (!STAFF_ROLES.includes(user.userType)) {
      if (!user.clientProfileId) {
        throw new BadRequestException('Client profile not found');
      }
      countQuery = countQuery.eq('client_profile_id', user.clientProfileId);
      dataQuery = dataQuery.eq('client_profile_id', user.clientProfileId);
    }

    // Apply filters
    if (filters.status) {
      countQuery = countQuery.eq('status', filters.status);
      dataQuery = dataQuery.eq('status', filters.status);
    }
    if (filters.priority) {
      countQuery = countQuery.eq('priority', filters.priority);
      dataQuery = dataQuery.eq('priority', filters.priority);
    }
    if (filters.clientProfileId) {
      countQuery = countQuery.eq('client_profile_id', filters.clientProfileId);
      dataQuery = dataQuery.eq('client_profile_id', filters.clientProfileId);
    }
    if (filters.assignedToId) {
      countQuery = countQuery.eq('assigned_to_id', filters.assignedToId);
      dataQuery = dataQuery.eq('assigned_to_id', filters.assignedToId);
    }
    if (filters.practiceAreaId) {
      countQuery = countQuery.eq('practice_area_id', filters.practiceAreaId);
      dataQuery = dataQuery.eq('practice_area_id', filters.practiceAreaId);
    }
    if (filters.search) {
      const sanitized = sanitizePostgrestFilter(filters.search);
      const searchFilter = `case_number.ilike.%${sanitized}%,title.ilike.%${sanitized}%`;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    // Execute count query
    const { count, error: countError } = (await countQuery) as {
      count: number | null;
      error: { message: string } | null;
    };

    if (countError) {
      this.logger.error('Failed to count cases', countError);
      throw new InternalServerErrorException('Failed to count cases');
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    // Execute data query with pagination
    const { data, error } = (await dataQuery
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)) as DbListResult<CaseRow>;

    if (error) {
      this.logger.error('Failed to fetch cases', error);
      throw new InternalServerErrorException('Failed to fetch cases');
    }

    return {
      data: (data ?? []).map((row) => this.mapCaseRow(row)),
      meta: { page, limit, total, totalPages },
    };
  }

  /**
   * Get a single case by ID with access control.
   *
   * @param caseId - The case UUID
   * @param user - The authenticated user
   * @returns The case detail with joined data
   * @throws {NotFoundException} If case not found
   * @throws {ForbiddenException} If user lacks access
   *
   * @example
   * ```typescript
   * const caseDetail = await service.getCaseById('case-uuid', user);
   * ```
   */
  async getCaseById(caseId: string, user: AuthUser): Promise<CaseResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('cases')
      .select(CASE_SELECT_WITH_JOINS)
      .eq('id', caseId)
      .single()) as DbResult<CaseRow>;

    if (error || !data) {
      throw new NotFoundException('Case not found');
    }

    this.assertCaseAccess(data, user);
    return this.mapCaseRow(data);
  }

  /**
   * Update case fields (staff only).
   *
   * @param caseId - The case UUID
   * @param dto - Fields to update
   * @param user - The staff user making the update
   * @returns The updated case
   * @throws {BadRequestException} If no fields to update
   * @throws {NotFoundException} If case not found
   *
   * @example
   * ```typescript
   * const updated = await service.updateCase(
   *   'case-uuid',
   *   { title: 'Updated Title', priority: CasePriority.HIGH },
   *   staffUser
   * );
   * ```
   */
  async updateCase(
    caseId: string,
    dto: UpdateCaseData,
    user: AuthUser,
  ): Promise<CaseResponse> {
    this.logger.log(`Updating case ${caseId} by user ${user.id}`);
    const adminClient = this.supabaseService.getAdminClient();

    const updatePayload: Record<string, unknown> = {};
    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.description !== undefined)
      updatePayload.description = dto.description;
    if (dto.priority !== undefined) updatePayload.priority = dto.priority;
    if (dto.caseType !== undefined) updatePayload.case_type = dto.caseType;
    if (dto.filingDate !== undefined)
      updatePayload.filing_date = dto.filingDate;
    if (dto.closingDate !== undefined)
      updatePayload.closing_date = dto.closingDate;

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const { data, error } = (await adminClient
      .from('cases')
      .update(updatePayload)
      .eq('id', caseId)
      .select(CASE_SELECT_WITH_JOINS)
      .single()) as DbResult<CaseRow>;

    if (error || !data) {
      this.logger.error(`Failed to update case ${caseId}`, error);
      throw new NotFoundException('Case not found');
    }

    return this.mapCaseRow(data);
  }

  /**
   * Update case status with auto-activity logging.
   * Auto-sets closing_date when status is RESOLVED or CLOSED.
   *
   * @param caseId - The case UUID
   * @param dto - New status
   * @param user - The staff user updating status
   * @returns The updated case
   * @throws {NotFoundException} If case not found
   *
   * @example
   * ```typescript
   * const updated = await service.updateCaseStatus(
   *   'case-uuid',
   *   { status: CaseStatus.RESOLVED },
   *   staffUser
   * );
   * ```
   */
  async updateCaseStatus(
    caseId: string,
    dto: UpdateCaseStatusData,
    user: AuthUser,
  ): Promise<CaseResponse> {
    this.logger.log(`Updating status of case ${caseId} to ${dto.status}`);
    const adminClient = this.supabaseService.getAdminClient();

    // Fetch current status for activity logging
    const { data: current, error: fetchError } = (await adminClient
      .from('cases')
      .select('status')
      .eq('id', caseId)
      .single()) as DbResult<{ status: string }>;

    if (fetchError || !current) {
      throw new NotFoundException('Case not found');
    }

    const updatePayload: Record<string, unknown> = {
      status: dto.status,
    };

    // Auto-set closing_date when resolved or closed
    if (
      dto.status === CaseStatus.RESOLVED ||
      dto.status === CaseStatus.CLOSED
    ) {
      updatePayload.closing_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = (await adminClient
      .from('cases')
      .update(updatePayload)
      .eq('id', caseId)
      .select(CASE_SELECT_WITH_JOINS)
      .single()) as DbResult<CaseRow>;

    if (error || !data) {
      this.logger.error(`Failed to update case status ${caseId}`, error);
      throw new NotFoundException('Case not found');
    }

    // Auto-create status change activity
    await this.caseActivitiesService.createAutoActivity(
      caseId,
      CaseActivityType.STATUS_CHANGED,
      `Status changed to ${dto.status}`,
      `Status changed from "${current.status}" to "${dto.status}"`,
      user.id,
    );

    return this.mapCaseRow(data);
  }

  /**
   * Delete a case (admin only).
   *
   * @param caseId - The case UUID
   * @throws {InternalServerErrorException} If deletion fails
   *
   * @example
   * ```typescript
   * await service.deleteCase('case-uuid');
   * ```
   */
  async deleteCase(caseId: string): Promise<void> {
    this.logger.log(`Deleting case ${caseId}`);
    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient.from('cases').delete().eq('id', caseId);

    if (error) {
      this.logger.error(`Failed to delete case ${caseId}`, error);
      throw new InternalServerErrorException('Failed to delete case');
    }
  }

  /**
   * Assign a user (attorney/staff) to a case with auto-activity logging.
   *
   * @param caseId - The case UUID
   * @param dto - Assignment data containing the assignee's user profile ID
   * @param user - The staff user making the assignment
   * @returns The updated case
   * @throws {NotFoundException} If case not found
   *
   * @example
   * ```typescript
   * const updated = await service.assign(
   *   'case-uuid',
   *   { assignedToId: 'user-profile-uuid' },
   *   staffUser
   * );
   * ```
   */
  async assign(
    caseId: string,
    dto: AssignToData,
    user: AuthUser,
  ): Promise<CaseResponse> {
    this.logger.log(
      `Assigning user ${dto.assignedToId} to case ${caseId}`,
    );
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('cases')
      .update({ assigned_to_id: dto.assignedToId })
      .eq('id', caseId)
      .select(CASE_SELECT_WITH_JOINS)
      .single()) as DbResult<CaseRow>;

    if (error || !data) {
      this.logger.error(`Failed to assign user to case ${caseId}`, error);
      throw new NotFoundException('Case not found');
    }

    const assignedName = data.assigned_to?.full_name ?? 'Unknown';
    await this.caseActivitiesService.createAutoActivity(
      caseId,
      CaseActivityType.ATTORNEY_ASSIGNED,
      `Assigned to: ${assignedName}`,
      null,
      user.id,
    );

    return this.mapCaseRow(data);
  }

  /**
   * Asserts that the user has access to the case.
   * Staff/Admin/Attorney: full access. Clients: own cases only.
   *
   * @param row - The case database row
   * @param user - The authenticated user
   * @throws {ForbiddenException} If user lacks access
   * @private
   */
  private assertCaseAccess(row: CaseRow, user: AuthUser): void {
    if (STAFF_ROLES.includes(user.userType)) return;
    if (user.clientProfileId === row.client_profile_id) return;
    throw new ForbiddenException('You do not have access to this case');
  }

  /**
   * Maps a CaseRow (snake_case DB) to CaseResponse (camelCase DTO).
   * Extracts display names from joined relations.
   *
   * @param row - The raw database row with joined data
   * @returns The mapped case response object
   * @private
   */
  private mapCaseRow(row: CaseRow): CaseResponse {
    return {
      id: row.id,
      caseNumber: row.case_number,
      clientProfileId: row.client_profile_id,
      clientName: row.client_profile?.user_profile?.full_name ?? 'Unknown',
      assignedToId: row.assigned_to_id,
      assignedToName: row.assigned_to?.full_name ?? null,
      practiceAreaId: row.practice_area_id,
      practiceAreaName: row.practice_area?.name ?? 'Unknown',
      serviceId: row.service_id,
      serviceName: row.service?.name ?? null,
      title: row.title,
      description: row.description,
      status: row.status as CaseStatus,
      priority: row.priority as CasePriority,
      caseType: row.case_type,
      filingDate: row.filing_date,
      closingDate: row.closing_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
