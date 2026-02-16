'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { requestPasswordReset } from '@/lib/auth/auth-actions';
import { PasswordResetRequestSchema } from '@repo/shared';
import { motion } from 'framer-motion';
import styles from '@/components/auth/auth.module.css';

type FormData = z.infer<typeof PasswordResetRequestSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(PasswordResetRequestSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await requestPasswordReset(data.email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
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
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {submitted ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              padding: '1.5rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <p className={styles.subtitle} style={{ marginBottom: '1rem' }}>
                If an account with that email exists, a password reset link has been sent. Please check your email.
              </p>
              <Link href="/auth/signin" className={styles.link}>
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && <div className={styles.error}>{error}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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

                <button
                  type="submit"
                  className={styles.button}
                  disabled={isSubmitting}
                >
                  <span className={styles.buttonText}>
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </span>
                </button>
              </form>

              <div className={styles.footer}>
                <Link href="/auth/signin" className={styles.link}>
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
