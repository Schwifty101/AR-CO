/**
 * Subscriptions Service — plan listing, checkout initiation, subscription retrieval,
 * cancellation/resumption, real-time status, and webhook delegation.
 *
 * Admin queries delegate to {@link SubscriptionsAdminService}.
 * Webhook processing delegates to {@link SubscriptionsWebhookService}.
 *
 * @module SubscriptionsModule
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
import { SubscriptionsWebhookService } from './subscriptions-webhook.service';
import { SubscriptionsAdminService } from './subscriptions-admin.service';
import { randomUUID } from 'crypto';

/**
 * Facade service for subscription management. Delegates admin queries to
 * {@link SubscriptionsAdminService} and webhook handling to
 * {@link SubscriptionsWebhookService}. Core client flows (initiate, cancel,
 * resume, status check) are implemented here.
 */
@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly lemonsqueezyService: LemonSqueezyService,
    private readonly webhookService: SubscriptionsWebhookService,
    private readonly adminService: SubscriptionsAdminService,
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
        redirectUrl: 'https://arandcolaw.com/payment/success?type=subscription',
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
    await this.webhookService.logEvent(
      subscriptionId,
      'subscription.cancelled_by_user',
      {
        cancelled_by: cancelledBy.id,
      },
    );

    this.logger.log(
      `Subscription ${subscriptionId} cancelled by ${cancelledBy.id}`,
    );
  }

  /**
   * Resume a cancelled subscription (client only).
   *
   * Verifies ownership, checks the subscription is in CANCELLED state,
   * calls LemonSqueezy to lift the cancellation, and restores ACTIVE status.
   *
   * @param subscriptionId - UUID of the user_subscriptions record
   * @param user - Authenticated client user
   * @throws {HttpException} NOT_FOUND, FORBIDDEN, or BAD_REQUEST
   *
   * @example
   * ```typescript
   * await subscriptionsService.resumeSubscription('sub-uuid', currentUser);
   * ```
   */
  async resumeSubscription(
    subscriptionId: string,
    user: AuthUser,
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

    const sub = rawSub as unknown as UserSubscriptionRow;

    if (user.userType === UserType.CLIENT && sub.user_id !== user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    if (sub.status !== (SubscriptionStatus.CANCELLED as string)) {
      throw new HttpException(
        'Only cancelled subscriptions can be resumed',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (sub.lemonsqueezy_subscription_id) {
      await this.lemonsqueezyService.resumeSubscription(
        sub.lemonsqueezy_subscription_id,
      );
    }

    await client
      .from('user_subscriptions')
      .update({
        status: SubscriptionStatus.ACTIVE,
        cancelled_at: null,
        ends_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    await this.webhookService.logEvent(subscriptionId, 'subscription.resumed', {
      resumed_by: user.id,
    });
    this.logger.log(
      `Subscription ${subscriptionId} resumed by user ${user.id}`,
    );
  }

  /**
   * Get real-time subscription status for the current user.
   *
   * Fetches the local DB record and, when a LemonSqueezy subscription ID exists,
   * calls the LS API for a live status comparison.
   *
   * @param userId - Supabase auth user UUID
   * @returns Object with local and live status fields
   *
   * @example
   * ```typescript
   * const status = await subscriptionsService.getMySubscriptionStatus(user.id);
   * // { status: 'active', liveStatus: 'active', currentPeriodEnd: '...', endsAt: null }
   * ```
   */
  async getMySubscriptionStatus(userId: string): Promise<{
    status: string;
    liveStatus: string | null;
    currentPeriodEnd: string | null;
    endsAt: string | null;
  }> {
    const client = this.supabaseService.getAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: rawSub, error } = await client
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', [
        SubscriptionStatus.ACTIVE,
        SubscriptionStatus.PENDING,
        SubscriptionStatus.PAUSED,
        SubscriptionStatus.UNPAID,
        SubscriptionStatus.CANCELLED,
      ])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    if (!rawSub) {
      return {
        status: 'none',
        liveStatus: null,
        currentPeriodEnd: null,
        endsAt: null,
      };
    }

    const sub = rawSub as unknown as UserSubscriptionRow;

    let liveStatus: string | null = null;
    if (sub.lemonsqueezy_subscription_id) {
      try {
        const lsData = (await this.lemonsqueezyService.getSubscription(
          sub.lemonsqueezy_subscription_id,
        )) as { data?: { attributes?: { status?: string } } } | null;
        liveStatus = lsData?.data?.attributes?.status ?? null;
      } catch (err) {
        this.logger.warn(
          `getMySubscriptionStatus: could not fetch LS status — ${String(err)}`,
        );
      }
    }

    return {
      status: sub.status,
      liveStatus,
      currentPeriodEnd: sub.current_period_end,
      endsAt: sub.ends_at,
    };
  }

  /**
   * List all subscriptions with filters and pagination (admin/staff).
   * @see SubscriptionsAdminService.getSubscriptions
   */
  async getSubscriptions(
    filters: SubscriptionFilters,
  ): Promise<PaginatedSubscriptionsResponse> {
    return this.adminService.getSubscriptions(filters);
  }

  /**
   * Get a single subscription by ID with event history (admin/staff).
   * @see SubscriptionsAdminService.getSubscriptionById
   */
  async getSubscriptionById(id: string): Promise<SubscriptionDetail> {
    return this.adminService.getSubscriptionById(id);
  }

  // ─── Webhook handler delegates (implementation in SubscriptionsWebhookService) ──

  /** @see SubscriptionsWebhookService.handleSubscriptionCreated */
  async handleSubscriptionCreated(
    p: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    return this.webhookService.handleSubscriptionCreated(p);
  }

  /** @see SubscriptionsWebhookService.handleSubscriptionUpdated */
  async handleSubscriptionUpdated(
    p: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    return this.webhookService.handleSubscriptionUpdated(p);
  }

  /** @see SubscriptionsWebhookService.handlePaymentSuccess */
  async handlePaymentSuccess(p: LemonSqueezyWebhookPayload): Promise<void> {
    return this.webhookService.handlePaymentSuccess(p);
  }

  /** @see SubscriptionsWebhookService.handlePaymentFailed */
  async handlePaymentFailed(p: LemonSqueezyWebhookPayload): Promise<void> {
    return this.webhookService.handlePaymentFailed(p);
  }

  /** @see SubscriptionsWebhookService.handlePaymentRecovered */
  async handlePaymentRecovered(p: LemonSqueezyWebhookPayload): Promise<void> {
    return this.webhookService.handlePaymentRecovered(p);
  }

  /** @see SubscriptionsWebhookService.handleSubscriptionCancelled */
  async handleSubscriptionCancelled(
    p: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    return this.webhookService.handleSubscriptionCancelled(p);
  }

  /** @see SubscriptionsWebhookService.handleSubscriptionExpired */
  async handleSubscriptionExpired(
    p: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    return this.webhookService.handleSubscriptionExpired(p);
  }
}
