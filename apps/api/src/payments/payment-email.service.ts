/**
 * Payment Email Service
 *
 * Sends transactional emails to clients when an admin reviews a manually
 * uploaded payment proof — either confirming the payment or flagging it for
 * out-of-band follow-up. Used by both consultation bookings and service
 * registrations.
 *
 * Uses SendGrid (`@sendgrid/mail`) with the configured sender. Sends are
 * best-effort: failures are logged and never block the status update.
 *
 * @module PaymentsModule
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import type { Configuration } from '../config/configuration';

/** Which review outcome an email represents */
export type PaymentEmailKind = 'confirmed' | 'flagged';

/** Context used to render the email body */
export interface PaymentEmailContext {
  /** Recipient email */
  to: string;
  /** Recipient full name */
  fullName: string;
  /** Booking/registration reference number, e.g. CON-2026-0042 */
  referenceNumber: string;
  /** Human label for what was paid, e.g. "Legal Consultation" */
  subject: string;
  /** Admin note (shown to client when flagged) */
  note?: string | null;
}

@Injectable()
export class PaymentEmailService {
  private readonly logger = new Logger(PaymentEmailService.name);

  constructor(private readonly configService: ConfigService<Configuration>) {}

  /**
   * Sends a payment-status email (confirmed or flagged) to a client.
   *
   * @param kind - 'confirmed' or 'flagged'
   * @param ctx - Recipient + reference + optional admin note
   *
   * @example
   * ```typescript
   * await paymentEmailService.send('confirmed', {
   *   to: 'jane@example.com',
   *   fullName: 'Jane Doe',
   *   referenceNumber: 'CON-2026-0042',
   *   subject: 'Legal Consultation',
   * });
   * ```
   */
  async send(kind: PaymentEmailKind, ctx: PaymentEmailContext): Promise<void> {
    const apiKey = this.configService.get('email.resendApiKey', {
      infer: true,
    });
    if (!apiKey) {
      this.logger.warn('Email API key not configured — skipping payment email');
      return;
    }

    const fromEmail = this.configService.get('email.fromEmail', {
      infer: true,
    });
    const fromName = this.configService.get('email.fromName', { infer: true });
    const whatsapp = this.configService.get('manualPayment.whatsappNumber', {
      infer: true,
    });
    const contactEmail = this.configService.get('manualPayment.contactEmail', {
      infer: true,
    });

    const contactLine = this.buildContactLine(whatsapp, contactEmail);
    const { subject, html } = this.buildContent(kind, ctx, contactLine);

    sgMail.setApiKey(apiKey);
    try {
      await sgMail.send({
        to: ctx.to,
        from: {
          email: fromEmail ?? 'noreply@arandcolaw.com',
          name: fromName ?? 'AR&CO Law Firm',
        },
        subject,
        html,
      });
      this.logger.log(
        `Payment ${kind} email sent to ${ctx.to} (${ctx.referenceNumber})`,
      );
    } catch (err) {
      // Best-effort — never block the status update on an email failure.
      this.logger.error(
        `Failed to send payment ${kind} email to ${ctx.to}`,
        err as Error,
      );
    }
  }

  /** Builds the "questions? contact us" line, hiding WhatsApp when not configured. */
  private buildContactLine(whatsapp?: string, contactEmail?: string): string {
    const email = contactEmail || 'info@arandcolaw.com';
    const parts: string[] = [];
    if (whatsapp && whatsapp.trim()) {
      parts.push(`WhatsApp <strong>${whatsapp}</strong>`);
    }
    parts.push(`email <strong>${email}</strong>`);
    return `For any questions, contact us via ${parts.join(' or ')}.`;
  }

  /** Builds the subject + HTML body for the given outcome. */
  private buildContent(
    kind: PaymentEmailKind,
    ctx: PaymentEmailContext,
    contactLine: string,
  ): { subject: string; html: string } {
    if (kind === 'confirmed') {
      return {
        subject: `Payment Confirmed — ${ctx.referenceNumber}`,
        html: `
          <h2>Payment Confirmed</h2>
          <p>Dear ${ctx.fullName},</p>
          <p>We have verified your payment for <strong>${ctx.subject}</strong>
             (Reference: <strong>${ctx.referenceNumber}</strong>). Your booking is
             now confirmed and our team will proceed accordingly.</p>
          <p>${contactLine}</p>
          <p>Best regards,<br/>AR&amp;CO Law Firm</p>
        `,
      };
    }

    const reason = ctx.note?.trim()
      ? `<p><strong>Reason:</strong> ${ctx.note.trim()}</p>`
      : '';
    return {
      subject: `Action Needed: Payment Could Not Be Verified — ${ctx.referenceNumber}`,
      html: `
        <h2>We Couldn't Verify Your Payment</h2>
        <p>Dear ${ctx.fullName},</p>
        <p>We were unable to verify the payment screenshot you submitted for
           <strong>${ctx.subject}</strong> (Reference:
           <strong>${ctx.referenceNumber}</strong>).</p>
        ${reason}
        <p>Please get in touch so we can resolve this quickly. ${contactLine}</p>
        <p>Best regards,<br/>AR&amp;CO Law Firm</p>
      `,
    };
  }
}
