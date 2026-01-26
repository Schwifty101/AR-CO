/**
 * Signup DTO
 *
 * Validates email/password signup requests for client users.
 * Admin users are blocked from email/password signup and must use Google OAuth.
 *
 * @module SignupDto
 *
 * @example
 * ```typescript
 * const dto: SignupDto = {
 *   email: 'client@example.com',
 *   password: 'SecureP@ss123',
 *   fullName: 'John Doe',
 *   phoneNumber: '+92-300-1234567',
 * };
 * ```
 */

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

/** Signup request body for client email/password registration */
export class SignupDto {
  /** Client's email address */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  /**
   * Password with minimum security requirements.
   * Must be at least 8 characters with one uppercase, one lowercase, and one number.
   */
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  /** Client's full display name */
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
  fullName!: string;

  /** Optional phone number for WhatsApp notifications */
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phoneNumber?: string;
}
