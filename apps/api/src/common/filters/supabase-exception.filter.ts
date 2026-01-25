/**
 * Supabase Exception Filter
 *
 * Catches Supabase-specific errors and transforms them into appropriate HTTP responses.
 * Handles database errors, auth errors, and permission errors.
 *
 * @module SupabaseExceptionFilter
 *
 * @example
 * ```typescript
 * // Applied globally in main.ts
 * import { SupabaseExceptionFilter } from './common/filters/supabase-exception.filter';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *   app.useGlobalFilters(
 *     new HttpExceptionFilter(),
 *     new SupabaseExceptionFilter() // After HttpExceptionFilter
 *   );
 *   await app.listen(4000);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Supabase errors transformed to HTTP responses
 *
 * // PGRST116 (Row not found) → 404 Not Found
 * const { data, error } = await supabase
 *   .from('cases')
 *   .select()
 *   .eq('id', '123')
 *   .single();
 * // Error code: PGRST116 → 404 "Resource not found"
 *
 * // 23505 (Unique violation) → 409 Conflict
 * const { error } = await supabase
 *   .from('users')
 *   .insert({ email: 'existing@example.com' });
 * // Error code: 23505 → 409 "Resource already exists"
 *
 * // Auth error → 401 Unauthorized
 * const { error } = await supabase.auth.getUser('invalid-token');
 * // Error message contains "auth" → 401 "Unauthorized"
 * ```
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Supabase exception filter
 *
 * Catches non-HTTP exceptions (primarily from Supabase) and maps them
 * to appropriate HTTP status codes.
 *
 * @class SupabaseExceptionFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class SupabaseExceptionFilter implements ExceptionFilter {
  /**
   * Catch and transform Supabase errors
   *
   * Maps Supabase error codes and messages to HTTP status codes.
   *
   * @param {any} exception - The caught exception
   * @param {ArgumentsHost} host - NestJS arguments host
   *
   * @example
   * ```typescript
   * // Database unique constraint violation
   * {
   *   code: '23505',
   *   message: 'duplicate key value violates unique constraint'
   * }
   * // → 409 Conflict: "Resource already exists"
   *
   * // Row not found
   * {
   *   code: 'PGRST116',
   *   message: 'The result contains 0 rows'
   * }
   * // → 404 Not Found: "Resource not found"
   *
   * // Permission denied
   * {
   *   code: '42501',
   *   message: 'permission denied for table cases'
   * }
   * // → 403 Forbidden: "Access denied"
   * ```
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Skip if already an HTTP exception (handled by HttpExceptionFilter)
    if (
      typeof exception === 'object' &&
      exception !== null &&
      'getStatus' in exception &&
      typeof (exception as { getStatus?: unknown }).getStatus === 'function'
    ) {
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Supabase error object structure
    const errorCode =
      typeof exception === 'object' && exception !== null && 'code' in exception
        ? (exception as { code?: string }).code
        : undefined;
    const errorMessage =
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception
        ? String((exception as { message?: unknown }).message).toLowerCase()
        : '';

    // Map Supabase error codes to HTTP status codes
    if (errorCode) {
      switch (errorCode) {
        // PostgreSQL error codes
        case 'PGRST116': // Row not found
          status = HttpStatus.NOT_FOUND;
          message = 'Resource not found';
          break;

        case '23505': // Unique constraint violation
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          break;

        case '23503': // Foreign key violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid reference';
          break;

        case '42501': // Insufficient privilege
          status = HttpStatus.FORBIDDEN;
          message = 'Access denied';
          break;

        case '23514': // Check constraint violation
        case '23502': // Not null violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid data';
          break;

        default:
          // Unknown error code
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database error';
          break;
      }
    } else if (errorMessage) {
      // Map error messages to HTTP status codes
      if (errorMessage.includes('auth') || errorMessage.includes('token')) {
        status = HttpStatus.UNAUTHORIZED;
        message = 'Unauthorized';
      } else if (
        errorMessage.includes('permission') ||
        errorMessage.includes('access')
      ) {
        status = HttpStatus.FORBIDDEN;
        message = 'Access denied';
      } else if (errorMessage.includes('not found')) {
        status = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
      }
    }

    // Standardized error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    response.status(status).json(errorResponse);
  }
}
