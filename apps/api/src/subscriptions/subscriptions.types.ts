/**
 * Shared types and utilities for the Subscriptions module.
 *
 * Contains database row interfaces, row-to-DTO mappers, and Safepay
 * webhook payload types used by SubscriptionsService.
 *
 * @module SubscriptionsModule
 *
 * @example
 * ```typescript
 * import { mapPlanRow, mapSubscriptionRow } from './subscriptions.types';
 * const plan = mapPlanRow(dbPlanRow);
 * const sub = mapSubscriptionRow(dbSubRow, dbPlanRow);
 * ```
 */

import type { SubscriptionPlan, UserSubscription, SubscriptionEvent } from '@repo/shared';

/**
 * Database row shape for subscription_plans table (snake_case)
 *
 * @example
 * ```typescript
 * const { data } = await client.from('subscription_plans').select('*');
 * const rows = data as SubscriptionPlanRow[];
 * ```
 */
export interface SubscriptionPlanRow {
  id: string;
  safepay_plan_token: string | null;
  name: string;
  slug: string;
  description: string | null;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Database row shape for user_subscriptions table (snake_case)
 *
 * @example
 * ```typescript
 * const { data } = await client.from('user_subscriptions').select('*');
 * const rows = data as UserSubscriptionRow[];
 * ```
 */
export interface UserSubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  safepay_subscription_id: string | null;
  status: string;
  current_billing_cycle: number | null;
  current_period_start: string | null;
  current_period_end: string | null;
  last_paid_at: string | null;
  cancelled_at: string | null;
  paused_at: string | null;
  ended_at: string | null;
  reference: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database row shape for subscription_events table (snake_case)
 *
 * @example
 * ```typescript
 * const { data } = await client.from('subscription_events').select('*');
 * const rows = data as SubscriptionEventRow[];
 * ```
 */
export interface SubscriptionEventRow {
  id: string;
  subscription_id: string;
  event_type: string;
  safepay_event_data: Record<string, unknown> | null;
  billing_cycle: number | null;
  amount: number | null;
  status: string | null;
  created_at: string;
}

/**
 * Maps a subscription_plans DB row to the API response shape.
 *
 * @param row - Database row from subscription_plans table
 * @returns Mapped plan response object (camelCase)
 *
 * @example
 * ```typescript
 * const mapped = mapPlanRow(dbRow);
 * // mapped.intervalCount === dbRow.interval_count
 * ```
 */
export function mapPlanRow(row: SubscriptionPlanRow): SubscriptionPlan {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    amount: row.amount,
    currency: row.currency,
    interval: row.interval as SubscriptionPlan['interval'],
    intervalCount: row.interval_count,
    features: row.features || [],
    isActive: row.is_active,
  };
}

/**
 * Maps a user_subscriptions DB row + plan to the API response shape.
 *
 * @param row - Database row from user_subscriptions table
 * @param plan - Associated subscription_plans row
 * @returns Mapped subscription response object (camelCase)
 *
 * @example
 * ```typescript
 * const mapped = mapSubscriptionRow(subRow, planRow);
 * // mapped.currentBillingCycle === subRow.current_billing_cycle
 * ```
 */
export function mapSubscriptionRow(
  row: UserSubscriptionRow,
  plan: SubscriptionPlanRow,
): UserSubscription {
  return {
    id: row.id,
    plan: mapPlanRow(plan),
    status: row.status as UserSubscription['status'],
    currentBillingCycle: row.current_billing_cycle,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    lastPaidAt: row.last_paid_at,
    cancelledAt: row.cancelled_at,
    pausedAt: row.paused_at,
    createdAt: row.created_at,
  };
}

/**
 * Maps a subscription_events DB row to the API response shape.
 *
 * @param row - Database row from subscription_events table
 * @returns Mapped event response object (camelCase)
 *
 * @example
 * ```typescript
 * const mapped = mapEventRow(eventRow);
 * // mapped.eventType === eventRow.event_type
 * ```
 */
export function mapEventRow(row: SubscriptionEventRow): SubscriptionEvent {
  return {
    id: row.id,
    eventType: row.event_type,
    billingCycle: row.billing_cycle,
    amount: row.amount,
    status: row.status,
    createdAt: row.created_at,
  };
}

/**
 * Safepay webhook event payload shape for subscription events.
 *
 * Safepay subscription webhooks have a different shape from payment webhooks:
 * - type: Event type (e.g., 'subscription.created', 'subscription.payment_succeeded')
 * - data: Subscription data with id (sub_xxx), plan_id, status, billing cycle info
 * - Timestamps are { seconds: number } format (Unix epoch seconds)
 *
 * @example
 * ```typescript
 * const payload: SafepaySubscriptionWebhookPayload = req.body;
 * const safepaySubId = payload.data.id; // 'sub_xxx'
 * ```
 */
export interface SafepaySubscriptionWebhookPayload {
  /** Webhook event type (e.g., 'subscription.created') */
  type: string;
  /** Subscription event data */
  data: {
    /** Safepay subscription ID (sub_xxx) */
    id?: string;
    /** Safepay plan ID (plan_xxx) */
    plan_id?: string;
    /** Subscription status */
    status?: string;
    /** Amount in paisa */
    amount?: number;
    /** ISO currency code */
    currency?: string;
    /** Current billing cycle number */
    current_billing_cycle?: number;
    /** Period start as Safepay timestamp */
    current_period_start_date?: { seconds: number };
    /** Period end as Safepay timestamp */
    current_period_end_date?: { seconds: number };
    /** Last payment date as Safepay timestamp */
    last_paid_date?: { seconds: number };
    /** Cancellation date as Safepay timestamp */
    canceled_at?: { seconds: number };
    /** Pause date as Safepay timestamp */
    paused_at?: { seconds: number };
    /** Resume date as Safepay timestamp */
    resumed_at?: { seconds: number };
    /** Transaction ID for payment events */
    transaction_id?: string;
    /** Transaction status */
    transaction_status?: string;
    /** Transaction error code */
    transaction_error_code?: string;
    /** Transaction error message */
    transaction_error_message?: string;
    /** Our internal reference passed during checkout */
    reference?: string;
    /** Total number of billing cycles */
    number_of_billing_cycles?: number;
    /** Allow additional unknown fields */
    [key: string]: unknown;
  };
  /** Event creation timestamp */
  created_at?: { seconds: number };
}

/**
 * Convert Safepay timestamp { seconds: number } to ISO 8601 string.
 *
 * Safepay webhooks send timestamps as objects with a `seconds` field
 * containing Unix epoch seconds. This converts to ISO string for DB storage.
 *
 * @param ts - Safepay timestamp object or undefined
 * @returns ISO 8601 string or null if timestamp is missing
 *
 * @example
 * ```typescript
 * safepayTimestampToISO({ seconds: 1708300800 }); // '2024-02-19T00:00:00.000Z'
 * safepayTimestampToISO(undefined); // null
 * ```
 */
export function safepayTimestampToISO(
  ts: { seconds: number } | undefined,
): string | null {
  if (!ts?.seconds) return null;
  return new Date(ts.seconds * 1000).toISOString();
}
