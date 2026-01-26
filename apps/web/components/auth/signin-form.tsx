'use client';

/**
 * Sign-In Form Component
 *
 * Tabbed form supporting Google OAuth and email/password sign-in.
 * Admin users must use Google OAuth; clients can use either method.
 *
 * @module SigninForm
 *
 * @example
 * ```typescript
 * <SigninForm />
 * ```
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OAuthButton } from './oauth-button';
import { useAuth } from '@/lib/auth/use-auth';
import { signInWithGoogle, signInWithEmail } from '@/lib/auth/auth-actions';

/** Email/password validation schema */
const signinSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SigninFormData = z.infer<typeof signinSchema>;

/**
 * Sign-in form with Google OAuth and email/password tabs
 */
export function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setOauthLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setOauthLoading(false);
    }
  };

  const handleEmailSignIn = async (data: SigninFormData) => {
    try {
      setError(null);
      const result = await signInWithEmail(data.email, data.password);
      setUser(result.user);

      const destination =
        redirectTo ||
        (result.user.userType === 'admin' || result.user.userType === 'staff'
          ? '/admin/dashboard'
          : '/client/dashboard');

      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose your preferred sign-in method
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs defaultValue="google" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4 pt-4">
          <OAuthButton onClick={handleGoogleSignIn} isLoading={oauthLoading} />
          <p className="text-xs text-center text-muted-foreground">
            Admin users must sign in with Google
          </p>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 pt-4">
          <form
            onSubmit={handleSubmit(handleEmailSignIn)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm">
            <Link
              href="/auth/forgot-password"
              className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
            <Link
              href="/auth/signup"
              className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
