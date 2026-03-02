/**
 * Admin Module
 *
 * NestJS module for admin CRM (client interactions) and activity logs.
 * DatabaseModule is @Global() so no need to import it here.
 *
 * @module AdminModule
 */

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ClientInteractionsService } from './client-interactions.service';
import { ActivityLogsService } from './activity-logs.service';

@Module({
  controllers: [AdminController],
  providers: [ClientInteractionsService, ActivityLogsService],
  exports: [ActivityLogsService],
})
export class AdminModule {}
