/**
 * Activity Logs Service
 *
 * Manages system-wide audit trail entries. Provides methods to create
 * log entries and query them with pagination and filters.
 *
 * @module ActivityLogsService
 *
 * @example
 * ```typescript
 * await activityLogsService.createLog(
 *   { action: 'create', entityType: 'case', entityId: 'uuid' },
 *   'user-uuid',
 * );
 *
 * const logs = await activityLogsService.getLogs(
 *   { page: 1, limit: 20 },
 *   { action: 'create', entityType: 'case' },
 * );
 * ```
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import type {
  CreateActivityLogData,
  ActivityLogFilters,
  PaginatedActivityLogsResponse,
} from '@repo/shared';

/** @class ActivityLogsService */
@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new activity log entry
   *
   * Used internally by other services to record user actions.
   * Uses admin client to bypass RLS.
   *
   * @param dto - Activity log data (action, entityType, entityId, metadata)
   * @param userId - UUID of the user performing the action (optional)
   */
  async createLog(dto: CreateActivityLogData, userId?: string): Promise<void> {
    const client = this.supabaseService.getAdminClient();

    const { error } = await client.from('activity_logs').insert({
      user_id: userId ?? null,
      action: dto.action,
      entity_type: dto.entityType,
      entity_id: dto.entityId ?? null,
      metadata: dto.metadata ?? {},
    });

    if (error) {
      this.logger.error('Failed to create activity log', error.message);
    }
  }

  /**
   * Query activity logs with pagination and filters
   *
   * Joins user_profiles for display names. Uses admin client
   * as activity_logs SELECT is restricted to admin users via RLS.
   *
   * @param pagination - Page and limit parameters
   * @param filters - Optional filters (action, entityType, userId, date range)
   * @returns Paginated activity log entries
   */
  async getLogs(
    pagination: { page: number; limit: number },
    filters?: ActivityLogFilters,
  ): Promise<PaginatedActivityLogsResponse> {
    const client = this.supabaseService.getAdminClient();
    const { page, limit } = pagination;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = client
      .from('activity_logs')
      .select(
        `
        id,
        user_id,
        action,
        entity_type,
        entity_id,
        metadata,
        ip_address,
        user_agent,
        created_at,
        user_profiles!activity_logs_user_id_fkey(full_name)
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Failed to fetch activity logs', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    const mapped = (data ?? []).map((row: Record<string, unknown>) => {
      const profile = row.user_profiles as
        | { full_name: string }
        | null;
      return {
        id: row.id as string,
        userId: (row.user_id as string) ?? null,
        action: row.action as string,
        entityType: row.entity_type as string,
        entityId: (row.entity_id as string) ?? null,
        metadata: (row.metadata as Record<string, unknown>) ?? {},
        ipAddress: (row.ip_address as string) ?? null,
        userAgent: (row.user_agent as string) ?? null,
        createdAt: row.created_at as string,
        userName: profile?.full_name ?? null,
      };
    });

    return {
      data: mapped,
      total: count ?? 0,
      page,
      limit,
    };
  }
}
