import { z } from 'zod';
import type {
  SubscriptionPlanSchema,
  UserSubscriptionSchema,
  SubscriptionEventSchema,
  InitiateSubscriptionSchema,
  SubscriptionCheckoutResponseSchema,
  CancelSubscriptionSchema,
  SubscriptionFiltersSchema,
  PaginatedSubscriptionsResponseSchema,
  SubscriptionDetailSchema,
} from '../schemas/subscriptions.schemas';

/** Subscription plan data */
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

/** User's subscription data */
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;

/** Subscription event record */
export type SubscriptionEvent = z.infer<typeof SubscriptionEventSchema>;

/** Request to initiate subscription */
export type InitiateSubscriptionData = z.infer<typeof InitiateSubscriptionSchema>;

/** Checkout URL response */
export type SubscriptionCheckoutResponse = z.infer<typeof SubscriptionCheckoutResponseSchema>;

/** Request to cancel subscription */
export type CancelSubscriptionData = z.infer<typeof CancelSubscriptionSchema>;

/** Admin subscription list filters */
export type SubscriptionFilters = z.infer<typeof SubscriptionFiltersSchema>;

/** Paginated subscriptions for admin */
export type PaginatedSubscriptionsResponse = z.infer<typeof PaginatedSubscriptionsResponseSchema>;

/** Subscription with event history */
export type SubscriptionDetail = z.infer<typeof SubscriptionDetailSchema>;
