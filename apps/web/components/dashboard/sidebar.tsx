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
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/** Sidebar navigation item */
interface NavItem {
  /** Display label */
  label: string;
  /** Route path */
  href: string;
}

/** Admin navigation items */
const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
];

/** Client navigation items */
const CLIENT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/client/dashboard' },
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
  const navItems = userType === 'admin' ? ADMIN_NAV : CLIENT_NAV;

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          {userType === 'admin' ? 'Admin Panel' : 'Client Portal'}
        </h2>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
