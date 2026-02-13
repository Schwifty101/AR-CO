/**
 * Safepay payment gateway service stub.
 *
 * Provides mock implementations matching the real Safepay Node SDK interface.
 * In HEAD TASK 10, stub bodies will be replaced with real SDK calls
 * while keeping the same method signatures.
 *
 * @module PaymentsModule
 * @see https://github.com/getsafepay/safepay-node
 *
 * @example
 * ```typescript
 * const { checkoutUrl } = await safepayService.createCheckoutSession({
 *   amount: 50000, currency: 'PKR', orderId: 'INV-001',
 *   metadata: { type: 'invoice', referenceId: 'inv-uuid' },
 *   returnUrl: 'https://arco.pk/success',
 *   cancelUrl: 'https://arco.pk/cancel',
 * });
 * ```
 */
import { Injectable, Logger } from '@nestjs/common';

/** Parameters for creating a one-time checkout session */
export interface CreateCheckoutParams {
  /** Amount in smallest currency unit */
  amount: number;
  /** ISO currency code */
  currency: string;
  /** Unique order identifier */
  orderId: string;
  /** Metadata for webhook routing */
  metadata: {
    type: 'consultation' | 'subscription' | 'service' | 'invoice';
    referenceId: string;
  };
  /** URL to redirect after successful payment */
  returnUrl: string;
  /** URL to redirect after cancelled payment */
  cancelUrl: string;
}

/** Parameters for creating a subscription checkout */
export interface CreateSubscriptionCheckoutParams {
  /** Safepay plan identifier */
  planId: string;
  /** Our internal reference (e.g., client profile ID) */
  reference: string;
  /** Customer email for Safepay */
  customerEmail: string;
  /** URL to redirect after successful subscription */
  returnUrl: string;
  /** URL to redirect after cancelled subscription */
  cancelUrl: string;
}

@Injectable()
export class SafepayService {
  private readonly logger = new Logger(SafepayService.name);

  /**
   * Creates a one-time checkout session.
   * STUB: Returns mock URL. Real implementation in HEAD TASK 10.
   */
  async createCheckoutSession(
    params: CreateCheckoutParams,
  ): Promise<{ checkoutUrl: string; token: string }> {
    this.logger.log(
      `[STUB] Creating checkout: ${params.orderId} for ${params.amount} ${params.currency}`,
    );
    return {
      checkoutUrl: `https://sandbox.api.getsafepay.com/checkout/stub-${params.orderId}`,
      token: `tracker_stub_${Date.now()}`,
    };
  }

  /**
   * Creates a recurring subscription checkout.
   * STUB: Returns mock URL. Real implementation in HEAD TASK 10.
   */
  async createSubscriptionCheckout(
    params: CreateSubscriptionCheckoutParams,
  ): Promise<{ checkoutUrl: string }> {
    this.logger.log(
      `[STUB] Creating subscription checkout: ${params.reference}`,
    );
    return {
      checkoutUrl: `https://sandbox.api.getsafepay.com/subscribe/stub-${params.reference}`,
    };
  }

  /**
   * Verifies webhook HMAC signature.
   * STUB: Always returns true. Real implementation in HEAD TASK 10.
   */
  verifyWebhookSignature(_payload: unknown, _signature: string): boolean {
    this.logger.log('[STUB] Verifying webhook signature - always true');
    return true;
  }

  /**
   * Gets payment status by tracker ID.
   * STUB: Returns completed. Real implementation in HEAD TASK 10.
   */
  async getPaymentStatus(
    trackerId: string,
  ): Promise<{ status: string; amount: number }> {
    this.logger.log(`[STUB] Getting payment status for: ${trackerId}`);
    return { status: 'completed', amount: 0 };
  }

  /**
   * Cancels a Safepay subscription.
   * STUB: Returns success. Real implementation in HEAD TASK 10.
   */
  async cancelSubscription(
    subscriptionId: string,
  ): Promise<{ success: boolean }> {
    this.logger.log(`[STUB] Cancelling subscription: ${subscriptionId}`);
    return { success: true };
  }
}
