/**
 * Supabase Server Client
 *
 * Creates a Supabase client for use in server components, route handlers,
 * and server actions. Uses cookies for session management.
 *
 * @module SupabaseServerClient
 *
 * @example
 * ```typescript
 * import { createServerClient } from '@/lib/supabase/server';
 *
 * export default async function Page() {
 *   const supabase = await createServerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 * }
 * ```
 */

import { createServerClient as createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for server-side usage
 *
 * Reads and writes cookies for session management.
 *
 * @returns Promise resolving to a Supabase client configured for server environment
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component — can be ignored
            // if middleware refreshes the session
          }
        },
      },
    },
  );
}
