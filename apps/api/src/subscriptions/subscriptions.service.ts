/**
 * Subscriptions Service
 *
 * Core business logic for subscription management:
 * - Plan listing (public)
 * - Subscription initiation with LemonSqueezy checkout
 * - Current subscription retrieval (client)
 * - LemonSqueezy webhook processing for lifecycle events (Task 10D)
 * - Subscription cancellation (client or admin)
 * - Admin listing with filters and pagination
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

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SubscriptionStatus, UserType } from '@repo/shared';
import type {
  SubscriptionPlan,
  SubscriptionCheckoutResponse,
  SubscriptionDetail,
  PaginatedSubscriptionsResponse,
  SubscriptionFilters,
} from '@repo/shared';
import { SupabaseService } from '../database/supabase.service';
import { LemonSqueezyService } from '../payments/lemonsqueezy.service';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  type SubscriptionPlanRow,
  type UserSubscriptionRow,
  type SubscriptionEventRow,
  type LemonSqueezyWebhookPayload,
  mapPlanRow,
  mapSubscriptionRow,
  mapEventRow,
} from './subscriptions.types';
import { randomUUID } from 'crypto';

/**
 * Service managing subscription plans, user subscriptions, and LemonSqueezy integration.
 *
 * Uses SupabaseService for database operations and LemonSqueezyService
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
    private readonly lemonsqueezyService: LemonSqueezyService,
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: rawSub, error } = await client
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

    if (!rawSub) return null;

    const sub = rawSub as unknown as UserSubscriptionRow & {
      subscription_plans: SubscriptionPlanRow;
    };
    const plan = sub.subscription_plans;

    // Fetch events for detail view
    const { data: events } = await client
      .from('subscription_events')
      .select('*')
      .eq('subscription_id', sub.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      ...mapSubscriptionRow(sub, plan),
      events: ((events || []) as SubscriptionEventRow[]).map(mapEventRow),
    };
  }

  /**
   * Initiate a new subscription checkout flow.
   *
   * 1. Validates no existing active/pending subscription
   * 2. Fetches plan by slug
   * 3. Creates pending user_subscriptions record
   * 4. Generates LemonSqueezy checkout URL via SDK
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

    const { data: rawExisting } = await client
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING])
      .limit(1)
      .maybeSingle();

    if (rawExisting) {
      throw new HttpException(
        'You already have an active or pending subscription',
        HttpStatus.CONFLICT,
      );
    }

    // 2. Fetch plan
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: rawPlan, error: planError } = await client
      .from('subscription_plans')
      .select('*')
      .eq('slug', planSlug)
      .eq('is_active', true)
      .single();

    if (planError || !rawPlan) {
      throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
    }

    const planRow = rawPlan as unknown as SubscriptionPlanRow;

    // 3. Create pending subscription record
    const reference = `SUB-${randomUUID()}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: rawSubscription, error: insertError } = await client
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
      throw new HttpException(insertError.message, HttpStatus.BAD_REQUEST);
    }

    const subscription = rawSubscription as unknown as { id: string };

    // 4. Generate checkout URL
    const { checkoutUrl } =
      await this.lemonsqueezyService.createSubscriptionCheckout({
        email: user.email,
        name: user.fullName || user.email,
        customData: {
          payment_type: 'subscription',
          user_id: user.id,
          reference,
        },
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?type=subscription`,
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
   * Cancel a subscription (callable by client or admin/staff).
   *
   * Clients can only cancel their own subscription. Admins/staff can cancel any.
   * Cancels on LemonSqueezy if a lemonsqueezy_subscription_id exists, then updates local record.
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: rawSub, error } = await client
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error || !rawSub) {
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
    }

    const subRow = rawSub as unknown as UserSubscriptionRow;

    // Clients can only cancel their own subscription
    if (
      cancelledBy.userType === UserType.CLIENT &&
      subRow.user_id !== cancelledBy.id
    ) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    if (
      subRow.status === (SubscriptionStatus.CANCELLED as string) ||
      subRow.status === (SubscriptionStatus.ENDED as string)
    ) {
      throw new HttpException(
        'Subscription is already cancelled or ended',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cancel on LemonSqueezy if we have the subscription ID
    if (subRow.lemonsqueezy_subscription_id) {
      await this.lemonsqueezyService.cancelSubscription(
        subRow.lemonsqueezy_subscription_id,
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: rawSubById, error } = await client
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('id', id)
      .single();

    if (error || !rawSubById) {
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
    }

    const subRow = rawSubById as unknown as UserSubscriptionRow & {
      subscription_plans: SubscriptionPlanRow;
    };
    const plan = subRow.subscription_plans;

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

  // ─── Webhook handlers (implemented in Task 10D) ──────────────────

  /**
   * Handle subscription_created webhook (stub — implemented in Task 10D).
   */
  async handleSubscriptionCreated(_payload: LemonSqueezyWebhookPayload): Promise<void> {
    this.logger.log('handleSubscriptionCreated: stub (Task 10D)');
  }

  /**
   * Handle subscription_updated webhook (stub — implemented in Task 10D).
   */
  async handleSubscriptionUpdated(_payload: LemonSqueezyWebhookPayload): Promise<void> {
    this.logger.log('handleSubscriptionUpdated: stub (Task 10D)');
  }

  /**
   * Handle subscription_payment_success webhook (stub — implemented in Task 10D).
   */
  async handlePaymentSuccess(_payload: LemonSqueezyWebhookPayload): Promise<void> {
    this.logger.log('handlePaymentSuccess: stub (Task 10D)');
  }

  /**
   * Handle subscription_payment_failed webhook (stub — implemented in Task 10D).
   */
  async handlePaymentFailed(_payload: LemonSqueezyWebhookPayload): Promise<void> {
    this.logger.log('handlePaymentFailed: stub (Task 10D)');
  }

  /**
   * Handle subscription_payment_recovered webhook (stub — implemented in Task 10D).
   */
  async handlePaymentRecovered(_payload: LemonSqueezyWebhookPayload): Promise<void> {
    this.logger.log('handlePaymentRecovered: stub (Task 10D)');
  }

  /**
   * Handle subscription_cancelled webhook (stub — implemented in Task 10D).
   */
  async handleSubscriptionCancelled(_payload: LemonSqueezyWebhookPayload): Promise<void> {
    this.logger.log('handleSubscriptionCancelled: stub (Task 10D)');
  }

  /**
   * Handle subscription_expired webhook (stub — implemented in Task 10D).
   */
  async handleSubscriptionExpired(_payload: LemonSqueezyWebhookPayload): Promise<void> {
    this.logger.log('handleSubscriptionExpired: stub (Task 10D)');
  }

  /**
   * Log a subscription lifecycle event to the subscription_events table.
   *
   * @param subscriptionId - UUID of the user_subscriptions record
   * @param eventType - Event type string
   * @param eventData - Raw webhook event data for debugging
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
      webhook_event_data: eventData as Record<string, unknown>,
      billing_cycle: extra?.billingCycle ?? null,
      amount: extra?.amount ?? null,
      status:
        ((eventData as Record<string, unknown>)?.status as string) ?? null,
    });
  }
}
