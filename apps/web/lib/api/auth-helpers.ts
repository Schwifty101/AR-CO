/**
 * Shared Authentication Helpers for API Clients
 *
 * Provides common utilities for authenticated API calls, including
 * session token retrieval and shared pagination interfaces.
 *
 * @module AuthHelpers
 *
 * @example
 * ```typescript
 * import { getSessionToken, PaginationParams } from '@/lib/api/auth-helpers';
 *
 * const token = await getSessionToken();
 * fetch('/api/endpoint', { headers: { Authorization: `Bearer ${token}` } });
 * ```
 */

import { createBrowserClient } from '@/lib/supabase/client';

/**
 * Retrieves the current session access token for authenticated API calls.
 *
 * @returns The JWT access token string
 * @throws Error if the user is not authenticated or session is expired
 *
 * @example
 * ```typescript
 * const token = await getSessionToken();
 * fetch('/api/endpoint', { headers: { Authorization: `Bearer ${token}` } });
 * ```
 */
export async function getSessionToken(): Promise<string> {
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session. Please sign in again.');
  }

  return session.access_token;
}

/** Pagination parameters for API list endpoints */
export interface PaginationParams {
  page?: number;
  limit?: number;
}
