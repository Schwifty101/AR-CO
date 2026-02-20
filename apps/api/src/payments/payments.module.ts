/**
 * Payments module providing SafepayService and SafepaySubscriptionService.
 *
 * Exports both services for use by ConsultationsModule, SubscriptionsModule,
 * ServiceRegistrationsModule, and any other module that needs payment gateway integration.
 *
 * @module PaymentsModule
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [PaymentsModule],
 * })
 * export class SubscriptionsModule {}
 * ```
 */
import { Module } from '@nestjs/common';
import { SafepayService } from './safepay.service';
import { SafepaySubscriptionService } from './safepay-subscription.service';

@Module({
  providers: [SafepayService, SafepaySubscriptionService],
  exports: [SafepayService, SafepaySubscriptionService],
})
export class PaymentsModule {}
