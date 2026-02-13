import type { z } from 'zod';
import type {
  SignupSchema,
  SigninSchema,
  OAuthCallbackSchema,
  RefreshTokenSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  AuthResponseUserSchema,
  AuthResponseSchema,
  AuthMessageSchema,
} from '../schemas/auth.schemas';

/** Signup request data */
export type SignupData = z.infer<typeof SignupSchema>;

/** Signin request data */
export type SigninData = z.infer<typeof SigninSchema>;

/** OAuth callback request data */
export type OAuthCallbackData = z.infer<typeof OAuthCallbackSchema>;

/** Refresh token request data */
export type RefreshTokenData = z.infer<typeof RefreshTokenSchema>;

/** Password reset request data */
export type PasswordResetRequestData = z.infer<typeof PasswordResetRequestSchema>;

/** Password reset confirmation data */
export type PasswordResetConfirmData = z.infer<typeof PasswordResetConfirmSchema>;

/** Public-safe user info in auth responses */
export type AuthResponseUser = z.infer<typeof AuthResponseUserSchema>;

/** Standard auth response with tokens */
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/** Message-only auth response */
export type AuthMessage = z.infer<typeof AuthMessageSchema>;
