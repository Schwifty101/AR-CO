/**
 * Dashboard Module
 *
 * NestJS module for dashboard statistics endpoints.
 * DatabaseModule is @Global() so no need to import it here.
 *
 * @module DashboardModule
 */

import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
