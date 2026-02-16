import { Suspense } from 'react';
import { SigninForm } from '@/components/auth/signin-form';
import styles from '@/components/auth/auth.module.css';

export const metadata = {
  title: 'Sign In | AR&CO Law Firm',
  description: 'Sign in to your AR&CO account',
};

export default function SigninPage() {
  return (
    <div className={styles.page}>
      <div className={styles.atmosphereGlow} />
      <div className={styles.grainOverlay} />
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <SigninForm />
      </Suspense>
    </div>
  );
}
