/**
 * Payments module providing SafepayService and webhook infrastructure.
 *
 * Exports SafepayService for use by ConsultationsModule, SubscriptionsModule,
 * and ServiceRegistrationsModule.
 *
 * Imports SubscriptionsModule to route webhook events to subscription handlers.
 *
 * @module PaymentsModule
 */
import { Module, forwardRef } from '@nestjs/common';
import { SafepayService } from './safepay.service';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { PaymentsWebhookService } from './payments-webhook.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [forwardRef(() => SubscriptionsModule)],
  controllers: [PaymentsWebhookController],
  providers: [SafepayService, PaymentsWebhookService],
  exports: [SafepayService],
})
export class PaymentsModule {}
