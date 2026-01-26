/**
 * Auth Types
 *
 * Shared type definitions for the authentication system.
 *
 * @module AuthTypes
 *
 * @example
 * ```typescript
 * import type { AuthUser, AuthState } from '@/lib/auth/types';
 * ```
 */

/** User information returned from the backend */
export interface AuthUser {
  /** Supabase auth.users UUID */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  fullName: string;
  /** User's role: 'client' | 'admin' | 'attorney' | 'staff' */
  userType: string;
}

/** Authentication state managed by AuthContext */
export interface AuthState {
  /** Current authenticated user or null */
  user: AuthUser | null;
  /** Whether auth state is being determined */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
}

/** Auth response from backend API */
export interface AuthResponse {
  /** User profile info */
  user: AuthUser;
  /** JWT access token */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
}

/** Message-only response from backend */
export interface AuthMessageResponse {
  /** Status message */
  message: string;
}

/** Signup form data */
export interface SignupData {
  /** User's email */
  email: string;
  /** User's password */
  password: string;
  /** User's full name */
  fullName: string;
  /** Optional phone number */
  phoneNumber?: string;
}
