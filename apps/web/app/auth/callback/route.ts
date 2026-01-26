/**
 * OAuth Callback Route Handler
 *
 * Processes the OAuth redirect from Supabase/Google.
 * Exchanges the auth code for a session, then notifies the backend
 * to create/fetch the user profile and determine the user type.
 *
 * @module OAuthCallbackRoute
 *
 * @example
 * ```
 * // Supabase redirects here after Google OAuth consent:
 * GET /auth/callback?code=xxx
 * ```
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/signin?error=missing_code`);
  }

  const supabase = await createServerClient();

  const { data: sessionData, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !sessionData.session) {
    return NextResponse.redirect(`${origin}/auth/signin?error=exchange_failed`);
  }

  // Notify backend to create/fetch profile and determine user type
  try {
    const backendUrl =
      process.env.API_BACKEND_URL || 'http://localhost:4000';

    const response = await fetch(`${backendUrl}/api/auth/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        user: { userType: string };
      };

      const dashboard =
        data.user.userType === 'admin' || data.user.userType === 'staff'
          ? '/admin/dashboard'
          : '/client/dashboard';

      return NextResponse.redirect(`${origin}${dashboard}`);
    }
  } catch {
    // If backend call fails, redirect to a default dashboard
  }

  // Fallback: redirect to client dashboard
  return NextResponse.redirect(`${origin}/client/dashboard`);
}
