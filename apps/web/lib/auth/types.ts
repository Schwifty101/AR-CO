/**
 * Auth Types
 *
 * Re-exports shared types and defines frontend-only auth state.
 *
 * @module AuthTypes
 *
 * @example
 * ```typescript
 * import type { AuthUser, AuthState } from '@/lib/auth/types';
 * ```
 */

import type { AuthResponseUser } from '@repo/shared';

/** User information returned from the backend (re-exported from shared) */
export type AuthUser = AuthResponseUser;

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
export type { AuthResponse } from '@repo/shared';

/** Message-only response from backend */
export type { AuthMessage as AuthMessageResponse } from '@repo/shared';

/** Signup form data */
export type { SignupData } from '@repo/shared';
