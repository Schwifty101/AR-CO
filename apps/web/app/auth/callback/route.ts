/**
 * OAuth Callback Route Handler
 *
 * Processes the OAuth redirect from Supabase/Google.
 * Exchanges the auth code for a session, then notifies the backend
 * to create/fetch the user profile and determine the user type.
 * Falls back to querying user_profiles directly if backend is unavailable.
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
import { cookies } from 'next/headers';
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

  // 1. Try backend call first (creates profile if needed + logs event)
  let userType: string | null = null;
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
      userType = data.user.userType;
    } else {
      console.error('[OAuth Callback] Backend returned:', response.status);
    }
  } catch (err) {
    console.error('[OAuth Callback] Backend call failed:', err);
  }

  // 2. Fallback: check user_profiles directly via Supabase
  if (!userType) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', sessionData.user.id)
      .single();
    userType = (profile as { user_type: string } | null)?.user_type ?? null;
  }

  // 3. Check for auth_redirect cookie (e.g., from /subscribe flow)
  const cookieStore = await cookies();
  const authRedirect = cookieStore.get('auth_redirect')?.value;

  if (authRedirect) {
    const redirectPath = decodeURIComponent(authRedirect);
    const response = NextResponse.redirect(`${origin}${redirectPath}`);
    response.cookies.delete('auth_redirect');
    return response;
  }

  // 4. Default: redirect based on userType
  const dashboard =
    userType === 'admin' || userType === 'staff'
      ? '/admin/dashboard'
      : '/client/dashboard';

  return NextResponse.redirect(`${origin}${dashboard}`);
}
