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
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { PaymentsModule } from '../payments/payments.module';

/**
 * Consultations feature module
 *
 * Registers controller and service.
 * Imports PaymentsModule to access SafepayService for payment processing.
 * Exports service for potential use in other modules.
 */
@Module({
  imports: [PaymentsModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
