/**
 * HTTP Exception Filter
 *
 * Catches all HTTP exceptions and formats them into standardized error responses.
 * Provides consistent error structure across the API.
 *
 * @module HttpExceptionFilter
 *
 * @example
 * ```typescript
 * // Applied globally in main.ts
 * import { HttpExceptionFilter } from './common/filters/http-exception.filter';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *   app.useGlobalFilters(new HttpExceptionFilter());
 *   await app.listen(4000);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Error response format
 * {
 *   "statusCode": 404,
 *   "timestamp": "2024-01-20T10:30:00.000Z",
 *   "path": "/api/cases/123",
 *   "message": "Case not found"
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Validation error response (multiple messages)
 * {
 *   "statusCode": 400,
 *   "timestamp": "2024-01-20T10:30:00.000Z",
 *   "path": "/api/auth/signup",
 *   "message": [
 *     "email must be a valid email",
 *     "password must be at least 8 characters"
 *   ]
 * }
 * ```
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * HTTP exception filter
 *
 * Catches all HttpException instances and formats them into a standardized response.
 *
 * @class HttpExceptionFilter
 * @implements {ExceptionFilter<HttpException>}
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Catch and format HTTP exceptions
   *
   * Transforms NestJS HttpException into standardized error response.
   *
   * @param {HttpException} exception - The caught HTTP exception
   * @param {ArgumentsHost} host - NestJS arguments host
   *
   * @example
   * ```typescript
   * // Controller throws exception
   * @Get('cases/:id')
   * async getCase(@Param('id') id: string) {
   *   const case = await this.casesService.findOne(id);
   *   if (!case) {
   *     throw new NotFoundException('Case not found');
   *   }
   *   return case;
   * }
   *
   * // Filter catches and formats:
   * // {
   * //   "statusCode": 404,
   * //   "timestamp": "2024-01-20T10:30:00.000Z",
   * //   "path": "/api/cases/123",
   * //   "message": "Case not found"
   * // }
   * ```
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Extract message from exception response
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? exceptionResponse.message
        : exception.message;

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
