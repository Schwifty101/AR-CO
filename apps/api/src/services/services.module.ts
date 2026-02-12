/**
 * Services Module
 *
 * Registers the services controller and service for handling
 * public-facing facilitation service catalog endpoints.
 *
 * @module ServicesModule
 *
 * @remarks
 * DatabaseModule is @Global(), so SupabaseService is available
 * without explicit import.
 */

import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
