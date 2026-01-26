/**
 * Password Reset DTOs
 *
 * Validates password reset request and confirmation payloads.
 *
 * @module PasswordResetDto
 *
 * @example
 * ```typescript
 * // Request a password reset
 * const request: PasswordResetRequestDto = {
 *   email: 'client@example.com',
 * };
 *
 * // Confirm password reset with new password
 * const confirm: PasswordResetConfirmDto = {
 *   accessToken: 'eyJhbGciOiJIUzI1NiIs...',
 *   newPassword: 'NewSecureP@ss456',
 * };
 * ```
 */

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Request body for initiating a password reset email */
export class PasswordResetRequestDto {
  /** Email address to send the reset link to */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
}

/** Request body for confirming a password reset */
export class PasswordResetConfirmDto {
  /** Access token from the password reset link */
  @IsString()
  @IsNotEmpty({ message: 'Access token is required' })
  accessToken!: string;

  /** New password meeting security requirements */
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword!: string;
}
