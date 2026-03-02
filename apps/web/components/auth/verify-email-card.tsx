'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import styles from './auth.module.css';

const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyEmailCard() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || !email) return;
    setResendStatus('sending');
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setResendStatus('sent');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setResendStatus('error');
    }
  }, [email, resendCooldown]);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.card}>
        {/* Mail icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ fontSize: '3rem', lineHeight: 1 }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--heritage-gold)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: '0 auto' }}
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </motion.div>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Check Your Inbox</h1>
          <p className={styles.subtitle}>
            We&apos;ve sent a confirmation link to
          </p>
          {email && (
            <p style={{
              color: 'var(--heritage-gold)',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '0.95rem',
              marginTop: '0.5rem',
              wordBreak: 'break-all',
            }}>
              {email}
            </p>
          )}
        </div>

        <p style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: '0.85rem',
          lineHeight: 1.7,
          color: 'rgba(249, 248, 246, 0.45)',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          Click the link in the email to activate your account. If you don&apos;t see it, check your spam folder.
        </p>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || resendStatus === 'sending'}
          className={styles.button}
          style={{ marginBottom: '1rem' }}
        >
          <span className={styles.buttonText}>
            {resendStatus === 'sending'
              ? 'Sending...'
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Confirmation Email'}
          </span>
        </button>

        {resendStatus === 'sent' && (
          <p style={{
            textAlign: 'center',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: '0.8rem',
            color: 'rgba(134, 239, 172, 0.8)',
            marginBottom: '0.5rem',
          }}>
            Confirmation email resent successfully.
          </p>
        )}

        {resendStatus === 'error' && (
          <p style={{
            textAlign: 'center',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: '0.8rem',
            color: 'rgb(252, 165, 165)',
            marginBottom: '0.5rem',
          }}>
            Failed to resend. Please wait a moment and try again.
          </p>
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Wrong email?{' '}
            <Link href="/auth/signup" className={styles.link}>
              Sign up again
            </Link>
          </p>
          <p className={styles.footerText} style={{ marginTop: '0.5rem' }}>
            Already confirmed?{' '}
            <Link href="/auth/signin" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
