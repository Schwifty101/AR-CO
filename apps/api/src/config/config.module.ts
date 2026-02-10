/**
 * Configuration Module for AR-CO Backend API
 *
 * This module configures NestJS ConfigModule with environment variable loading,
 * validation, and typed configuration access throughout the application.
 *
 * The module is configured as global, so ConfigService can be injected anywhere
 * in the application without importing ConfigModule in every module.
 *
 * @module ConfigModule
 *
 * @example
 * ```typescript
 * // Import in app.module.ts
 * import { AppConfigModule } from './config/config.module';
 *
 * @Module({
 *   imports: [AppConfigModule],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Inject ConfigService in any service
 * import { ConfigService } from '@nestjs/config';
 * import { Configuration } from './config/configuration';
 *
 * export class MyService {
 *   constructor(private configService: ConfigService<Configuration>) {}
 *
 *   getSupabaseUrl() {
 *     return this.configService.get('supabase.url', { infer: true });
 *   }
 * }
 * ```
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validationSchema, validationOptions } from './validation.schema';

/**
 * AppConfigModule
 *
 * Configures NestJS ConfigModule with:
 * - Environment variable loading from .env file
 * - Joi validation schema to ensure required variables are present
 * - Typed configuration factory function
 * - Global availability throughout the application
 *
 * @class
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      // Load the configuration factory function
      load: [configuration],

      // Make ConfigService available globally without importing ConfigModule everywhere
      isGlobal: true,

      // Load .env file from the project root (apps/api/.env or .env.local)
      envFilePath: ['.env.local', '.env'],

      // Validate environment variables using Joi schema
      validationSchema,
      validationOptions,

      // Expand variables in .env file (e.g., API_URL=${PROTOCOL}://${HOST})
      expandVariables: true,

      // Cache configuration for better performance
      cache: true,
    }),
  ],
})
export class AppConfigModule {}
