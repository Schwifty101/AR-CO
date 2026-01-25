/**
 * Current User Decorator
 *
 * Parameter decorator to extract the authenticated user from the request.
 * Populated by JwtAuthGuard after successful authentication.
 *
 * @module CurrentUserDecorator
 *
 * @example
 * ```typescript
 * import { CurrentUser } from './common/decorators/current-user.decorator';
 * import { AuthUser } from './common/interfaces/auth-user.interface';
 *
 * @Controller('profile')
 * export class ProfileController {
 *   @Get()
 *   getProfile(@CurrentUser() user: AuthUser) {
 *     console.log(user.id);        // Supabase user UUID
 *     console.log(user.email);     // User's email
 *     console.log(user.userType);  // 'client', 'attorney', 'admin', etc.
 *     console.log(user.fullName);  // Full name from profile
 *
 *     return {
 *       message: `Hello, ${user.fullName}!`,
 *       type: user.userType,
 *     };
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Controller('cases')
 * export class CasesController {
 *   @Get('my-cases')
 *   async getMyCases(@CurrentUser() user: AuthUser) {
 *     // Filter cases based on user type
 *     if (user.userType === UserType.CLIENT) {
 *       return this.casesService.getClientCases(user.clientProfileId);
 *     }
 *
 *     if (user.userType === UserType.ATTORNEY) {
 *       return this.casesService.getAttorneyCases(user.attorneyProfileId);
 *     }
 *
 *     // Admin/Staff see all cases
 *     return this.casesService.getAllCases();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Extract specific fields only
 * @Post('appointments')
 * createAppointment(
 *   @CurrentUser('id') userId: string,
 *   @Body() dto: CreateAppointmentDto
 * ) {
 *   return this.appointmentsService.create(userId, dto);
 * }
 * ```
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../interfaces/auth-user.interface';
import type { RequestWithUser } from '../interfaces/request-with-user.interface';

/**
 * CurrentUser parameter decorator
 *
 * Extracts the authenticated user from request.user.
 * Optionally extracts a specific property if provided.
 *
 * @decorator
 * @param {keyof AuthUser} [data] - Optional property name to extract
 * @param {ExecutionContext} ctx - NestJS execution context
 * @returns {AuthUser | any} Full user object or specific property
 *
 * @example
 * ```typescript
 * // Get full user object
 * @Get('profile')
 * getProfile(@CurrentUser() user: AuthUser) {
 *   return user;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Get specific property
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: string) {
 *   return { userId };
 * }
 *
 * @Get('my-email')
 * getMyEmail(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Return specific property if requested
    return data ? user?.[data] : user;
  },
);
