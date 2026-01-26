/**
 * Refresh Token DTO
 *
 * Validates token refresh requests.
 *
 * @module RefreshTokenDto
 *
 * @example
 * ```typescript
 * const dto: RefreshTokenDto = {
 *   refreshToken: 'v1.MjQ0OTUx...',
 * };
 * ```
 */

import { IsNotEmpty, IsString } from 'class-validator';

/** Refresh token request body */
export class RefreshTokenDto {
  /** Supabase refresh token */
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;
}
