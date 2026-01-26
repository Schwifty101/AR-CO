/**
 * Signin DTO
 *
 * Validates email/password signin requests.
 *
 * @module SigninDto
 *
 * @example
 * ```typescript
 * const dto: SigninDto = {
 *   email: 'client@example.com',
 *   password: 'SecureP@ss123',
 * };
 * ```
 */

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** Signin request body for email/password authentication */
export class SigninDto {
  /** User's email address */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  /** User's password */
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}
