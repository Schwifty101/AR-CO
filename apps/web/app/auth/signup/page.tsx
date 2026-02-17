import { Suspense } from 'react';
import { SignupForm } from '@/components/auth/signup-form';
import styles from '@/components/auth/auth.module.css';

export const metadata = {
  title: 'Create Account | AR&CO Law Firm',
  description: 'Create a client account with AR&CO',
};

export default function SignupPage() {
  return (
    <div className={styles.page}>
      <div className={styles.atmosphereGlow} />
      <div className={styles.grainOverlay} />
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
