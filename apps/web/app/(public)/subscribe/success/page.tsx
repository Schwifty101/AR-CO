'use client';

/**
 * Subscription Success Page
 *
 * Called after Safepay redirects back from card tokenization.
 * Triggers subscription activation (first charge) and shows result.
 *
 * @module SubscribeSuccessPage
 */

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { activateSubscription } from '@/lib/api/subscriptions';
import styles from './page.module.css';

type ActivationState = 'loading' | 'success' | 'error';

export default function SubscribeSuccessPage() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ActivationState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const activatedRef = useRef(false);

  useEffect(() => {
    if (activatedRef.current) return;
    activatedRef.current = true;

    const tracker = searchParams.get('tracker');
    const subscriptionId = searchParams.get('subscription_id');

    if (!tracker || !subscriptionId) {
      setState('error');
      setErrorMessage('Missing payment information. Please try subscribing again.');
      return;
    }

    activateSubscription(subscriptionId, tracker)
      .then(() => {
        setState('success');
      })
      .catch((error: Error) => {
        setState('error');
        setErrorMessage(error.message || 'Subscription activation failed');
      });
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
