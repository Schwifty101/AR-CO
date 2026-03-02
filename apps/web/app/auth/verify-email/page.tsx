import { Suspense } from 'react';
import { VerifyEmailCard } from '@/components/auth/verify-email-card';
import styles from '@/components/auth/auth.module.css';

export const metadata = {
  title: 'Verify Your Email | AR&CO Law Firm',
  description: 'Check your inbox to confirm your email address',
};

export default function VerifyEmailPage() {
  return (
    <div className={styles.page}>
      <div className={styles.atmosphereGlow} />
      <div className={styles.grainOverlay} />
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <VerifyEmailCard />
      </Suspense>
    </div>
  );
}
