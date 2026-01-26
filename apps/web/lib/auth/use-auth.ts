/**
 * useAuth Hook
 *
 * Provides access to authentication state and actions.
 * Must be used within an AuthProvider.
 *
 * @module useAuth
 *
 * @example
 * ```typescript
 * 'use client';
 * import { useAuth } from '@/lib/auth/use-auth';
 *
 * function ProfileButton() {
 *   const { user, isAuthenticated, isLoading } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <LoginButton />;
 *   return <span>{user.fullName}</span>;
 * }
 * ```
 */

'use client';

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from './auth-context';

/**
 * Access authentication state and actions
 *
 * @returns Auth context value with user state and methods
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```typescript
 * const { user, isAuthenticated, refreshUser, clearAuth } = useAuth();
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
