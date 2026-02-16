'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createBrowserClient } from '@/lib/supabase/client';
import { confirmPasswordReset } from '@/lib/auth/auth-actions';
import { PasswordSchema } from '@repo/shared';
import { motion } from 'framer-motion';
import styles from '@/components/auth/auth.module.css';

const schema = z
  .object({
    newPassword: PasswordSchema,
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
    <div className={styles.page}>
      <div className={styles.atmosphereGlow} />
      <div className={styles.grainOverlay} />

      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Set New Password</h1>
            <p className={styles.subtitle}>
              Enter your new password below
            </p>
          </div>

          {success ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p className={styles.subtitle}>
                Password has been reset successfully. Redirecting to sign in...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className={styles.error}>
                  {error}
                  {error.includes('expired') && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <Link href="/auth/forgot-password" className={styles.link}>
                        Request a new reset link
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.label}>New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className={styles.input}
                    {...register('newPassword')}
                  />
                  {errors.newPassword && (
                    <p className={styles.fieldError}>{errors.newPassword.message}</p>
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

                <button
                  type="submit"
                  className={styles.button}
                  disabled={isSubmitting || !accessToken}
                >
                  <span className={styles.buttonText}>
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
