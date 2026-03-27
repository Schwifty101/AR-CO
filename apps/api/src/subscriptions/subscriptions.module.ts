/**
 * Subscriptions Module
 *
 * Provides subscription plan listing, checkout initiation, lifecycle management,
 * and LemonSqueezy webhook handling. Imports PaymentsModule for LemonSqueezyService.
 *
 * @module SubscriptionsModule
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import { SubscriptionsModule } from './subscriptions/subscriptions.module';
 *
 * @Module({
 *   imports: [SubscriptionsModule],
 * })
 * export class AppModule {}
 * ```
 */

import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsWebhookService } from './subscriptions-webhook.service';
import { SubscriptionsAdminService } from './subscriptions-admin.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsWebhookService, SubscriptionsAdminService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
