import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      `${origin}/auth/signin?error=invalid_confirmation_link`,
    );
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error || !data.session || !data.user) {
    return NextResponse.redirect(
      `${origin}/auth/signin?error=confirmation_failed`,
    );
  }

  // Create user profile via backend (same endpoint as OAuth)
  let userType: string | null = null;
  try {
    const backendUrl =
      process.env.API_BACKEND_URL || 'http://localhost:4000';

    const response = await fetch(`${backendUrl}/api/auth/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      }),
    });

    if (response.ok) {
      const result = (await response.json()) as {
        user: { userType: string };
      };
      userType = result.user.userType;
    }
  } catch (err) {
    console.error('[Email Confirm] Backend call failed:', err);
  }

  // Fallback: check user_profiles directly
  if (!userType) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', data.user.id)
      .single();
    userType = (profile as { user_type: string } | null)?.user_type ?? null;
  }

  const dashboard =
    userType === 'admin' || userType === 'staff' || userType === 'attorney'
      ? '/admin/dashboard'
      : '/client/dashboard';

  return NextResponse.redirect(`${origin}${dashboard}`);
}
