import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { BillingSchedulerService } from './billing-scheduler.service';
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
 * - Daily billing cron for renewals and retries
 *
 * Exports SubscriptionsService for use by other modules (e.g., ComplaintsModule,
 * PaymentsModule webhook handler)
 */
@Module({
  imports: [forwardRef(() => PaymentsModule)],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, BillingSchedulerService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
