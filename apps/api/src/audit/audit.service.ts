import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

/**
 * Data required to create an audit log entry
 *
 * @example
 * ```typescript
 * await auditService.log({
 *   userId: 'uuid',
 *   action: 'CREATE',
 *   entityType: 'case',
 *   entityId: 'uuid',
 *   metadata: { title: 'New Case' },
 *   ipAddress: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...',
 * });
 * ```
 */
export interface CreateAuditLogEntry {
  /** UUID of the user who performed the action */
  userId: string | null;
  /** Action performed (CREATE, UPDATE, DELETE, etc.) */
  action: string;
  /** Type of entity affected */
  entityType: string;
  /** UUID of the affected entity */
  entityId?: string | null;
  /** Additional context — request body, old/new values */
  metadata?: Record<string, unknown>;
  /** Client IP address */
  ipAddress?: string | null;
  /** Client user agent string */
  userAgent?: string | null;
}

/**
 * Centralized audit logging service
 *
 * Writes to the `activity_logs` table using admin client (bypasses RLS).
 * All failures are caught and logged — never blocks the calling operation.
 *
 * @example
 * ```typescript
 * constructor(private readonly auditService: AuditService) {}
 *
 * await this.auditService.log({
 *   userId: user.id,
 *   action: AuditAction.CREATE,
 *   entityType: AuditEntityType.CASE,
 *   entityId: newCase.id,
 * });
 * ```
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Write a single audit log entry
   *
   * Uses admin client to bypass RLS. Failures are caught silently.
   */
  async log(entry: CreateAuditLogEntry): Promise<void> {
    try {
      const adminClient = this.supabaseService.getAdminClient();
      await adminClient.from('activity_logs').insert({
        user_id: entry.userId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId || null,
        metadata: entry.metadata || {},
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to write audit log: ${entry.action} ${entry.entityType}`,
        error,
      );
    }
  }

  /**
   * Query audit logs with filters and pagination
   *
   * Joins user_profiles to include user name/email in results.
   */
  async findAll(filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    limit: number;
  }): Promise<{ data: Record<string, unknown>[]; total: number }> {
    const adminClient = this.supabaseService.getAdminClient();
    const offset = (filters.page - 1) * filters.limit;

    let query = adminClient
      .from('activity_logs')
      .select('*, user_profiles!activity_logs_user_id_fkey(full_name)', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + filters.limit - 1);

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error, count } = await query;

    if (error) {
      this.logger.error(`Failed to query audit logs: ${error.message}`);
      return { data: [], total: 0 };
    }

    return {
      data: (data || []) as Record<string, unknown>[],
      total: count || 0,
    };
  }

  /**
   * Get distinct users who have audit log entries (for filter dropdown)
   */
  async getDistinctUsers(): Promise<{ id: string; fullName: string | null }[]> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient
      .from('activity_logs')
      .select('user_id')
      .not('user_id', 'is', null);

    if (error || !data) {
      this.logger.error(
        `Failed to get distinct audit log users: ${error?.message}`,
      );
      return [];
    }

    // Get unique user IDs
    const uniqueIds = [...new Set(data.map((row) => row.user_id as string))];

    if (uniqueIds.length === 0) return [];

    const { data: profiles, error: profileError } = await adminClient
      .from('user_profiles')
      .select('id, full_name')
      .in('id', uniqueIds);

    if (profileError || !profiles) {
      return uniqueIds.map((id) => ({ id, fullName: null }));
    }

    return profiles.map((p) => ({
      id: p.id as string,
      fullName: p.full_name as string | null,
    }));
  }
}
