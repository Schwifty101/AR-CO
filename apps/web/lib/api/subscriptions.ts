/**
 * Subscriptions API Client
 *
 * Client-side functions for complaint subscription management.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module SubscriptionsAPI
 *
 * @example
 * ```typescript
 * import { createSubscription, getMySubscription, cancelSubscription } from '@/lib/api/subscriptions';
 *
 * // Create new subscription (client)
 * const { subscription, checkoutUrl } = await createSubscription();
 * window.location.href = checkoutUrl; // Redirect to Safepay
 *
 * // Check current subscription
 * const subscription = await getMySubscription();
 *
 * // Cancel subscription
 * const cancelled = await cancelSubscription({ reason: 'No longer needed' });
 * ```
 */

import { getSessionToken, type PaginationParams } from './auth-helpers';
import type {
  SubscriptionResponse,
  CancelSubscriptionData,
  PaginatedSubscriptionsResponse,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type { SubscriptionResponse, CancelSubscriptionData } from '@repo/shared';
export type { PaginationParams } from './auth-helpers';

/** Paginated subscriptions response shaped for frontend consumption */
export interface PaginatedSubscriptions {
  subscriptions: SubscriptionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


/**
 * Create a new subscription for the authenticated client
 *
 * This initiates the Safepay payment flow. The response includes a checkout URL
 * that the user should be redirected to for payment.
 *
 * @returns Object containing the created subscription and Safepay checkout URL
 * @throws Error if request fails or user already has an active subscription
 *
 * @example
 * ```typescript
 * const { subscription, checkoutUrl } = await createSubscription();
 * console.log('Subscription ID:', subscription.id);
 * window.location.href = checkoutUrl; // Redirect to payment
 * ```
 */
export async function createSubscription(): Promise<{
  subscription: SubscriptionResponse;
  checkoutUrl: string;
}> {
  const token = await getSessionToken();

  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to create subscription');
  }

  return (await response.json()) as { subscription: SubscriptionResponse; checkoutUrl: string };
}

/**
 * Fetch the current user's subscription
 *
 * Returns the authenticated client's active or most recent subscription.
 *
 * @returns Subscription data
 * @throws Error if request fails or no subscription found
 *
 * @example
 * ```typescript
 * const subscription = await getMySubscription();
 * if (subscription.status === 'active') {
 *   console.log('Subscription active until:', subscription.endDate);
 * }
 * ```
 */
export async function getMySubscription(): Promise<SubscriptionResponse> {
  const token = await getSessionToken();

  const response = await fetch('/api/subscriptions/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch subscription');
  }

  return (await response.json()) as SubscriptionResponse;
}

/**
 * Cancel the current user's subscription
 *
 * Cancels the authenticated client's active subscription. Optionally include a reason.
 *
 * @param data - Optional cancellation reason
 * @returns Updated subscription with 'cancelled' status
 * @throws Error if request fails or no active subscription exists
 *
 * @example
 * ```typescript
 * const cancelled = await cancelSubscription({ reason: 'Service no longer needed' });
 * console.log('Subscription cancelled:', cancelled.status);
 * ```
 */
export async function cancelSubscription(
  data?: CancelSubscriptionData,
): Promise<SubscriptionResponse> {
  const token = await getSessionToken();

  const response = await fetch('/api/subscriptions/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to cancel subscription');
  }

  return (await response.json()) as SubscriptionResponse;
}

/**
 * Fetch paginated list of all subscriptions (staff only)
 *
 * @param params - Pagination parameters (page, limit)
 * @returns Paginated subscriptions response
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const subscriptions = await getAllSubscriptions({ page: 1, limit: 50 });
 * console.log(`Total subscriptions: ${subscriptions.total}`);
 * ```
 */
export async function getAllSubscriptions(
  params?: PaginationParams,
): Promise<PaginatedSubscriptions> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `/api/subscriptions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch subscriptions');
  }

  const backendResponse = (await response.json()) as PaginatedSubscriptionsResponse;

  return {
    subscriptions: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}
