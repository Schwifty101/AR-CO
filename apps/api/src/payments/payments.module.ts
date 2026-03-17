/**
 * Payments module providing LemonSqueezyService.
 *
 * Exports LemonSqueezyService for use by SubscriptionsModule,
 * ConsultationsModule, ServiceRegistrationsModule, and any other
 * module that needs payment gateway integration.
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
import { LemonSqueezyService } from './lemonsqueezy.service';

@Module({
  providers: [LemonSqueezyService],
  exports: [LemonSqueezyService],
})
export class PaymentsModule {}
