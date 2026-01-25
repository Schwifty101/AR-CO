/**
 * Database Module
 *
 * Global module that provides Supabase and admin whitelist services
 * throughout the application.
 *
 * This module is decorated with @Global() to make its providers available
 * everywhere without needing to import in each module.
 *
 * @module DatabaseModule
 *
 * @example
 * ```typescript
 * // Import in AppModule
 * import { DatabaseModule } from './database/database.module';
 *
 * @Module({
 *   imports: [ConfigModule, DatabaseModule],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Use in any service (no import needed due to @Global)
 * @Injectable()
 * export class CasesService {
 *   constructor(
 *     private readonly supabaseService: SupabaseService,
 *     private readonly adminWhitelist: AdminWhitelistService,
 *   ) {}
 * }
 * ```
 */

import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { AdminWhitelistService } from './admin-whitelist.service';

/**
 * Global database module
 *
 * Exports Supabase and admin whitelist services for app-wide use.
 *
 * @decorator @Global - Makes providers available throughout the app
 * @class DatabaseModule
 */
@Global()
@Module({
  providers: [SupabaseService, AdminWhitelistService],
  exports: [SupabaseService, AdminWhitelistService],
})
export class DatabaseModule {}
