import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { SafepayService } from '../payments/safepay.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import type {
  DbResult,
  DbListResult,
  DbCountResult,
} from '../database/db-result.types';
import {
  SubscriptionResponse,
  CancelSubscriptionData,
  PaginatedSubscriptionsResponse,
  PaginationParams,
  SubscriptionStatus,
} from '@repo/shared';

/** Database row shape for the subscriptions table */
interface SubscriptionRow {
  id: string;
  client_profile_id: string;
  plan_name: string;
  monthly_amount: number;
  currency: string;
  status: SubscriptionStatus;
  safepay_subscription_id: string | null;
  safepay_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  retry_count: number;
  next_retry_at: string | null;
  last_payment_error: string | null;
  created_at: string;
  updated_at: string;
}

/** Database row shape for the subscription_payments table */
interface SubscriptionPaymentRow {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  safepay_tracker_token: string;
  safepay_charge_token: string | null;
  status: 'pending' | 'succeeded' | 'failed';
  failure_reason: string | null;
  is_renewal: boolean;
  safepay_webhook_data: Record<string, unknown> | null;
  created_at: string;
}

/** Allowed sort columns for subscriptions */
const ALLOWED_SUBSCRIPTION_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'status',
  'current_period_start',
  'current_period_end',
] as const;

import { validateSortColumn } from '../common/utils/query-helpers';

/** Default subscription plan configuration */
const SUBSCRIPTION_PLAN = {
  PLAN_NAME: 'civic_retainer',
  /** Amount in paisa (PKR 700.00 * 100) */
  AMOUNT_PAISA: 70000,
  MONTHLY_AMOUNT: 700.0,
  CURRENCY: 'PKR',
} as const;

/** Retry schedule in days after each failed renewal attempt */
const RETRY_SCHEDULE_DAYS = [1, 3, 7] as const;
const MAX_RETRIES = RETRY_SCHEDULE_DAYS.length;

/** Service for managing subscription lifecycle with Safepay integration */
@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly safepayService: SafepayService,
  ) {}

  /**
   * Creates a subscription with card tokenization checkout.
   *
   * 1. Creates or reuses Safepay Customer
   * 2. Creates instrument session (zero-amount card tokenization)
   * 3. Returns hosted checkout URL for card entry (no Safepay login)
   *
   * @param user - Authenticated client user
   * @returns Subscription record and checkout URL
   */
  async createSubscription(
    user: AuthUser,
  ): Promise<{ subscription: SubscriptionResponse; checkoutUrl: string }> {
    if (user.userType !== UserType.CLIENT || !user.clientProfileId) {
      throw new BadRequestException('Only clients can create subscriptions');
    }

    const adminClient = this.supabaseService.getAdminClient();
    const clientProfileId = user.clientProfileId;

    try {
      // Check for existing subscription
      const { data: existing, error: fetchError } = (await adminClient
        .from('subscriptions')
        .select('*')
        .eq('client_profile_id', clientProfileId)
        .single()) as DbResult<SubscriptionRow>;

      if (fetchError && fetchError.code !== 'PGRST116') {
        this.logger.error(
          `Failed to fetch subscription: ${fetchError.message}`,
        );
        throw new InternalServerErrorException(
          'Failed to check existing subscription',
        );
      }

      let subscription: SubscriptionRow;

      if (existing) {
        if (existing.status === SubscriptionStatus.ACTIVE) {
          throw new ForbiddenException(
            'You already have an active subscription',
          );
        }

        // Reactivate cancelled/expired/past_due subscription
        const { data: updated, error: updateError } = (await adminClient
          .from('subscriptions')
          .update({
            status: SubscriptionStatus.PENDING,
            cancelled_at: null,
            cancellation_reason: null,
            retry_count: 0,
            next_retry_at: null,
            last_payment_error: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()) as DbResult<SubscriptionRow>;

        if (updateError || !updated) {
          throw new InternalServerErrorException(
            'Failed to reactivate subscription',
          );
        }
        subscription = updated;
      } else {
        // Create Safepay Customer if not exists
        let safepayCustomerId = '';
        const nameParts = (user.fullName || user.email.split('@')[0]).split(
          ' ',
        );
        const { token } = await this.safepayService.createCustomer({
          email: user.email,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || nameParts[0],
          phone: user.phoneNumber || undefined,
        });
        safepayCustomerId = token;

        // Create new subscription
        const { data: created, error: insertError } = (await adminClient
          .from('subscriptions')
          .insert({
            client_profile_id: clientProfileId,
            plan_name: SUBSCRIPTION_PLAN.PLAN_NAME,
            monthly_amount: SUBSCRIPTION_PLAN.MONTHLY_AMOUNT,
            currency: SUBSCRIPTION_PLAN.CURRENCY,
            status: SubscriptionStatus.PENDING,
            safepay_customer_id: safepayCustomerId,
          })
          .select()
          .single()) as DbResult<SubscriptionRow>;

        if (insertError || !created) {
          throw new InternalServerErrorException(
            'Failed to create subscription',
          );
        }
        subscription = created;
      }

      // Ensure we have a Safepay customer ID
      let customerToken = subscription.safepay_customer_id;
      if (!customerToken) {
        const nameParts = (user.fullName || user.email.split('@')[0]).split(
          ' ',
        );
        const { token } = await this.safepayService.createCustomer({
          email: user.email,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || nameParts[0],
          phone: user.phoneNumber || undefined,
        });
        customerToken = token;
        await adminClient
          .from('subscriptions')
          .update({
            safepay_customer_id: customerToken,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);
      }

      // Create instrument session for card tokenization
      const session = await this.safepayService.createInstrumentSession(
        customerToken,
        SUBSCRIPTION_PLAN.CURRENCY,
      );

      // Generate hosted checkout URL (card form, no login page)
      const frontendUrl =
        this.safepayService['frontendUrl'] || 'http://localhost:3000';
      const checkoutUrl = await this.safepayService.generateCheckoutUrl(
        session.trackerToken,
        `${frontendUrl}/subscribe/success?subscription_id=${subscription.id}`,
        `${frontendUrl}/subscribe/cancel`,
      );

      this.logger.log(
        `Subscription ${subscription.id} created, checkout URL generated`,
      );

      return {
        subscription: this.mapSubscriptionRow(subscription),
        checkoutUrl,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Unexpected error creating subscription: ${error}`);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating subscription',
      );
    }
  }

  /**
   * Initiates subscription activation after card tokenization.
   *
   * Creates an async charge via chargeCustomer(). The actual activation
   * happens when the Safepay webhook confirms payment.
   * Frontend should poll GET /api/subscriptions/me until status changes.
   *
   * @param subscriptionId - Subscription UUID
   * @param tracker - Safepay tracker token from redirect URL (optional)
   * @returns Subscription (still pending — webhook will activate)
   */
  async activateSubscription(
    subscriptionId: string,
    clientProfileId: string,
    tracker?: string,
  ): Promise<SubscriptionResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: subscription, error: fetchError } = (await adminClient
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single()) as DbResult<SubscriptionRow>;

    if (fetchError || !subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Verify the subscription belongs to the requesting client
    if (subscription.client_profile_id !== clientProfileId) {
      throw new ForbiddenException(
        'You do not have permission to activate this subscription',
      );
    }

    // Idempotency: already active
    if (subscription.status === SubscriptionStatus.ACTIVE) {
      return this.mapSubscriptionRow(subscription);
    }

    if (subscription.status !== SubscriptionStatus.PENDING) {
      throw new BadRequestException(
        `Cannot activate subscription with status: ${subscription.status}`,
      );
    }

    // Check for duplicate activation (same tracker already processed)
    if (tracker) {
      const { data: existingPayment } = (await adminClient
        .from('subscription_payments')
        .select('id, status')
        .eq('subscription_id', subscriptionId)
        .eq('safepay_tracker_token', tracker)
        .neq('status', 'failed')
        .single()) as DbResult<{ id: string; status: string }>;

      if (existingPayment) {
        const { data: current } = (await adminClient
          .from('subscriptions')
          .select('*')
          .eq('id', subscriptionId)
          .single()) as DbResult<SubscriptionRow>;
        return this.mapSubscriptionRow(current!);
      }
    }

    const customerToken = subscription.safepay_customer_id;
    if (!customerToken) {
      throw new InternalServerErrorException(
        'Subscription has no Safepay customer — cannot charge',
      );
    }

    // Initiate async charge (webhook will confirm)
    const orderId = `SUB-${subscriptionId.slice(0, 8).toUpperCase()}`;
    const chargeResult = await this.safepayService.chargeCustomer(
      customerToken,
      SUBSCRIPTION_PLAN.AMOUNT_PAISA,
      SUBSCRIPTION_PLAN.CURRENCY,
      orderId,
      { type: 'subscription', referenceId: subscriptionId },
    );

    if (chargeResult.status === 'failed') {
      // Session creation itself failed — record and throw
      await adminClient.from('subscription_payments').insert({
        subscription_id: subscriptionId,
        amount: SUBSCRIPTION_PLAN.MONTHLY_AMOUNT,
        currency: SUBSCRIPTION_PLAN.CURRENCY,
        safepay_tracker_token: chargeResult.trackerToken || 'no-tracker',
        safepay_charge_token: null,
        status: 'failed',
        failure_reason: chargeResult.error,
        is_renewal: false,
      });

      await adminClient
        .from('subscriptions')
        .update({
          last_payment_error: chargeResult.error,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      throw new BadRequestException(
        `Payment initiation failed: ${chargeResult.error || 'Could not create charge session'}`,
      );
    }

    // Record pending payment — webhook will update to succeeded/failed
    await adminClient.from('subscription_payments').insert({
      subscription_id: subscriptionId,
      amount: SUBSCRIPTION_PLAN.MONTHLY_AMOUNT,
      currency: SUBSCRIPTION_PLAN.CURRENCY,
      safepay_tracker_token: chargeResult.trackerToken,
      safepay_charge_token: null,
      status: 'pending',
      failure_reason: null,
      is_renewal: false,
    });

    this.logger.log(
      `Subscription ${subscriptionId} charge initiated (tracker: ${chargeResult.trackerToken}) — awaiting webhook`,
    );

    // Return the subscription as-is (still pending)
    return this.mapSubscriptionRow(subscription);
  }

  /**
   * Processes due subscription renewals and retries.
   *
   * Called by the billing scheduler cron job. Initiates async charges
   * for due subscriptions. Actual success/failure handled by webhook.
   * Also cleans up stale pending payments older than 24h.
   */
  async processRenewals(): Promise<{
    processed: number;
    initiated: number;
    failed: number;
  }> {
    const adminClient = this.supabaseService.getAdminClient();
    const now = new Date().toISOString();
    let processed = 0;
    let initiated = 0;
    let failed = 0;

    // Find subscriptions due for renewal
    const { data: dueSubscriptions, error } = (await adminClient
      .from('subscriptions')
      .select('*')
      .eq('status', SubscriptionStatus.ACTIVE)
      .lte('current_period_end', now)) as DbListResult<SubscriptionRow>;

    // Find subscriptions due for retry
    const { data: retrySubscriptions } = (await adminClient
      .from('subscriptions')
      .select('*')
      .eq('status', SubscriptionStatus.ACTIVE)
      .not('next_retry_at', 'is', null)
      .lte('next_retry_at', now)) as DbListResult<SubscriptionRow>;

    if (error) {
      this.logger.error(`Failed to query due subscriptions: ${error.message}`);
      return { processed: 0, initiated: 0, failed: 0 };
    }

    // Combine and deduplicate
    const allDue = new Map<string, SubscriptionRow>();
    for (const sub of dueSubscriptions || []) allDue.set(sub.id, sub);
    for (const sub of retrySubscriptions || []) allDue.set(sub.id, sub);

    for (const subscription of allDue.values()) {
      processed++;
      const customerToken = subscription.safepay_customer_id;

      if (!customerToken) {
        this.logger.warn(
          `Subscription ${subscription.id} has no Safepay customer — skipping`,
        );
        failed++;
        continue;
      }

      // Skip if there's already a pending payment for this subscription
      const { data: pendingPayment } = (await adminClient
        .from('subscription_payments')
        .select('id')
        .eq('subscription_id', subscription.id)
        .eq('status', 'pending')
        .eq('is_renewal', true)
        .single()) as DbResult<{ id: string }>;

      if (pendingPayment) {
        this.logger.log(
          `Subscription ${subscription.id} already has a pending renewal — skipping`,
        );
        continue;
      }

      const orderId = `SUB-RENEW-${subscription.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
      const chargeResult = await this.safepayService.chargeCustomer(
        customerToken,
        SUBSCRIPTION_PLAN.AMOUNT_PAISA,
        SUBSCRIPTION_PLAN.CURRENCY,
        orderId,
        { type: 'subscription', referenceId: subscription.id },
      );

      // Record payment attempt
      await adminClient.from('subscription_payments').insert({
        subscription_id: subscription.id,
        amount: SUBSCRIPTION_PLAN.MONTHLY_AMOUNT,
        currency: SUBSCRIPTION_PLAN.CURRENCY,
        safepay_tracker_token: chargeResult.trackerToken || 'no-tracker',
        safepay_charge_token: null,
        status: chargeResult.status === 'failed' ? 'failed' : 'pending',
        failure_reason: chargeResult.error,
        is_renewal: true,
      });

      if (chargeResult.status === 'failed') {
        // Session creation failed — handle retry logic
        const retryCount = subscription.retry_count + 1;

        if (retryCount >= MAX_RETRIES) {
          await adminClient
            .from('subscriptions')
            .update({
              status: SubscriptionStatus.PAST_DUE,
              retry_count: retryCount,
              next_retry_at: null,
              last_payment_error: chargeResult.error,
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          this.logger.warn(
            `Subscription ${subscription.id} marked past_due after ${retryCount} failed retries`,
          );
        } else {
          const retryDays = RETRY_SCHEDULE_DAYS[retryCount - 1];
          const nextRetry = new Date();
          nextRetry.setDate(nextRetry.getDate() + retryDays);

          await adminClient
            .from('subscriptions')
            .update({
              retry_count: retryCount,
              next_retry_at: nextRetry.toISOString(),
              last_payment_error: chargeResult.error,
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          this.logger.log(
            `Renewal session failed for ${subscription.id}, retry ${retryCount}/${MAX_RETRIES} in ${retryDays} days`,
          );
        }
        failed++;
      } else {
        this.logger.log(
          `Renewal charge initiated for ${subscription.id} (tracker: ${chargeResult.trackerToken})`,
        );
        initiated++;
      }
    }

    // Clean up stale pending payments (older than 24h)
    await this.cleanupStalePendingPayments();

    this.logger.log(
      `Renewal processing: ${processed} processed, ${initiated} charges initiated, ${failed} session failures`,
    );
    return { processed, initiated, failed };
  }

  /**
   * Checks stale pending payments (>24h) against Safepay reporter API.
   * Marks them as succeeded or failed based on actual state.
   * Handles edge cases where webhooks were lost.
   */
  private async cleanupStalePendingPayments(): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const { data: stalePayments } = (await adminClient
      .from('subscription_payments')
      .select('*')
      .eq('status', 'pending')
      .lt(
        'created_at',
        cutoff.toISOString(),
      )) as DbListResult<SubscriptionPaymentRow>;

    if (!stalePayments?.length) return;

    this.logger.log(
      `Found ${stalePayments.length} stale pending payments to check`,
    );

    for (const payment of stalePayments) {
      if (
        !payment.safepay_tracker_token ||
        payment.safepay_tracker_token === 'no-tracker'
      ) {
        await adminClient
          .from('subscription_payments')
          .update({
            status: 'failed',
            failure_reason: 'No tracker token — stale cleanup',
          })
          .eq('id', payment.id);
        continue;
      }

      try {
        const verification = await this.safepayService.verifyPayment(
          payment.safepay_tracker_token,
        );

        if (verification.isPaid) {
          this.logger.log(`Stale payment ${payment.id} verified as paid`);
          await this.handlePaymentSuccess(
            payment.safepay_tracker_token,
            verification.reference,
            null,
          );
        } else {
          this.logger.log(
            `Stale payment ${payment.id} verified as not paid (${verification.state})`,
          );
          await this.handlePaymentFailure(
            payment.safepay_tracker_token,
            `Stale cleanup: ${verification.state}`,
            null,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to verify stale payment ${payment.id}`,
          error,
        );
        await adminClient
          .from('subscription_payments')
          .update({
            status: 'failed',
            failure_reason: 'Verification error during stale cleanup',
          })
          .eq('id', payment.id);
      }
    }
  }

  /**
   * Handles successful payment webhook for a subscription.
   *
   * Called by PaymentsWebhookService when `payment.succeeded` arrives.
   * Updates subscription_payments status and activates/renews subscription.
   *
   * @param trackerToken - Safepay tracker token
   * @param chargeToken - Safepay charge token (ch_xxx)
   * @param webhookData - Full webhook payload for audit
   */
  async handlePaymentSuccess(
    trackerToken: string,
    chargeToken: string | null,
    webhookData: Record<string, unknown> | null,
  ): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    // Find the pending payment by tracker
    const { data: payment, error } = (await adminClient
      .from('subscription_payments')
      .select('*')
      .eq('safepay_tracker_token', trackerToken)
      .eq('status', 'pending')
      .single()) as DbResult<SubscriptionPaymentRow>;

    if (error || !payment) {
      // Check if already processed (idempotency)
      const { data: processed } = (await adminClient
        .from('subscription_payments')
        .select('id')
        .eq('safepay_tracker_token', trackerToken)
        .eq('status', 'succeeded')
        .single()) as DbResult<{ id: string }>;

      if (processed) {
        this.logger.log(`Payment ${trackerToken} already processed — skipping`);
        return;
      }

      this.logger.warn(`No pending payment found for tracker: ${trackerToken}`);
      return;
    }

    // Update payment to succeeded
    await adminClient
      .from('subscription_payments')
      .update({
        status: 'succeeded',
        safepay_charge_token: chargeToken,
        safepay_webhook_data: webhookData,
      })
      .eq('id', payment.id);

    // Fetch the subscription
    const { data: subscription } = (await adminClient
      .from('subscriptions')
      .select('*')
      .eq('id', payment.subscription_id)
      .single()) as DbResult<SubscriptionRow>;

    if (!subscription) {
      this.logger.error(`Subscription not found for payment: ${payment.id}`);
      return;
    }

    if (payment.is_renewal) {
      // Renewal: extend period by 1 month from current end
      const periodStart = new Date(
        subscription.current_period_end || new Date().toISOString(),
      );
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await adminClient
        .from('subscriptions')
        .update({
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          retry_count: 0,
          next_retry_at: null,
          last_payment_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      this.logger.log(`Renewal succeeded for subscription ${subscription.id}`);
    } else {
      // First payment: activate subscription
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await adminClient
        .from('subscriptions')
        .update({
          status: SubscriptionStatus.ACTIVE,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          retry_count: 0,
          next_retry_at: null,
          last_payment_error: null,
          updated_at: now.toISOString(),
        })
        .eq('id', subscription.id);

      this.logger.log(`Subscription ${subscription.id} activated via webhook`);
    }
  }

  /**
   * Handles failed payment webhook for a subscription.
   *
   * Called by PaymentsWebhookService when `payment.failed` arrives.
   * Updates subscription_payments status and handles retry logic.
   *
   * @param trackerToken - Safepay tracker token
   * @param failureReason - Error message from Safepay
   * @param webhookData - Full webhook payload for audit
   */
  async handlePaymentFailure(
    trackerToken: string,
    failureReason: string,
    webhookData: Record<string, unknown> | null,
  ): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    // Find the pending payment
    const { data: payment, error } = (await adminClient
      .from('subscription_payments')
      .select('*')
      .eq('safepay_tracker_token', trackerToken)
      .eq('status', 'pending')
      .single()) as DbResult<SubscriptionPaymentRow>;

    if (error || !payment) {
      this.logger.warn(
        `No pending payment found for failed tracker: ${trackerToken}`,
      );
      return;
    }

    // Update payment to failed
    await adminClient
      .from('subscription_payments')
      .update({
        status: 'failed',
        failure_reason: failureReason,
        safepay_webhook_data: webhookData,
      })
      .eq('id', payment.id);

    // Fetch subscription
    const { data: subscription } = (await adminClient
      .from('subscriptions')
      .select('*')
      .eq('id', payment.subscription_id)
      .single()) as DbResult<SubscriptionRow>;

    if (!subscription) {
      this.logger.error(
        `Subscription not found for failed payment: ${payment.id}`,
      );
      return;
    }

    if (payment.is_renewal) {
      // Renewal failure: handle retry logic
      const retryCount = subscription.retry_count + 1;

      if (retryCount >= MAX_RETRIES) {
        await adminClient
          .from('subscriptions')
          .update({
            status: SubscriptionStatus.PAST_DUE,
            retry_count: retryCount,
            next_retry_at: null,
            last_payment_error: failureReason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        this.logger.warn(
          `Subscription ${subscription.id} marked past_due after ${retryCount} failed retries`,
        );
      } else {
        const retryDays = RETRY_SCHEDULE_DAYS[retryCount - 1];
        const nextRetry = new Date();
        nextRetry.setDate(nextRetry.getDate() + retryDays);

        await adminClient
          .from('subscriptions')
          .update({
            retry_count: retryCount,
            next_retry_at: nextRetry.toISOString(),
            last_payment_error: failureReason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        this.logger.log(
          `Renewal failed for ${subscription.id}, retry ${retryCount}/${MAX_RETRIES} in ${retryDays} days`,
        );
      }
    } else {
      // First payment failure: update subscription error
      await adminClient
        .from('subscriptions')
        .update({
          last_payment_error: failureReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      this.logger.warn(
        `First payment failed for subscription ${subscription.id}: ${failureReason}`,
      );
    }
  }

  /** Retrieves the authenticated client's subscription */
  async getMySubscription(user: AuthUser): Promise<SubscriptionResponse> {
    if (user.userType !== UserType.CLIENT || !user.clientProfileId) {
      throw new BadRequestException(
        'Only clients can retrieve their subscription',
      );
    }

    const adminClient = this.supabaseService.getAdminClient();

    try {
      const { data, error } = (await adminClient
        .from('subscriptions')
        .select('*')
        .eq('client_profile_id', user.clientProfileId)
        .single()) as DbResult<SubscriptionRow>;

      if (error || !data) {
        if (error?.code === 'PGRST116') {
          throw new NotFoundException('No subscription found for this client');
        }
        this.logger.error(`Failed to fetch subscription: ${error?.message}`);
        throw new InternalServerErrorException('Failed to fetch subscription');
      }

      return this.mapSubscriptionRow(data);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Unexpected error fetching subscription: ${error}`);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscription',
      );
    }
  }

  /** Cancels the authenticated client's active subscription (local-only, no Safepay call) */
  async cancelSubscription(
    user: AuthUser,
    data: CancelSubscriptionData,
  ): Promise<SubscriptionResponse> {
    if (user.userType !== UserType.CLIENT || !user.clientProfileId) {
      throw new BadRequestException(
        'Only clients can cancel their subscription',
      );
    }

    const adminClient = this.supabaseService.getAdminClient();

    try {
      // Fetch existing subscription
      const { data: existingSubscription, error: fetchError } =
        (await adminClient
          .from('subscriptions')
          .select('*')
          .eq('client_profile_id', user.clientProfileId)
          .single()) as DbResult<SubscriptionRow>;

      if (fetchError || !existingSubscription) {
        if (fetchError?.code === 'PGRST116') {
          throw new NotFoundException('No subscription found for this client');
        }
        this.logger.error(
          `Failed to fetch subscription: ${fetchError?.message}`,
        );
        throw new InternalServerErrorException('Failed to fetch subscription');
      }

      // Verify subscription is active
      if (existingSubscription.status !== SubscriptionStatus.ACTIVE) {
        throw new ForbiddenException(
          'Only active subscriptions can be cancelled',
        );
      }

      // Update subscription status (local-only cancellation)
      const { data: updated, error: updateError } = (await adminClient
        .from('subscriptions')
        .update({
          status: SubscriptionStatus.CANCELLED,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: data.reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()) as DbResult<SubscriptionRow>;

      if (updateError || !updated) {
        this.logger.error(
          `Failed to cancel subscription: ${updateError?.message}`,
        );
        throw new InternalServerErrorException('Failed to cancel subscription');
      }

      this.logger.log(
        `Cancelled subscription ${updated.id} for client ${user.clientProfileId}`,
      );

      return this.mapSubscriptionRow(updated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Unexpected error cancelling subscription: ${error}`);
      throw new InternalServerErrorException(
        'An unexpected error occurred while cancelling subscription',
      );
    }
  }

  /** Retrieves all subscriptions with pagination (staff only) */
  async getAllSubscriptions(
    pagination: PaginationParams,
  ): Promise<PaginatedSubscriptionsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const {
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'desc',
    } = pagination;
    const offset = (page - 1) * limit;

    try {
      // Get total count
      const { count, error: countError } = (await adminClient
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })) as DbCountResult;

      if (countError) {
        this.logger.error(
          `Failed to count subscriptions: ${countError.message}`,
        );
        throw new InternalServerErrorException('Failed to count subscriptions');
      }

      // Get paginated data with validated sort
      const validSort = validateSortColumn(
        sort,
        ALLOWED_SUBSCRIPTION_SORT_COLUMNS,
      );
      const { data, error: fetchError } = (await adminClient
        .from('subscriptions')
        .select('*')
        .order(validSort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1)) as DbListResult<SubscriptionRow>;

      if (fetchError) {
        this.logger.error(
          `Failed to fetch subscriptions: ${fetchError.message}`,
        );
        throw new InternalServerErrorException('Failed to fetch subscriptions');
      }

      const subscriptions = (data || []).map((row) =>
        this.mapSubscriptionRow(row),
      );

      return {
        data: subscriptions,
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Unexpected error fetching subscriptions: ${error}`);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscriptions',
      );
    }
  }

  /**
   * Checks if a client has an active subscription
   * Used by other modules (e.g., ComplaintsModule) to verify subscription status
   *
   * @param clientProfileId - The client profile UUID
   * @returns True if client has active subscription, false otherwise
   *
   * @example
   * ```typescript
   * const hasActiveSubscription = await service.isSubscriptionActive(
   *   'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
   * );
   * if (!hasActiveSubscription) {
   *   throw new ForbiddenException('Active subscription required');
   * }
   * ```
   */
  async isSubscriptionActive(clientProfileId: string): Promise<boolean> {
    const adminClient = this.supabaseService.getAdminClient();

    try {
      const { data, error } = (await adminClient
        .from('subscriptions')
        .select('id')
        .eq('client_profile_id', clientProfileId)
        .eq('status', SubscriptionStatus.ACTIVE)
        .single()) as DbResult<{ id: string }>;

      if (error && error.code !== 'PGRST116') {
        this.logger.error(
          `Failed to check subscription status: ${error.message}`,
        );
        return false;
      }

      return !!data;
    } catch (error) {
      this.logger.error(
        `Unexpected error checking subscription status: ${error}`,
      );
      return false;
    }
  }

  /**
   * Maps database row (snake_case) to SubscriptionResponse (camelCase)
   *
   * @param row - Raw database row
   * @returns Typed SubscriptionResponse object
   * @private
   */
  private mapSubscriptionRow(row: SubscriptionRow): SubscriptionResponse {
    return {
      id: row.id,
      clientProfileId: row.client_profile_id,
      planName: row.plan_name,
      monthlyAmount: Number(row.monthly_amount),
      currency: row.currency,
      status: row.status,
      currentPeriodStart: row.current_period_start ?? null,
      currentPeriodEnd: row.current_period_end ?? null,
      cancelledAt: row.cancelled_at ?? null,
      cancellationReason: row.cancellation_reason ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
