/**
 * Roles Authorization Guard
 *
 * Enforces role-based access control using @Roles() decorator.
 * Checks user's role against required roles, with admin whitelist bypass.
 *
 * **Guard Order:** Must run AFTER JwtAuthGuard (depends on request.user)
 *
 * @module RolesGuard
 *
 * @example
 * ```typescript
 * // Applied globally in main.ts (after JwtAuthGuard)
 * const reflector = app.get(Reflector);
 * const adminWhitelist = app.get(AdminWhitelistService);
 * app.useGlobalGuards(
 *   new JwtAuthGuard(reflector, supabaseService),
 *   new RolesGuard(reflector, adminWhitelist) // Second guard
 * );
 * ```
 *
 * @example
 * ```typescript
 * @Controller('admin')
 * export class AdminController {
 *   @Get('dashboard')
 *   @Roles(UserType.ADMIN, UserType.STAFF)
 *   getDashboard(@CurrentUser() user: AuthUser) {
 *     // Only admins and staff can access
 *   }
 *
 *   @Delete('user/:id')
 *   @Roles(UserType.ADMIN)
 *   deleteUser(@Param('id') id: string) {
 *     // Only admins can delete users
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Admin whitelist bypass
 * // ADMIN_EMAILS="john@gmail.com,jane@outlook.com"
 *
 * @Get('sensitive')
 * @Roles(UserType.ADMIN)
 * getSensitiveData() {
 *   // Accessible by:
 *   // 1. Users with user_type = 'admin' in database
 *   // 2. john@gmail.com (whitelisted, any user_type)
 *   // 3. jane@outlook.com (whitelisted, any user_type)
 * }
 * ```
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminWhitelistService } from '../../database/admin-whitelist.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserType } from '../enums/user-type.enum';
// AuthUser used in JSDoc comments
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AuthUser } from '../interfaces/auth-user.interface';
import type { RequestWithUser } from '../interfaces/request-with-user.interface';

/**
 * Roles authorization guard
 *
 * Checks if authenticated user has required role to access the route.
 * Admin whitelist emails bypass all role restrictions.
 *
 * @class RolesGuard
 * @implements {CanActivate}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Initialize guard with dependencies
   *
   * @param {Reflector} reflector - NestJS reflector for reading metadata
   * @param {AdminWhitelistService} adminWhitelist - Admin whitelist service
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly adminWhitelist: AdminWhitelistService,
  ) {}

  /**
   * Validate user authorization
   *
   * Checks if user's role matches required roles or if user is in admin whitelist.
   *
   * @param {ExecutionContext} context - NestJS execution context
   * @returns {boolean} True if authorized
   * @throws {ForbiddenException} If user lacks required role
   *
   * @example
   * ```typescript
   * // No @Roles() decorator - allow all authenticated users
   * @Get('profile')
   * getProfile(@CurrentUser() user: AuthUser) { } // ✅ Allowed
   *
   * // With @Roles() - check user.userType
   * @Get('admin-only')
   * @Roles(UserType.ADMIN)
   * adminOnly() { } // ✅ Only admins or whitelisted emails
   *
   * @Get('multi-role')
   * @Roles(UserType.ATTORNEY, UserType.STAFF)
   * multiRole() { } // ✅ Attorneys, staff, or whitelisted emails
   * ```
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator - allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Should never happen (JwtAuthGuard runs first), but defensive check
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admin whitelist bypass - whitelisted emails have access to all routes
    if (this.adminWhitelist.isAdminEmail(user.email)) {
      return true;
    }

    // Check if user's role matches any required role
    const hasRequiredRole = requiredRoles.includes(user.userType);

    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
