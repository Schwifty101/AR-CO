'use client';

/**
 * Subscription Success Page
 *
 * Called after Safepay redirects back from card tokenization.
 * Initiates activation (async charge), then polls for status
 * until the webhook confirms payment and activates subscription.
 *
 * @module SubscribeSuccessPage
 */

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { activateSubscription, getMySubscription } from '@/lib/api/subscriptions';
import styles from './page.module.css';

type PageState = 'loading' | 'polling' | 'success' | 'timeout' | 'error';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60000;

function SubscribeSuccessContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<PageState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const activatedRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (activatedRef.current) return;
    activatedRef.current = true;

    const tracker = searchParams.get('tracker') || undefined;

    async function activate() {
      let subscription;
      try {
        subscription = await getMySubscription();
      } catch {
        setState('error');
        setErrorMessage('Could not find your subscription. Please sign in and try again.');
        return;
      }

      // Already active — show success
      if (subscription.status === 'active') {
        setState('success');
        return;
      }

      // Not pending — can't activate
      if (subscription.status !== 'pending') {
        setState('error');
        setErrorMessage(`Subscription status is "${subscription.status}". Please contact support.`);
        return;
      }

      // Initiate activation (async charge — returns pending)
      try {
        await activateSubscription(subscription.id, tracker);
      } catch (error: unknown) {
        setState('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Subscription activation failed',
        );
        return;
      }

      // Start polling for status change
      setState('polling');

      pollTimerRef.current = setInterval(async () => {
        try {
          const updated = await getMySubscription();
          if (updated.status === 'active') {
            stopPolling();
            setState('success');
          }
        } catch {
          // Ignore poll errors — keep trying
        }
      }, POLL_INTERVAL_MS);

      // Timeout after 60s
      timeoutTimerRef.current = setTimeout(() => {
        stopPolling();
        setState('timeout');
      }, POLL_TIMEOUT_MS);
    }

    activate();

    return () => stopPolling();
  }, [searchParams, stopPolling]);

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {(state === 'loading' || state === 'polling') && (
        <>
          <div className={styles.iconWrapper}>
            <Loader2 className={`${styles.icon} ${styles.spinning}`} />
          </div>
          <h1 className={styles.title}>
            {state === 'loading' ? 'Activating Subscription' : 'Processing Payment'}
          </h1>
          <p className={styles.subtitle}>
            {state === 'loading'
              ? 'Setting up your subscription...'
              : 'Your payment is being processed. This usually takes a few seconds...'}
          </p>
        </>
      )}

      {state === 'success' && (
        <>
          <div className={styles.iconWrapper}>
            <CheckCircle2 className={styles.icon} />
          </div>

          <h1 className={styles.title}>Subscription Activated</h1>
          <p className={styles.subtitle}>
            Your Civic Retainer subscription has been successfully activated
          </p>

          <div className={styles.nextSteps}>
            <p className={styles.nextStepsTitle}>What&apos;s Next?</p>
            <ul className={styles.stepsList}>
              <li className={styles.stepItem}>
                <CheckCircle2 className={styles.stepIcon} />
                <span className={styles.stepText}>
                  Access your subscription details in the client portal
                </span>
              </li>
              <li className={styles.stepItem}>
                <CheckCircle2 className={styles.stepIcon} />
                <span className={styles.stepText}>
                  Start submitting complaints against government organizations
                </span>
              </li>
              <li className={styles.stepItem}>
                <CheckCircle2 className={styles.stepIcon} />
                <span className={styles.stepText}>
                  Track your complaint status and receive legal guidance
                </span>
              </li>
            </ul>
          </div>

          <Link href="/client/dashboard" className={styles.button}>
            <span className={styles.buttonText}>Go to Dashboard</span>
          </Link>

          <p className={styles.note}>
            You will receive a confirmation email shortly with your subscription details.
          </p>
        </>
      )}

      {state === 'timeout' && (
        <>
          <div className={styles.iconWrapper}>
            <Clock className={styles.icon} />
          </div>

          <h1 className={styles.title}>Payment Processing</h1>
          <p className={styles.subtitle}>
            Your payment is being processed. You&apos;ll receive confirmation shortly.
            Check your subscription status in your dashboard.
          </p>

          <Link href="/client/dashboard" className={styles.button}>
            <span className={styles.buttonText}>Go to Dashboard</span>
          </Link>
        </>
      )}

      {state === 'error' && (
        <>
          <div className={styles.iconWrapper}>
            <AlertCircle className={styles.icon} />
          </div>

          <h1 className={styles.title}>Activation Failed</h1>
          <p className={styles.subtitle}>{errorMessage}</p>

          <Link href="/subscribe" className={styles.button}>
            <span className={styles.buttonText}>Try Again</span>
          </Link>
        </>
      )}
    </motion.div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <div className={styles.page}>
      <div className={styles.atmosphereGlow} />
      <div className={styles.grainOverlay} />

      <div className={styles.container}>
        <Suspense
          fallback={
            <div className={styles.card}>
              <div className={styles.iconWrapper}>
                <Loader2 className={`${styles.icon} ${styles.spinning}`} />
              </div>
              <h1 className={styles.title}>Loading...</h1>
            </div>
          }
        >
          <SubscribeSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
