'use client';

/**
 * Admin Dashboard Page
 *
 * Displays aggregate statistics for admin/staff users:
 * total clients, active cases, and pending appointments.
 *
 * @module AdminDashboardPage
 *
 * @example
 * Accessible at /admin/dashboard (requires admin or staff role)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { motion } from 'framer-motion';
import {
  Users,
  Scale,
  CalendarClock,
  CreditCard,
  MessageSquareWarning,
  ClipboardList
} from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { getAdminDashboardStats } from '@/lib/api/dashboard';
import type { AdminDashboardStats } from '@repo/shared';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    async function loadStats() {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        setStatsError(
          err instanceof Error ? err.message : 'Failed to load stats',
        );
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();
  }, [authLoading]);

  // Redirect to signin when session is lost
  if (!authLoading && !user) {
    router.push('/auth/signin');
    return null;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-2">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight"
        >
          Admin Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground"
        >
          Welcome back, {user?.fullName || 'Admin'}. Here&apos;s what&apos;s happening today.
        </motion.p>
      </div>

      {statsError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20"
        >
          {statsError}
        </motion.div>
      )}

      {/* Primary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <DashboardCard
            title="Total Clients"
            value={statsLoading ? "..." : stats?.totalClients ?? 0}
            icon={Users}
            description="Registered users"
            delay={0.2}
          />
        </Link>
        <Link href="/admin/cases?status=active">
          <DashboardCard
            title="Active Cases"
            value={statsLoading ? "..." : stats?.activeCases ?? 0}
            icon={Scale}
            description="Cases currently in progress"
            delay={0.3}
          />
        </Link>
        <DashboardCard
          title="Pending Appointments"
          value={statsLoading ? "..." : stats?.pendingAppointments ?? 0}
          icon={CalendarClock}
          description="Awaiting confirmation"
          delay={0.4}
        />
      </div>

      {/* Secondary Stats / Coming Soon */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-4 text-xl font-semibold tracking-tight"
        >
          Analytics Overview
        </motion.h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-60 pointer-events-none grayscale-[0.5]">
          <DashboardCard
            title="Active Subscribers"
            value="0"
            icon={CreditCard}
            description="Premium plan members"
            delay={0.6}
          />
          <DashboardCard
            title="Open Complaints"
            value="0"
            icon={MessageSquareWarning}
            description="Unresolved issues"
            delay={0.7}
          />
          <DashboardCard
            title="Pending Registrations"
            value="0"
            icon={ClipboardList}
            description="Service requests"
            delay={0.8}
          />
        </div>
      </div>
    </div>
  );
}
