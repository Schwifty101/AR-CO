import { Module } from '@nestjs/common';
import { ServiceRegistrationsController } from './service-registrations.controller';
import { ServiceRegistrationsService } from './service-registrations.service';

/**
 * Module for managing facilitation service registrations
 * Handles guest registration and staff management
 *
 * @module ServiceRegistrationsModule
 */
@Module({
  controllers: [ServiceRegistrationsController],
  providers: [ServiceRegistrationsService],
  exports: [ServiceRegistrationsService],
})
export class ServiceRegistrationsModule {}
