/**
 * Supabase Proxy Client
 *
 * Creates a Supabase client for use in Next.js proxy.
 * Handles session refresh on each request.
 *
 * @module SupabaseProxyClient
 *
 * @example
 * ```typescript
 * import { updateSession } from '@/lib/supabase/proxy';
 *
 * export async function proxy(request: NextRequest) {
 *   return await updateSession(request);
 * }
 * ```
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Refresh the Supabase session and return updated response
 *
 * Should be called in Next.js proxy to keep sessions fresh.
 *
 * @param request - Incoming Next.js request
 * @returns NextResponse with updated session cookies
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in proxy');
    return { supabaseResponse, user: null };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
