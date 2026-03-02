import { z } from 'zod';

/**
 * Schema for a single audit log entry response
 *
 * @example
 * ```typescript
 * const log = AuditLogResponseSchema.parse(data);
 * console.log(log.action, log.entityType);
 * ```
 */
export const AuditLogResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().uuid().nullable(),
  metadata: z.record(z.unknown()).default({}),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
  userName: z.string().nullable().optional(),
  userEmail: z.string().nullable().optional(),
});

/**
 * Schema for audit log query filters
 *
 * @example
 * ```typescript
 * const filters = AuditLogFiltersSchema.parse(req.query);
 * ```
 */
export const AuditLogFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

/**
 * Schema for paginated audit log list response
 *
 * @example
 * ```typescript
 * const response = PaginatedAuditLogsResponseSchema.parse(data);
 * ```
 */
export const PaginatedAuditLogsResponseSchema = z.object({
  data: z.array(AuditLogResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

/**
 * Schema for audit log user dropdown response
 *
 * @example
 * ```typescript
 * const users = AuditLogUserSchema.array().parse(data);
 * ```
 */
export const AuditLogUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().nullable(),
});
