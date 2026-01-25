/**
 * Public Route Decorator
 *
 * Marks a route as public, bypassing authentication guards.
 * Use this for endpoints that should be accessible without a JWT token.
 *
 * @module PublicDecorator
 *
 * @example
 * ```typescript
 * import { Public } from './common/decorators/public.decorator';
 *
 * @Controller('health')
 * export class HealthController {
 *   @Get()
 *   @Public() // Skip JWT authentication
 *   healthCheck() {
 *     return { status: 'ok' };
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Post('signup')
 *   @Public() // Allow unauthenticated signup
 *   async signup(@Body() dto: SignupDto) {
 *     return this.authService.signup(dto);
 *   }
 *
 *   @Post('login')
 *   @Public() // Allow unauthenticated login
 *   async login(@Body() dto: LoginDto) {
 *     return this.authService.login(dto);
 *   }
 *
 *   @Get('profile')
 *   // No @Public() - requires authentication
 *   async getProfile(@CurrentUser() user: AuthUser) {
 *     return user;
 *   }
 * }
 * ```
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for public routes
 * @constant
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public decorator
 *
 * Sets metadata to mark a route as public.
 * JwtAuthGuard checks for this metadata and skips authentication if present.
 *
 * @decorator
 * @returns {MethodDecorator} NestJS method decorator
 *
 * @example
 * ```typescript
 * @Get('public-data')
 * @Public()
 * getPublicData() {
 *   return { message: 'This is accessible without authentication' };
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
