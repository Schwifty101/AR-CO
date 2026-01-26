/**
 * Auth Module
 *
 * Encapsulates all authentication-related providers and controllers.
 * Depends on DatabaseModule (global) for SupabaseService and AdminWhitelistService.
 *
 * @module AuthModule
 *
 * @example
 * ```typescript
 * // Import in AppModule
 * import { AuthModule } from './auth/auth.module';
 *
 * @Module({
 *   imports: [AuthModule],
 * })
 * export class AppModule {}
 * ```
 */

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Authentication module
 *
 * SupabaseService and AdminWhitelistService are injected
 * automatically via the @Global() DatabaseModule.
 *
 * @class AuthModule
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
