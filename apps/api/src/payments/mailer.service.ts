/**
 * Mailer Service
 *
 * Central email sender via Resend HTTP API. All outgoing transactional mail
 * (payment confirmations, welcome emails, invoices, internal notifications)
 * goes through here, sent from the configured `MAIL_FROM` address.
 *
 * Sends are best-effort: when Resend is not configured or a send fails, the
 * error is logged and never propagated so it cannot block the calling flow.
 *
 * @module PaymentsModule
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { Configuration } from '../config/configuration';

/** Options for a single outgoing email */
export interface MailOptions {
  /** Recipient address(es) */
  to: string | string[];
  /** Subject line */
  subject: string;
  /** HTML body */
  html: string;
  /** Optional Reply-To (e.g. the requester's email on admin notifications) */
  replyTo?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly resend: Resend | null;

  constructor(private readonly configService: ConfigService<Configuration>) {
    const apiKey = this.configService.get('email.resendApiKey', {
      infer: true,
    });

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not configured — outgoing emails are disabled',
      );
      this.resend = null;
      return;
    }

    this.resend = new Resend(apiKey);
  }

  /** Builds the `From` header: `AR&CO Law Firm <info@arandcolaw.com>`. */
  private fromHeader(): string {
    const email =
      this.configService.get('email.fromEmail', { infer: true }) ??
      'info@arandcolaw.com';
    const name =
      this.configService.get('email.fromName', { infer: true }) ??
      'AR&CO Law Firm';
    return `${name} <${email}>`;
  }

  /**
   * Sends a single email. Best-effort — never throws.
   *
   * @param options - Recipient, subject, HTML body, optional reply-to
   *
   * @example
   * ```typescript
   * await mailerService.sendMail({
   *   to: 'client@example.com',
   *   subject: 'Payment Confirmed',
   *   html: '<p>Thank you…</p>',
   * });
   * ```
   */
  async sendMail(options: MailOptions): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        `Email skipped (Resend not configured): "${options.subject}" → ${String(options.to)}`,
      );
      return;
    }

    const to = Array.isArray(options.to) ? options.to : [options.to];

    const { error } = await this.resend.emails.send({
      from: this.fromHeader(),
      to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      this.logger.error(
        `Failed to send email "${options.subject}" → ${String(options.to)}`,
        error,
      );
      return;
    }

    this.logger.log(
      `Email sent: "${options.subject}" → ${String(options.to)}`,
    );
  }

  /**
   * Sends an internal notification to the firm mailbox (`MAIL_ADMIN`,
   * info@arandcolaw.com by default).
   *
   * @param subject - Notification subject
   * @param html - Notification HTML body
   * @param replyTo - Optional reply-to (e.g. the requester's email)
   *
   * @example
   * ```typescript
   * await mailerService.sendToAdmin(
   *   'New complaint filed: CMP-2026-0001',
   *   '<p>Sara Ahmed filed a complaint…</p>',
   *   'sara@example.com',
   * );
   * ```
   */
  async sendToAdmin(
    subject: string,
    html: string,
    replyTo?: string,
  ): Promise<void> {
    const adminEmail =
      this.configService.get('email.adminEmail', { infer: true }) ??
      'info@arandcolaw.com';
    await this.sendMail({ to: adminEmail, subject, html, replyTo });
  }
}
