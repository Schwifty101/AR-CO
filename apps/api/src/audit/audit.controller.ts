import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '@repo/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuditLogFiltersSchema } from '@repo/shared';
import type {
  AuditLogFilters,
  AuditLogResponse,
  PaginatedAuditLogsResponse,
  AuditLogUser,
} from '@repo/shared';

/**
 * Audit Logs Controller
 *
 * Provides read access to audit logs for Admin and Attorney roles.
 *
 * @example
 * ```
 * GET /api/audit-logs?page=1&limit=25&action=CREATE&entityType=case
 * GET /api/audit-logs/users
 * ```
 */
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Get paginated audit logs with optional filters
   */
  @Get()
  @Roles(UserType.ADMIN, UserType.ATTORNEY)
  async getAuditLogs(
    @Query(new ZodValidationPipe(AuditLogFiltersSchema))
    filters: AuditLogFilters,
  ): Promise<PaginatedAuditLogsResponse> {
    const result = await this.auditService.findAll(filters);

    return {
      data: result.data.map((row) => this.mapToResponse(row)),
      total: result.total,
      page: filters.page,
      limit: filters.limit,
    };
  }

  /**
   * Get distinct users who appear in audit logs (for filter dropdown)
   */
  @Get('users')
  @Roles(UserType.ADMIN, UserType.ATTORNEY)
  async getAuditLogUsers(): Promise<AuditLogUser[]> {
    const users = await this.auditService.getDistinctUsers();
    return users.map((u) => ({ id: u.id, fullName: u.fullName }));
  }

  /** Map DB row to response schema shape (snake_case to camelCase) */
  private mapToResponse(row: Record<string, unknown>): AuditLogResponse {
    const profile = row.user_profiles as Record<string, unknown> | null;
    return {
      id: row.id as string,
      userId: row.user_id as string | null,
      action: row.action as string,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string | null,
      metadata: (row.metadata || {}) as Record<string, unknown>,
      ipAddress: row.ip_address as string | null,
      userAgent: row.user_agent as string | null,
      createdAt: row.created_at as string,
      userName: (profile?.full_name as string) || null,
      userEmail: (profile?.email as string) || null,
    };
  }
}
