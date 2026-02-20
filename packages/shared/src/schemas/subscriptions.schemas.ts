import { z } from 'zod';
import { SubscriptionStatus, BillingInterval } from '../enums';
import { PaginationSchema } from './common.schemas';

/** Schema for a subscription plan response */
export const SubscriptionPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
  interval: z.nativeEnum(BillingInterval),
  intervalCount: z.number(),
  features: z.array(z.string()),
  isActive: z.boolean(),
});

/** Schema for a user subscription response */
export const UserSubscriptionSchema = z.object({
  id: z.string().uuid(),
  plan: SubscriptionPlanSchema,
  status: z.nativeEnum(SubscriptionStatus),
  currentBillingCycle: z.number().nullable(),
  currentPeriodStart: z.string().nullable(),
  currentPeriodEnd: z.string().nullable(),
  lastPaidAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  pausedAt: z.string().nullable(),
  createdAt: z.string(),
});

/** Schema for subscription event in history */
export const SubscriptionEventSchema = z.object({
  id: z.string().uuid(),
  eventType: z.string(),
  billingCycle: z.number().nullable(),
  amount: z.number().nullable(),
  status: z.string().nullable(),
  createdAt: z.string(),
});

/** Schema for initiating a subscription */
export const InitiateSubscriptionSchema = z.object({
  planSlug: z.string().min(1),
});

/** Schema for subscription checkout response */
export const SubscriptionCheckoutResponseSchema = z.object({
  checkoutUrl: z.string().url(),
  subscriptionId: z.string().uuid(),
  reference: z.string(),
});

/** Schema for cancelling a subscription */
export const CancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid(),
});

/** Schema for subscription list filters (admin) */
export const SubscriptionFiltersSchema = PaginationSchema.extend({
  status: z.nativeEnum(SubscriptionStatus).optional(),
});

/** Schema for paginated subscriptions response (admin) */
export const PaginatedSubscriptionsResponseSchema = z.object({
  data: z.array(UserSubscriptionSchema.extend({
    userId: z.string().uuid(),
    userEmail: z.string().email(),
    userName: z.string(),
  })),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

/** Schema for subscription with events (detail view) */
export const SubscriptionDetailSchema = UserSubscriptionSchema.extend({
  events: z.array(SubscriptionEventSchema),
});
