/**
 * Mailer Service
 *
 * Central SMTP email sender built on nodemailer. All outgoing transactional
 * mail (payment confirmations, welcome emails, invoices, internal new-request
 * notifications) goes through here, sent from the configured `MAIL_FROM`
 * address (info@arandcolaw.com by default).
 *
 * Sends are best-effort: when SMTP is not configured, or a send fails, the
 * error is logged and never propagated so it can't block the calling flow.
 *
 * @module PaymentsModule
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
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
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService<Configuration>) {
    const host = this.configService.get('email.smtpHost', { infer: true });

    if (!host) {
      this.logger.warn(
        'SMTP_HOST not configured — outgoing emails are disabled (set SMTP_* env vars)',
      );
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: this.configService.get('email.smtpPort', { infer: true }),
      secure: this.configService.get('email.smtpSecure', { infer: true }),
      auth: {
        user: this.configService.get('email.smtpUser', { infer: true }),
        pass: this.configService.get('email.smtpPass', { infer: true }),
      },
    });
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
    if (!this.transporter) {
      this.logger.warn(
        `Email skipped (SMTP not configured): "${options.subject}" → ${String(options.to)}`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromHeader(),
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      });
      this.logger.log(
        `Email sent: "${options.subject}" → ${String(options.to)}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send email "${options.subject}" → ${String(options.to)}`,
        err as Error,
      );
    }
  }

  /**
   * Sends an internal notification to the firm mailbox (`MAIL_ADMIN`,
   * info@arandcolaw.com by default). The sending address is the same mailbox,
   * which is fine — a mailbox can receive mail it sent to itself.
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
