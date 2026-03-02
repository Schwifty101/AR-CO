import { z } from 'zod';
import type {
  AuditLogResponseSchema,
  AuditLogFiltersSchema,
  PaginatedAuditLogsResponseSchema,
  AuditLogUserSchema,
} from '../schemas/audit.schemas';

/** Single audit log entry */
export type AuditLogResponse = z.infer<typeof AuditLogResponseSchema>;

/** Audit log query filters */
export type AuditLogFilters = z.infer<typeof AuditLogFiltersSchema>;

/** Paginated audit log list */
export type PaginatedAuditLogsResponse = z.infer<typeof PaginatedAuditLogsResponseSchema>;

/** User option for audit log filter dropdown */
export type AuditLogUser = z.infer<typeof AuditLogUserSchema>;
