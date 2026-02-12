import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { ServiceRegistrationsController } from './service-registrations.controller';
import { ServiceRegistrationsService } from './service-registrations.service';
import { ServiceRegistrationsPaymentService } from './service-registrations-payment.service';

/**
 * Module for managing facilitation service registrations
 * Handles guest registration, payment initiation, and staff management
 *
 * @module ServiceRegistrationsModule
 */
@Module({
  imports: [PaymentsModule],
  controllers: [ServiceRegistrationsController],
  providers: [ServiceRegistrationsService, ServiceRegistrationsPaymentService],
  exports: [ServiceRegistrationsService],
})
export class ServiceRegistrationsModule {}
