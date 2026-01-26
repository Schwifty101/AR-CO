import { Suspense } from 'react';
import { SigninForm } from '@/components/auth/signin-form';

export const metadata = {
  title: 'Sign In | AR&CO Law Firm',
  description: 'Sign in to your AR&CO account',
};

export default function SigninPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <SigninForm />
      </Suspense>
    </div>
  );
}
