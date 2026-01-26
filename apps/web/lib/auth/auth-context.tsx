/**
 * Auth Context
 *
 * Provides authentication state and methods to the component tree.
 * Listens to Supabase auth state changes and syncs with backend.
 *
 * @module AuthContext
 *
 * @example
 * ```typescript
 * // Wrap app in provider (layout.tsx)
 * import { AuthProvider } from '@/lib/auth/auth-context';
 *
 * export default function Layout({ children }) {
 *   return <AuthProvider>{children}</AuthProvider>;
 * }
 * ```
 */

'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { AuthState, AuthUser } from './types';

/** Context value shape with state and actions */
export interface AuthContextValue extends AuthState {
  /** Refresh the current user from the backend */
  refreshUser: () => Promise<void>;
  /** Clear auth state (called after signout) */
  clearAuth: () => void;
  /** Set user directly (called after successful auth) */
  setUser: (user: AuthUser) => void;
}

/** Auth context instance */
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

/** Props for AuthProvider */
interface AuthProviderProps {
  /** Child components */
  children: ReactNode;
}

/**
 * Auth provider component
 *
 * Wraps the app to provide auth state and methods.
 * Listens to Supabase auth state changes.
 *
 * @param props - Provider props with children
 * @returns Provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUserState(null);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const userData = (await response.json()) as AuthUser;
        setUserState(userData);
      } else {
        setUserState(null);
      }
    } catch {
      setUserState(null);
    }
  }, []);

  const clearAuth = useCallback(() => {
    setUserState(null);
  }, []);

  const setUser = useCallback((newUser: AuthUser) => {
    setUserState(newUser);
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient();

    // Check initial session
    const initAuth = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setUserState(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      refreshUser,
      clearAuth,
      setUser,
    }),
    [user, isLoading, refreshUser, clearAuth, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
