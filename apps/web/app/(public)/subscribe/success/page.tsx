'use client';

/**
 * Subscription Success Page
 *
 * Displayed after successful payment completion via Safepay.
 * Redesigned with editorial luxury aesthetic matching the blogs page.
 *
 * @module SubscribeSuccessPage
 */

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function SubscribeSuccessPage() {
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
            <CheckCircle2 className={styles.icon} />
          </div>

          <h1 className={styles.title}>Subscription Activated</h1>
          <p className={styles.subtitle}>
            Your Civic Retainer subscription has been successfully activated
          </p>

          <div className={styles.nextSteps}>
            <p className={styles.nextStepsTitle}>What's Next?</p>
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

          <Link href="/client/subscription" className={styles.button}>
            <span className={styles.buttonText}>Go to Subscription Dashboard</span>
          </Link>

          <p className={styles.note}>
            You will receive a confirmation email shortly with your subscription details.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
