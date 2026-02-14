/**
 * Payments module providing SafepayService.
 *
 * Exports SafepayService for use by ConsultationsModule, SubscriptionsModule,
 * and ServiceRegistrationsModule.
 *
 * @module PaymentsModule
 */
import { Module } from '@nestjs/common';
import { SafepayService } from './safepay.service';

@Module({
  providers: [SafepayService],
  exports: [SafepayService],
})
export class PaymentsModule {}
