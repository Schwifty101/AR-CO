/**
 * Mail Service
 *
 * SMTP-based email service for internal admin notifications.
 * All sends are fire-and-forget — failures are logged, never rethrown.
 * Uses nodemailer with credentials from SMTP_* env vars.
 *
 * @module MailModule
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Configuration } from '../config/configuration';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly adminEmail: string;
  private readonly from: string;

  constructor(private readonly configService: ConfigService<Configuration>) {
    const host = this.configService.get('smtp.host', { infer: true });

    if (!host) {
      this.transporter = null;
      this.adminEmail = '';
      this.from = '';
      this.logger.warn('SMTP_HOST not configured — admin email notifications disabled');
      return;
    }

    this.adminEmail = this.configService.get('smtp.adminEmail', { infer: true }) ?? '';
    const fromAddr = this.configService.get('smtp.from', { infer: true }) ?? '';
    const fromName = this.configService.get('smtp.fromName', { infer: true }) ?? 'AR&CO Law Firm';
    this.from = fromName ? `"${fromName}" <${fromAddr}>` : fromAddr;

    this.transporter = nodemailer.createTransport({
      host,
      port: this.configService.get('smtp.port', { infer: true }) ?? 587,
      secure: this.configService.get('smtp.secure', { infer: true }) ?? false,
      auth: {
        user: this.configService.get('smtp.user', { infer: true }),
        pass: this.configService.get('smtp.pass', { infer: true }),
      },
    });
  }

  /**
   * Fire-and-forget admin notification email. Never throws, never blocks the caller.
   *
   * @param subject - Email subject line
   * @param text - Plain-text body
   *
   * @example
   * ```typescript
   * void this.mailService.sendAdminNotification(
   *   'New booking: CON-2026-0001',
   *   'Reference: CON-2026-0001\nName: Jane Doe\nEmail: jane@example.com',
   * );
   * ```
   */
  sendAdminNotification(subject: string, text: string): void {
    if (!this.transporter || !this.adminEmail) return;

    void this.transporter
      .sendMail({ from: this.from, to: this.adminEmail, subject, text })
      .then(() => {
        this.logger.log(`Admin notification sent: "${subject}" → ${this.adminEmail}`);
      })
      .catch((err: Error) => {
        this.logger.error(
          `Failed to send admin notification "${subject}" → ${this.adminEmail}: ${err.message}`,
        );
      });
  }
}
