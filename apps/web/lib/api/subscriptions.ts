/**
 * Subscriptions API Client
 *
 * Client-side functions for subscription plan management, checkout, and admin operations.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * Public endpoints: plan listing. Authenticated endpoints: subscribe, cancel, admin list/detail.
 *
 * @module SubscriptionsAPI
 *
 * @example
 * ```typescript
 * import {
 *   getSubscriptionPlans,
 *   initiateSubscription,
 *   getMySubscription,
 *   cancelSubscription,
 *   getSubscriptions,
 *   getSubscriptionDetail,
 *   syncPlanToSafepay,
 * } from '@/lib/api/subscriptions';
 *
 * // Public: Fetch available plans
 * const plans = await getSubscriptionPlans();
 *
 * // Authenticated: Start subscription checkout
 * const { checkoutUrl } = await initiateSubscription('civic-retainer');
 *
 * // Authenticated: Get my subscription
 * const subscription = await getMySubscription();
 *
 * // Admin: List all subscriptions
 * const result = await getSubscriptions({ status: 'active', page: 1, limit: 20 });
 * ```
 */

import { getSessionToken } from './auth-helpers';
import type {
  SubscriptionPlan,
  SubscriptionCheckoutResponse,
  SubscriptionDetail,
  PaginatedSubscriptionsResponse,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type {
  SubscriptionPlan,
  SubscriptionCheckoutResponse,
  SubscriptionDetail,
  PaginatedSubscriptionsResponse,
} from '@repo/shared';

/**
 * Fetch active subscription plans (public, no auth needed)
 *
 * Retrieves all active subscription plans from the catalog.
 * Does not require authentication.
 *
 * @returns Array of active subscription plans
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const plans = await getSubscriptionPlans();
 * plans.forEach(p => console.log(p.name, p.amount));
 * ```
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await fetch('/api/subscriptions/plans');
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch plans');
  }
  return (await response.json()) as SubscriptionPlan[];
}

/**
 * Initiate subscription checkout (requires auth)
 *
 * Creates a Safepay subscription checkout session for the given plan.
 * Returns a checkout URL to redirect the user to Safepay payment.
 *
 * @param planSlug - URL slug of the subscription plan
 * @returns Checkout URL, subscription ID, and payment reference
 * @throws Error if request fails, plan not found, or user already subscribed
 *
 * @example
 * ```typescript
 * const { checkoutUrl, subscriptionId } = await initiateSubscription('civic-retainer');
 * // Open checkoutUrl in popup via usePaymentPopup hook
 * ```
 */
export async function initiateSubscription(
  planSlug: string,
): Promise<SubscriptionCheckoutResponse> {
  const token = await getSessionToken();
  const response = await fetch('/api/subscriptions/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planSlug }),
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to initiate subscription');
  }
  return (await response.json()) as SubscriptionCheckoutResponse;
}

/**
 * Get current user's subscription (requires auth)
 *
 * Fetches the authenticated user's active or most recent subscription.
 * Returns null if the user has no subscription.
 *
 * @returns Subscription detail or null if none exists
 * @throws Error if request fails (excluding 404)
 *
 * @example
 * ```typescript
 * const subscription = await getMySubscription();
 * if (subscription) {
 *   console.log('Plan:', subscription.plan.name);
 *   console.log('Status:', subscription.status);
 * }
 * ```
 */
export async function getMySubscription(): Promise<SubscriptionDetail | null> {
  const token = await getSessionToken();
  const response = await fetch('/api/subscriptions/my-subscription', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch subscription');
  }
  const text = await response.text();
  if (!text || text === 'null') return null;
  return JSON.parse(text) as SubscriptionDetail;
}

/**
 * Cancel subscription (requires auth)
 *
 * Cancels the user's active subscription. The subscription remains active
 * until the end of the current billing period.
 *
 * @param subscriptionId - UUID of the subscription to cancel
 * @throws Error if request fails, subscription not found, or already cancelled
 *
 * @example
 * ```typescript
 * await cancelSubscription('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const token = await getSessionToken();
  const response = await fetch(
    `/api/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to cancel subscription');
  }
}

/**
 * Admin: list all subscriptions with filters
 *
 * Fetches a paginated list of all subscriptions. Requires admin authentication.
 * Supports filtering by subscription status with pagination.
 *
 * @param params - Optional filter and pagination parameters
 * @returns Paginated subscriptions with user info
 * @throws Error if request fails or user lacks admin permissions
 *
 * @example
 * ```typescript
 * const result = await getSubscriptions({ status: 'active', page: 1, limit: 20 });
 * console.log('Total:', result.total);
 * result.data.forEach(s => console.log(s.userName, s.plan.name));
 * ```
 */
export async function getSubscriptions(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedSubscriptionsResponse> {
  const token = await getSessionToken();
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const response = await fetch(
    `/api/subscriptions?${searchParams.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch subscriptions');
  }
  return (await response.json()) as PaginatedSubscriptionsResponse;
}

/**
 * Admin: get subscription detail by ID
 *
 * Fetches full subscription details including event history.
 * Requires admin authentication.
 *
 * @param id - UUID of the subscription
 * @returns Subscription detail with event history
 * @throws Error if request fails, not found, or user lacks admin permissions
 *
 * @example
 * ```typescript
 * const detail = await getSubscriptionDetail('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Events:', detail.events.length);
 * ```
 */
export async function getSubscriptionDetail(
  id: string,
): Promise<SubscriptionDetail> {
  const token = await getSessionToken();
  const response = await fetch(`/api/subscriptions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch subscription detail');
  }
  return (await response.json()) as SubscriptionDetail;
}

/**
 * Admin: sync plan to Safepay
 *
 * Triggers synchronization of a subscription plan with Safepay's billing system.
 * Creates or updates the corresponding plan in Safepay. Requires admin authentication.
 *
 * @param planId - UUID of the subscription plan to sync
 * @returns Object containing the Safepay plan token
 * @throws Error if request fails, plan not found, or user lacks admin permissions
 *
 * @example
 * ```typescript
 * const { planToken } = await syncPlanToSafepay('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Safepay plan token:', planToken);
 * ```
 */
export async function syncPlanToSafepay(
  planId: string,
): Promise<{ planToken: string }> {
  const token = await getSessionToken();
  const response = await fetch(`/api/subscriptions/plans/${planId}/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to sync plan');
  }
  return (await response.json()) as { planToken: string };
}
