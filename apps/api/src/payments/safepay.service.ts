/**
 * Safepay payment gateway service.
 *
 * Integrates with the real Safepay Node SDK (@sfpy/node-core) for:
 * - Payment session creation (v3 API)
 * - Checkout URL generation with TBT auth token
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
 * });
 * const checkoutUrl = await safepayService.generateCheckoutUrl(session.trackerToken);
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

/** Parameters for creating a payment session */
export interface CreatePaymentSessionParams {
  /** Amount in paisa (PKR * 100) */
  amount: number;
  /** ISO currency code */
  currency: string;
  /** Order ID for tracking (e.g., reference number) */
  orderId: string;
}

/** Internal result from session creation */
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

/** Payment session result returned to frontend (includes checkout URL) */
export interface PaymentSessionResult {
  /** Full Safepay checkout URL for popup window */
  checkoutUrl: string;
  /** Tracker token for later verification */
  trackerToken: string;
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
    const secretKey = this.configService.get<string>('safepay.secretKey') ?? '';
    this.publicKey = this.configService.get<string>('safepay.publicKey') ?? '';
    this.environment =
      this.configService.get<string>('safepay.environment') ?? 'sandbox';
    this.frontendUrl =
      this.configService.get<string>('safepay.frontendUrl') ??
      'http://localhost:3000';
    const host =
      this.configService.get<string>('safepay.host') ??
      'https://sandbox.api.getsafepay.com';

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
        host,
      });
      this.logger.log(`Safepay SDK initialized (host: ${host})`);
    } catch (error) {
      this.logger.error('Failed to initialize Safepay SDK', error);
    }
  }

  /**
   * Creates a payment session and returns internal tracking details.
   *
   * @param params - Payment session parameters
   * @returns Internal result with tracker token
   * @throws {InternalServerErrorException} If SDK not initialized or API fails
   *
   * @example
   * ```typescript
   * const result = await safepayService.createPaymentSession({
   *   amount: 5000000, currency: 'PKR', orderId: 'CON-2026-0001',
   * });
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
      session = (await this.safepay.payments.session.setup({
        merchant_api_key: this.publicKey,
        intent: 'CYBERSOURCE',
        mode: 'payment',
        currency: params.currency,
        amount: params.amount,
        metadata: {
          order_id: params.orderId,
        },
      })) as unknown as { data?: { tracker?: { token?: string } } };
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
      amount: params.amount / 100,
      currency: params.currency,
      orderId: params.orderId,
    };
  }

  /**
   * Generates a Safepay hosted checkout URL for popup-based payment.
   *
   * Creates a short-lived TBT (temporary bearer token) via passport, then
   * builds the checkout URL using the SDK's built-in method.
   *
   * @param trackerToken - Tracker token from createPaymentSession
   * @param redirectUrl - Custom redirect URL (defaults to consultation callback)
   * @param cancelUrl - Custom cancel URL
   * @returns Full Safepay checkout URL string
   * @throws {InternalServerErrorException} If SDK not initialized or API fails
   *
   * @example
   * ```typescript
   * const url = await safepayService.generateCheckoutUrl('track_xxx');
   * // Opens in popup: https://sandbox.api.getsafepay.com/embedded/?...
   * ```
   */
  async generateCheckoutUrl(
    trackerToken: string,
    redirectUrl?: string,
    cancelUrl?: string,
  ): Promise<string> {
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

    // Step 2: Generate the hosted checkout URL via SDK
    try {
      const checkoutUrl = this.safepay.checkout.createCheckoutUrl({
        tracker: trackerToken,
        tbt,
        env: this.environment as 'development' | 'sandbox' | 'production',
        source: 'hosted',
        redirect_url:
          redirectUrl || `${this.frontendUrl}/consultation/payment-callback`,
        cancel_url:
          cancelUrl ||
          `${this.frontendUrl}/consultation/payment-callback?cancelled=true`,
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
   * @param trackerToken - The tracker token from createPaymentSession
   * @returns Payment verification result with isPaid flag
   * @throws {InternalServerErrorException} If SDK not initialized or API fails
   *
   * @example
   * ```typescript
   * const result = await safepayService.verifyPayment('track_xxx');
   * if (result.isPaid) { /* update booking *\/ }
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

    let payment: Record<string, unknown>;
    try {
      payment = (await this.safepay.reporter.payments.fetch(
        trackerToken,
      )) as unknown as Record<string, unknown>;
    } catch (error) {
      this.logger.error('Safepay payment verification failed', error);
      throw new InternalServerErrorException(
        'Payment gateway error — failed to verify payment',
      );
    }

    const data = payment?.data as Record<string, unknown> | undefined;
    const state = (data?.state as string) ?? 'UNKNOWN';
    const charge = data?.charge as Record<string, unknown> | undefined;
    const chargeToken = (charge?.token as string) ?? null;
    const hasCapture = !!charge?.capture;
    const purchaseTotals = data?.purchase_totals as
      | { quote_amount?: { amount?: number } }
      | undefined;
    const amount = purchaseTotals?.quote_amount?.amount ?? 0;

    const isPaid =
      state === 'TRACKER_COMPLETED' ||
      state === 'PAID' ||
      (state === 'TRACKER_ENDED' && hasCapture);

    this.logger.log(
      `Payment verification: tracker=${trackerToken} state=${state} charge=${chargeToken} captured=${hasCapture}`,
    );

    return { isPaid, reference: chargeToken, amount, state };
  }

  /**
   * Verifies a Safepay webhook signature using HMAC-SHA512 on the full body.
   *
   * @param rawBody - The full webhook request body
   * @param signature - The X-SFPY-SIGNATURE header value
   * @returns Whether the signature is valid
   *
   * @example
   * ```typescript
   * const isValid = safepayService.verifyWebhookSignature(req.rawBody, signature);
   * ```
   */
  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
    const webhookSecret = this.configService.get<string>(
      'safepay.webhookSecret',
    );
    if (!webhookSecret) {
      this.logger.warn('SAFEPAY_WEBHOOK_SECRET not configured');
      return false;
    }

    const data = Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(rawBody, 'utf-8');
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
