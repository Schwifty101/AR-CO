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

/** Parameters for creating a Safepay customer */
export interface CreateCustomerParams {
  /** Customer email address */
  email: string;
  /** Customer first name */
  firstName: string;
  /** Customer last name */
  lastName: string;
  /** Customer phone number (optional) */
  phone?: string;
}

/** Result from creating a Safepay customer */
export interface CustomerResult {
  /** Safepay customer token (cust_xxx) */
  token: string;
}

/** Result from charging a customer's stored card */
export interface ChargeResult {
  /** Whether the charge was successful */
  success: boolean;
  /** Tracker token for this charge */
  trackerToken: string;
  /** Charge token (ch_xxx) if successful */
  chargeToken: string | null;
  /** Error message if failed */
  error: string | null;
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
   * Generates a Safepay hosted checkout URL for redirect-based payment.
   *
   * Creates a short-lived TBT (temporary bearer token) via passport, then
   * builds the checkout URL. For subscriptions, pass custom redirect URLs.
   *
   * @param trackerToken - Tracker token from createPaymentSession or createInstrumentSession
   * @param redirectUrl - Optional custom redirect URL (defaults to consultation callback)
   * @param cancelUrl - Optional custom cancel URL
   * @returns Full Safepay checkout URL string
   * @throws {InternalServerErrorException} If SDK not initialized or API fails
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

    // Step 2: Generate the hosted checkout URL
    try {
      const checkoutUrl = this.safepay.checkout.createCheckoutUrl({
        tracker: trackerToken,
        tbt,
        env: this.environment as 'development' | 'sandbox' | 'production',
        source: 'hosted',
        redirect_url: redirectUrl || `${this.frontendUrl}/consultation/payment-callback`,
        cancel_url: cancelUrl || `${this.frontendUrl}/consultation/payment-callback?cancelled=true`,
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
   * Uses the reporter API (`safepay.reporter.payments.fetch()`) to retrieve
   * the full tracker record including charge and capture details.
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
    let payment: Record<string, unknown>;
    try {
      payment = await this.safepay.reporter.payments.fetch(trackerToken);
    } catch (error) {
      this.logger.error('Safepay payment verification failed', error);
      throw new InternalServerErrorException(
        'Payment gateway error — failed to verify payment',
      );
    }

    // Actual response shape (differs from Safepay docs):
    //   data.state        — tracker state (e.g., 'TRACKER_ENDED')
    //   data.charge.token — transaction reference (e.g., 'ch_xxx')
    //   data.charge.capture — exists when payment was captured
    //   data.attempts[0].is_success — explicit success flag
    //   data.purchase_totals.quote_amount.amount — amount in paisa
    const data = payment?.data as Record<string, unknown> | undefined;
    const state = (data?.state as string) ?? 'UNKNOWN';

    const charge = data?.charge as Record<string, unknown> | undefined;
    const chargeToken = (charge?.token as string) ?? null;
    const hasCapture = !!charge?.capture;

    const purchaseTotals = data?.purchase_totals as
      | { quote_amount?: { amount?: number } }
      | undefined;
    const amount = purchaseTotals?.quote_amount?.amount ?? 0;

    this.logger.log(
      `Payment verification: tracker=${trackerToken} state=${state} charge=${chargeToken} captured=${hasCapture}`,
    );

    // A successful payment has TRACKER_ENDED state with a captured charge.
    // Also accept TRACKER_COMPLETED or PAID for earlier state checks.
    const isPaid =
      state === 'TRACKER_COMPLETED' ||
      state === 'PAID' ||
      (state === 'TRACKER_ENDED' && hasCapture);

    return {
      isPaid,
      reference: chargeToken,
      amount,
      state,
    };
  }

  /**
   * Creates a Safepay customer object server-side.
   *
   * The customer token is used to link card tokenization and
   * merchant-initiated charges to this customer.
   *
   * @param params - Customer details
   * @returns Customer token (cust_xxx)
   * @throws {InternalServerErrorException} If SDK not initialized or API fails
   *
   * @example
   * ```typescript
   * const { token } = await safepayService.createCustomer({
   *   email: 'client@example.com',
   *   firstName: 'Hassan',
   *   lastName: 'Zaidi',
   * });
   * // token → 'cust_a7cc6fc1-...'
   * ```
   */
  async createCustomer(params: CreateCustomerParams): Promise<CustomerResult> {
    if (!this.safepay) {
      throw new InternalServerErrorException(
        'Safepay SDK not initialized. Check SAFEPAY_SECRET_KEY.',
      );
    }

    this.logger.log(`Creating Safepay customer: ${params.email}`);

    try {
      const response = await this.safepay.customers.object.create({
        first_name: params.firstName,
        last_name: params.lastName,
        email: params.email,
        phone_number: params.phone || undefined,
        country: 'PK',
        is_guest: false,
      });

      const token = (response as { data?: { token?: string } })?.data?.token;
      if (!token) {
        this.logger.error('Safepay customer creation returned no token', response);
        throw new InternalServerErrorException(
          'Failed to create customer — no token returned',
        );
      }

      this.logger.log(`Safepay customer created: ${token}`);
      return { token };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('Safepay customer creation failed', error);
      throw new InternalServerErrorException(
        'Payment gateway error — failed to create customer',
      );
    }
  }

  /**
   * Creates an instrument session for card tokenization (zero-amount auth).
   *
   * The customer enters card details on Safepay's hosted page.
   * No charge occurs — the card is saved to the customer's wallet.
   *
   * @param customerToken - Safepay customer token (cust_xxx)
   * @param currency - ISO currency code
   * @returns Internal result with tracker token for checkout URL generation
   * @throws {InternalServerErrorException} If SDK not initialized or API fails
   *
   * @example
   * ```typescript
   * const session = await safepayService.createInstrumentSession('cust_xxx', 'PKR');
   * const checkoutUrl = await safepayService.generateCheckoutUrl(session.trackerToken);
   * ```
   */
  async createInstrumentSession(
    customerToken: string,
    currency: string,
  ): Promise<PaymentSessionInternalResult> {
    if (!this.safepay) {
      throw new InternalServerErrorException(
        'Safepay SDK not initialized. Check SAFEPAY_SECRET_KEY.',
      );
    }

    this.logger.log(
      `Creating instrument session for customer: ${customerToken}`,
    );

    let session: { data?: { tracker?: { token?: string } } };
    try {
      session = await this.safepay.payments.session.setup({
        merchant_api_key: this.publicKey,
        intent: 'CYBERSOURCE',
        mode: 'instrument',
        currency,
        amount: 0,
        user: customerToken,
      });
    } catch (error) {
      this.logger.error('Safepay instrument session creation failed', error);
      throw new InternalServerErrorException(
        'Payment gateway error — failed to create card tokenization session',
      );
    }

    const trackerToken = session?.data?.tracker?.token;
    if (!trackerToken) {
      this.logger.error(
        'Safepay instrument session returned no tracker',
        session,
      );
      throw new InternalServerErrorException(
        'Card tokenization session failed — no tracker returned',
      );
    }

    this.logger.log(`Instrument session created: tracker=${trackerToken}`);
    return {
      trackerToken,
      amount: 0,
      currency,
      orderId: '',
    };
  }

  /**
   * Charges a customer's stored card via merchant-initiated transaction.
   *
   * Uses `mode: 'unscheduled_cof'` with `entry_mode: 'tms'` to charge
   * a previously tokenized card without customer interaction.
   *
   * @param customerToken - Safepay customer token (cust_xxx)
   * @param amount - Amount in paisa (PKR * 100)
   * @param currency - ISO currency code
   * @param orderId - Order ID for tracking
   * @returns Charge result with success status and tokens
   *
   * @example
   * ```typescript
   * const result = await safepayService.chargeCustomer(
   *   'cust_xxx', 70000, 'PKR', 'SUB-RENEW-2026-02'
   * );
   * if (result.success) {
   *   // Update subscription period
   * }
   * ```
   */
  async chargeCustomer(
    customerToken: string,
    amount: number,
    currency: string,
    orderId: string,
  ): Promise<ChargeResult> {
    if (!this.safepay) {
      throw new InternalServerErrorException(
        'Safepay SDK not initialized. Check SAFEPAY_SECRET_KEY.',
      );
    }

    this.logger.log(
      `Charging customer ${customerToken}: ${amount} ${currency} (order: ${orderId})`,
    );

    let session: { data?: { tracker?: { token?: string } } };
    try {
      session = await this.safepay.payments.session.setup({
        merchant_api_key: this.publicKey,
        intent: 'CYBERSOURCE',
        mode: 'unscheduled_cof',
        entry_mode: 'tms',
        currency,
        amount,
        user: customerToken,
        metadata: { order_id: orderId },
      });
    } catch (error) {
      this.logger.error(`Charge failed for ${customerToken}`, error);
      return {
        success: false,
        trackerToken: '',
        chargeToken: null,
        error: error instanceof Error ? error.message : 'Charge session creation failed',
      };
    }

    const trackerToken = session?.data?.tracker?.token;
    if (!trackerToken) {
      this.logger.error('Charge session returned no tracker', session);
      return {
        success: false,
        trackerToken: '',
        chargeToken: null,
        error: 'No tracker returned from charge session',
      };
    }

    // Verify the charge completed
    try {
      const verification = await this.verifyPayment(trackerToken);
      if (verification.isPaid) {
        this.logger.log(
          `Charge succeeded: tracker=${trackerToken} ref=${verification.reference}`,
        );
        return {
          success: true,
          trackerToken,
          chargeToken: verification.reference,
          error: null,
        };
      } else {
        this.logger.warn(
          `Charge not confirmed: tracker=${trackerToken} state=${verification.state}`,
        );
        return {
          success: false,
          trackerToken,
          chargeToken: null,
          error: `Payment state: ${verification.state}`,
        };
      }
    } catch (error) {
      this.logger.error(`Charge verification failed: ${trackerToken}`, error);
      return {
        success: false,
        trackerToken,
        chargeToken: null,
        error: 'Payment verification failed',
      };
    }
  }

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
