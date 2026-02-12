import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { ServiceRegistrationsController } from './service-registrations.controller';
import { ServiceRegistrationsService } from './service-registrations.service';

/**
 * Module for managing facilitation service registrations
 * Handles guest registration, payment initiation, and staff management
 *
 * @remarks
 * This module allows unauthenticated (guest) users to register for services
 * and initiate payments, then provides authenticated endpoints for tracking
 * and staff management.
 *
 * Dependencies:
 * - PaymentsModule: Provides SafepayService for payment processing
 * - DatabaseModule: Automatically available (global module)
 *
 * @example
 * ```typescript
 * // Import in AppModule or feature module
 * @Module({
 *   imports: [ServiceRegistrationsModule],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
  imports: [PaymentsModule],
  controllers: [ServiceRegistrationsController],
  providers: [ServiceRegistrationsService],
  exports: [ServiceRegistrationsService],
})
export class ServiceRegistrationsModule {}
