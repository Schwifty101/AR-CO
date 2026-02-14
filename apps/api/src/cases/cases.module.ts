/**
 * Cases Module
 *
 * Registers the cases feature module with its controller and services.
 * DatabaseModule is global, so SupabaseService is available without importing.
 *
 * @module CasesModule
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import { CasesModule } from './cases/cases.module';
 *
 * @Module({ imports: [CasesModule] })
 * export class AppModule {}
 * ```
 */

import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { CaseActivitiesService } from './case-activities.service';

@Module({
  controllers: [CasesController],
  providers: [CasesService, CaseActivitiesService],
  exports: [CasesService],
})
export class CasesModule {}
