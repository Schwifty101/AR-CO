import { z } from 'zod';
import { SubscriptionStatus } from '../enums';

/** Subscription response */
export const SubscriptionResponseSchema = z.object({
  id: z.string().uuid(),
  clientProfileId: z.string().uuid(),
  planName: z.string(),
  monthlyAmount: z.number(),
  currency: z.string(),
  status: z.nativeEnum(SubscriptionStatus),
  currentPeriodStart: z.string().nullable(),
  currentPeriodEnd: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Cancel subscription request */
export const CancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
});

/** Paginated subscriptions response */
export const PaginatedSubscriptionsResponseSchema = z.object({
  data: z.array(SubscriptionResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
