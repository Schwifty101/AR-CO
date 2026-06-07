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

/**
 * Schema for an admin reviewing a manually-uploaded payment proof.
 * Shared by consultation bookings and service registrations.
 *
 * - `confirm` marks the payment as paid and triggers downstream actions
 *   (invoice creation, account creation, confirmation email).
 * - `flag` marks the payment as flagged for out-of-band follow-up and emails
 *   the client. A `note` is expected when flagging.
 *
 * @example
 * ```typescript
 * const data = ReviewPaymentSchema.parse({ action: 'confirm', amount: 50000 });
 * const flagged = ReviewPaymentSchema.parse({ action: 'flag', note: 'Amount mismatch' });
 * ```
 */
export const ReviewPaymentSchema = z.object({
  /** Whether to confirm the payment or flag it for follow-up */
  action: z.enum(['confirm', 'flag']),
  /** Admin note — surfaced to the client in the flagged email */
  note: z.string().max(1000).optional(),
  /** Actual amount confirmed (PKR), if it differs from the recorded fee */
  amount: z.number().positive().optional(),
});
