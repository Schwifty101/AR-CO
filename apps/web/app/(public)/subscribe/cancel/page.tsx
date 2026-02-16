'use client';

/**
 * Subscription Cancel Page
 *
 * Displayed when user cancels the payment process at Safepay checkout.
 * Redesigned with editorial luxury aesthetic matching the blogs page.
 *
 * @module SubscribeCancelPage
 */

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function SubscribeCancelPage() {
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
          <div className={styles.iconWrapper}>
            <XCircle className={styles.icon} />
          </div>

          <h1 className={styles.title}>Subscription Cancelled</h1>
          <p className={styles.subtitle}>
            Your payment was not completed and the subscription was not activated
          </p>

          <div className={styles.message}>
            <p>
              If you experienced any issues during the payment process, please try again or contact our support team for assistance.
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <Link href="/subscribe" className={styles.button}>
              <span className={styles.buttonText}>Try Again</span>
            </Link>
            <Link href="/" className={`${styles.button} ${styles.buttonSecondary}`}>
              <span className={styles.buttonText}>Return to Homepage</span>
            </Link>
          </div>

          <p className={styles.note}>
            Need help? Contact us at{' '}
            <a href="mailto:support@arco.com" className={styles.contactLink}>
              support@arco.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
