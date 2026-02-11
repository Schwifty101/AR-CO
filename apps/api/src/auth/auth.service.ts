/**
 * Auth Service
 *
 * Handles all authentication operations including email/password signup/signin,
 * Google OAuth callback processing, token refresh, password reset, and signout.
 *
 * Admin users (whitelisted emails) are restricted to Google OAuth only.
 * Client users can use either Google OAuth or email/password authentication.
 *
 * @module AuthService
 *
 * @example
 * ```typescript
 * // Email/password signup (clients only)
 * const result = await authService.signup({
 *   email: 'client@example.com',
 *   password: 'SecureP@ss123',
 *   fullName: 'John Doe',
 * });
 *
 * // Process OAuth callback
 * const oauthResult = await authService.processOAuthCallback({
 *   accessToken: 'eyJ...',
 *   refreshToken: 'v1...',
 * });
 * ```
 */

import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { AdminWhitelistService } from '../database/admin-whitelist.service';
import { UserType } from '@repo/shared';
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

/** Metadata for activity log entries */
interface ActivityLogMetadata {
  provider?: string;
  action_detail?: string;
  [key: string]: unknown;
}

/**
 * Authentication service
 *
 * Manages user authentication flows with Supabase Auth.
 * Automatically creates user profiles on first login.
 *
 * @class AuthService
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly adminWhitelistService: AdminWhitelistService,
  ) {}

  /**
   * Register a new client user with email/password
   *
   * Admin emails are blocked from email/password registration.
   * Creates a Supabase auth user, user_profile, and client_profile.
   *
   * @param {SignupData} dto - Signup credentials and profile data
   * @returns {Promise<AuthResponse>} User profile with session tokens
   * @throws {ForbiddenException} If email is in admin whitelist
   * @throws {UnauthorizedException} If Supabase signup fails
   *
   * @example
   * ```typescript
   * const result = await authService.signup({
   *   email: 'new.client@example.com',
   *   password: 'SecureP@ss123',
   *   fullName: 'Jane Smith',
   *   phoneNumber: '+92-300-9876543',
   * });
   * ```
   */
  async signup(dto: SignupData): Promise<AuthResponse> {
    if (this.adminWhitelistService.isAdminEmail(dto.email)) {
      throw new ForbiddenException(
        'Admin accounts must use Google OAuth. Please sign in with Google.',
      );
    }

    const adminClient = this.supabaseService.getAdminClient();

    const { data: authData, error: authError } = await adminClient.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          full_name: dto.fullName,
        },
      },
    });

    if (authError || !authData.user) {
      this.logger.warn(`Signup failed for email: ${dto.email}`);
      throw new UnauthorizedException(
        'Unable to create account. Please try again.',
      );
    }

    const userId = authData.user.id;

    await this.createUserProfile(
      userId,
      dto.fullName,
      'client',
      dto.phoneNumber,
    );
    await this.createClientProfile(userId);
    await this.logAuthEvent(userId, 'SIGNUP', 'user', {
      provider: 'email',
    });

    return {
      user: {
        id: userId,
        email: dto.email,
        fullName: dto.fullName,
        userType: UserType.CLIENT,
      },
      accessToken: authData.session?.access_token ?? '',
      refreshToken: authData.session?.refresh_token ?? '',
    };
  }

  /**
   * Authenticate with email and password
   *
   * @param {SigninData} dto - Login credentials
   * @returns {Promise<AuthResponse>} User profile with session tokens
   * @throws {UnauthorizedException} If credentials are invalid
   *
   * @example
   * ```typescript
   * const result = await authService.signin({
   *   email: 'client@example.com',
   *   password: 'SecureP@ss123',
   * });
   * ```
   */
  async signin(dto: SigninData): Promise<AuthResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: authData, error: authError } =
      await adminClient.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (authError || !authData.user || !authData.session) {
      throw new UnauthorizedException('Invalid email or password');
    }

    let profile = await this.fetchUserProfile(authData.user.id);

    // Check if existing user should be upgraded to admin
    const isAdminEmail = this.adminWhitelistService.isAdminEmail(dto.email);
    if (isAdminEmail && profile.user_type !== 'admin') {
      // Upgrade user to admin
      const { error: updateError } = await adminClient
        .from('user_profiles')
        .update({ user_type: 'admin' })
        .eq('id', authData.user.id);

      if (!updateError) {
        this.logger.log(`Upgraded user ${dto.email} to admin`);
        profile = { ...profile, user_type: 'admin' };
      }
    }

    await this.logAuthEvent(authData.user.id, 'SIGNIN', 'user', {
      provider: 'email',
    });

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        fullName: profile.full_name,
        userType: profile.user_type as UserType,
      },
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    };
  }

  /**
   * Process OAuth callback tokens
   *
   * Validates the access token, creates user profile if first login,
   * and determines user type based on admin whitelist.
   *
   * @param {OAuthCallbackData} dto - OAuth session tokens from frontend
   * @returns {Promise<AuthResponse>} User profile with session tokens
   * @throws {UnauthorizedException} If token is invalid
   *
   * @example
   * ```typescript
   * const result = await authService.processOAuthCallback({
   *   accessToken: 'eyJ...',
   *   refreshToken: 'v1...',
   * });
   * // result.user.userType === 'admin' if email is whitelisted
   * ```
   */
  async processOAuthCallback(dto: OAuthCallbackData): Promise<AuthResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const {
      data: { user: authUser },
      error: authError,
    } = await adminClient.auth.getUser(dto.accessToken);

    if (authError || !authUser || !authUser.email) {
      throw new UnauthorizedException('Invalid OAuth token');
    }

    let profile = await this.fetchUserProfileOrNull(authUser.id);

    if (!profile) {
      const userType = this.adminWhitelistService.isAdminEmail(authUser.email)
        ? 'admin'
        : 'client';

      const fullName =
        (authUser.user_metadata?.full_name as string) ||
        (authUser.user_metadata?.name as string) ||
        authUser.email;

      await this.createUserProfile(authUser.id, fullName, userType);

      if (userType === 'client') {
        await this.createClientProfile(authUser.id);
      }

      profile = {
        full_name: fullName,
        user_type: userType,
      };
    } else {
      // Check if existing user should be upgraded to admin
      const isAdminEmail = this.adminWhitelistService.isAdminEmail(
        authUser.email,
      );
      if (isAdminEmail && profile.user_type !== 'admin') {
        // Upgrade user to admin
        const { error: updateError } = await adminClient
          .from('user_profiles')
          .update({ user_type: 'admin' })
          .eq('id', authUser.id);

        if (!updateError) {
          this.logger.log(`Upgraded user ${authUser.email} to admin`);
          profile.user_type = 'admin';
        }
      }
    }

    await this.logAuthEvent(authUser.id, 'OAUTH_LOGIN', 'user', {
      provider: 'google',
    });

    return {
      user: {
        id: authUser.id,
        email: authUser.email,
        fullName: profile.full_name,
        userType: profile.user_type as UserType,
      },
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
    };
  }

  /**
   * Refresh an expired access token
   *
   * @param {RefreshTokenData} dto - Refresh token
   * @returns {Promise<AuthResponse>} New session tokens with user info
   * @throws {UnauthorizedException} If refresh token is invalid
   *
   * @example
   * ```typescript
   * const result = await authService.refreshToken({
   *   refreshToken: 'v1.MjQ0OTUx...',
   * });
   * ```
   */
  async refreshToken(dto: RefreshTokenData): Promise<AuthResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: sessionData, error: sessionError } =
      await adminClient.auth.refreshSession({
        refresh_token: dto.refreshToken,
      });

    if (sessionError || !sessionData.session || !sessionData.user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const profile = await this.fetchUserProfile(sessionData.user.id);

    return {
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email!,
        fullName: profile.full_name,
        userType: profile.user_type as UserType,
      },
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
    };
  }

  /**
   * Request a password reset email
   *
   * Sends a password reset email via Supabase Auth.
   * Returns a generic success message regardless of whether the email exists.
   *
   * @param {PasswordResetRequestData} dto - Email address
   * @returns {Promise<AuthMessage>} Generic success message
   *
   * @example
   * ```typescript
   * const result = await authService.requestPasswordReset({
   *   email: 'client@example.com',
   * });
   * // Always returns success to prevent email enumeration
   * ```
   */
  async requestPasswordReset(
    dto: PasswordResetRequestData,
  ): Promise<AuthMessage> {
    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient.auth.resetPasswordForEmail(dto.email, {
      redirectTo: `${process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      this.logger.warn(`Password reset request failed: ${error.message}`);
    }

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  /**
   * Confirm password reset with new password
   *
   * Uses the access token from the reset link to set a new password.
   *
   * @param {PasswordResetConfirmData} dto - Access token and new password
   * @returns {Promise<AuthMessage>} Success message
   * @throws {UnauthorizedException} If reset token is invalid
   *
   * @example
   * ```typescript
   * const result = await authService.confirmPasswordReset({
   *   accessToken: 'eyJ...',
   *   newPassword: 'NewSecureP@ss456',
   * });
   * ```
   */
  async confirmPasswordReset(
    dto: PasswordResetConfirmData,
  ): Promise<AuthMessage> {
    const adminClient = this.supabaseService.getAdminClient();

    const {
      data: { user },
      error: verifyError,
    } = await adminClient.auth.getUser(dto.accessToken);

    if (verifyError || !user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { password: dto.newPassword },
    );

    if (updateError) {
      this.logger.error(`Password update failed for user ${user.id}`);
      throw new InternalServerErrorException(
        'Unable to update password. Please try again.',
      );
    }

    await this.logAuthEvent(user.id, 'PASSWORD_RESET', 'user');

    return { message: 'Password has been reset successfully.' };
  }

  /**
   * Sign out the current user
   *
   * Logs the signout event. Actual session invalidation is handled
   * by the frontend clearing the Supabase session.
   *
   * @param {string} userId - Authenticated user's UUID
   * @returns {Promise<AuthMessage>} Success message
   *
   * @example
   * ```typescript
   * const result = await authService.signout(user.id);
   * ```
   */
  async signout(userId: string): Promise<AuthMessage> {
    await this.logAuthEvent(userId, 'SIGNOUT', 'user');
    return { message: 'Signed out successfully.' };
  }

  /**
   * Get current user profile
   *
   * @param {string} userId - Authenticated user's UUID
   * @param {string} email - User's email
   * @returns {Promise<AuthResponseUser>} User profile info
   *
   * @example
   * ```typescript
   * const profile = await authService.getCurrentUser(user.id, user.email);
   * ```
   */
  async getCurrentUser(
    userId: string,
    email: string,
  ): Promise<AuthResponseUser> {
    const adminClient = this.supabaseService.getAdminClient();
    let profile = await this.fetchUserProfile(userId);

    // Check if existing user should be upgraded to admin
    const isAdminEmail = this.adminWhitelistService.isAdminEmail(email);
    if (isAdminEmail && profile.user_type !== 'admin') {
      // Upgrade user to admin
      const { error: updateError } = await adminClient
        .from('user_profiles')
        .update({ user_type: 'admin' })
        .eq('id', userId);

      if (!updateError) {
        this.logger.log(`Upgraded user ${email} to admin`);
        profile = { ...profile, user_type: 'admin' };
      }
    }

    return {
      id: userId,
      email,
      fullName: profile.full_name,
      userType: profile.user_type as UserType,
    };
  }

  /**
   * Create a user_profile record
   *
   * Uses admin client to bypass RLS since the user profile
   * doesn't exist yet during first-time registration.
   */
  private async createUserProfile(
    userId: string,
    fullName: string,
    userType: string,
    phoneNumber?: string,
  ): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient.from('user_profiles').insert({
      id: userId,
      full_name: fullName,
      user_type: userType,
      phone_number: phoneNumber || null,
    });

    if (error) {
      this.logger.error(
        `Failed to create user profile for ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Unable to create user profile. Please try again.',
      );
    }
  }

  /**
   * Create a client_profile record linked to the user profile
   *
   * Uses admin client to bypass RLS.
   */
  private async createClientProfile(userProfileId: string): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient.from('client_profiles').insert({
      user_profile_id: userProfileId,
    });

    if (error) {
      this.logger.error(
        `Failed to create client profile for ${userProfileId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Unable to create client profile. Please try again.',
      );
    }
  }

  /**
   * Fetch user profile, throwing if not found
   */
  private async fetchUserProfile(
    userId: string,
  ): Promise<{ full_name: string; user_type: string }> {
    const profile = await this.fetchUserProfileOrNull(userId);

    if (!profile) {
      throw new UnauthorizedException('User profile not found');
    }

    return profile;
  }

  /**
   * Fetch user profile, returning null if not found
   */
  private async fetchUserProfileOrNull(
    userId: string,
  ): Promise<{ full_name: string; user_type: string } | null> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient
      .from('user_profiles')
      .select('full_name, user_type')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as { full_name: string; user_type: string };
  }

  /**
   * Log an authentication event to activity_logs
   *
   * Uses admin client to bypass RLS.
   * Failures are logged but don't propagate to the caller.
   */
  private async logAuthEvent(
    userId: string,
    action: string,
    entityType: string,
    metadata?: ActivityLogMetadata,
  ): Promise<void> {
    try {
      const adminClient = this.supabaseService.getAdminClient();

      await adminClient.from('activity_logs').insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: userId,
        metadata: metadata || {},
      });
    } catch (error) {
      this.logger.warn(`Failed to log auth event: ${action}`, error);
    }
  }
}
