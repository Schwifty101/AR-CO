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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  SignupSchema,
  SigninSchema,
  OAuthCallbackSchema,
  RefreshTokenSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
} from '@repo/shared';
import type {
  SignupData,
  SigninData,
  OAuthCallbackData,
  RefreshTokenData,
  PasswordResetRequestData,
  PasswordResetConfirmData,
  AuthResponse,
  AuthResponseUser,
  AuthMessage,
} from '@repo/shared';

/**
 * Authentication controller
 *
 * Provides REST endpoints for all authentication flows.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new client with email/password
   *
   * Admin emails are blocked and must use Google OAuth.
   */
  @Post('signup')
  @Public()
  async signup(
    @Body(new ZodValidationPipe(SignupSchema)) dto: SignupData,
  ): Promise<AuthResponse> {
    return this.authService.signup(dto);
  }

  /**
   * Sign in with email/password
   */
  @Post('signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body(new ZodValidationPipe(SigninSchema)) dto: SigninData,
  ): Promise<AuthResponse> {
    return this.authService.signin(dto);
  }

  /**
   * Process OAuth callback with Supabase session tokens
   *
   * Called by the frontend after exchanging the OAuth code for tokens.
   * Creates user profile on first login and determines user type.
   */
  @Post('oauth/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  async oauthCallback(
    @Body(new ZodValidationPipe(OAuthCallbackSchema)) dto: OAuthCallbackData,
  ): Promise<AuthResponse> {
    return this.authService.processOAuthCallback(dto);
  }

  /**
   * Refresh an expired access token
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body(new ZodValidationPipe(RefreshTokenSchema)) dto: RefreshTokenData,
  ): Promise<AuthResponse> {
    return this.authService.refreshToken(dto);
  }

  /**
   * Request a password reset email
   *
   * Returns a generic message regardless of whether the email exists.
   */
  @Post('password-reset/request')
  @Public()
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body(new ZodValidationPipe(PasswordResetRequestSchema))
    dto: PasswordResetRequestData,
  ): Promise<AuthMessage> {
    return this.authService.requestPasswordReset(dto);
  }

  /**
   * Confirm password reset with new password
   */
  @Post('password-reset/confirm')
  @Public()
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Body(new ZodValidationPipe(PasswordResetConfirmSchema))
    dto: PasswordResetConfirmData,
  ): Promise<AuthMessage> {
    return this.authService.confirmPasswordReset(dto);
  }

  /**
   * Get the current authenticated user's profile
   *
   * Requires a valid JWT in the Authorization header.
   */
  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: AuthUser,
  ): Promise<AuthResponseUser> {
    return this.authService.getCurrentUser(user.id, user.email);
  }

  /**
   * Sign out the current user
   *
   * Logs the signout event. Frontend handles session clearing.
   */
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@CurrentUser() user: AuthUser): Promise<AuthMessage> {
    return this.authService.signout(user.id);
  }
}
