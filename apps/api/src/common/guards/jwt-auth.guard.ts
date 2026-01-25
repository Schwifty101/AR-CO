/**
 * JWT Authentication Guard
 *
 * Global guard that validates JWT tokens and populates request.user.
 * Skips authentication for routes decorated with @Public().
 *
 * @module JwtAuthGuard
 *
 * @example
 * ```typescript
 * // Applied globally in main.ts
 * const reflector = app.get(Reflector);
 * const supabaseService = app.get(SupabaseService);
 * app.useGlobalGuards(new JwtAuthGuard(reflector, supabaseService));
 * ```
 *
 * @example
 * ```typescript
 * // Controller usage (guard applied automatically)
 * @Controller('cases')
 * export class CasesController {
 *   @Get()
 *   // JWT required by default
 *   getAllCases(@CurrentUser() user: AuthUser) {
 *     return this.casesService.findAll(user);
 *   }
 *
 *   @Get('public')
 *   @Public() // Skip JWT authentication
 *   getPublicInfo() {
 *     return { message: 'No auth required' };
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Request flow
 * // 1. Client sends: Authorization: Bearer <jwt-token>
 * // 2. JwtAuthGuard extracts token
 * // 3. Validates with Supabase
 * // 4. Populates request.user with AuthUser
 * // 5. Route handler receives @CurrentUser()
 * ```
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { SupabaseService } from '../../database/supabase.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { RequestWithUser } from '../interfaces/request-with-user.interface';

/**
 * JWT authentication guard
 *
 * Validates JWT tokens from Authorization header and populates request.user.
 * Respects @Public() decorator to allow unauthenticated access.
 *
 * @class JwtAuthGuard
 * @implements {CanActivate}
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  /**
   * Initialize guard with dependencies
   *
   * @param {Reflector} reflector - NestJS reflector for reading metadata
   * @param {SupabaseService} supabaseService - Supabase service for token validation
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Validate request authentication
   *
   * Checks for @Public() decorator, then validates JWT and populates request.user.
   *
   * @param {ExecutionContext} context - NestJS execution context
   * @returns {Promise<boolean>} True if authenticated or public route
   * @throws {UnauthorizedException} If token is missing, invalid, or expired
   *
   * @example
   * ```typescript
   * // Public route - returns true immediately
   * @Get('health')
   * @Public()
   * healthCheck() { }
   *
   * // Protected route - validates JWT
   * @Get('profile')
   * getProfile(@CurrentUser() user: AuthUser) { }
   * ```
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check for @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip authentication for public routes
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // Validate Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    // Extract JWT token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    // Validate token and get user profile
    const user = await this.supabaseService.getUserFromToken(token);

    // Attach user to request for downstream use
    (request as RequestWithUser).user = user;

    return true;
  }
}
