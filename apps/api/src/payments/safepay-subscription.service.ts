/**
 * Safepay subscription service using @sfpy/node-sdk.
 *
 * Provides subscription-specific operations:
 * - Plan creation via direct REST API (no SDK support for plan CRUD)
 * - Subscription checkout URL generation via SDK
 * - Subscription cancellation via SDK
 * - Webhook signature verification via SDK
 *
 * @module PaymentsModule
 * @see docs/safepay/safepay-integration-reference.md
 *
 * @example
 * ```typescript
 * const planToken = await safepaySubscriptionService.createPlan({
 *   amount: '500000', currency: 'PKR', interval: 'month',
 *   intervalCount: 1, product: 'Premium Plan',
 * });
 * const checkoutUrl = await safepaySubscriptionService
 *   .generateSubscriptionCheckoutUrl({ planToken });
 * ```
 */
import {
  Injectable,
  Logger,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IncomingHttpHeaders } from 'http';

/** @sfpy/node-sdk instance type (loosely typed due to SDK limitations) */
type SafepaySdkInstance = {
  checkout: {
    createSubscription: (params: {
      cancelUrl: string;
      redirectUrl: string;
      planId: string;
      reference?: string;
    }) => Promise<string>;
  };
  subscription: {
    cancel: (subId: string) => Promise<unknown>;
    pause: (params: {
      subscriptionId: string;
      behavior: string;
    }) => Promise<unknown>;
    resume: (subId: string) => Promise<unknown>;
  };
  verify: {
    webhook: (request: {
      body?: unknown;
      headers?: IncomingHttpHeaders;
    }) => boolean;
  };
};

/**
 * Service for managing Safepay subscriptions.
 *
 * Uses @sfpy/node-sdk for subscription checkout and lifecycle management,
 * and direct REST API calls for plan CRUD (not supported by SDK).
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [PaymentsModule],
 * })
 * export class SubscriptionsModule {}
 * ```
 */
@Injectable()
export class SafepaySubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SafepaySubscriptionService.name);
  private safepay: SafepaySdkInstance | null = null;
  private environment: string;
  private apiKey: string;
  private v1Secret: string;
  private webhookSecret: string;
  private frontendUrl: string;
  private host: string;

  constructor(private readonly configService: ConfigService) {
    this.environment =
      this.configService.get<string>('safepay.environment') || 'sandbox';
    this.apiKey = this.configService.get<string>('safepay.secretKey') || '';
    this.v1Secret = this.configService.get<string>('safepay.v1Secret') || '';
    this.webhookSecret =
      this.configService.get<string>('safepay.webhookSecret') || '';
    this.frontendUrl =
      this.configService.get<string>('safepay.frontendUrl') ||
      'http://localhost:3000';
    this.host = this.configService.get<string>('safepay.host') || '';
  }

  /**
   * Lazy-load @sfpy/node-sdk to avoid import issues.
   *
   * The SDK is dynamically imported at module initialization to handle
   * cases where the package may not be available in all environments.
   *
   * @example
   * ```typescript
   * // Called automatically by NestJS on module init
   * await safepaySubscriptionService.onModuleInit();
   * ```
   */
  async onModuleInit(): Promise<void> {
    try {
      const { Safepay } = await import('@sfpy/node-sdk');
      // Environment enum values match string literals ('sandbox', 'production')
      // but the SDK types them as enum members, so we cast through unknown
      this.safepay = new (Safepay as unknown as new (opts: {
        environment: string;
        apiKey: string;
        v1Secret: string;
        webhookSecret: string;
      }) => SafepaySdkInstance)({
        environment: this.environment,
        apiKey: this.apiKey,
        v1Secret: this.v1Secret,
        webhookSecret: this.webhookSecret,
      });
      this.logger.log(
        `SafepaySubscriptionService initialized (${this.environment})`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize @sfpy/node-sdk', error);
    }
  }

  /**
   * Get typed SDK instance, throwing if not initialized.
   *
   * @returns Typed SDK instance
   * @throws {HttpException} If SDK is not initialized (SERVICE_UNAVAILABLE)
   */
  private getSdk(): SafepaySdkInstance {
    if (!this.safepay) {
      throw new HttpException(
        'Safepay subscription SDK not initialized',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return this.safepay;
  }

  /**
   * Create a subscription plan on Safepay via direct HTTP.
   *
   * Neither @sfpy/node-core nor @sfpy/node-sdk has plan CRUD support,
   * so this calls the REST API directly using axios.
   * This is typically a one-time setup operation per plan.
   *
   * @param params - Plan creation parameters
   * @param params.amount - Plan amount as string (in paisa, e.g., '500000' for PKR 5000)
   * @param params.currency - ISO currency code (e.g., 'PKR')
   * @param params.interval - Billing interval ('day', 'week', 'month', 'year')
   * @param params.intervalCount - Number of intervals between billings
   * @param params.product - Human-readable product name
   * @returns The Safepay plan token (plan_xxx)
   * @throws {HttpException} If API call fails or no token returned (BAD_GATEWAY)
   *
   * @example
   * ```typescript
   * const planToken = await safepaySubscriptionService.createPlan({
   *   amount: '500000',
   *   currency: 'PKR',
   *   interval: 'month',
   *   intervalCount: 1,
   *   product: 'Premium Monthly',
   * });
   * // planToken = 'plan_xxx'
   * ```
   */
  async createPlan(params: {
    amount: string;
    currency: string;
    interval: string;
    intervalCount: number;
    product: string;
  }): Promise<string> {
    const axios = (await import('axios')).default;
    const url = `${this.host}/client/plans/v1/`;

    let response: { data?: { data?: { token?: string } } };
    try {
      response = await axios.post(
        url,
        {
          payload: {
            amount: params.amount,
            currency: params.currency,
            interval: params.interval,
            type: 'RECURRING',
            interval_count: params.intervalCount,
            product: params.product,
            active: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      this.logger.error('Safepay plan creation failed', error);
      throw new HttpException(
        'Failed to create Safepay plan — API call failed',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const planToken = response.data?.data?.token;
    if (!planToken) {
      this.logger.error(
        'Safepay plan creation returned no token',
        response.data,
      );
      throw new HttpException(
        'Failed to create Safepay plan — no token returned',
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.log(`Created Safepay plan: ${planToken}`);
    return planToken;
  }

  /**
   * Generate a subscription checkout URL.
   *
   * Uses @sfpy/node-sdk checkout.createSubscription() which auto-creates
   * an auth token and builds the checkout URL with plan_id and auth_token.
   *
   * @param params - Checkout URL generation parameters
   * @param params.planToken - Safepay plan token (plan_xxx)
   * @param params.reference - Optional reference string for tracking
   * @returns Full Safepay subscription checkout URL
   * @throws {HttpException} If SDK not initialized or URL generation fails
   *
   * @example
   * ```typescript
   * const checkoutUrl = await safepaySubscriptionService
   *   .generateSubscriptionCheckoutUrl({
   *     planToken: 'plan_xxx',
   *     reference: 'SUB-2026-0001',
   *   });
   * // Opens: https://sandbox.api.getsafepay.com/checkout/subscribe?plan_id=...
   * ```
   */
  async generateSubscriptionCheckoutUrl(params: {
    planToken: string;
    reference?: string;
  }): Promise<string> {
    const sdk = this.getSdk();
    const redirectUrl = `${this.frontendUrl}/payment-callback?source=subscription`;
    const cancelUrl = `${this.frontendUrl}/payment-callback?source=subscription&cancelled=true`;

    let checkoutUrl: unknown;
    try {
      checkoutUrl = await sdk.checkout.createSubscription({
        planId: params.planToken,
        redirectUrl,
        cancelUrl,
        reference: params.reference,
      });
    } catch (error) {
      this.logger.error(
        'Safepay subscription checkout URL generation failed',
        error,
      );
      throw new HttpException(
        'Failed to generate subscription checkout URL',
        HttpStatus.BAD_GATEWAY,
      );
    }

    // SDK bug: .catch handler returns error as value instead of re-throwing
    if (checkoutUrl instanceof Error) {
      this.logger.error(
        'Safepay auth token creation failed (SDK swallowed error)',
        checkoutUrl.message,
      );
      throw new HttpException(
        `Subscription checkout failed: ${checkoutUrl.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!checkoutUrl || typeof checkoutUrl !== 'string') {
      this.logger.error(
        'Unexpected checkout URL result type',
        typeof checkoutUrl,
        checkoutUrl,
      );
      throw new HttpException(
        'Failed to generate subscription checkout URL — empty response',
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.log(
      `Generated subscription checkout URL for plan ${params.planToken}`,
    );
    return checkoutUrl;
  }

  /**
   * Cancel a subscription on Safepay.
   *
   * @param safepaySubscriptionId - Safepay subscription ID (sub_xxx)
   * @throws {HttpException} If SDK not initialized or cancellation fails
   *
   * @example
   * ```typescript
   * await safepaySubscriptionService.cancelSubscription('sub_xxx');
   * ```
   */
  async cancelSubscription(safepaySubscriptionId: string): Promise<void> {
    const sdk = this.getSdk();
    try {
      await sdk.subscription.cancel(safepaySubscriptionId);
      this.logger.log(`Cancelled subscription: ${safepaySubscriptionId}`);
    } catch (error) {
      this.logger.error(
        `Failed to cancel subscription: ${safepaySubscriptionId}`,
        error,
      );
      throw new HttpException(
        'Failed to cancel subscription on Safepay',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Verify a Safepay webhook HMAC-SHA512 signature using the SDK.
   *
   * @param request - The webhook request containing body and headers
   * @param request.body - The parsed webhook request body
   * @param request.headers - The incoming HTTP headers (must include X-SFPY-SIGNATURE)
   * @returns Whether the webhook signature is valid
   *
   * @example
   * ```typescript
   * const isValid = safepaySubscriptionService.verifyWebhook({
   *   body: req.body,
   *   headers: req.headers,
   * });
   * if (!isValid) throw new UnauthorizedException('Invalid webhook signature');
   * ```
   */
  verifyWebhook(request: {
    body: unknown;
    headers: IncomingHttpHeaders;
  }): boolean {
    const sdk = this.getSdk();
    return sdk.verify.webhook(request);
  }
}
