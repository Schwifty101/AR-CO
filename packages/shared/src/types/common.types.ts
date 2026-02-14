import type { z } from 'zod';
import type { AssignToSchema, PaginationSchema } from '../schemas/common.schemas';

/**
 * Data for assigning a staff/attorney to an entity (case, complaint, service registration).
 *
 * @example
 * ```typescript
 * const assignment: AssignToData = { assignedToId: '550e8400-e29b-41d4-a716-446655440000' };
 * ```
 */
export type AssignToData = z.infer<typeof AssignToSchema>;

/**
 * Pagination query parameters.
 *
 * @example
 * ```typescript
 * const params: PaginationParams = { page: 1, limit: 20, sort: 'created_at', order: 'desc' };
 * ```
 */
export type PaginationParams = z.infer<typeof PaginationSchema>;
