/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/**
 * Supabase Service
 *
 * Provides centralized Supabase client management with RLS-enforced user clients
 * and service-role admin clients. Handles JWT validation and user profile retrieval.
 *
 * @module SupabaseService
 *
 * @example
 * ```typescript
 * import { SupabaseService } from './database/supabase.service';
 *
 * @Injectable()
 * export class CasesService {
 *   constructor(private readonly supabaseService: SupabaseService) {}
 *
 *   async getUserCases(accessToken: string) {
 *     // RLS-enforced client (user can only see their own data)
 *     const client = this.supabaseService.getClient(accessToken);
 *     const { data, error } = await client.from('cases').select('*');
 *     return data;
 *   }
 *
 *   async adminGetAllCases() {
 *     // Admin client bypasses RLS (use with caution)
 *     const client = this.supabaseService.getAdminClient();
 *     const { data, error } = await client.from('cases').select('*');
 *     return data;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Validate JWT and get user profile
 * async validateUser(token: string) {
 *   try {
 *     const user = await this.supabaseService.getUserFromToken(token);
 *     console.log(user.email, user.userType);
 *   } catch (error) {
 *     // Invalid or expired token
 *   }
 * }
 * ```
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { UserType } from '../common/enums/user-type.enum';

/**
 * Supabase service for database and auth operations
 *
 * Manages Supabase client instances and provides helper methods for
 * JWT validation and user profile retrieval.
 *
 * @class SupabaseService
 */
@Injectable()
export class SupabaseService {
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;
  private readonly supabaseServiceRoleKey: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('supabase.url')!;
    this.supabaseAnonKey = this.configService.get<string>('supabase.anonKey')!;
    this.supabaseServiceRoleKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    )!;
  }

  /**
   * Get user-scoped Supabase client (RLS enforced)
   *
   * Returns a Supabase client configured with the anon key.
   * If an access token is provided, sets the user context for RLS.
   *
   * **Use this for all user-initiated operations** to ensure Row Level Security
   * policies are properly enforced.
   *
   * @param {string} [accessToken] - Optional JWT access token to set user context
   * @returns {SupabaseClient} Supabase client with RLS enforcement
   *
   * @example
   * ```typescript
   * const client = this.supabaseService.getClient(userToken);
   * // This query respects RLS policies
   * const { data } = await client.from('cases').select('*');
   * ```
   */

  getClient(accessToken?: string): SupabaseClient<any, 'public', any> {
    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    });
  }

  /**
   * Get admin Supabase client (bypasses RLS)
   *
   * Returns a Supabase client configured with the service role key.
   * This client **bypasses all Row Level Security policies**.
   *
   * **⚠️ SECURITY WARNING:**
   * Only use this for legitimate admin operations that require bypassing RLS.
   * Document why RLS bypass is necessary when using this method.
   *
   * @returns {SupabaseClient} Supabase client with RLS bypass
   *
   * @example
   * ```typescript
   * // Admin operation: Generate report across all users
   * const client = this.supabaseService.getAdminClient();
   * const { data } = await client.from('cases').select('*');
   * // This bypasses RLS and returns ALL cases
   * ```
   */
  getAdminClient(): SupabaseClient<any, 'public', any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return createClient(this.supabaseUrl, this.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  /**
   * Validate JWT and retrieve authenticated user profile
   *
   * Validates the JWT token against Supabase Auth and fetches the corresponding
   * user profile from the user_profiles table.
   *
   * @param {string} accessToken - JWT access token from Authorization header
   * @returns {Promise<AuthUser>} Authenticated user profile
   * @throws {UnauthorizedException} If token is invalid, expired, or user profile not found
   *
   * @example
   * ```typescript
   * try {
   *   const user = await this.supabaseService.getUserFromToken(token);
   *   console.log(`User ${user.fullName} (${user.userType}) authenticated`);
   * } catch (error) {
   *   // Handle invalid token
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Used by JwtAuthGuard to populate request.user
   * const user = await this.supabaseService.getUserFromToken(token);
   * request.user = user;
   * ```
   */
  async getUserFromToken(accessToken: string): Promise<AuthUser> {
    try {
      const client = this.getClient(accessToken);

      // Validate JWT with Supabase Auth
      const {
        data: { user: authUser },
        error: authError,
      } = await client.auth.getUser(accessToken);

      if (authError || !authUser) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Fetch user profile with user_type
      const { data: profile, error: profileError } = await client
        .from('user_profiles')
        .select('full_name, phone_number, user_type')
        .eq('id', authUser.id)
        .single();

      if (profileError || !profile) {
        throw new UnauthorizedException('User profile not found');
      }

      // Map to AuthUser interface
      const profileData = profile as {
        full_name: string;
        phone_number: string | null;
        user_type: string;
      };

      const authenticatedUser: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        userType: profileData.user_type as UserType,
        fullName: profileData.full_name,
        phoneNumber: profileData.phone_number ?? null,
      };

      // Look up linked profile IDs based on user type
      if (profileData.user_type === UserType.CLIENT) {
        const { data: clientProfile } = await client
          .from('client_profiles')
          .select('id')
          .eq('user_profile_id', authUser.id)
          .single();
        if (clientProfile) {
          authenticatedUser.clientProfileId = (
            clientProfile as { id: string }
          ).id;
        }
      }

      return authenticatedUser;
    } catch (error: unknown) {
      // If it's already an UnauthorizedException, re-throw it
      if (
        error instanceof UnauthorizedException ||
        (typeof error === 'object' &&
          error !== null &&
          'name' in error &&
          error.name === 'UnauthorizedException')
      ) {
        throw error;
      }
      // Generic error message to prevent information leakage
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
