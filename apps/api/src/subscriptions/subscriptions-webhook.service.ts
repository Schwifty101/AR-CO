/**
 * Subscriptions Webhook Service
 *
 * Handles all LemonSqueezy subscription webhook lifecycle events:
 * - subscription_created  → activates pending subscription record
 * - subscription_updated  → syncs card info and maps LS status to our enum
 * - subscription_payment_success  → increments billing cycle, records last paid
 * - subscription_payment_failed   → marks subscription unpaid
 * - subscription_payment_recovered → restores active status
 * - subscription_cancelled  → records grace period without changing status
 * - subscription_expired    → terminates subscription (ENDED)
 *
 * All handlers are non-throwing: errors are logged and the method returns
 * so that the webhook endpoint always responds 200 to LemonSqueezy.
 *
 * @module SubscriptionsModule
 *
 * @example
 * ```typescript
 * await subscriptionsWebhookService.handleSubscriptionCreated(payload);
 * await subscriptionsWebhookService.handleSubscriptionExpired(payload);
 * ```
 */

import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionStatus } from '@repo/shared';
import { SupabaseService } from '../database/supabase.service';
import type {
  LemonSqueezyWebhookPayload,
  UserSubscriptionRow,
} from './subscriptions.types';
import type { LemonSqueezySubscriptionData } from '../payments/types/webhook.types';

/**
 * Service that processes LemonSqueezy subscription webhook events
 * and writes the resulting state changes to user_subscriptions and
 * subscription_events tables.
 *
 * Uses getAdminClient() exclusively — webhooks are server-to-server and
 * must bypass Row Level Security.
 *
 * @example
 * ```typescript
 * @Module({
 *   providers: [SubscriptionsWebhookService],
 * })
 * export class SubscriptionsModule {}
 * ```
 */
@Injectable()
export class SubscriptionsWebhookService {
  private readonly logger = new Logger(SubscriptionsWebhookService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // ─── Public webhook handlers ──────────────────────────────────────

  /**
   * Handle subscription_created webhook.
   *
   * Finds the most recent pending subscription for the user identified in
   * custom_data, then activates it with LemonSqueezy IDs and billing period.
   *
   * @param payload - Verified LemonSqueezy webhook payload
   */
  async handleSubscriptionCreated(
    payload: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    const data = payload.data as LemonSqueezySubscriptionData;
    const attributes = data.attributes;
    const userId = payload.meta.custom_data?.user_id;

    if (!userId) {
      this.logger.warn(
        'handleSubscriptionCreated: missing user_id in custom_data',
      );
      return;
    }

    const client = this.supabaseService.getAdminClient();
    const { data: rawSub, error } = await client
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', SubscriptionStatus.PENDING)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !rawSub) {
      this.logger.warn(
        `handleSubscriptionCreated: no pending subscription for user ${userId}`,
      );
      return;
    }

    const sub = rawSub as unknown as UserSubscriptionRow;
    const now = new Date().toISOString();

    await client
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.ACTIVE,
        lemonsqueezy_subscription_id: data.id,
        lemonsqueezy_customer_id: String(attributes.customer_id),
        lemonsqueezy_order_id: String(attributes.order_id),
        card_brand: attributes.card_brand,
        card_last_four: attributes.card_last_four,
        current_period_start: now,
        current_period_end: attributes.renews_at,
        current_billing_cycle: 1,
        updated_at: now,
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.created', attributes);
    this.logger.log(`Subscription ${sub.id} activated for user ${userId}`);
  }

  /**
   * Handle subscription_updated webhook.
   *
   * Syncs card details and renewal date. Maps LemonSqueezy status to our enum;
   * the 'cancelled' LS status is deliberately excluded here because
   * grace-period semantics are handled by handleSubscriptionCancelled.
   *
   * @param payload - Verified LemonSqueezy webhook payload
   */
  async handleSubscriptionUpdated(
    payload: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    const data = payload.data as LemonSqueezySubscriptionData;
    const attributes = data.attributes;

    const sub = await this.findByLsId(data.id, 'handleSubscriptionUpdated');
    if (!sub) return;

    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.UNPAID,
      paused: SubscriptionStatus.PAUSED,
      expired: SubscriptionStatus.ENDED,
    };

    const mappedStatus =
      statusMap[attributes.status] ?? (sub.status as SubscriptionStatus);

    await this.supabaseService
      .getAdminClient()
      .from('user_subscriptions')
      .update({
        card_brand: attributes.card_brand,
        card_last_four: attributes.card_last_four,
        current_period_end: attributes.renews_at,
        ends_at: attributes.ends_at,
        status: mappedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.updated', attributes);
  }

  /**
   * Handle subscription_payment_success webhook.
   *
   * Marks subscription active, increments billing cycle, and records last paid time.
   *
   * @param payload - Verified LemonSqueezy webhook payload
   */
  async handlePaymentSuccess(
    payload: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    const data = payload.data as LemonSqueezySubscriptionData;
    const attributes = data.attributes;

    const sub = await this.findByLsId(data.id, 'handlePaymentSuccess');
    if (!sub) return;

    await this.supabaseService
      .getAdminClient()
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.ACTIVE,
        current_period_end: attributes.renews_at,
        last_paid_at: new Date().toISOString(),
        current_billing_cycle: (sub.current_billing_cycle ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.payment_success', attributes);
  }

  /**
   * Handle subscription_payment_failed webhook.
   *
   * Marks subscription unpaid so the dashboard can surface a payment action.
   *
   * @param payload - Verified LemonSqueezy webhook payload
   */
  async handlePaymentFailed(
    payload: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    const data = payload.data as LemonSqueezySubscriptionData;
    const attributes = data.attributes;

    const sub = await this.findByLsId(data.id, 'handlePaymentFailed');
    if (!sub) return;

    await this.supabaseService
      .getAdminClient()
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.UNPAID,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.payment_failed', attributes);
  }

  /**
   * Handle subscription_payment_recovered webhook.
   *
   * Restores active status after a previously failed payment is recovered.
   *
   * @param payload - Verified LemonSqueezy webhook payload
   */
  async handlePaymentRecovered(
    payload: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    const data = payload.data as LemonSqueezySubscriptionData;
    const attributes = data.attributes;

    const sub = await this.findByLsId(data.id, 'handlePaymentRecovered');
    if (!sub) return;

    await this.supabaseService
      .getAdminClient()
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.ACTIVE,
        current_period_end: attributes.renews_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.payment_recovered', attributes);
  }

  /**
   * Handle subscription_cancelled webhook.
   *
   * Records the cancellation timestamp and grace-period end date.
   * Status intentionally stays ACTIVE through the grace period so the
   * client retains access — it becomes ENDED via subscription_expired.
   *
   * @param payload - Verified LemonSqueezy webhook payload
   */
  async handleSubscriptionCancelled(
    payload: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    const data = payload.data as LemonSqueezySubscriptionData;
    const attributes = data.attributes;

    const sub = await this.findByLsId(data.id, 'handleSubscriptionCancelled');
    if (!sub) return;

    await this.supabaseService
      .getAdminClient()
      .from('user_subscriptions')
      .update({
        cancelled_at: new Date().toISOString(),
        ends_at: attributes.ends_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.cancelled', attributes);
  }

  /**
   * Handle subscription_expired webhook.
   *
   * Terminates the subscription: status becomes ENDED, ended_at is stamped,
   * and ends_at is cleared (no longer in grace period).
   *
   * @param payload - Verified LemonSqueezy webhook payload
   */
  async handleSubscriptionExpired(
    payload: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    const data = payload.data as LemonSqueezySubscriptionData;
    const attributes = data.attributes;

    const sub = await this.findByLsId(data.id, 'handleSubscriptionExpired');
    if (!sub) return;

    await this.supabaseService
      .getAdminClient()
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.ENDED,
        ends_at: null,
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.expired', attributes);
  }

  // ─── Private helpers ──────────────────────────────────────────────

  /**
   * Find a user_subscriptions row by LemonSqueezy subscription ID.
   *
   * Returns null (and logs a warning) if not found — callers must guard on null.
   *
   * @param lsSubscriptionId - LemonSqueezy subscription ID string
   * @param callerName - Method name for log context
   */
  private async findByLsId(
    lsSubscriptionId: string,
    callerName: string,
  ): Promise<UserSubscriptionRow | null> {
    const client = this.supabaseService.getAdminClient();
    const { data: rawSub, error } = await client
      .from('user_subscriptions')
      .select('*')
      .eq('lemonsqueezy_subscription_id', lsSubscriptionId)
      .maybeSingle();

    if (error || !rawSub) {
      this.logger.warn(
        `${callerName}: subscription ${lsSubscriptionId} not found`,
      );
      return null;
    }

    return rawSub as unknown as UserSubscriptionRow;
  }

  /**
   * Log a subscription lifecycle event to the subscription_events table.
   *
   * @param subscriptionId - UUID of the user_subscriptions record
   * @param eventType - Event type string
   * @param eventData - Raw webhook attributes for debugging
   * @param extra - Optional billing cycle and amount overrides
   */
  async logEvent(
    subscriptionId: string,
    eventType: string,
    eventData: unknown,
    extra?: { billingCycle?: number; amount?: number },
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();
    await client.from('subscription_events').insert({
      subscription_id: subscriptionId,
      event_type: eventType,
      webhook_event_data: eventData as Record<string, unknown>,
      billing_cycle: extra?.billingCycle ?? null,
      amount: extra?.amount ?? null,
      status:
        ((eventData as Record<string, unknown>)?.status as string) ?? null,
    });
  }
}
