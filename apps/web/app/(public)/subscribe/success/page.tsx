'use client';

/**
 * Subscription Success Page
 *
 * Called after Safepay redirects back from card tokenization.
 * Fetches the user's pending subscription from the API, then
 * triggers activation (first charge) and shows result.
 *
 * @module SubscribeSuccessPage
 */

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { activateSubscription, getMySubscription } from '@/lib/api/subscriptions';
import styles from './page.module.css';

type ActivationState = 'loading' | 'success' | 'error';

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <Loader2 className={`${styles.icon} ${styles.spinning}`} />
          </div>
        </div>
      </div>
    }>
      <SubscribeSuccessContent />
    </Suspense>
  );
}

function SubscribeSuccessContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ActivationState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const activatedRef = useRef(false);

  useEffect(() => {
    if (activatedRef.current) return;
    activatedRef.current = true;

    // Tracker may or may not be in URL depending on Safepay redirect behavior
    const tracker = searchParams.get('tracker') || undefined;

    async function activate() {
      // Fetch the user's subscription to get its ID and status
      let subscription;
      try {
        subscription = await getMySubscription();
      } catch {
        setState('error');
        setErrorMessage('Could not find your subscription. Please sign in and try again.');
        return;
      }

      // Already active — show success immediately
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

      // Activate: charge first month
      try {
        await activateSubscription(subscription.id, tracker);
        setState('success');
      } catch (error: unknown) {
        setState('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Subscription activation failed',
        );
      }
    }

    activate();
  }, [searchParams]);

  return (
    <div className={styles.page}>
      <div className={styles.atmosphereGlow} />
      <div className={styles.grainOverlay} />

      <div className={styles.container}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {state === 'loading' && (
            <>
              <div className={styles.iconWrapper}>
                <Loader2 className={`${styles.icon} ${styles.spinning}`} />
              </div>
              <h1 className={styles.title}>Activating Subscription</h1>
              <p className={styles.subtitle}>
                Processing your first payment...
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
      </div>
    </div>
  );
}
