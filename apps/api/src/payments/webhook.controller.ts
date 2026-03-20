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
import { InvoicesService } from './invoices.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ConsultationsService } from '../consultations/consultations.service';
import { ServiceRegistrationsService } from '../service-registrations/service-registrations.service';
import { SupabaseService } from '../database/supabase.service';
import { InvoiceStatus } from '@repo/shared';
import {
  LemonSqueezyEventName,
  PaymentType,
  type LemonSqueezyWebhookPayload,
  type LemonSqueezySubscriptionData,
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
    private readonly invoicesService: InvoicesService,
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
          if (payload.meta.custom_data?.booking_id) {
            await this.autoCreateInvoiceForConsultation(payload.meta.custom_data.booking_id);
          }
        } else if (paymentType === PaymentType.SERVICE) {
          await this.serviceRegistrationsService.handlePaymentConfirmed(payload);
          if (payload.meta.custom_data?.registration_id) {
            await this.autoCreateInvoiceForServiceRegistration(payload.meta.custom_data.registration_id);
          }
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
        if (payload.meta.custom_data?.user_id) {
          await this.autoCreateInvoiceForSubscription(
            payload.meta.custom_data.user_id,
            undefined,
          );
        }
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
        await this.autoCreateInvoiceForSubscription(
          payload.meta.custom_data?.user_id,
          (payload.data as LemonSqueezySubscriptionData).id,
        );
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

  /**
   * Auto-creates a PAID invoice for a completed consultation booking.
   * Uses the guest's email — no client profile required.
   */
  private async autoCreateInvoiceForConsultation(bookingId: string): Promise<void> {
    const db = this.supabaseService.getAdminClient();
    const { data: booking } = await db
      .from('consultation_bookings')
      .select('email, consultation_fee, reference_number')
      .eq('id', bookingId)
      .maybeSingle();

    if (!booking) return;
    const amount = Number(booking.consultation_fee ?? 0);
    if (amount <= 0) return;

    const dueDate = new Date().toISOString().split('T')[0];
    try {
      const invoice = await this.invoicesService.createInvoice({
        email: booking.email,
        dueDate,
        taxAmount: 0,
        discountAmount: 0,
        items: [{ description: 'Legal Consultation', quantity: 1, unitPrice: amount }],
        notes: booking.reference_number ? `Reference: ${booking.reference_number}` : undefined,
      });
      await this.invoicesService.updateInvoice(invoice.id, { status: InvoiceStatus.PAID });
      this.logger.log(`Auto-created consultation invoice for booking ${bookingId}`);
    } catch (err) {
      this.logger.error(`Failed to auto-create consultation invoice for ${bookingId}: ${(err as Error).message}`);
    }
  }

  /**
   * Auto-creates a PAID invoice for a completed service registration.
   * Links to client profile if one exists; otherwise stores by email only.
   */
  private async autoCreateInvoiceForServiceRegistration(registrationId: string): Promise<void> {
    const db = this.supabaseService.getAdminClient();
    const { data: reg } = await db
      .from('service_registrations')
      .select('email, paid_amount, client_profile_id, reference_number, services(name)')
      .eq('id', registrationId)
      .maybeSingle();

    if (!reg) return;
    const amount = Number(reg.paid_amount ?? 0);
    if (amount <= 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceName = (reg.services as any)?.name ?? 'Facilitation Service';
    const dueDate = new Date().toISOString().split('T')[0];
    try {
      const invoice = await this.invoicesService.createInvoice({
        clientProfileId: reg.client_profile_id ?? undefined,
        email: reg.email,
        dueDate,
        taxAmount: 0,
        discountAmount: 0,
        items: [{ description: serviceName, quantity: 1, unitPrice: amount }],
        notes: reg.reference_number ? `Reference: ${reg.reference_number}` : undefined,
      });
      await this.invoicesService.updateInvoice(invoice.id, { status: InvoiceStatus.PAID });
      this.logger.log(`Auto-created service invoice for registration ${registrationId}`);
    } catch (err) {
      this.logger.error(`Failed to auto-create service invoice for ${registrationId}: ${(err as Error).message}`);
    }
  }

  /**
   * Auto-creates a PAID invoice for a subscription payment.
   * Looks up user email and client profile from either userId or lsSubscriptionId.
   */
  private async autoCreateInvoiceForSubscription(
    userId: string | undefined,
    lsSubscriptionId: string | undefined,
  ): Promise<void> {
    const db = this.supabaseService.getAdminClient();

    let subQuery = db
      .from('user_subscriptions')
      .select('user_id, subscription_plans(name, amount)')
      .order('created_at', { ascending: false })
      .limit(1);

    if (lsSubscriptionId) {
      subQuery = subQuery.eq('lemonsqueezy_subscription_id', lsSubscriptionId);
    } else if (userId) {
      subQuery = subQuery.eq('user_id', userId).eq('status', 'active');
    } else {
      return;
    }

    const { data: sub } = await subQuery.maybeSingle();
    if (!sub) return;

    const actualUserId: string = sub.user_id ?? userId ?? '';
    if (!actualUserId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planName: string = (sub.subscription_plans as any)?.name ?? 'Subscription Plan';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const amount = Number((sub.subscription_plans as any)?.amount ?? 0);
    if (amount <= 0) return;

    const [authResult, cpResult] = await Promise.all([
      db.auth.admin.getUserById(actualUserId),
      db.from('client_profiles').select('id').eq('user_profile_id', actualUserId).maybeSingle(),
    ]);

    const email = authResult.data?.user?.email;
    if (!email) return;

    const clientProfileId = (cpResult.data as { id: string } | null)?.id;
    const dueDate = new Date().toISOString().split('T')[0];
    try {
      const invoice = await this.invoicesService.createInvoice({
        clientProfileId,
        email,
        dueDate,
        taxAmount: 0,
        discountAmount: 0,
        items: [{ description: planName, quantity: 1, unitPrice: amount }],
      });
      await this.invoicesService.updateInvoice(invoice.id, { status: InvoiceStatus.PAID });
      this.logger.log(`Auto-created subscription invoice for user ${actualUserId}`);
    } catch (err) {
      this.logger.error(`Failed to auto-create subscription invoice for ${actualUserId}: ${(err as Error).message}`);
    }
  }
}
