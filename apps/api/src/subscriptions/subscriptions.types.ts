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
 * Re-export canonical webhook payload types from the payments module.
 * Single source of truth — defined in payments/types/webhook.types.ts.
 */
export type {
  LemonSqueezyWebhookPayload,
  LemonSqueezySubscriptionAttributes,
  LemonSqueezyOrderAttributes,
} from '../payments/types/webhook.types';

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
