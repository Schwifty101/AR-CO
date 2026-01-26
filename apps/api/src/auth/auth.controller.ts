/**
 * Auth Controller
 *
 * Handles all authentication-related HTTP endpoints including signup, signin,
 * OAuth callback, token refresh, password reset, and signout.
 *
 * All public endpoints are decorated with @Public() to bypass JwtAuthGuard.
 * Protected endpoints require a valid JWT in the Authorization header.
 *
 * @module AuthController
 *
 * @example
 * ```typescript
 * // Public endpoints (no auth required)
 * POST /api/auth/signup          - Client email/password registration
 * POST /api/auth/signin          - Email/password login
 * POST /api/auth/oauth/callback  - Process OAuth tokens
 * POST /api/auth/refresh         - Refresh access token
 * POST /api/auth/password-reset/request  - Request reset email
 * POST /api/auth/password-reset/confirm  - Confirm password reset
 *
 * // Protected endpoints (JWT required)
 * GET  /api/auth/me              - Get current user profile
 * POST /api/auth/signout         - Sign out
 * ```
 */

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  SignupDto,
  SigninDto,
  OAuthCallbackDto,
  RefreshTokenDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
} from './dto';
import type { AuthResponseDto, AuthMessageDto } from './dto';

/**
 * Authentication controller
 *
 * Provides REST endpoints for all authentication flows.
 *
 * @class AuthController
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new client with email/password
   *
   * Admin emails are blocked and must use Google OAuth.
   *
   * @param {SignupDto} dto - Registration data
   * @returns {Promise<AuthResponseDto>} User profile with session tokens
   */
  @Post('signup')
  @Public()
  async signup(@Body() dto: SignupDto): Promise<AuthResponseDto> {
    return this.authService.signup(dto);
  }

  /**
   * Sign in with email/password
   *
   * @param {SigninDto} dto - Login credentials
   * @returns {Promise<AuthResponseDto>} User profile with session tokens
   */
  @Post('signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: SigninDto): Promise<AuthResponseDto> {
    return this.authService.signin(dto);
  }

  /**
   * Process OAuth callback with Supabase session tokens
   *
   * Called by the frontend after exchanging the OAuth code for tokens.
   * Creates user profile on first login and determines user type.
   *
   * @param {OAuthCallbackDto} dto - OAuth session tokens
   * @returns {Promise<AuthResponseDto>} User profile with session tokens
   */
  @Post('oauth/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  async oauthCallback(@Body() dto: OAuthCallbackDto): Promise<AuthResponseDto> {
    return this.authService.processOAuthCallback(dto);
  }

  /**
   * Refresh an expired access token
   *
   * @param {RefreshTokenDto} dto - Refresh token
   * @returns {Promise<AuthResponseDto>} New session tokens with user info
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(dto);
  }

  /**
   * Request a password reset email
   *
   * Returns a generic message regardless of whether the email exists.
   *
   * @param {PasswordResetRequestDto} dto - Email address
   * @returns {Promise<AuthMessageDto>} Generic success message
   */
  @Post('password-reset/request')
  @Public()
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() dto: PasswordResetRequestDto,
  ): Promise<AuthMessageDto> {
    return this.authService.requestPasswordReset(dto);
  }

  /**
   * Confirm password reset with new password
   *
   * @param {PasswordResetConfirmDto} dto - Reset token and new password
   * @returns {Promise<AuthMessageDto>} Success message
   */
  @Post('password-reset/confirm')
  @Public()
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Body() dto: PasswordResetConfirmDto,
  ): Promise<AuthMessageDto> {
    return this.authService.confirmPasswordReset(dto);
  }

  /**
   * Get the current authenticated user's profile
   *
   * Requires a valid JWT in the Authorization header.
   *
   * @param {AuthUser} user - Injected authenticated user
   * @returns {Promise<AuthResponseDto['user']>} User profile info
   */
  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: AuthUser,
  ): Promise<AuthResponseDto['user']> {
    return this.authService.getCurrentUser(user.id, user.email);
  }

  /**
   * Sign out the current user
   *
   * Logs the signout event. Frontend handles session clearing.
   *
   * @param {AuthUser} user - Injected authenticated user
   * @returns {Promise<AuthMessageDto>} Success message
   */
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@CurrentUser() user: AuthUser): Promise<AuthMessageDto> {
    return this.authService.signout(user.id);
  }
}
