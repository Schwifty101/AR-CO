import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  CaseActivityType,
  type CreateCaseActivityData,
  type CaseActivityResponse,
  type PaginatedCaseActivitiesResponse,
  type PaginationParams,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for the case_activities table with joined creator profile */
interface CaseActivityRow {
  id: string;
  case_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_by: string;
  attachments: unknown;
  created_at: string;
  /** Joined user_profiles via created_by foreign key */
  creator: { full_name: string } | null;
}

/**
 * Supabase select clause that joins creator profile for activity entries.
 * Uses a foreign-key relationship: case_activities.created_by -> user_profiles.id
 */
const ACTIVITY_SELECT_WITH_CREATOR =
  '*, creator:user_profiles!created_by(full_name)' as const;

/**
 * Service responsible for managing case activity timeline entries.
 * Handles manual activity creation and auto-generated activity logging
 * for case lifecycle events (status changes, attorney assignments, etc.).
 *
 * @remarks
 * Activities form a timeline for each case, providing an audit trail
 * of all significant events. Auto-activities are created by CasesService
 * and should not throw errors to avoid breaking parent operations.
 *
 * @example
 * ```typescript
 * // Get paginated activities for a case
 * const activities = await caseActivitiesService.getCaseActivities(
 *   'case-uuid-123',
 *   { page: 1, limit: 20, sort: 'created_at', order: 'desc' }
 * );
 *
 * // Add a manual activity entry
 * const activity = await caseActivitiesService.addCaseActivity(
 *   'case-uuid-123',
 *   { activityType: CaseActivityType.NOTE_ADDED, title: 'Client meeting notes' },
 *   user
 * );
 * ```
 */
@Injectable()
export class CaseActivitiesService {
  private readonly logger = new Logger(CaseActivitiesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Retrieves paginated activities for a specific case, sorted by creation date descending.
   * Includes creator name from joined user_profiles.
   *
   * @param caseId - The case UUID to fetch activities for
   * @param pagination - Pagination parameters (page, limit)
   * @returns Paginated list of case activities with creator names
   * @throws {InternalServerErrorException} If database query fails
   *
   * @example
   * ```typescript
   * const result = await service.getCaseActivities(
   *   'case-uuid-123',
   *   { page: 1, limit: 10, sort: 'created_at', order: 'desc' }
   * );
   * // result.data[0].createdByName === 'John Doe'
   * ```
   */
  async getCaseActivities(
    caseId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedCaseActivitiesResponse> {
    this.logger.log(`Fetching activities for case ${caseId}`);

    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const { data, error, count } = (await adminClient
      .from('case_activities')
      .select(ACTIVITY_SELECT_WITH_CREATOR, { count: 'exact' })
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)) as DbListResult<CaseActivityRow>;

    if (error) {
      this.logger.error(`Failed to fetch activities for case ${caseId}`, error);
      throw new InternalServerErrorException('Failed to fetch case activities');
    }

    const activities = (data ?? []).map((row) => this.mapCaseActivityRow(row));

    return {
      data: activities,
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Adds a manual activity entry to a case timeline.
   * Used by staff, attorneys, or admins to record case events.
   *
   * @param caseId - The case UUID to add the activity to
   * @param dto - Activity creation data (activityType, title, description)
   * @param user - The authenticated user creating the activity
   * @returns The created activity with creator name
   * @throws {InternalServerErrorException} If database insert fails
   *
   * @example
   * ```typescript
   * const activity = await service.addCaseActivity(
   *   'case-uuid-123',
   *   {
   *     activityType: CaseActivityType.NOTE_ADDED,
   *     title: 'Filed motion for discovery',
   *     description: 'Motion filed with court clerk on 2024-01-15'
   *   },
   *   staffUser
   * );
   * ```
   */
  async addCaseActivity(
    caseId: string,
    dto: CreateCaseActivityData,
    user: AuthUser,
  ): Promise<CaseActivityResponse> {
    this.logger.log(`Adding activity to case ${caseId} by user ${user.id}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('case_activities')
      .insert({
        case_id: caseId,
        activity_type: dto.activityType,
        title: dto.title,
        description: dto.description ?? null,
        created_by: user.id,
      })
      .select(ACTIVITY_SELECT_WITH_CREATOR)
      .single()) as DbResult<CaseActivityRow>;

    if (error || !data) {
      this.logger.error(`Failed to add activity to case ${caseId}`, error);
      throw new InternalServerErrorException('Failed to add case activity');
    }

    this.logger.log(`Activity added to case ${caseId} successfully`);
    return this.mapCaseActivityRow(data);
  }

  /**
   * Creates an auto-generated activity entry for case lifecycle events.
   * This method is called internally by CasesService and should NOT throw
   * on failure -- auto-activity creation should never break the parent operation.
   *
   * @param caseId - The case UUID
   * @param activityType - The type of activity (from CaseActivityType enum)
   * @param title - Short title for the activity entry
   * @param description - Optional detailed description
   * @param userId - The user who triggered the activity
   *
   * @example
   * ```typescript
   * // Called internally when a case is created
   * await service.createAutoActivity(
   *   'case-uuid-123',
   *   CaseActivityType.CASE_CREATED,
   *   'Case created',
   *   'New case opened for client',
   *   'user-uuid-456'
   * );
   * ```
   */
  async createAutoActivity(
    caseId: string,
    activityType: CaseActivityType,
    title: string,
    description: string | null,
    userId: string,
  ): Promise<void> {
    try {
      const adminClient = this.supabaseService.getAdminClient();

      const { error } = await adminClient.from('case_activities').insert({
        case_id: caseId,
        activity_type: activityType,
        title,
        description,
        created_by: userId,
      });

      if (error) {
        this.logger.warn(
          `Failed to create auto-activity for case ${caseId}: ${error.message}`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Exception creating auto-activity for case ${caseId}`,
        err,
      );
    }
  }

  /**
   * Maps a database row (snake_case) to a CaseActivityResponse object (camelCase).
   * Extracts creator name from the joined user_profiles relation.
   *
   * @param row - The raw database row with optional joined creator profile
   * @returns The mapped case activity response object
   * @private
   */
  private mapCaseActivityRow(row: CaseActivityRow): CaseActivityResponse {
    return {
      id: row.id,
      caseId: row.case_id,
      activityType: row.activity_type as CaseActivityType,
      title: row.title,
      description: row.description ?? null,
      createdBy: row.created_by,
      createdByName: row.creator?.full_name ?? 'Unknown',
      attachments: row.attachments ?? null,
      createdAt: row.created_at,
    };
  }
}
