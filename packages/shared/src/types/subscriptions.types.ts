import type { z } from 'zod';
import type {
  SubscriptionResponseSchema,
  CancelSubscriptionSchema,
  PaginatedSubscriptionsResponseSchema,
} from '../schemas/subscriptions.schemas';

export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
export type CancelSubscriptionData = z.infer<typeof CancelSubscriptionSchema>;
export type PaginatedSubscriptionsResponse = z.infer<typeof PaginatedSubscriptionsResponseSchema>;
