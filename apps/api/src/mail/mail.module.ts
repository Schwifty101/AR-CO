/**
 * Mail Module
 *
 * Global module providing MailService for SMTP admin notifications.
 * Registered globally so any feature module can inject MailService
 * without importing MailModule explicitly.
 *
 * @module MailModule
 */

import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
