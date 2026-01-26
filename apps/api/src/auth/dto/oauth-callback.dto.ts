/**
 * OAuth Callback DTO
 *
 * Validates OAuth callback tokens after successful Google OAuth flow.
 * The frontend exchanges the auth code for tokens and sends them here.
 *
 * @module OAuthCallbackDto
 *
 * @example
 * ```typescript
 * const dto: OAuthCallbackDto = {
 *   accessToken: 'eyJhbGciOiJIUzI1NiIs...',
 *   refreshToken: 'v1.MjQ0OTUx...',
 * };
 * ```
 */

import { IsNotEmpty, IsString } from 'class-validator';

/** OAuth callback request body with Supabase session tokens */
export class OAuthCallbackDto {
  /** Supabase access token (JWT) obtained from code exchange */
  @IsString()
  @IsNotEmpty({ message: 'Access token is required' })
  accessToken!: string;

  /** Supabase refresh token for session renewal */
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;
}
