import { SignupForm } from '@/components/auth/signup-form';

export const metadata = {
  title: 'Create Account | AR&CO Law Firm',
  description: 'Create a client account with AR&CO',
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <SignupForm />
    </div>
  );
}
