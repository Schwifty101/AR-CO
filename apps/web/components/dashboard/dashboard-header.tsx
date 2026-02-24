'use client';

/**
 * Dashboard Header Component
 *
 * Top navigation bar for dashboard pages with user info, sign-out,
 * and mobile hamburger menu that opens a Sheet sidebar.
 *
 * @module DashboardHeader
 *
 * @example
 * ```typescript
 * <DashboardHeader userType="admin" />
 * <DashboardHeader userType="client" />
 * ```
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, LayoutGroup } from 'framer-motion';
import { Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth/use-auth';
import { signOut } from '@/lib/auth/auth-actions';
import { ADMIN_NAV, CLIENT_NAV } from './sidebar';

/** Props for DashboardHeader */
interface DashboardHeaderProps {
  /** User type to determine mobile sidebar navigation items */
  userType: 'admin' | 'client';
}

/**
 * Dashboard header with user info, sign-out button, and mobile sidebar
 */
export function DashboardHeader({ userType }: DashboardHeaderProps) {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navItems = userType === 'admin' ? ADMIN_NAV : CLIENT_NAV;

  useEffect(() => {
    document.body.classList.add('app-loaded');
  }, []);

  const handleSignOut = async () => {
    await signOut();
    clearAuth();
    router.push('/auth/signin');
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6 text-foreground">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <Link href="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
          AR&CO
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden sm:flex flex-col items-end">
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

      {/* Mobile sidebar sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-4">
          <SheetHeader className="px-0">
            <SheetTitle>
              {userType === 'admin' ? 'Admin Panel' : 'Client Portal'}
            </SheetTitle>
          </SheetHeader>
          <nav className="mt-4 space-y-1 relative">
            <LayoutGroup>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors z-10',
                      isActive
                        ? 'text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-mobile-nav"
                        className="absolute inset-0 rounded-md bg-accent"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="h-4 w-4 flex-shrink-0 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </LayoutGroup>
          </nav>
          <div className="mt-auto pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={async () => {
                setOpen(false);
                await handleSignOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
