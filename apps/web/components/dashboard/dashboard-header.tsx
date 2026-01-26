'use client';

/**
 * Dashboard Header Component
 *
 * Top navigation bar for dashboard pages with user info and sign-out.
 *
 * @module DashboardHeader
 *
 * @example
 * ```typescript
 * <DashboardHeader />
 * ```
 */

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/use-auth';
import { signOut } from '@/lib/auth/auth-actions';

/**
 * Dashboard header with user info and sign-out button
 */
export function DashboardHeader() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    clearAuth();
    router.push('/auth/signin');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div className="font-semibold">AR&CO</div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-muted-foreground">
            {user.fullName}
          </span>
        )}
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
