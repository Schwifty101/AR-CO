/**
 * Service for processing Safepay webhook events.
 *
 * Routes payment events by metadata `source` key to the appropriate handler
 * (subscription, consultation, etc.). Subscription-specific events are routed
 * directly by event type since they don't carry custom metadata.
 *
 * Safepay only supports two metadata keys: `order_id` and `source`.
 * We use `source` for payment type routing and `order_id` for reference IDs.
 *
 * @module PaymentsModule
 *
 * @example
 * ```typescript
 * await webhookService.processEvent({
 *   type: 'payment.succeeded',
 *   data: {
 *     tracker: 'track_xxx',
 *     metadata: { order_id: 'SUB-uuid', source: 'subscription' },
 *   },
 * });
 * ```
 */
import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

/**
 * Safepay v2.0.0 payment webhook data.
 * Sent for payment.succeeded, payment.failed, payment.refunded events.
 */
export interface SafepayPaymentWebhookData {
  /** Payment tracker token */
  tracker: string;
  /** Payment intent (e.g., 'CYBERSOURCE') */
  intent?: string;
  /** Tracker state (e.g., 'TRACKER_ENDED') */
  state?: string;
  /** Gross amount in paisa */
  amount?: number;
  /** Currency code */
  currency?: string;
  /** Net amount after fees in paisa */
  net?: number;
  /** Processing fee in paisa */
  fee?: number;
  /** Customer email */
  customer_email?: string;
  /**
   * Custom metadata. In webhook payloads, values are flat strings.
   * In reporter API responses, values are nested `{ key, value }` objects.
   */
  metadata?: Record<string, string | { key: string; value: string }>;
  /** Error category (payment.failed only) */
  category?: string;
  /** Error code (payment.failed only) */
  code?: number;
  /** Error message (payment.failed only) */
  message?: string;
  /** Charge timestamp (payment.succeeded) */
  charged_at?: { seconds: number; nanos?: number };
  /** Failure timestamp (payment.failed) */
  failed_at?: { seconds: number; nanos?: number };
  /** Refund amount in paisa (payment.refunded) */
  refund_amount?: number;
  /** Remaining balance (payment.refunded) */
  balance?: number;
}

/**
 * Safepay v2.0.0 subscription webhook data.
 * Sent for subscription.* events (created, canceled, ended, paused, resumed,
 * payment.succeeded, payment.failed).
 */
export interface SafepaySubscriptionWebhookData {
  /** Subscription ID (sub_xxx) */
  id: string;
  /** Plan ID (plan_xxx) */
  plan_id: string;
  /** Customer email */
  customer_email?: string;
  /** Subscription status: ACTIVE, PAUSED, CANCELED, ENDED, INCOMPLETE, UNPAID */
  status?: string;
  /** Amount in paisa */
  amount?: number;
  /** Currency code */
  currency?: string;
  /** Balance */
  balance?: string;
  /** Transaction ID (subscription.payment.* events) */
  transaction_id?: string;
  /** Transaction status: COMPLETE, FAILED */
  transaction_status?: string;
  /** Transaction error code (payment.failed) */
  transaction_error_code?: string;
  /** Transaction error message (payment.failed) */
  transaction_error_message?: string;
  /** Current billing cycle number */
  current_billing_cycle?: number;
  /** Period start */
  current_period_start_date?: { seconds: number };
  /** Period end */
  current_period_end_date?: { seconds: number };
  /** Last paid date */
  last_paid_date?: { seconds: number; nanos?: number };
  /** Billing cycle anchor */
  billing_cycle_anchor?: { seconds: number };
  /** Number of billing cycles */
  number_of_billing_cycles?: number;
  /** Timestamps */
  created_at?: { seconds: number };
  updated_at?: { seconds: number };
  canceled_at?: { seconds: number };
  paused_at?: { seconds: number };
  resumed_at?: { seconds: number };
}

/** Safepay v2.0.0 webhook event envelope */
export interface SafepayWebhookEvent {
  /** Unique event token ID (evt_xxx) */
  token: string;
  /** Event type (e.g., 'payment.succeeded', 'subscription.payment.succeeded') */
  type: string;
  /** Webhook schema version */
  version?: string;
  /** Merchant API key */
  merchant_api_key?: string;
  /** Event-specific data — shape depends on event type */
  data: SafepayPaymentWebhookData | SafepaySubscriptionWebhookData;
  /** Number of delivery attempts */
  delivery_attempts?: number;
  /** Event creation timestamp */
  created_at?: { seconds: number; nanos?: number };
}

@Injectable()
export class PaymentsWebhookService {
  private readonly logger = new Logger(PaymentsWebhookService.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Extracts a metadata value from webhook data.
   * Handles both flat string values (webhook payloads) and nested
   * `{ key, value }` objects (reporter API responses).
   */
  private getMetaValue(
    metadata: Record<string, string | { key: string; value: string }> | undefined,
    key: string,
  ): string | undefined {
    const raw = metadata?.[key];
    if (!raw) return undefined;
    if (typeof raw === 'string') return raw;
    return raw.value;
  }

  /**
   * Processes a verified Safepay webhook event.
   *
   * Routes payment events by metadata `source` key.
   * Routes subscription events directly by event type.
   * Returns silently for unrecognized events (don't block Safepay retries).
   *
   * @param event - Parsed and signature-verified webhook event
   */
  async processEvent(event: SafepayWebhookEvent): Promise<void> {
    const { type } = event;

    this.logger.log(
      `Processing webhook: type=${type} token=${event.token}`,
    );

    switch (type) {
      case 'payment.succeeded':
        await this.handlePaymentSucceeded(
          event.data as SafepayPaymentWebhookData,
          event,
        );
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(
          event.data as SafepayPaymentWebhookData,
          event,
        );
        break;
      case 'subscription.payment.succeeded':
        await this.handleSubscriptionPaymentSucceeded(
          event.data as SafepaySubscriptionWebhookData,
        );
        break;
      case 'subscription.payment.failed':
        await this.handleSubscriptionPaymentFailed(
          event.data as SafepaySubscriptionWebhookData,
        );
        break;
      case 'subscription.created':
      case 'subscription.canceled':
      case 'subscription.ended':
      case 'subscription.paused':
      case 'subscription.resumed':
        this.logger.log(
          `Subscription lifecycle event: ${type} — sub=${(event.data as SafepaySubscriptionWebhookData).id}`,
        );
        break;
      default:
        this.logger.log(`Unhandled webhook event type: ${type} — ignoring`);
    }
  }

  /**
   * Routes payment.succeeded by metadata `source` to the appropriate domain handler.
   * Used for our unscheduled_cof (DIY recurring billing) charges and one-off payments.
   */
  private async handlePaymentSucceeded(
    data: SafepayPaymentWebhookData,
    event: SafepayWebhookEvent,
  ): Promise<void> {
    const tracker = data.tracker;
    const metadataType = this.getMetaValue(data.metadata, 'source');
    const webhookPayload = event as unknown as Record<string, unknown>;

    if (!tracker) {
      this.logger.warn(
        `payment.succeeded with no tracker (event: ${event.token}) — skipping`,
      );
      return;
    }

    switch (metadataType) {
      case 'subscription':
        await this.subscriptionsService.handlePaymentSuccess(
          tracker,
          null, // charge token populated via reporter API during stale payment cleanup
          webhookPayload,
        );
        break;
      case 'consultation':
        // Future: handle consultation payment confirmation
        this.logger.log(`Consultation payment succeeded: ${tracker}`);
        break;
      default:
        this.logger.warn(
          `payment.succeeded for unknown source "${metadataType}" (tracker: ${tracker})`,
        );
    }
  }

  /**
   * Routes payment.failed by metadata `source` to the appropriate domain handler.
   */
  private async handlePaymentFailed(
    data: SafepayPaymentWebhookData,
    event: SafepayWebhookEvent,
  ): Promise<void> {
    const tracker = data.tracker;
    const metadataType = this.getMetaValue(data.metadata, 'source');
    const failureReason =
      data.message || data.category || 'Unknown payment failure';
    const webhookPayload = event as unknown as Record<string, unknown>;

    if (!tracker) {
      this.logger.warn(
        `payment.failed with no tracker (event: ${event.token}) — skipping`,
      );
      return;
    }

    switch (metadataType) {
      case 'subscription':
        await this.subscriptionsService.handlePaymentFailure(
          tracker,
          failureReason,
          webhookPayload,
        );
        break;
      case 'consultation':
        // Future: handle consultation payment failure
        this.logger.log(
          `Consultation payment failed: ${tracker} — ${failureReason}`,
        );
        break;
      default:
        this.logger.warn(
          `payment.failed for unknown source "${metadataType}" (tracker: ${tracker})`,
        );
    }
  }

  /**
   * Handles Safepay-managed subscription payment success.
   * Used when subscriptions are managed via Safepay's built-in subscription mode.
   */
  private async handleSubscriptionPaymentSucceeded(
    data: SafepaySubscriptionWebhookData,
  ): Promise<void> {
    this.logger.log(
      `Subscription payment succeeded: sub=${data.id} plan=${data.plan_id} ` +
        `cycle=${data.current_billing_cycle} txn=${data.transaction_id}`,
    );
    // Future: integrate with Safepay-managed subscriptions if needed
  }

  /**
   * Handles Safepay-managed subscription payment failure.
   */
  private async handleSubscriptionPaymentFailed(
    data: SafepaySubscriptionWebhookData,
  ): Promise<void> {
    this.logger.warn(
      `Subscription payment failed: sub=${data.id} plan=${data.plan_id} ` +
        `txn=${data.transaction_id} error=${data.transaction_error_message}`,
    );
    // Future: integrate with Safepay-managed subscriptions if needed
  }
}
