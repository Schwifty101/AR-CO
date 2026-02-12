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
import { useAuth } from '@/lib/auth/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { getClientDashboardStats } from '@/lib/api/dashboard';
import type { ClientDashboardStats } from '@repo/shared';

export default function ClientDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
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
        <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
        <p className="text-muted-foreground">
          Welcome, {user?.fullName || 'Client'}
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
            My Cases
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-bold">
              {stats?.myCases ?? 0}
            </p>
          )}
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Upcoming Appointments
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-bold">
              {stats?.upcomingAppointments ?? 0}
            </p>
          )}
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending Invoices
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-bold">
              {stats?.pendingInvoices ?? 0}
            </p>
          )}
        </div>
        {/* TODO: Fetch from backend when dashboard stats are expanded */}
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Subscription
          </h3>
          {statsLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-xl font-bold text-muted-foreground">
              Inactive
            </p>
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
            Service Registrations
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
