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
  useRef,
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
 * Fetch user profile from backend using the given access token.
 *
 * @param accessToken - JWT access token
 * @returns AuthUser if successful, null otherwise
 */
async function fetchUserFromBackend(
  accessToken: string,
): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.ok) {
      return (await response.json()) as AuthUser;
    }
  } catch {
    // Network error — return null
  }
  return null;
}

/**
 * Auth provider component
 *
 * Wraps the app to provide auth state and methods.
 * Uses onAuthStateChange as single source of truth to avoid
 * concurrent getSession() calls that deadlock on navigator.locks.
 *
 * @param props - Provider props with children
 * @returns Provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initDone = useRef(false);

  const refreshUser = useCallback(async () => {
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setUserState(null);
      return;
    }

    const userData = await fetchUserFromBackend(session.access_token);
    setUserState(userData);
  }, []);

  const clearAuth = useCallback(() => {
    setUserState(null);
  }, []);

  const setUser = useCallback((newUser: AuthUser) => {
    setUserState(newUser);
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient();

    // Use onAuthStateChange as the ONLY way to get the session.
    // This avoids calling getSession() concurrently which deadlocks
    // on the navigator.locks API in @supabase/supabase-js.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED'
      ) {
        if (session) {
          // Print bearer token to console on sign in
          if (event === 'SIGNED_IN') {
            console.log('Bearer Token:', session.access_token);
          }
          const userData = await fetchUserFromBackend(session.access_token);
          setUserState(userData);
        } else {
          setUserState(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserState(null);
      }

      // Mark loading done after first event (INITIAL_SESSION)
      if (!initDone.current) {
        initDone.current = true;
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
