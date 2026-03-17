/**
 * LemonSqueezy Payment Service
 *
 * Real implementation using @lemonsqueezy/lemonsqueezy.js SDK.
 * Handles checkout creation, webhook signature verification,
 * and subscription lifecycle management.
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

import { createHmac } from 'crypto';
import {
  BadGatewayException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  lemonSqueezySetup,
  createCheckout,
  cancelSubscription as lsCancelSubscription,
  updateSubscription,
  getSubscription as lsGetSubscription,
  getOrder as lsGetOrder,
} from '@lemonsqueezy/lemonsqueezy.js';
import type { Configuration } from '../config/configuration';

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
 * @example
 * ```typescript
 * @Module({ imports: [PaymentsModule] })
 * export class SubscriptionsModule {}
 * ```
 */
@Injectable()
export class LemonSqueezyService implements OnModuleInit {
  private readonly logger = new Logger(LemonSqueezyService.name);

  constructor(private readonly configService: ConfigService<Configuration>) {}

  /**
   * Initialize the LemonSqueezy SDK on module startup.
   * Called automatically by NestJS before any request is handled.
   */
  onModuleInit() {
    const apiKey = this.configService.get<string>('lemonsqueezy.apiKey', {
      infer: true,
    });
    lemonSqueezySetup({
      apiKey,
      onError: (error) => {
        this.logger.error('LemonSqueezy SDK error', error);
      },
    });
    this.logger.log('LemonSqueezy SDK initialized');
  }

  /**
   * Create a one-time checkout session (consultation fee or service registration fee).
   *
   * @param params - Checkout parameters including variant ID, price, email, custom data
   * @returns Checkout URL and checkout ID
   * @throws {BadGatewayException} If LemonSqueezy API returns an error
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
    params: CreateOneTimeCheckoutParams,
  ): Promise<CheckoutResult> {
    const storeId = Number(
      this.configService.get<string>('lemonsqueezy.storeId', { infer: true }),
    );

    const { data, error } = await createCheckout(storeId, params.variantId, {
      ...(params.customPrice !== undefined && {
        customPrice: params.customPrice,
      }),
      productOptions: {
        ...(params.productName && { name: params.productName }),
        redirectUrl: params.redirectUrl,
        receiptButtonText: 'Return to AR&CO',
        receiptLinkUrl:
          this.configService.get<string>('lemonsqueezy.frontendUrl', {
            infer: true,
          }) ?? 'http://localhost:3000',
      },
      checkoutOptions: {
        embed: false,
        discount: false,
      },
      checkoutData: {
        email: params.email,
        name: params.name,
        billingAddress: { country: 'PK' },
        custom: params.customData,
      },
    });

    if (error) {
      this.logger.error('createOneTimeCheckout failed', error.message);
      throw new BadGatewayException(
        `Payment session creation failed: ${error.message}`,
      );
    }

    return {
      checkoutUrl: data.data.attributes.url,
      checkoutId: data.data.id,
    };
  }

  /**
   * Create a subscription checkout session (Civic Retainer — PKR 700/month).
   *
   * @param params - Checkout parameters including email, name, custom data
   * @returns Checkout URL and checkout ID
   * @throws {BadGatewayException} If LemonSqueezy API returns an error
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
    params: CreateSubscriptionCheckoutParams,
  ): Promise<CheckoutResult> {
    const storeId = Number(
      this.configService.get<string>('lemonsqueezy.storeId', { infer: true }),
    );
    const variantId = Number(
      this.configService.get<string>(
        'lemonsqueezy.subscriptionVariantId',
        { infer: true },
      ),
    );

    const { data, error } = await createCheckout(storeId, variantId, {
      productOptions: {
        redirectUrl: params.redirectUrl,
        receiptButtonText: 'Return to AR&CO',
        receiptLinkUrl:
          this.configService.get<string>('lemonsqueezy.frontendUrl', {
            infer: true,
          }) ?? 'http://localhost:3000',
      },
      checkoutOptions: {
        embed: false,
        discount: false,
      },
      checkoutData: {
        email: params.email,
        name: params.name,
        billingAddress: { country: 'PK' },
        custom: params.customData,
      },
    });

    if (error) {
      this.logger.error('createSubscriptionCheckout failed', error.message);
      throw new BadGatewayException(
        `Subscription checkout creation failed: ${error.message}`,
      );
    }

    return {
      checkoutUrl: data.data.attributes.url,
      checkoutId: data.data.id,
    };
  }

  /**
   * Verify LemonSqueezy webhook signature (HMAC-SHA256).
   *
   * Computes HMAC-SHA256 of the raw request body using the webhook secret
   * and compares it to the X-Signature header value.
   *
   * @param rawBody - Raw request body as Buffer
   * @param signature - X-Signature header value
   * @returns true if the signature is valid, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = lemonsqueezyService.verifyWebhookSignature(
   *   req.rawBody,
   *   req.headers['x-signature'] as string,
   * );
   * if (!isValid) throw new UnauthorizedException('Invalid signature');
   * ```
   */
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    const secret = this.configService.get<string>(
      'lemonsqueezy.webhookSecret',
      { infer: true },
    );
    if (!secret) {
      this.logger.warn(
        'LEMONSQUEEZY_WEBHOOK_SECRET not configured — rejecting all webhooks',
      );
      return false;
    }
    const digest = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return digest === signature;
  }

  /**
   * Retrieve a subscription by LemonSqueezy subscription ID.
   *
   * @param subscriptionId - LemonSqueezy subscription ID (numeric string)
   * @returns Raw LemonSqueezy subscription data
   * @throws {BadGatewayException} If LemonSqueezy API returns an error
   *
   * @example
   * ```typescript
   * const sub = await lemonsqueezyService.getSubscription('123');
   * ```
   */
  async getSubscription(subscriptionId: string): Promise<unknown> {
    const { data, error } = await lsGetSubscription(subscriptionId);
    if (error) {
      this.logger.error('getSubscription failed', error.message);
      throw new BadGatewayException(
        `Failed to retrieve subscription: ${error.message}`,
      );
    }
    return data;
  }

  /**
   * Cancel a subscription via LemonSqueezy API.
   * The subscription remains active until the end of the current billing period.
   *
   * @param subscriptionId - LemonSqueezy subscription ID (numeric string)
   * @throws {BadGatewayException} If LemonSqueezy API returns an error
   *
   * @example
   * ```typescript
   * await lemonsqueezyService.cancelSubscription('123');
   * ```
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const { error } = await lsCancelSubscription(subscriptionId);
    if (error) {
      this.logger.error('cancelSubscription failed', error.message);
      throw new BadGatewayException(
        `Failed to cancel subscription: ${error.message}`,
      );
    }
  }

  /**
   * Resume a cancelled subscription via LemonSqueezy API.
   * Clears the pause by setting `pause: null`.
   *
   * @param subscriptionId - LemonSqueezy subscription ID (numeric string)
   * @throws {BadGatewayException} If LemonSqueezy API returns an error
   *
   * @example
   * ```typescript
   * await lemonsqueezyService.resumeSubscription('123');
   * ```
   */
  async resumeSubscription(subscriptionId: string): Promise<void> {
    const { error } = await updateSubscription(subscriptionId, {
      pause: null,
    });
    if (error) {
      this.logger.error('resumeSubscription failed', error.message);
      throw new BadGatewayException(
        `Failed to resume subscription: ${error.message}`,
      );
    }
  }

  /**
   * Retrieve an order by LemonSqueezy order ID.
   *
   * @param orderId - LemonSqueezy order ID (numeric string)
   * @returns Raw LemonSqueezy order data
   * @throws {BadGatewayException} If LemonSqueezy API returns an error
   *
   * @example
   * ```typescript
   * const order = await lemonsqueezyService.getOrder('456');
   * ```
   */
  async getOrder(orderId: string): Promise<unknown> {
    const { data, error } = await lsGetOrder(orderId);
    if (error) {
      this.logger.error('getOrder failed', error.message);
      throw new BadGatewayException(
        `Failed to retrieve order: ${error.message}`,
      );
    }
    return data;
  }
}
