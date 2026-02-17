'use client';

/**
 * Subscription Success Page
 *
 * Placeholder - subscription service removed.
 *
 * @module SubscribeSuccessPage
 */

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
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
            <AlertCircle className={styles.icon} />
          </div>

          <h1 className={styles.title}>Service Unavailable</h1>
          <p className={styles.subtitle}>
            The subscription service is currently unavailable.
          </p>

          <Link href="/client/dashboard" className={styles.button}>
            <span className={styles.buttonText}>Go to Dashboard</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
