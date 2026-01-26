/**
 * Auth Actions
 *
 * Client-side functions for authentication operations.
 * Manages Supabase auth and communicates with the backend API.
 *
 * @module AuthActions
 *
 * @example
 * ```typescript
 * import { signInWithGoogle, signInWithEmail, signUp } from '@/lib/auth/auth-actions';
 *
 * // Google OAuth
 * await signInWithGoogle();
 *
 * // Email/password signin
 * const result = await signInWithEmail('user@example.com', 'password');
 * ```
 */

import { createBrowserClient } from '@/lib/supabase/client';
import type { AuthResponse, SignupData } from './types';

/**
 * Initiate Google OAuth sign-in flow
 *
 * Redirects the user to Google's consent screen via Supabase Auth.
 * After consent, the user is redirected to /auth/callback.
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Sign in with email and password
 *
 * Authenticates via the backend API (not directly with Supabase)
 * to ensure profile creation and activity logging.
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Auth response with user info and tokens
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Sign in failed');
  }

  const data = (await response.json()) as AuthResponse;

  // Set the session in the browser Supabase client
  const supabase = createBrowserClient();
  await supabase.auth.setSession({
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
  });

  return data;
}

/**
 * Register a new client account with email/password
 *
 * @param signupData - Registration form data
 * @returns Auth response with user info and tokens
 */
export async function signUp(signupData: SignupData): Promise<AuthResponse> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signupData),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Sign up failed');
  }

  const data = (await response.json()) as AuthResponse;

  // Set the session in the browser Supabase client
  const supabase = createBrowserClient();
  await supabase.auth.setSession({
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
  });

  return data;
}

/**
 * Sign out the current user
 *
 * Clears the Supabase session and notifies the backend.
 */
export async function signOut(): Promise<void> {
  // Notify backend (best-effort)
  try {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    }
  } catch {
    // Signout notification is best-effort
  }

  // Clear client-side session
  const supabase = createBrowserClient();
  await supabase.auth.signOut();
}

/**
 * Request a password reset email
 *
 * @param email - Email address to send reset link to
 * @returns Success message
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ message: string }> {
  const response = await fetch('/api/auth/password-reset/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return (await response.json()) as { message: string };
}

/**
 * Confirm password reset with new password
 *
 * @param accessToken - Token from the reset link
 * @param newPassword - New password
 * @returns Success message
 */
export async function confirmPasswordReset(
  accessToken: string,
  newPassword: string,
): Promise<{ message: string }> {
  const response = await fetch('/api/auth/password-reset/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, newPassword }),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Password reset failed');
  }

  return (await response.json()) as { message: string };
}
