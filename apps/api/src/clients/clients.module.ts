/**
 * Clients Module
 *
 * Provides client profile management endpoints.
 * DatabaseModule is @Global() so no import needed.
 *
 * @module ClientsModule
 */
import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientsAggregationService } from './clients-aggregation.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ClientsAggregationService],
  exports: [ClientsService],
})
export class ClientsModule {}
