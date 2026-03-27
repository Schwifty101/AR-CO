import { Module } from '@nestjs/common';
import { ServiceRegistrationsController } from './service-registrations.controller';
import { ServiceRegistrationsService } from './service-registrations.service';
import { PaymentsModule } from '../payments/payments.module';

/**
 * Module for managing facilitation service registrations.
 * Handles guest registration, payment initiation, and staff management.
 *
 * Imports PaymentsModule to access LemonSqueezyService for checkout creation.
 *
 * @module ServiceRegistrationsModule
 */
@Module({
  imports: [PaymentsModule],
  controllers: [ServiceRegistrationsController],
  providers: [ServiceRegistrationsService],
  exports: [ServiceRegistrationsService],
})
export class ServiceRegistrationsModule {}
