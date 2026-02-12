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
import { useAuth } from '@/lib/auth/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { getAdminDashboardStats } from '@/lib/api/dashboard';
import type { AdminDashboardStats } from '@repo/shared';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || 'Admin'}
        </p>
      </div>

      {statsError && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive text-sm">
          {statsError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Clients
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-bold">
              {stats?.totalClients ?? 0}
            </p>
          )}
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Cases
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-bold">
              {stats?.activeCases ?? 0}
            </p>
          )}
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending Appointments
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-bold">
              {stats?.pendingAppointments ?? 0}
            </p>
          )}
        </div>
        {/* TODO: Fetch from backend when dashboard stats are expanded */}
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Subscribers
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-bold">0</p>
          )}
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Open Complaints
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-bold">0</p>
          )}
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending Registrations
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-bold">0</p>
          )}
        </div>
      </div>
    </div>
  );
}
