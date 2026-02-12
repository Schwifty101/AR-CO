/**
 * Payments module providing the SafepayService stub.
 *
 * Exports SafepayService for use by SubscriptionsModule and ServiceRegistrationsModule.
 * The stub will be replaced with real Safepay SDK integration in HEAD TASK 10.
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
