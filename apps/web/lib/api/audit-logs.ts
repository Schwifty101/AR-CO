/**
 * Audit Logs API Client
 *
 * Client-side functions for fetching audit log data.
 * All requests go through the Next.js API proxy (/api/*).
 * Admin-only endpoints.
 *
 * @module AuditLogsAPI
 *
 * @example
 * ```typescript
 * import { getAuditLogs, getAuditLogUsers } from '@/lib/api/audit-logs';
 *
 * // Fetch paginated audit logs with filters
 * const logs = await getAuditLogs({ page: 1, limit: 25, action: 'CREATE' });
 *
 * // Fetch distinct users for filter dropdown
 * const users = await getAuditLogUsers();
 * ```
 */

import { getSessionToken } from './auth-helpers';
import type {
  PaginatedAuditLogsResponse,
  AuditLogUser,
  AuditLogFilters,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type {
  PaginatedAuditLogsResponse,
  AuditLogUser,
  AuditLogFilters,
} from '@repo/shared';

/**
 * Fetch paginated audit logs with optional filters
 *
 * Requires ADMIN role. Returns audit trail entries with optional
 * filtering by user, action, entity type, and date range.
 *
 * @param params - Optional filter and pagination parameters
 * @returns Paginated audit logs response
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const logs = await getAuditLogs({ page: 1, limit: 25, action: 'CREATE' });
 * console.log(logs.data, logs.total);
 * ```
 */
export async function getAuditLogs(
  params?: Partial<AuditLogFilters>,
): Promise<PaginatedAuditLogsResponse> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.userId) queryParams.set('userId', params.userId);
  if (params?.action) queryParams.set('action', params.action);
  if (params?.entityType) queryParams.set('entityType', params.entityType);
  if (params?.dateFrom) queryParams.set('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.set('dateTo', params.dateTo);

  const url = `/api/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch audit logs');
  }

  return (await response.json()) as PaginatedAuditLogsResponse;
}

/**
 * Fetch distinct users who appear in audit logs (for filter dropdown)
 *
 * Requires ADMIN role. Returns a list of user IDs and full names
 * for populating the user filter in the audit logs UI.
 *
 * @returns Array of audit log user objects
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const users = await getAuditLogUsers();
 * // [{ id: 'uuid', fullName: 'John Doe' }, ...]
 * ```
 */
export async function getAuditLogUsers(): Promise<AuditLogUser[]> {
  const token = await getSessionToken();

  const response = await fetch('/api/audit-logs/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch audit log users');
  }

  return (await response.json()) as AuditLogUser[];
}
