'use client';

/**
 * Sign-Up Form Component
 *
 * Redesigned with editorial luxury aesthetic matching the blogs page.
 * Registration form for client email/password accounts.
 *
 * @module SignupForm
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { OAuthButton } from './oauth-button';
import { useAuth } from '@/lib/auth/use-auth';
import { signUp, signInWithGoogle } from '@/lib/auth/auth-actions';
import { SignupSchema } from '@repo/shared';
import { motion } from 'framer-motion';
import styles from './auth.module.css';

/** Signup form validation schema (extends shared schema with confirmPassword) */
const signupFormSchema = SignupSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupFormSchema>;

/**
 * Client registration form
 */
export function SignupForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
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

  const handleSignUp = async (data: SignupFormData) => {
    try {
      setError(null);
      const result = await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
      });
      setUser(result.user);
      router.push('/client/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
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
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            Register for a client account
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <OAuthButton onClick={handleGoogleSignIn} isLoading={oauthLoading} />

        <div className={styles.divider}>
          <span className={styles.dividerText}>Or register with email</span>
        </div>

        <form onSubmit={handleSubmit(handleSignUp)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              className={styles.input}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className={styles.fieldError}>{errors.fullName.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-email" className={styles.label}>Email</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className={styles.label}>Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className={styles.input}
              {...register('password')}
            />
            {errors.password && (
              <p className={styles.fieldError}>{errors.password.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={styles.input}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className={styles.fieldError}>{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phoneNumber" className={styles.label}>
              Phone Number <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+92-300-1234567"
              autoComplete="tel"
              className={styles.input}
              {...register('phoneNumber')}
            />
            {errors.phoneNumber && (
              <p className={styles.fieldError}>{errors.phoneNumber.message}</p>
            )}
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isSubmitting}
          >
            <span className={styles.buttonText}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </span>
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link href="/auth/signin" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
