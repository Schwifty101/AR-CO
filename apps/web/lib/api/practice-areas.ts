/**
 * Practice Areas API Client
 *
 * Client-side functions for fetching practice areas.
 * Used by admin forms for practice area dropdown selection.
 *
 * @module PracticeAreasAPI
 *
 * @example
 * ```typescript
 * import { getPracticeAreas } from '@/lib/api/practice-areas';
 *
 * const areas = await getPracticeAreas();
 * // [{ id: 'uuid', name: 'Corporate Law' }, ...]
 * ```
 */

import { createBrowserClient } from '@/lib/supabase/client';

/** Practice area shape returned by the API */
export interface PracticeArea {
  /** UUID primary key */
  id: string;
  /** Display name */
  name: string;
}

/**
 * Gets the current user's session token from Supabase
 *
 * @returns JWT access token
 * @throws Error if no session exists
 */
async function getSessionToken(): Promise<string> {
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session. Please sign in again.');
  }

  return session.access_token;
}

/**
 * Fetch all practice areas
 *
 * @returns Array of practice areas sorted by name
 * @throws Error if request fails or user is not authenticated
 *
 * @example
 * ```typescript
 * const areas = await getPracticeAreas();
 * areas.forEach(a => console.log(a.id, a.name));
 * ```
 */
export async function getPracticeAreas(): Promise<PracticeArea[]> {
  const token = await getSessionToken();

  const response = await fetch('/api/practice-areas', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch practice areas');
  }

  return (await response.json()) as PracticeArea[];
}
