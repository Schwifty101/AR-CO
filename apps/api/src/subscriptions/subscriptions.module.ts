import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PaymentsModule } from '../payments/payments.module';

/**
 * Module for subscription management
 * Provides subscription lifecycle operations for clients
 *
 * @remarks
 * This module handles:
 * - Subscription creation and Safepay checkout integration
 * - Subscription retrieval and status checking
 * - Subscription cancellation
 * - Staff access to all subscriptions
 *
 * Exports SubscriptionsService for use by other modules (e.g., ComplaintsModule)
 * to verify subscription status.
 *
 * @example
 * ```typescript
 * // In ComplaintsModule
 * @Module({
 *   imports: [SubscriptionsModule],
 *   // ...
 * })
 * export class ComplaintsModule {}
 * ```
 */
@Module({
  imports: [PaymentsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
