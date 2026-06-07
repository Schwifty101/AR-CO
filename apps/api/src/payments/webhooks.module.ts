/**
 * Webhooks Module
 *
 * Hosts the LemonSqueezy webhook controller. Since consultation and service
 * one-time payments are now handled manually (screenshot + admin review), the
 * webhook only routes subscription events, so only SubscriptionsModule (plus
 * PaymentsModule for invoices) is required. Kept separate from PaymentsModule to
 * avoid circular dependencies (SubscriptionsModule → PaymentsModule would
 * become circular if PaymentsModule imported SubscriptionsModule).
 *
 * @module WebhooksModule
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * @Module({ imports: [WebhooksModule] })
 * export class AppModule {}
 * ```
 */

import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentsModule } from './payments.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PaymentsModule, SubscriptionsModule],
  controllers: [WebhookController],
})
export class WebhooksModule {}
