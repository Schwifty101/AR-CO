import { z } from 'zod';
import { UserType } from '../enums';

/** Reusable password field schema (8-72 chars, uppercase+lowercase+digit) */
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  );

/** Signup request body for client email/password registration */
export const SignupSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .min(1, 'Email is required'),
  password: PasswordSchema,
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(255, 'Full name must not exceed 255 characters'),
  phoneNumber: z
    .string()
    .max(20, 'Phone number must not exceed 20 characters')
    .optional(),
});

/** Signin request body for email/password authentication */
export const SigninSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

/** OAuth callback request body with Supabase session tokens */
export const OAuthCallbackSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/** Refresh token request body */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/** Request body for initiating a password reset email */
export const PasswordResetRequestSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .min(1, 'Email is required'),
});

/** Request body for confirming a password reset */
export const PasswordResetConfirmSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  newPassword: PasswordSchema,
});

/** Public-safe user information returned in auth responses */
export const AuthResponseUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  userType: z.nativeEnum(UserType),
});

/** Standard auth response with tokens and user info */
export const AuthResponseSchema = z.object({
  user: AuthResponseUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

/** Response for operations that don't return tokens */
export const AuthMessageSchema = z.object({
  message: z.string(),
});
