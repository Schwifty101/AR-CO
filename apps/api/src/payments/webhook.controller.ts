/**
 * LemonSqueezy Webhook Controller
 *
 * Single entry point for all LemonSqueezy webhook events.
 * Verifies signature, checks idempotency, logs, and routes to the
 * correct service handler based on `meta.event_name`.
 *
 * Endpoint: POST /api/webhooks/lemonsqueezy
 *
 * @module WebhooksModule
 *
 * @example
 * ```
 * POST /api/webhooks/lemonsqueezy
 * Headers: X-Signature: <hmac-sha256>
 * Body: { meta: { event_name, custom_data }, data: { ... } }
 * ```
 */

import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { LemonSqueezyService } from './lemonsqueezy.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ConsultationsService } from '../consultations/consultations.service';
import { ServiceRegistrationsService } from '../service-registrations/service-registrations.service';
import { SupabaseService } from '../database/supabase.service';
import {
  LemonSqueezyEventName,
  PaymentType,
  type LemonSqueezyWebhookPayload,
} from './types/webhook.types';

/**
 * Handles all inbound LemonSqueezy webhook deliveries.
 *
 * Processing flow:
 * 1. Verify HMAC-SHA256 signature via `X-Signature` header
 * 2. Parse raw body to webhook payload
 * 3. Check idempotency — skip if `event_id` already processed
 * 4. Record event in `webhook_events` table
 * 5. Route to correct service handler
 * 6. Return `{ received: true }` immediately (200)
 */
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly lemonSqueezyService: LemonSqueezyService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly consultationsService: ConsultationsService,
    private readonly serviceRegistrationsService: ServiceRegistrationsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Receive and route a LemonSqueezy webhook event.
   *
   * @param req - Raw body request (rawBody: true must be set in main.ts)
   * @param signature - X-Signature HMAC-SHA256 header from LemonSqueezy
   * @returns `{ received: true }` on success
   */
  @Post('lemonsqueezy')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleLemonSqueezyWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ): Promise<{ received: boolean }> {
    // ── 1. Validate raw body and signature header ──────────────────────────
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing request body');
    }
    if (!signature) {
      throw new UnauthorizedException('Missing X-Signature header');
    }

    // ── 2. Verify HMAC-SHA256 signature ────────────────────────────────────
    const isValid = this.lemonSqueezyService.verifyWebhookSignature(
      rawBody,
      signature,
    );
    if (!isValid) {
      this.logger.warn('Invalid webhook signature — rejecting request');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // ── 3. Parse payload ───────────────────────────────────────────────────
    let payload: LemonSqueezyWebhookPayload;
    try {
      payload = JSON.parse(rawBody.toString()) as LemonSqueezyWebhookPayload;
    } catch {
      throw new BadRequestException('Invalid JSON payload');
    }

    const { event_name, event_id, custom_data } = payload.meta;
    const paymentType = custom_data?.payment_type ?? null;

    this.logger.log(
      `Webhook received: event=${event_name} id=${event_id} payment_type=${paymentType ?? 'n/a'}`,
    );

    // ── 4. Idempotency check ───────────────────────────────────────────────
    const db = this.supabaseService.getAdminClient();
    const { data: existing } = await db
      .from('webhook_events')
      .select('id')
      .eq('event_id', event_id)
      .maybeSingle();

    if (existing) {
      this.logger.log(
        `Duplicate webhook skipped: event_id=${event_id} (already processed)`,
      );
      return { received: true };
    }

    // ── 5. Record event before processing (so retries are safe) ───────────
    await db.from('webhook_events').insert({
      event_id,
      event_name,
      payment_type: paymentType,
      payload,
    });

    // ── 6. Route to correct handler ────────────────────────────────────────
    try {
      await this.routeEvent(event_name, paymentType, payload);
    } catch (err) {
      // Log but don't re-throw — we've already acknowledged receipt.
      // LemonSqueezy will retry if we return non-200, but we've recorded the
      // event so the retry would be a no-op (idempotency check above).
      this.logger.error(
        `Handler error for event=${event_name}: ${(err as Error).message}`,
        (err as Error).stack,
      );
    }

    return { received: true };
  }

  /**
   * Route the webhook event to the correct service handler.
   *
   * @param eventName - LemonSqueezy event name
   * @param paymentType - custom_data.payment_type value
   * @param payload - Full parsed webhook payload
   */
  private async routeEvent(
    eventName: string,
    paymentType: string | null,
    payload: LemonSqueezyWebhookPayload,
  ): Promise<void> {
    switch (eventName) {
      // ── Order events ──────────────────────────────────────────────────────
      case LemonSqueezyEventName.ORDER_CREATED:
        if (paymentType === PaymentType.CONSULTATION) {
          await this.consultationsService.handlePaymentConfirmed(payload);
        } else if (paymentType === PaymentType.SERVICE) {
          await this.serviceRegistrationsService.handlePaymentConfirmed(
            payload,
          );
        } else {
          this.logger.warn(
            `order_created: unknown payment_type="${paymentType}" — no handler`,
          );
        }
        break;

      case LemonSqueezyEventName.ORDER_REFUNDED:
        if (paymentType === PaymentType.CONSULTATION) {
          await this.consultationsService.handlePaymentRefunded(payload);
        } else if (paymentType === PaymentType.SERVICE) {
          await this.serviceRegistrationsService.handlePaymentRefunded(payload);
        } else {
          this.logger.warn(
            `order_refunded: unknown payment_type="${paymentType}" — no handler`,
          );
        }
        break;

      // ── Subscription lifecycle events ─────────────────────────────────────
      case LemonSqueezyEventName.SUBSCRIPTION_CREATED:
        await this.subscriptionsService.handleSubscriptionCreated(payload);
        break;

      case LemonSqueezyEventName.SUBSCRIPTION_UPDATED:
        await this.subscriptionsService.handleSubscriptionUpdated(payload);
        break;

      case LemonSqueezyEventName.SUBSCRIPTION_CANCELLED:
        await this.subscriptionsService.handleSubscriptionCancelled(payload);
        break;

      case LemonSqueezyEventName.SUBSCRIPTION_EXPIRED:
        await this.subscriptionsService.handleSubscriptionExpired(payload);
        break;

      // ── Subscription payment events ───────────────────────────────────────
      case LemonSqueezyEventName.SUBSCRIPTION_PAYMENT_SUCCESS:
        await this.subscriptionsService.handlePaymentSuccess(payload);
        break;

      case LemonSqueezyEventName.SUBSCRIPTION_PAYMENT_FAILED:
        await this.subscriptionsService.handlePaymentFailed(payload);
        break;

      case LemonSqueezyEventName.SUBSCRIPTION_PAYMENT_RECOVERED:
        await this.subscriptionsService.handlePaymentRecovered(payload);
        break;

      // ── Unhandled events ──────────────────────────────────────────────────
      default:
        this.logger.log(`Unhandled event type: ${eventName} — acknowledged`);
        break;
    }
  }
}
