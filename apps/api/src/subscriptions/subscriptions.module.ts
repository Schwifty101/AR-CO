/**
 * Subscriptions Module
 *
 * Provides subscription plan listing, checkout initiation, lifecycle management,
 * and Safepay webhook handling. Imports PaymentsModule for SafepaySubscriptionService.
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
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
