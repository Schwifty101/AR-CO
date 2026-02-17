/**
 * Payments module providing SafepayService.
 *
 * Exports SafepayService for use by ConsultationsModule, ServiceRegistrationsModule,
 * and any other module that needs payment gateway integration.
 *
 * @module PaymentsModule
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [PaymentsModule],
 * })
 * export class ConsultationsModule {}
 * ```
 */
import { Module } from '@nestjs/common';
import { SafepayService } from './safepay.service';

@Module({
  providers: [SafepayService],
  exports: [SafepayService],
})
export class PaymentsModule {}
