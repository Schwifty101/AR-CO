import { z } from 'zod';

/** Pagination query parameters with coercion for query strings */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema for assigning a staff/attorney to an entity (case, complaint, service registration).
 *
 * @example
 * ```typescript
 * const data = AssignToSchema.parse({ assignedToId: '550e8400-e29b-41d4-a716-446655440000' });
 * ```
 */
export const AssignToSchema = z.object({
  assignedToId: z.string().uuid('Valid user profile ID is required'),
});
