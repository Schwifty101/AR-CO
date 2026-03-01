import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

/**
 * Module for document management (upload, CRUD, download).
 * StorageService is injected via @Global() StorageModule.
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * imports: [DocumentsModule]
 * ```
 */
@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
