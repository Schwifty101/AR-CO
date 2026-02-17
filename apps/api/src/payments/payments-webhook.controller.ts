/**
 * Controller for receiving Safepay webhook events.
 *
 * Endpoint: POST /api/payments/webhook/safepay
 *
 * Verifies HMAC-SHA512 signature from X-SFPY-SIGNATURE header,
 * then delegates to PaymentsWebhookService for event processing.
 *
 * @module PaymentsModule
 *
 * @example
 * ```bash
 * # Safepay sends this automatically after payment events
 * curl -X POST http://localhost:4000/api/payments/webhook/safepay \
 *   -H "Content-Type: application/json" \
 *   -H "X-SFPY-SIGNATURE: <hmac-sha512-hex>" \
 *   -d '{ "type": "payment.succeeded", "data": { ... } }'
 * ```
 */
import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { SafepayService } from './safepay.service';
import {
  PaymentsWebhookService,
  type SafepayWebhookEvent,
} from './payments-webhook.service';

@Controller('payments/webhook')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(
    private readonly safepayService: SafepayService,
    private readonly webhookService: PaymentsWebhookService,
  ) {}

  /**
   * Receives and processes Safepay webhook events.
   *
   * 1. Verifies signature using raw body + X-SFPY-SIGNATURE header
   * 2. Parses event type and routes to appropriate handler
   * 3. Returns 200 immediately (Safepay retries for 24h if not 200)
   *
   * @param req - Raw body request for signature verification
   * @param signature - HMAC-SHA512 hex digest from X-SFPY-SIGNATURE header
   * @returns Acknowledgement object
   */
  @Post('safepay')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleSafepayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-sfpy-signature') signature?: string,
  ): Promise<{ received: boolean }> {
    // Validate signature
    if (!signature) {
      this.logger.warn('Webhook received without X-SFPY-SIGNATURE header');
      throw new UnauthorizedException('Missing webhook signature');
    }

    // Use raw body for signature verification
    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.error(
        'Raw body not available — ensure rawBody: true in NestFactory.create()',
      );
      throw new UnauthorizedException('Cannot verify webhook signature');
    }

    const isValid = this.safepayService.verifyWebhookSignature(
      rawBody,
      signature,
    );
    const payload = JSON.parse(rawBody.toString()) as Record<string, unknown>;

    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = payload as unknown as SafepayWebhookEvent;
    this.logger.log(
      `Webhook received: type=${event.type} token=${event.token} attempt=${event.delivery_attempts}`,
    );

    // Process asynchronously but still within the 10s window
    try {
      await this.webhookService.processEvent(event);
    } catch (error) {
      // Log but still return 200 to prevent Safepay retries for handled events
      this.logger.error('Webhook processing error', error);
    }

    return { received: true };
  }
}
