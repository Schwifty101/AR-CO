/**
 * Shared types and utilities for the Subscriptions module.
 *
 * Contains database row interfaces, row-to-DTO mappers, and LemonSqueezy
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

import type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionEvent,
} from '@repo/shared';

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
  lemonsqueezy_subscription_id: string | null;
  lemonsqueezy_customer_id: string | null;
  lemonsqueezy_order_id: string | null;
  card_brand: string | null;
  card_last_four: string | null;
  ends_at: string | null;
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
  webhook_event_data: Record<string, unknown> | null;
  billing_cycle: number | null;
  amount: number | null;
  status: string | null;
  created_at: string;
}

/**
 * LemonSqueezy webhook payload structure.
 *
 * All LemonSqueezy webhooks share this top-level shape:
 * - meta: event metadata + custom_data passed during checkout
 * - data: JSON:API resource object (order or subscription)
 *
 * @example
 * ```typescript
 * const payload: LemonSqueezyWebhookPayload = JSON.parse(req.rawBody.toString());
 * const eventName = payload.meta.event_name; // 'subscription_created'
 * const userId = payload.meta.custom_data?.user_id;
 * ```
 */
export interface LemonSqueezyWebhookPayload {
  /** Webhook metadata */
  meta: {
    /** Event name (e.g., 'subscription_created', 'order_created') */
    event_name: string;
    /** Webhook endpoint UUID */
    webhook_id: string;
    /** Custom data passed during checkout creation */
    custom_data?: Record<string, string>;
  };
  /** JSON:API resource data (order or subscription) */
  data: {
    /** Resource type ('orders' | 'subscriptions') */
    type: string;
    /** LemonSqueezy resource ID */
    id: string;
    /** Resource attributes */
    attributes: LemonSqueezySubscriptionAttributes | LemonSqueezyOrderAttributes;
  };
}

/**
 * Attributes for a LemonSqueezy subscription resource.
 */
export interface LemonSqueezySubscriptionAttributes {
  store_id: number;
  customer_id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name: string;
  user_name: string;
  user_email: string;
  status: string;
  card_brand: string | null;
  card_last_four: string | null;
  renews_at: string | null;
  ends_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * Attributes for a LemonSqueezy order resource.
 */
export interface LemonSqueezyOrderAttributes {
  store_id: number;
  customer_id: number;
  identifier: string;
  order_number: number;
  user_name: string;
  user_email: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  total_formatted: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
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
