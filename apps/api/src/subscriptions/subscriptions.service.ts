/**
 * Subscriptions Service
 *
 * Core business logic for subscription management:
 * - Plan listing (public)
 * - Subscription initiation with Safepay checkout
 * - Current subscription retrieval (client)
 * - Safepay webhook processing for lifecycle events
 * - Subscription cancellation (client or admin)
 * - Admin listing with filters and pagination
 * - Plan sync to Safepay (admin one-time operation)
 *
 * @module SubscriptionsModule
 *
 * @example
 * ```typescript
 * const plans = await subscriptionsService.getPlans();
 * const checkout = await subscriptionsService.initiateSubscription(user, 'premium-monthly');
 * const mySub = await subscriptionsService.getMySubscription(userId);
 * ```
 */

import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionStatus } from '@repo/shared';
import type {
  SubscriptionPlan,
  SubscriptionCheckoutResponse,
  SubscriptionDetail,
  PaginatedSubscriptionsResponse,
  SubscriptionFilters,
} from '@repo/shared';
import { SupabaseService } from '../database/supabase.service';
import { SafepaySubscriptionService } from '../payments/safepay-subscription.service';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  type SubscriptionPlanRow,
  type UserSubscriptionRow,
  type SubscriptionEventRow,
  type SafepaySubscriptionWebhookPayload,
  mapPlanRow,
  mapSubscriptionRow,
  mapEventRow,
  safepayTimestampToISO,
} from './subscriptions.types';
import { randomUUID } from 'crypto';

/**
 * Service managing subscription plans, user subscriptions, and Safepay integration.
 *
 * Uses SupabaseService for database operations and SafepaySubscriptionService
 * for payment gateway interactions. All DB queries use getAdminClient() since
 * subscriptions require cross-user access for webhook processing.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [PaymentsModule],
 *   providers: [SubscriptionsService],
 * })
 * export class SubscriptionsModule {}
 * ```
 */
@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly safepaySubscription: SafepaySubscriptionService,
  ) {}

  /**
   * List all active subscription plans ordered by amount ascending.
   *
   * Public endpoint - no auth required.
   *
   * @returns Array of active subscription plans
   *
   * @example
   * ```typescript
   * const plans = await subscriptionsService.getPlans();
   * // [{ id, name, slug, amount, currency, interval, features, ... }]
   * ```
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const client = this.supabaseService.getAdminClient();
    const { data, error } = await client
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('amount', { ascending: true });

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return (data as SubscriptionPlanRow[]).map(mapPlanRow);
  }

  /**
   * Get the current user's active/pending/paused subscription with event history.
   *
   * Returns the most recent non-terminal subscription, or null if none exists.
   *
   * @param userId - Supabase auth user UUID
   * @returns Subscription detail with events, or null
   *
   * @example
   * ```typescript
   * const sub = await subscriptionsService.getMySubscription(user.id);
   * if (sub) console.log(sub.status, sub.plan.name);
   * ```
   */
  async getMySubscription(userId: string): Promise<SubscriptionDetail | null> {
    const client = this.supabaseService.getAdminClient();

    const { data: sub, error } = await client
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .in('status', [
        SubscriptionStatus.ACTIVE,
        SubscriptionStatus.PENDING,
        SubscriptionStatus.PAUSED,
        SubscriptionStatus.UNPAID,
      ])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    if (!sub) return null;

    const plan = sub.subscription_plans as unknown as SubscriptionPlanRow;
    const subRow = sub as unknown as UserSubscriptionRow;

    // Fetch events for detail view
    const { data: events } = await client
      .from('subscription_events')
      .select('*')
      .eq('subscription_id', sub.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      ...mapSubscriptionRow(subRow, plan),
      events: ((events || []) as SubscriptionEventRow[]).map(mapEventRow),
    };
  }

  /**
   * Initiate a new subscription checkout flow.
   *
   * 1. Validates no existing active/pending subscription
   * 2. Fetches plan by slug and verifies Safepay sync
   * 3. Creates pending user_subscriptions record
   * 4. Generates Safepay checkout URL via SDK
   *
   * @param user - Authenticated client user
   * @param planSlug - URL-safe plan identifier (e.g., 'premium-monthly')
   * @returns Checkout URL, subscription ID, and reference
   * @throws {HttpException} CONFLICT if already subscribed, NOT_FOUND if plan missing
   *
   * @example
   * ```typescript
   * const { checkoutUrl, subscriptionId } =
   *   await subscriptionsService.initiateSubscription(user, 'premium-monthly');
   * // Redirect user to checkoutUrl
   * ```
   */
  async initiateSubscription(
    user: AuthUser,
    planSlug: string,
  ): Promise<SubscriptionCheckoutResponse> {
    const client = this.supabaseService.getAdminClient();

    // 1. Check no active/pending subscription
    const { data: existing } = await client
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING])
      .limit(1)
      .maybeSingle();

    if (existing) {
      throw new HttpException(
        'You already have an active or pending subscription',
        HttpStatus.CONFLICT,
      );
    }

    // 2. Fetch plan
    const { data: plan, error: planError } = await client
      .from('subscription_plans')
      .select('*')
      .eq('slug', planSlug)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
    }

    const planRow = plan as unknown as SubscriptionPlanRow;
    if (!planRow.safepay_plan_token) {
      throw new HttpException(
        'Plan not yet synced with Safepay. Contact admin.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // 3. Create pending subscription record
    const reference = `SUB-${randomUUID()}`;
    const { data: subscription, error: insertError } = await client
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planRow.id,
        status: SubscriptionStatus.PENDING,
        reference,
      })
      .select()
      .single();

    if (insertError) {
      throw new HttpException(
        insertError.message,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 4. Generate checkout URL
    const checkoutUrl =
      await this.safepaySubscription.generateSubscriptionCheckoutUrl({
        planToken: planRow.safepay_plan_token,
        reference,
      });

    this.logger.log(
      `Initiated subscription ${subscription.id} for user ${user.id}`,
    );

    return {
      checkoutUrl,
      subscriptionId: subscription.id,
      reference,
    };
  }

  /**
   * Process a Safepay subscription webhook event.
   *
   * Verifies the webhook signature, then routes to the appropriate handler
   * based on event type. Handles both dot-notation and underscore variants
   * of payment event types.
   *
   * @param body - Safepay webhook payload
   * @param headers - HTTP request headers (must include X-SFPY-SIGNATURE)
   * @throws {HttpException} UNAUTHORIZED if signature is invalid
   *
   * @example
   * ```typescript
   * await subscriptionsService.handleWebhook(req.body, req.headers);
   * ```
   */
  async handleWebhook(
    body: SafepaySubscriptionWebhookPayload,
    headers: Record<string, string>,
  ): Promise<void> {
    // Verify signature
    const isValid = this.safepaySubscription.verifyWebhook({
      body,
      headers: headers as unknown as import('http').IncomingHttpHeaders,
    });

    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    const eventType = body.type;
    const eventData = body.data;
    this.logger.log(`Received webhook: ${eventType}`);

    // Normalize event type (handle both dot and underscore variants)
    const normalizedType = eventType
      .replace('subscription.payment_succeeded', 'subscription.payment.succeeded')
      .replace('subscription.payment_failed', 'subscription.payment.failed');

    switch (normalizedType) {
      case 'subscription.created':
        await this.handleSubscriptionCreated(eventData);
        break;
      case 'subscription.payment.succeeded':
        await this.handlePaymentSucceeded(eventData);
        break;
      case 'subscription.payment.failed':
        await this.handlePaymentFailed(eventData);
        break;
      case 'subscription.canceled':
        await this.handleSubscriptionCancelled(eventData);
        break;
      case 'subscription.ended':
        await this.handleSubscriptionEnded(eventData);
        break;
      case 'subscription.paused':
        await this.handleSubscriptionPaused(eventData);
        break;
      case 'subscription.resumed':
        await this.handleSubscriptionResumed(eventData);
        break;
      default:
        this.logger.warn(`Unhandled subscription webhook: ${eventType}`);
    }
  }

  /**
   * Cancel a subscription (callable by client or admin/staff).
   *
   * Clients can only cancel their own subscription. Admins/staff can cancel any.
   * Cancels on Safepay if a safepay_subscription_id exists, then updates local record.
   *
   * @param subscriptionId - UUID of the user_subscriptions record
   * @param cancelledBy - Authenticated user performing the cancellation
   * @throws {HttpException} NOT_FOUND, FORBIDDEN, or BAD_REQUEST
   *
   * @example
   * ```typescript
   * await subscriptionsService.cancelSubscription('sub-uuid', currentUser);
   * ```
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelledBy: AuthUser,
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();

    const { data: sub, error } = await client
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error || !sub) {
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
    }

    const subRow = sub as unknown as UserSubscriptionRow;

    // Clients can only cancel their own subscription
    if (
      cancelledBy.userType === 'client' &&
      subRow.user_id !== cancelledBy.id
    ) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    if (
      subRow.status === SubscriptionStatus.CANCELLED ||
      subRow.status === SubscriptionStatus.ENDED
    ) {
      throw new HttpException(
        'Subscription is already cancelled or ended',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cancel on Safepay if we have the subscription ID
    if (subRow.safepay_subscription_id) {
      await this.safepaySubscription.cancelSubscription(
        subRow.safepay_subscription_id,
      );
    }

    // Update local record
    await client
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.CANCELLED,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    // Log event
    await this.logEvent(subscriptionId, 'subscription.cancelled_by_user', {
      cancelled_by: cancelledBy.id,
    });

    this.logger.log(
      `Subscription ${subscriptionId} cancelled by ${cancelledBy.id}`,
    );
  }

  /**
   * List all subscriptions with filters and pagination (admin/staff).
   *
   * Joins user_profiles for email and name display. Supports filtering by status.
   *
   * @param filters - Pagination and optional status filter
   * @returns Paginated subscriptions with user info
   *
   * @example
   * ```typescript
   * const result = await subscriptionsService.getSubscriptions({
   *   page: 1, limit: 20, status: SubscriptionStatus.ACTIVE,
   * });
   * // result.data[0].userName, result.total, result.page
   * ```
   */
  async getSubscriptions(
    filters: SubscriptionFilters,
  ): Promise<PaginatedSubscriptionsResponse> {
    const client = this.supabaseService.getAdminClient();
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let query = client
      .from('user_subscriptions')
      .select('*, subscription_plans(*), user_profiles!inner(full_name)', {
        count: 'exact',
      });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    const rows = (data || []) as Array<
      UserSubscriptionRow & {
        subscription_plans: SubscriptionPlanRow;
        user_profiles: { full_name: string };
      }
    >;

    // Fetch emails from auth.users for each unique user
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const emailMap = new Map<string, string>();
    await Promise.all(
      userIds.map(async (uid) => {
        const { data: authData } = await client.auth.admin.getUserById(uid);
        if (authData?.user?.email) {
          emailMap.set(uid, authData.user.email);
        }
      }),
    );

    return {
      data: rows.map((row) => ({
        ...mapSubscriptionRow(row, row.subscription_plans),
        userId: row.user_id,
        userEmail: emailMap.get(row.user_id) || '',
        userName: row.user_profiles?.full_name || '',
      })),
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Get a single subscription by ID with event history (admin/staff).
   *
   * @param id - UUID of the user_subscriptions record
   * @returns Subscription detail with events array
   * @throws {HttpException} NOT_FOUND if subscription does not exist
   *
   * @example
   * ```typescript
   * const detail = await subscriptionsService.getSubscriptionById('sub-uuid');
   * console.log(detail.events.length);
   * ```
   */
  async getSubscriptionById(id: string): Promise<SubscriptionDetail> {
    const client = this.supabaseService.getAdminClient();

    const { data: sub, error } = await client
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('id', id)
      .single();

    if (error || !sub) {
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
    }

    const plan = sub.subscription_plans as unknown as SubscriptionPlanRow;
    const subRow = sub as unknown as UserSubscriptionRow;

    const { data: events } = await client
      .from('subscription_events')
      .select('*')
      .eq('subscription_id', id)
      .order('created_at', { ascending: false });

    return {
      ...mapSubscriptionRow(subRow, plan),
      events: ((events || []) as SubscriptionEventRow[]).map(mapEventRow),
    };
  }

  /**
   * Sync a local subscription plan to Safepay (one-time admin operation).
   *
   * Creates the plan on Safepay via REST API and stores the returned
   * plan token in the subscription_plans table. Idempotent - returns
   * existing token if plan is already synced.
   *
   * @param planId - UUID of the subscription_plans record
   * @returns Safepay plan token (plan_xxx)
   * @throws {HttpException} NOT_FOUND if plan does not exist
   *
   * @example
   * ```typescript
   * const planToken = await subscriptionsService.syncPlanToSafepay('plan-uuid');
   * // planToken = 'plan_xxx'
   * ```
   */
  async syncPlanToSafepay(planId: string): Promise<string> {
    const client = this.supabaseService.getAdminClient();

    const { data: plan, error } = await client
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error || !plan) {
      throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
    }

    const planRow = plan as unknown as SubscriptionPlanRow;
    if (planRow.safepay_plan_token) {
      return planRow.safepay_plan_token;
    }

    const planToken = await this.safepaySubscription.createPlan({
      amount: String(planRow.amount),
      currency: planRow.currency,
      interval: planRow.interval,
      intervalCount: planRow.interval_count,
      product: planRow.name,
    });

    await client
      .from('subscription_plans')
      .update({
        safepay_plan_token: planToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId);

    this.logger.log(`Synced plan ${planId} -> ${planToken}`);
    return planToken;
  }

  // ─── Private webhook handlers ─────────────────────────────────────

  /**
   * Handle subscription.created webhook: link Safepay sub ID to local record.
   */
  private async handleSubscriptionCreated(
    data: SafepaySubscriptionWebhookPayload['data'],
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();
    const safepaySubId = data.id;
    const reference = data.reference;

    if (!safepaySubId) {
      this.logger.warn('subscription.created missing sub ID');
      return;
    }

    // Match by reference (our internal UUID passed during checkout)
    let sub: UserSubscriptionRow | null = null;
    if (reference) {
      const { data: found } = await client
        .from('user_subscriptions')
        .select('*')
        .eq('reference', reference)
        .eq('status', SubscriptionStatus.PENDING)
        .maybeSingle();
      sub = found as unknown as UserSubscriptionRow;
    }

    if (!sub) {
      this.logger.warn(
        `subscription.created: no pending subscription found for reference=${reference}`,
      );
      return;
    }

    await client
      .from('user_subscriptions')
      .update({
        safepay_subscription_id: safepaySubId,
        status: SubscriptionStatus.ACTIVE,
        current_period_start: safepayTimestampToISO(
          data.current_period_start_date,
        ),
        current_period_end: safepayTimestampToISO(
          data.current_period_end_date,
        ),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.created', data);
    this.logger.log(`Subscription ${sub.id} activated (${safepaySubId})`);
  }

  /**
   * Handle subscription.payment.succeeded: update billing cycle and period dates.
   */
  private async handlePaymentSucceeded(
    data: SafepaySubscriptionWebhookPayload['data'],
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();
    const safepaySubId = data.id;

    if (!safepaySubId) return;

    const { data: sub } = await client
      .from('user_subscriptions')
      .select('id')
      .eq('safepay_subscription_id', safepaySubId)
      .maybeSingle();

    if (!sub) {
      this.logger.warn(
        `payment.succeeded: no subscription found for ${safepaySubId}`,
      );
      return;
    }

    await client
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.ACTIVE,
        current_billing_cycle: data.current_billing_cycle ?? null,
        current_period_start: safepayTimestampToISO(
          data.current_period_start_date,
        ),
        current_period_end: safepayTimestampToISO(
          data.current_period_end_date,
        ),
        last_paid_at: safepayTimestampToISO(data.last_paid_date) ||
          new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.payment.succeeded', data, {
      billingCycle: data.current_billing_cycle,
    });
  }

  /**
   * Handle subscription.payment.failed: mark subscription as unpaid.
   */
  private async handlePaymentFailed(
    data: SafepaySubscriptionWebhookPayload['data'],
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();
    const safepaySubId = data.id;

    if (!safepaySubId) return;

    const { data: sub } = await client
      .from('user_subscriptions')
      .select('id')
      .eq('safepay_subscription_id', safepaySubId)
      .maybeSingle();

    if (!sub) return;

    await client
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.UNPAID,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.payment.failed', data);
    this.logger.warn(`Payment failed for subscription ${sub.id}`);
  }

  /**
   * Handle subscription.canceled: mark subscription as cancelled.
   */
  private async handleSubscriptionCancelled(
    data: SafepaySubscriptionWebhookPayload['data'],
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();
    const safepaySubId = data.id;

    if (!safepaySubId) return;

    const { data: sub } = await client
      .from('user_subscriptions')
      .select('id')
      .eq('safepay_subscription_id', safepaySubId)
      .maybeSingle();

    if (!sub) return;

    await client
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.CANCELLED,
        cancelled_at: safepayTimestampToISO(data.canceled_at) ||
          new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.canceled', data);
  }

  /**
   * Handle subscription.ended: mark subscription as ended (terminal state).
   */
  private async handleSubscriptionEnded(
    data: SafepaySubscriptionWebhookPayload['data'],
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();
    const safepaySubId = data.id;

    if (!safepaySubId) return;

    const { data: sub } = await client
      .from('user_subscriptions')
      .select('id')
      .eq('safepay_subscription_id', safepaySubId)
      .maybeSingle();

    if (!sub) return;

    await client
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.ENDED,
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.ended', data);
  }

  /**
   * Handle subscription.paused: mark subscription as paused.
   */
  private async handleSubscriptionPaused(
    data: SafepaySubscriptionWebhookPayload['data'],
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();
    const safepaySubId = data.id;

    if (!safepaySubId) return;

    const { data: sub } = await client
      .from('user_subscriptions')
      .select('id')
      .eq('safepay_subscription_id', safepaySubId)
      .maybeSingle();

    if (!sub) return;

    await client
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.PAUSED,
        paused_at: safepayTimestampToISO(data.paused_at) ||
          new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.paused', data);
  }

  /**
   * Handle subscription.resumed: reactivate paused subscription.
   */
  private async handleSubscriptionResumed(
    data: SafepaySubscriptionWebhookPayload['data'],
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();
    const safepaySubId = data.id;

    if (!safepaySubId) return;

    const { data: sub } = await client
      .from('user_subscriptions')
      .select('id')
      .eq('safepay_subscription_id', safepaySubId)
      .maybeSingle();

    if (!sub) return;

    await client
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.ACTIVE,
        paused_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    await this.logEvent(sub.id, 'subscription.resumed', data);
  }

  /**
   * Log a subscription lifecycle event to the subscription_events table.
   *
   * @param subscriptionId - UUID of the user_subscriptions record
   * @param eventType - Event type string (e.g., 'subscription.created')
   * @param eventData - Raw Safepay event data for debugging
   * @param extra - Optional billing cycle and amount overrides
   */
  private async logEvent(
    subscriptionId: string,
    eventType: string,
    eventData: unknown,
    extra?: { billingCycle?: number; amount?: number },
  ): Promise<void> {
    const client = this.supabaseService.getAdminClient();
    await client.from('subscription_events').insert({
      subscription_id: subscriptionId,
      event_type: eventType,
      safepay_event_data: eventData as Record<string, unknown>,
      billing_cycle: extra?.billingCycle ?? null,
      amount: extra?.amount ?? null,
      status:
        (eventData as Record<string, unknown>)?.status as string ?? null,
    });
  }
}
