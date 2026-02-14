/**
 * Consultations Module
 *
 * Manages consultation booking lifecycle for guest users:
 * - Booking creation (guest intake form)
 * - Payment processing via Safepay SDK
 * - Cal.com webhook integration for appointment scheduling
 * - Status tracking and cancellation (staff)
 *
 * @module ConsultationsModule
 *
 * @example
 * ```typescript
 * // Imported in AppModule
 * @Module({
 *   imports: [ConsultationsModule],
 * })
 * export class AppModule {}
 * ```
 */

import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { ConsultationsPaymentService } from './consultations-payment.service';

/**
 * Consultations feature module
 *
 * Registers controller and services, imports PaymentsModule for SafepayService.
 * Exports both services for potential use in other modules.
 */
@Module({
  imports: [PaymentsModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, ConsultationsPaymentService],
  exports: [ConsultationsService, ConsultationsPaymentService],
})
export class ConsultationsModule {}
