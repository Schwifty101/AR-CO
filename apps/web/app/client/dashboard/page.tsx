'use client';

/**
 * Client Dashboard Page
 *
 * Displays aggregate statistics for client users:
 * their cases, upcoming appointments, and pending invoices.
 *
 * @module ClientDashboardPage
 *
 * @example
 * Accessible at /client/dashboard (requires authenticated client)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { motion } from 'framer-motion';
import {
  Scale,
  Calendar,
  FileText,
  CreditCard,
  MessageSquareWarning,
  ClipboardList
} from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { getClientDashboardStats } from '@/lib/api/dashboard';
import type { ClientDashboardStats } from '@repo/shared';

export default function ClientDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ClientDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    async function loadStats() {
      try {
        const data = await getClientDashboardStats();
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
          Client Portal
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground"
        >
          Welcome, {user?.fullName || 'Client'}. Manage your legal matters here.
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
        <Link href="/client/cases">
          <DashboardCard
            title="My Cases"
            value={statsLoading ? "..." : stats?.myCases ?? 0}
            icon={Scale}
            description="Active legal cases"
            delay={0.2}
          />
        </Link>
        <DashboardCard
          title="Upcoming Appointments"
          value={statsLoading ? "..." : stats?.upcomingAppointments ?? 0}
          icon={Calendar}
          description="Scheduled meetings"
          delay={0.3}
        />
        <DashboardCard
          title="Pending Invoices"
          value={statsLoading ? "..." : stats?.pendingInvoices ?? 0}
          icon={FileText}
          description="Awaiting payment"
          delay={0.4}
        />
      </div>

      {/* Secondary Stats / Account Info */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-4 text-xl font-semibold tracking-tight"
        >
          Account Overview
        </motion.h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-60 pointer-events-none grayscale-[0.5]">
          <DashboardCard
            title="Subscription"
            value="Inactive"
            icon={CreditCard}
            description="Current plan status"
            delay={0.6}
          />
          <DashboardCard
            title="Open Complaints"
            value="0"
            icon={MessageSquareWarning}
            description="Submitted issues"
            delay={0.7}
          />
          <DashboardCard
            title="Service Registrations"
            value="0"
            icon={ClipboardList}
            description="Requested services"
            delay={0.8}
          />
        </div>
      </div>
    </div>
  );
}
