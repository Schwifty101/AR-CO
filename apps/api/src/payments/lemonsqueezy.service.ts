/**
 * LemonSqueezy Payment Service
 *
 * Stub implementation. All methods throw NotImplementedException until
 * Task 10B replaces them with real SDK calls.
 *
 * LemonSqueezy is used as Merchant of Record for:
 * - Civic Retainer subscription (PKR 700/month)
 * - Legal Consultation fee (PKR 50,000 one-time)
 * - Facilitation Service fees (variable, custom_price)
 *
 * @module PaymentsModule
 *
 * @example
 * ```typescript
 * const { checkoutUrl } = await lemonsqueezyService.createSubscriptionCheckout({
 *   email: 'client@example.com',
 *   name: 'John Doe',
 *   customData: { payment_type: 'subscription', user_id: '...' },
 *   redirectUrl: 'https://arco.pk/payment/success?type=subscription',
 * });
 * ```
 */

import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Parameters for creating a one-time checkout (consultation or service fee) */
export interface CreateOneTimeCheckoutParams {
  /** LemonSqueezy variant ID (from env config) */
  variantId: number;
  /** Price in cents (e.g., PKR 50,000 → 5000000) */
  customPrice?: number;
  /** Customer email */
  email: string;
  /** Customer full name */
  name: string;
  /** Custom data passed through to webhook (payment_type, reference_id, etc.) */
  customData: Record<string, string>;
  /** URL to redirect after checkout */
  redirectUrl: string;
  /** Optional product name override */
  productName?: string;
}

/** Parameters for creating a subscription checkout */
export interface CreateSubscriptionCheckoutParams {
  /** Customer email */
  email: string;
  /** Customer full name */
  name: string;
  /** Custom data passed through to webhook (payment_type, user_id, etc.) */
  customData: Record<string, string>;
  /** URL to redirect after checkout */
  redirectUrl: string;
}

/** Result of a checkout creation */
export interface CheckoutResult {
  /** Hosted checkout URL to redirect the user to */
  checkoutUrl: string;
  /** LemonSqueezy checkout ID */
  checkoutId: string;
}

/**
 * LemonSqueezy payment service — handles checkout creation, webhook
 * signature verification, and subscription lifecycle management.
 *
 * **Stub stage (Task 10A):** All methods throw NotImplementedException.
 * **Real implementation:** Task 10B will replace stubs with SDK calls.
 *
 * @example
 * ```typescript
 * @Module({ imports: [PaymentsModule] })
 * export class SubscriptionsModule {}
 * ```
 */
@Injectable()
export class LemonSqueezyService {
  private readonly logger = new Logger(LemonSqueezyService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Create a one-time checkout session (consultation fee or service registration fee).
   *
   * @param params - Checkout parameters including variant ID, price, email, custom data
   * @returns Checkout URL and checkout ID
   * @throws {NotImplementedException} Until Task 10B implementation
   *
   * @example
   * ```typescript
   * const { checkoutUrl } = await lemonsqueezyService.createOneTimeCheckout({
   *   variantId: 12345,
   *   customPrice: 5000000,
   *   email: 'client@example.com',
   *   name: 'John Doe',
   *   customData: { payment_type: 'consultation', booking_id: 'uuid' },
   *   redirectUrl: 'https://arco.pk/payment/success?type=consultation',
   * });
   * ```
   */
  async createOneTimeCheckout(
    _params: CreateOneTimeCheckoutParams,
  ): Promise<CheckoutResult> {
    this.logger.warn('createOneTimeCheckout called on stub — not yet implemented');
    throw new NotImplementedException(
      'LemonSqueezy integration not yet configured',
    );
  }

  /**
   * Create a subscription checkout session (Civic Retainer — PKR 700/month).
   *
   * @param params - Checkout parameters including email, name, custom data
   * @returns Checkout URL and checkout ID
   * @throws {NotImplementedException} Until Task 10B implementation
   *
   * @example
   * ```typescript
   * const { checkoutUrl } = await lemonsqueezyService.createSubscriptionCheckout({
   *   email: 'client@example.com',
   *   name: 'John Doe',
   *   customData: { payment_type: 'subscription', user_id: 'uuid' },
   *   redirectUrl: 'https://arco.pk/payment/success?type=subscription',
   * });
   * ```
   */
  async createSubscriptionCheckout(
    _params: CreateSubscriptionCheckoutParams,
  ): Promise<CheckoutResult> {
    this.logger.warn('createSubscriptionCheckout called on stub — not yet implemented');
    throw new NotImplementedException(
      'LemonSqueezy integration not yet configured',
    );
  }

  /**
   * Verify LemonSqueezy webhook signature (HMAC-SHA256).
   *
   * @param rawBody - Raw request body as Buffer
   * @param signature - X-Signature header value
   * @returns true if valid, false otherwise
   * @throws {NotImplementedException} Until Task 10B implementation
   *
   * @example
   * ```typescript
   * const isValid = lemonsqueezyService.verifyWebhookSignature(req.rawBody, req.headers['x-signature']);
   * ```
   */
  verifyWebhookSignature(_rawBody: Buffer, _signature: string): boolean {
    this.logger.warn('verifyWebhookSignature called on stub — not yet implemented');
    throw new NotImplementedException(
      'LemonSqueezy integration not yet configured',
    );
  }

  /**
   * Retrieve a subscription by LemonSqueezy subscription ID.
   *
   * @param subscriptionId - LemonSqueezy subscription ID
   * @throws {NotImplementedException} Until Task 10B implementation
   *
   * @example
   * ```typescript
   * const sub = await lemonsqueezyService.getSubscription('123');
   * ```
   */
  async getSubscription(_subscriptionId: string): Promise<unknown> {
    throw new NotImplementedException(
      'LemonSqueezy integration not yet configured',
    );
  }

  /**
   * Cancel a subscription via LemonSqueezy API.
   *
   * @param subscriptionId - LemonSqueezy subscription ID
   * @throws {NotImplementedException} Until Task 10B implementation
   *
   * @example
   * ```typescript
   * await lemonsqueezyService.cancelSubscription('123');
   * ```
   */
  async cancelSubscription(_subscriptionId: string): Promise<void> {
    throw new NotImplementedException(
      'LemonSqueezy integration not yet configured',
    );
  }

  /**
   * Resume a paused or cancelled subscription via LemonSqueezy API.
   *
   * @param subscriptionId - LemonSqueezy subscription ID
   * @throws {NotImplementedException} Until Task 10B implementation
   *
   * @example
   * ```typescript
   * await lemonsqueezyService.resumeSubscription('123');
   * ```
   */
  async resumeSubscription(_subscriptionId: string): Promise<void> {
    throw new NotImplementedException(
      'LemonSqueezy integration not yet configured',
    );
  }

  /**
   * Retrieve an order by LemonSqueezy order ID.
   *
   * @param orderId - LemonSqueezy order ID
   * @throws {NotImplementedException} Until Task 10B implementation
   *
   * @example
   * ```typescript
   * const order = await lemonsqueezyService.getOrder('456');
   * ```
   */
  async getOrder(_orderId: string): Promise<unknown> {
    throw new NotImplementedException(
      'LemonSqueezy integration not yet configured',
    );
  }
}
