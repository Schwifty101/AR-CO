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

import Link from 'next/link';
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
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/60 px-6 backdrop-blur-md transition-all supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Link href="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
          AR&CO
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium leading-none">
              {user.fullName}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {user.userType}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
