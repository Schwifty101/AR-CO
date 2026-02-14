'use client';

/**
 * Dashboard Sidebar Component
 *
 * Navigation sidebar for admin and client dashboards.
 * Renders different menu items based on user type.
 *
 * @module DashboardSidebar
 *
 * @example
 * ```typescript
 * <DashboardSidebar userType="admin" />
 * <DashboardSidebar userType="client" />
 * ```
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Users,
  UserCheck,
  MessageSquareWarning,
  CreditCard,
  ClipboardList,
  Briefcase,
  Scale,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth/auth-actions';
import { useAuth } from '@/lib/auth/use-auth';
import { Button } from '@/components/ui/button';

/** Sidebar navigation item */
interface NavItem {
  /** Display label */
  label: string;
  /** Route path */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
}

/** Admin navigation items */
const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/admin/profile', icon: User },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Clients', href: '/admin/clients', icon: UserCheck },
  { label: 'Cases', href: '/admin/cases', icon: Scale },
  { label: 'Complaints', href: '/admin/complaints', icon: MessageSquareWarning },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Service Registrations', href: '/admin/service-registrations', icon: ClipboardList },
];

/** Client navigation items */
const CLIENT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/client/profile', icon: User },
  { label: 'Subscription', href: '/client/subscription', icon: CreditCard },
  { label: 'Complaints', href: '/client/complaints', icon: MessageSquareWarning },
  { label: 'My Cases', href: '/client/cases', icon: Scale },
  { label: 'My Services', href: '/client/services', icon: Briefcase },
];

/** Props for DashboardSidebar */
interface DashboardSidebarProps {
  /** User type to determine navigation items */
  userType: 'admin' | 'client';
}

/**
 * Dashboard sidebar navigation
 */
export function DashboardSidebar({ userType }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuth();
  const navItems = userType === 'admin' ? ADMIN_NAV : CLIENT_NAV;

  return (
    <aside className="hidden md:flex h-full w-64 flex-col border-r bg-muted/40 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          {userType === 'admin' ? 'Admin Panel' : 'Client Portal'}
        </h2>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={async () => {
            await signOut();
            clearAuth();
            router.push('/auth/signin');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
