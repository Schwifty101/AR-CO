'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBrowserClient } from '@/lib/supabase/client';
import { confirmPasswordReset } from '@/lib/auth/auth-actions';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    // Supabase sets the session from the recovery link hash
    const supabase = createBrowserClient();

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setAccessToken(session.access_token);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };

    void getSession();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!accessToken) {
      setError('Invalid or expired reset link. Please request a new one.');
      return;
    }

    try {
      setError(null);
      await confirmPasswordReset(accessToken, data.newPassword);
      setSuccess(true);
      setTimeout(() => router.push('/auth/signin'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Set new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 dark:bg-green-950 p-4 text-sm text-green-800 dark:text-green-200 text-center space-y-3">
            <p>Password has been reset successfully. Redirecting to sign in...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
                {error.includes('expired') && (
                  <div className="mt-2">
                    <Link
                      href="/auth/forgot-password"
                      className="underline underline-offset-4"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !accessToken}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
