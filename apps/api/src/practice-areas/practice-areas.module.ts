/**
 * Practice Areas Module
 *
 * Registers the practice areas controller and service for
 * handling practice area listing endpoints.
 *
 * @module PracticeAreasModule
 *
 * @remarks
 * DatabaseModule is @Global(), so SupabaseService is available
 * without explicit import.
 */

import { Module } from '@nestjs/common';
import { PracticeAreasController } from './practice-areas.controller';
import { PracticeAreasService } from './practice-areas.service';

@Module({
  controllers: [PracticeAreasController],
  providers: [PracticeAreasService],
  exports: [PracticeAreasService],
})
export class PracticeAreasModule {}
