/**
 * Next.js Middleware
 *
 * Handles session refresh and route protection for the AR-CO platform.
 * - Refreshes Supabase session on each request
 * - Protects /admin/* and /client/* routes
 * - Redirects authenticated users away from /auth/*
 * - Routes users based on user_type after auth
 *
 * @module Middleware
 *
 * @example
 * ```typescript
 * // Matched routes are processed by this middleware:
 * // /auth/signin -> redirects to dashboard if authenticated
 * // /admin/dashboard -> redirects to /auth/signin if not authenticated
 * // /client/dashboard -> redirects to /auth/signin if not authenticated
 * ```
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/** Routes that require authentication */
const PROTECTED_ROUTES = ['/admin', '/client'];

/** Routes that should redirect authenticated users */
const AUTH_ROUTES = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];

/**
 * Middleware function
 *
 * Runs on every matched request to handle auth routing.
 */
export async function proxy(request: NextRequest) {
  try {
    const { supabaseResponse, user } = await updateSession(request);
    const { pathname } = request.nextUrl;

    // Check if user is accessing a protected route
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route),
    );

    // Check if user is accessing an auth route
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !user) {
      // Redirect unauthenticated users to sign in
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && user) {
      // Redirect authenticated users to their dashboard
      // Fetch user type from backend to determine dashboard
      try {
        const backendUrl = process.env.API_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(
          `${backendUrl}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${(await getAccessToken(request)) || ''}`,
            },
          },
        );

        if (response.ok) {
          const userData = (await response.json()) as { userType: string };
          const url = request.nextUrl.clone();
          url.pathname =
            userData.userType === 'admin' || userData.userType === 'staff'
              ? '/admin/dashboard'
              : '/client/dashboard';
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error('Error fetching user type:', error);
        // If we can't determine user type, let them through
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return next response on any error to prevent blocking
    return NextResponse.next();
  }
}

/**
 * Extract access token from Supabase cookies
 */
async function getAccessToken(request: NextRequest): Promise<string | null> {
  const cookies = request.cookies.getAll();
  const sbCookie = cookies.find(
    (c) => c.name.includes('auth-token') && c.name.includes('sb-'),
  );

  if (!sbCookie) return null;

  try {
    const parsed = JSON.parse(sbCookie.value) as { access_token?: string };
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

/** Configure which routes this middleware runs on */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser icon)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
