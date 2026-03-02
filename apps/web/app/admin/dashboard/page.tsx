'use client';

/**
 * Admin Dashboard Page
 *
 * Displays aggregate statistics, analytics overview, and recent activity
 * for admin/staff users.
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
  ClipboardList,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { getAdminDashboardStats } from '@/lib/api/dashboard';
import { getAnalyticsStats, getRecentActivities } from '@/lib/api/admin';
import type { AdminDashboardStats, AdminAnalyticsStats, ActivityLogResponse } from '@repo/shared';

/** Auth session actions excluded from recent activity feed */
const HIDDEN_AUTH_ACTIONS = new Set(['SIGNIN', 'SIGNOUT', 'OAUTH_LOGIN', 'TOKEN_REFRESH']);

/** Maps action strings to human-readable labels */
function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

/** Maps action to badge variant */
function actionVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action.includes('DELETE') || action.includes('SIGNOUT')) return 'destructive';
  if (action.includes('CREATE') || action.includes('SIGNUP') || action.includes('LOGIN')) return 'default';
  if (action.includes('UPDATE') || action.includes('ASSIGN')) return 'secondary';
  return 'outline';
}

/** Formats ISO timestamp to relative or short date */
function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<AdminAnalyticsStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLogResponse[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
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

    async function loadAnalytics() {
      try {
        const data = await getAnalyticsStats();
        setAnalyticsStats(data);
      } catch {
        // Non-critical — analytics cards will show 0
      } finally {
        setAnalyticsLoading(false);
      }
    }

    async function loadRecentActivity() {
      try {
        const data = await getRecentActivities(20);
        setRecentActivity(
          data.filter((e) => !HIDDEN_AUTH_ACTIONS.has(e.action)).slice(0, 10),
        );
      } catch {
        // Non-critical — activity feed will show empty state
      } finally {
        setActivityLoading(false);
      }
    }

    loadStats();
    loadAnalytics();
    loadRecentActivity();
  }, [authLoading]);

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
            value={statsLoading ? '...' : stats?.totalClients ?? 0}
            icon={Users}
            description="Registered users"
            delay={0.2}
          />
        </Link>
        <Link href="/admin/cases?status=active">
          <DashboardCard
            title="Active Cases"
            value={statsLoading ? '...' : stats?.activeCases ?? 0}
            icon={Scale}
            description="Cases currently in progress"
            delay={0.3}
          />
        </Link>
        <DashboardCard
          title="Pending Appointments"
          value={statsLoading ? '...' : stats?.pendingAppointments ?? 0}
          icon={CalendarClock}
          description="Awaiting confirmation"
          delay={0.4}
        />
      </div>

      {/* Analytics Overview */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-4 text-xl font-semibold tracking-tight"
        >
          Analytics Overview
        </motion.h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/subscriptions">
            <DashboardCard
              title="Active Subscribers"
              value={analyticsLoading ? '...' : analyticsStats?.activeSubscribers ?? 0}
              icon={CreditCard}
              description="Premium plan members"
              delay={0.6}
            />
          </Link>
          <Link href="/admin/complaints">
            <DashboardCard
              title="Open Complaints"
              value={analyticsLoading ? '...' : analyticsStats?.openComplaints ?? 0}
              icon={MessageSquareWarning}
              description="Unresolved issues"
              delay={0.7}
            />
          </Link>
          <Link href="/admin/service-registrations">
            <DashboardCard
              title="Pending Registrations"
              value={analyticsLoading ? '...' : analyticsStats?.pendingRegistrations ?? 0}
              icon={ClipboardList}
              description="Service requests"
              delay={0.8}
            />
          </Link>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No recent activity to display.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/50"
                  >
                    <Badge variant={actionVariant(entry.action)} className="shrink-0 text-xs">
                      {formatAction(entry.action)}
                    </Badge>
                    <span className="text-muted-foreground truncate">
                      {entry.entityType}
                      {entry.userName ? ` by ${entry.userName}` : ''}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {formatTimeAgo(entry.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
