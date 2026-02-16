/**
 * Safepay payment gateway service.
 *
 * Integrates with the real Safepay Node SDK (@sfpy/node-core) for:
 * - Payment session creation (v3 API)
 * - Payment verification via tracker (reporter API)
 * - Webhook signature verification (HMAC-SHA512)
 *
 * @module PaymentsModule
 * @see docs/safepay/safepay-integration-reference.md
 *
 * @example
 * ```typescript
 * const session = await safepayService.createPaymentSession({
 *   amount: 5000000, currency: 'PKR', orderId: 'CON-2026-0001',
 *   metadata: { type: 'consultation', referenceId: 'booking-uuid' },
 * });
 * ```
 */
import {
  Injectable,
  Logger,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/** Parameters for creating a redirect-based checkout session (legacy) */
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

/** Parameters for creating a subscription checkout (legacy) */
export interface CreateSubscriptionCheckoutParams {
  /** Safepay plan identifier */
  planId: string;
  /** Our internal reference */
  reference: string;
  /** Customer email for Safepay */
  customerEmail: string;
  /** URL to redirect after successful subscription */
  returnUrl: string;
  /** URL to redirect after cancelled subscription */
  cancelUrl: string;
}

/** Parameters for creating a payment session */
export interface CreatePaymentSessionParams {
  /** Amount in paisa (PKR * 100) */
  amount: number;
  /** ISO currency code */
  currency: string;
  /** Order ID for tracking (e.g., reference number) */
  orderId: string;
  /** Metadata for webhook routing */
  metadata: {
    type: 'consultation' | 'subscription' | 'service' | 'invoice';
    referenceId: string;
  };
}

/** Internal result from session creation (not exposed to frontend) */
export interface PaymentSessionInternalResult {
  /** Tracker token for payment tracking */
  trackerToken: string;
  /** Amount in PKR (converted from paisa) */
  amount: number;
  /** Currency code */
  currency: string;
  /** Order ID */
  orderId: string;
}

/** Payment session result returned to frontend */
export interface PaymentSessionResult {
  /** Full Safepay checkout URL for popup window */
  checkoutUrl: string;
  /** Amount in PKR (for display) */
  amount: number;
  /** Currency code */
  currency: string;
  /** Order ID */
  orderId: string;
}

/** Payment verification result */
export interface PaymentVerificationResult {
  /** Whether payment was successful */
  isPaid: boolean;
  /** Safepay transaction reference */
  reference: string | null;
  /** Payment amount */
  amount: number;
  /** Payment state */
  state: string;
}

@Injectable()
export class SafepayService implements OnModuleInit {
  private readonly logger = new Logger(SafepayService.name);
  private safepay: InstanceType<
    typeof import('@sfpy/node-core').default
  > | null = null;
  private publicKey = '';
  private environment = 'sandbox';
  private frontendUrl = 'http://localhost:3000';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const secretKey = this.configService.get<string>('safepay.secretKey');
    const host = this.configService.get<string>('safepay.host');
    this.publicKey = this.configService.get<string>('safepay.publicKey') ?? '';
    this.environment =
      this.configService.get<string>('safepay.environment') ?? 'sandbox';
    this.frontendUrl =
      this.configService.get<string>('safepay.frontendUrl') ??
      'http://localhost:3000';

    if (!secretKey) {
      this.logger.warn(
        'SAFEPAY_SECRET_KEY not configured — Safepay SDK not initialized',
      );
      return;
    }

    try {
      const SafepayModule = await import('@sfpy/node-core');
      const Safepay = SafepayModule.default ?? SafepayModule;
      this.safepay = new Safepay(secretKey, {
        authType: 'secret',
        host: host || 'https://sandbox.api.getsafepay.com',
      });
      this.logger.log(`Safepay SDK initialized (host: ${host})`);
    } catch (error) {
      this.logger.error('Failed to initialize Safepay SDK', error);
    }
  }

  /**
   * Creates a payment session and returns internal tracking details.
   *
   * The tracker token is used internally by generateCheckoutUrl() to build
   * the hosted checkout URL. Not directly exposed to the frontend.
   *
   * @param params - Payment session parameters
   * @returns Internal result with tracker token for checkout URL generation
   * @throws {InternalServerErrorException} If SDK not initialized or API fails
   *
   * @example
   * ```typescript
   * const result = await safepayService.createPaymentSession({
   *   amount: 5000000, // PKR 50,000 in paisa
   *   currency: 'PKR',
   *   orderId: 'CON-2026-0001',
   *   metadata: { type: 'consultation', referenceId: 'uuid-here' },
   * });
   * // result.trackerToken → 'track_xxx'
   * ```
   */
  async createPaymentSession(
    params: CreatePaymentSessionParams,
  ): Promise<PaymentSessionInternalResult> {
    if (!this.safepay) {
      throw new InternalServerErrorException(
        'Safepay SDK not initialized. Check SAFEPAY_SECRET_KEY.',
      );
    }

    this.logger.log(
      `Creating payment session: ${params.orderId} for ${params.amount} ${params.currency}`,
    );

    let session: { data?: { tracker?: { token?: string } } };
    try {
      session = await this.safepay.payments.session.setup({
        merchant_api_key: this.publicKey,
        intent: 'CYBERSOURCE',
        mode: 'payment',
        currency: params.currency,
        amount: params.amount,
        metadata: {
          order_id: params.orderId,
        },
      });
    } catch (error) {
      this.logger.error('Safepay session creation failed', error);
      throw new InternalServerErrorException(
        'Payment gateway error — failed to create payment session',
      );
    }

    const trackerToken = session?.data?.tracker?.token;
    if (!trackerToken) {
      this.logger.error(
        'Safepay session creation returned no tracker',
        session,
      );
      throw new InternalServerErrorException(
        'Payment session creation failed — no tracker returned',
      );
    }

    this.logger.log(`Payment session created: tracker=${trackerToken}`);

    return {
      trackerToken,
      amount: params.amount / 100, // Convert paisa → PKR for frontend
      currency: params.currency,
      orderId: params.orderId,
    };
  }

  /**
   * Generates a Safepay hosted checkout URL for popup-based payment.
   *
   * Creates a short-lived TBT (temporary bearer token) via passport, then
   * builds the checkout URL that the frontend opens in a popup window.
   *
   * @param trackerToken - Tracker token from createPaymentSession
   * @returns Full Safepay checkout URL string
   * @throws {InternalServerErrorException} If SDK not initialized or API fails
   *
   * @example
   * ```typescript
   * const url = await safepayService.generateCheckoutUrl('track_xxx');
   * // url → 'https://sandbox.api.getsafepay.com/components?...'
   * ```
   */
  async generateCheckoutUrl(trackerToken: string): Promise<string> {
    if (!this.safepay) {
      throw new InternalServerErrorException(
        'Safepay SDK not initialized. Check SAFEPAY_SECRET_KEY.',
      );
    }

    this.logger.log(`Generating checkout URL for tracker: ${trackerToken}`);

    // Step 1: Create a short-lived TBT (temporary bearer token)
    let tbt: string;
    try {
      const passportResponse =
        (await this.safepay.client.passport.create()) as unknown as {
          data: string;
        };
      tbt = passportResponse.data;
    } catch (error) {
      this.logger.error('Safepay passport creation failed', error);
      throw new InternalServerErrorException(
        'Payment gateway error — failed to create auth token',
      );
    }

    // Step 2: Generate the hosted checkout URL
    try {
      const checkoutUrl = this.safepay.checkout.createCheckoutUrl({
        tracker: trackerToken,
        tbt,
        env: this.environment as 'development' | 'sandbox' | 'production',
        source: 'hosted',
        redirect_url: `${this.frontendUrl}/consultation/payment-callback`,
        cancel_url: `${this.frontendUrl}/consultation/payment-callback?cancelled=true`,
      });

      this.logger.log(`Checkout URL generated for tracker: ${trackerToken}`);
      return checkoutUrl;
    } catch (error) {
      this.logger.error('Safepay checkout URL generation failed', error);
      throw new InternalServerErrorException(
        'Payment gateway error — failed to generate checkout URL',
      );
    }
  }

  /**
   * Verifies a payment by fetching its status via tracker token.
   *
   * Uses the reporter API (`safepay.reporter.payments.get()`) which is the
   * correct endpoint for payment verification per the Safepay Express Checkout docs.
   *
   * @param trackerToken - The tracker token from createPaymentSession
   * @returns Payment verification result with isPaid flag
   * @throws {InternalServerErrorException} If SDK not initialized or API fails
   *
   * @example
   * ```typescript
   * const result = await safepayService.verifyPayment('track_xxx');
   * if (result.isPaid) {
   *   // Update booking to payment_confirmed
   * }
   * ```
   */
  async verifyPayment(
    trackerToken: string,
  ): Promise<PaymentVerificationResult> {
    if (!this.safepay) {
      throw new InternalServerErrorException(
        'Safepay SDK not initialized. Check SAFEPAY_SECRET_KEY.',
      );
    }

    this.logger.log(`Verifying payment: tracker=${trackerToken}`);

    // Use reporter.payments.fetch() — the only query method on Reporter.Payments
    let payment: {
      data?: { state?: string; reference?: string; amount?: number };
    };
    try {
      payment = await this.safepay.reporter.payments.fetch(trackerToken);
    } catch (error) {
      this.logger.error('Safepay payment verification failed', error);
      throw new InternalServerErrorException(
        'Payment gateway error — failed to verify payment',
      );
    }

    const state = payment?.data?.state ?? 'UNKNOWN';
    const reference = payment?.data?.reference ?? null;
    const amount = payment?.data?.amount ?? 0;

    this.logger.log(
      `Payment verification: tracker=${trackerToken} state=${state} ref=${reference}`,
    );

    return {
      isPaid: state === 'TRACKER_COMPLETED' || state === 'PAID',
      reference,
      amount,
      state,
    };
  }

  // ── Legacy stubs (used by service-registrations + subscriptions modules) ──

  /**
   * Creates a redirect-based checkout session.
   * TODO: Replace with real SDK when service-registrations module is updated.
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
   * TODO: Replace with real SDK when subscriptions module is updated.
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
   * Gets payment status by tracker ID.
   * TODO: Replace with real SDK when needed.
   */
  async getPaymentStatus(
    trackerId: string,
  ): Promise<{ status: string; amount: number }> {
    this.logger.log(`[STUB] Getting payment status for: ${trackerId}`);
    return { status: 'completed', amount: 0 };
  }

  /**
   * Cancels a Safepay subscription.
   * TODO: Replace with real SDK when subscriptions module is updated.
   */
  async cancelSubscription(
    subscriptionId: string,
  ): Promise<{ success: boolean }> {
    this.logger.log(`[STUB] Cancelling subscription: ${subscriptionId}`);
    return { success: true };
  }

  // ── End legacy stubs ──

  /**
   * Verifies a Safepay webhook signature using HMAC-SHA512.
   *
   * @param payload - The full webhook request body (JSON-encoded for HMAC)
   * @param signature - The X-SFPY-SIGNATURE header value
   * @returns Whether the signature is valid
   *
   * @example
   * ```typescript
   * const isValid = safepayService.verifyWebhookSignature(
   *   request.body,
   *   'hmac-sha512-signature-from-header',
   * );
   * ```
   */
  verifyWebhookSignature(payload: unknown, signature: string): boolean {
    const webhookSecret = this.configService.get<string>(
      'safepay.webhookSecret',
    );
    if (!webhookSecret) {
      this.logger.warn('SAFEPAY_WEBHOOK_SECRET not configured');
      return false;
    }

    const data = Buffer.from(JSON.stringify(payload));
    const expectedSignature = crypto
      .createHmac('sha512', webhookSecret)
      .update(data)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex'),
      );
    } catch {
      return false;
    }
  }
}
