/**
 * Roles Decorator
 *
 * Restricts route access to specific user types.
 * Use this in combination with RolesGuard to implement role-based access control.
 *
 * @module RolesDecorator
 *
 * @example
 * ```typescript
 * import { Roles } from './common/decorators/roles.decorator';
 * import { UserType } from './common/enums/user-type.enum';
 *
 * @Controller('admin')
 * export class AdminController {
 *   @Get('dashboard')
 *   @Roles(UserType.ADMIN, UserType.STAFF)
 *   getDashboard(@CurrentUser() user: AuthUser) {
 *     // Only admins and staff can access this
 *     return this.adminService.getDashboardData();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Controller('cases')
 * export class CasesController {
 *   @Get()
 *   // No @Roles() - any authenticated user can access
 *   getAllCases(@CurrentUser() user: AuthUser) {
 *     return this.casesService.findAll(user);
 *   }
 *
 *   @Delete(':id')
 *   @Roles(UserType.ADMIN) // Only admins can delete
 *   deleteCase(@Param('id') id: string) {
 *     return this.casesService.delete(id);
 *   }
 *
 *   @Get('attorney-cases')
 *   @Roles(UserType.ATTORNEY, UserType.STAFF)
 *   getAttorneyCases() {
 *     return this.casesService.getAttorneyView();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Admin whitelist bypass
 * // If user's email is in ADMIN_EMAILS, they can access any @Roles() route
 * // regardless of their user_type in the database
 * @Get('sensitive-data')
 * @Roles(UserType.ADMIN)
 * getSensitiveData() {
 *   // Accessible by:
 *   // 1. Users with user_type = 'admin'
 *   // 2. Users whose email is in ADMIN_EMAILS
 * }
 * ```
 */

import { SetMetadata } from '@nestjs/common';
import { UserType } from '../enums/user-type.enum';

/**
 * Metadata key for required roles
 * @constant
 */
export const ROLES_KEY = 'roles';

/**
 * Roles decorator
 *
 * Sets metadata with the list of roles allowed to access the route.
 * RolesGuard checks this metadata and compares against the user's role.
 *
 * @decorator
 * @param {...UserType[]} roles - One or more user types that can access the route
 * @returns {MethodDecorator} NestJS method decorator
 *
 * @example
 * ```typescript
 * @Post('approve-payment')
 * @Roles(UserType.ADMIN, UserType.STAFF)
 * approvePayment(@Param('id') id: string) {
 *   return this.paymentsService.approve(id);
 * }
 * ```
 */
export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
