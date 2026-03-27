/**
 * LemonSqueezy Webhook Payload Types
 *
 * TypeScript interfaces for all LemonSqueezy webhook payloads received at
 * `POST /api/webhooks/lemonsqueezy`. Covers order and subscription events.
 *
 * @module WebhookTypes
 *
 * @example
 * ```typescript
 * import type { LemonSqueezyWebhookPayload } from './types/webhook.types';
 *
 * function handleWebhook(payload: LemonSqueezyWebhookPayload) {
 *   const { event_name } = payload.meta;
 *   const { payment_type } = payload.meta.custom_data ?? {};
 * }
 * ```
 */

/** All LemonSqueezy webhook event names used by AR-CO */
export enum LemonSqueezyEventName {
  ORDER_CREATED = 'order_created',
  ORDER_REFUNDED = 'order_refunded',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPDATED = 'subscription_updated',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_RESUMED = 'subscription_resumed',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  SUBSCRIPTION_PAUSED = 'subscription_paused',
  SUBSCRIPTION_UNPAUSED = 'subscription_unpaused',
  SUBSCRIPTION_PAYMENT_SUCCESS = 'subscription_payment_success',
  SUBSCRIPTION_PAYMENT_FAILED = 'subscription_payment_failed',
  SUBSCRIPTION_PAYMENT_RECOVERED = 'subscription_payment_recovered',
}

/** Payment type values embedded in checkout custom_data */
export enum PaymentType {
  SUBSCRIPTION = 'subscription',
  CONSULTATION = 'consultation',
  SERVICE = 'service',
}

/** Custom data passed through checkout into every webhook payload */
export interface LemonSqueezyCustomData {
  /** Identifies the AR-CO payment flow */
  payment_type?: PaymentType | string;
  /** Internal reference ID (e.g. "CON-2026-0001", "SVC-2026-0001") */
  reference_id?: string;
  /** UUID of the consultation booking (order flows) */
  booking_id?: string;
  /** UUID of the service registration (order flows) */
  registration_id?: string;
  /** UUID of the Supabase user (subscription flows) */
  user_id?: string;
  /** UUID of the client profile (subscription flows) */
  client_profile_id?: string;
  /** Allow additional string keys */
  [key: string]: string | undefined;
}

/** Meta section present in every webhook payload */
export interface LemonSqueezyWebhookMeta {
  /** Unique ID of this webhook delivery (used for idempotency) */
  event_id: string;
  /** Name of the event that triggered this webhook */
  event_name: LemonSqueezyEventName | string;
  /** Custom data passed during checkout creation */
  custom_data?: LemonSqueezyCustomData;
}

/** Attributes for order events (`order_created`, `order_refunded`) */
export interface LemonSqueezyOrderAttributes {
  store_id: number;
  customer_id: number;
  identifier: string;
  order_number: number;
  user_name: string;
  user_email: string;
  currency: string;
  /** Total in cents */
  total: number;
  total_formatted: string;
  /** e.g. "paid", "refunded" */
  status: string;
  first_order_item: {
    product_name: string;
    variant_name: string;
    price: number;
  } | null;
  created_at: string;
  test_mode: boolean;
}

/** Attributes for subscription events */
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
  /** e.g. "active", "cancelled", "expired", "past_due", "paused" */
  status: string;
  card_brand: string | null;
  card_last_four: string | null;
  /** ISO date — next renewal date */
  renews_at: string | null;
  /** ISO date — when the subscription ends (grace period after cancel) */
  ends_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
}

/** Union data payload — either an order or a subscription object */
export interface LemonSqueezyOrderData {
  type: 'orders';
  id: string;
  attributes: LemonSqueezyOrderAttributes;
}

export interface LemonSqueezySubscriptionData {
  type: 'subscriptions';
  id: string;
  attributes: LemonSqueezySubscriptionAttributes;
}

/** Full webhook payload from LemonSqueezy */
export interface LemonSqueezyWebhookPayload {
  meta: LemonSqueezyWebhookMeta;
  data: LemonSqueezyOrderData | LemonSqueezySubscriptionData;
}

/** Processed webhook event row shape for `webhook_events` table */
export interface WebhookEventRow {
  id: string;
  event_id: string;
  event_name: string;
  payment_type: string | null;
  processed_at: string;
  payload: LemonSqueezyWebhookPayload;
}
