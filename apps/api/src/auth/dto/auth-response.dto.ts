/**
 * Auth Response DTO
 *
 * Standard response shapes for authentication endpoints.
 *
 * @module AuthResponseDto
 *
 * @example
 * ```typescript
 * const response: AuthResponseDto = {
 *   user: {
 *     id: '123e4567-e89b-12d3-a456-426614174000',
 *     email: 'client@example.com',
 *     fullName: 'John Doe',
 *     userType: 'client',
 *   },
 *   accessToken: 'eyJhbGciOiJIUzI1NiIs...',
 *   refreshToken: 'v1.MjQ0OTUx...',
 * };
 * ```
 */

/** Public-safe user information returned in auth responses */
export interface AuthResponseUser {
  /** Supabase auth.users UUID */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  fullName: string;
  /** User's role in the system */
  userType: string;
}

/** Standard auth response with tokens and user info */
export interface AuthResponseDto {
  /** Public user information */
  user: AuthResponseUser;
  /** JWT access token */
  accessToken: string;
  /** Refresh token for session renewal */
  refreshToken: string;
}

/** Response for operations that don't return tokens */
export interface AuthMessageDto {
  /** Human-readable status message */
  message: string;
}
