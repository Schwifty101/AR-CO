/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for use in browser/client components.
 * Uses the anon key and persists sessions in browser storage.
 *
 * @module SupabaseBrowserClient
 *
 * @example
 * ```typescript
 * 'use client';
 * import { createBrowserClient } from '@/lib/supabase/client';
 *
 * function MyComponent() {
 *   const supabase = createBrowserClient();
 *   // Use supabase for auth operations
 * }
 * ```
 */

import { createBrowserClient as createClient } from '@supabase/ssr';

/**
 * Create a Supabase client for browser usage
 *
 * @returns Supabase client configured for browser environment
 */
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
