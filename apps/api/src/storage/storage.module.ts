import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';

/**
 * Global module for Supabase Storage operations.
 * Marked @Global() so any module can inject StorageService without importing.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class DocumentsService {
 *   constructor(private readonly storageService: StorageService) {}
 * }
 * ```
 */
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
