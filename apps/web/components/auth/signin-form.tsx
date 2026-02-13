'use client';

/**
 * Sign-In Form Component
 *
 * Redesigned with editorial luxury aesthetic matching the blogs page.
 * Tabbed form supporting Google OAuth and email/password sign-in.
 *
 * @module SigninForm
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { OAuthButton } from './oauth-button';
import { useAuth } from '@/lib/auth/use-auth';
import { signInWithGoogle, signInWithEmail } from '@/lib/auth/auth-actions';
import { SigninSchema } from '@repo/shared';
import { motion } from 'framer-motion';
import styles from './auth.module.css';

type SigninFormData = z.infer<typeof SigninSchema>;

export function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'google' | 'email'>('google');
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(SigninSchema),
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
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>
            Choose your preferred sign-in method
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.tabs}>
          <div className={styles.tabsList}>
            <button
              type="button"
              className={`${styles.tabsTrigger} ${activeTab === 'google' ? styles.tabsTriggerActive : ''}`}
              onClick={() => setActiveTab('google')}
            >
              Google
            </button>
            <button
              type="button"
              className={`${styles.tabsTrigger} ${activeTab === 'email' ? styles.tabsTriggerActive : ''}`}
              onClick={() => setActiveTab('email')}
            >
              Email
            </button>
          </div>

          {activeTab === 'google' && (
            <div className={styles.tabsContent}>
              <OAuthButton onClick={handleGoogleSignIn} isLoading={oauthLoading} />
              <p className={styles.subtitle} style={{ textAlign: 'center', marginTop: '1rem' }}>
                Admin users must sign in with Google
              </p>
            </div>
          )}

          {activeTab === 'email' && (
            <div className={styles.tabsContent}>
              <form onSubmit={handleSubmit(handleEmailSignIn)} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={styles.input}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className={styles.fieldError}>{errors.email.message}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={styles.input}
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className={styles.fieldError}>{errors.password.message}</p>
                  )}
                </div>

                <div className={styles.forgotPassword}>
                  <Link href="/auth/forgot-password" className={styles.link}>
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className={styles.button}
                  disabled={isSubmitting}
                >
                  <span className={styles.buttonText}>
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{' '}
            <Link href="/auth/signup" className={styles.link}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
