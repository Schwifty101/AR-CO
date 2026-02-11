/**
 * Users Module
 *
 * Encapsulates all user profile management providers and controllers.
 * Depends on DatabaseModule (global) for SupabaseService.
 *
 * @module UsersModule
 *
 * @example
 * ```typescript
 * // Import in AppModule
 * import { UsersModule } from './users/users.module';
 *
 * @Module({
 *   imports: [UsersModule],
 * })
 * export class AppModule {}
 * ```
 */

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * Users module
 *
 * SupabaseService is injected automatically via the @Global() DatabaseModule.
 *
 * @class UsersModule
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
