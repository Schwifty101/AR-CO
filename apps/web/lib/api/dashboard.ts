/**
 * Dashboard API Client
 *
 * Client-side functions for fetching dashboard statistics.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module DashboardAPI
 *
 * @example
 * ```typescript
 * import { getAdminDashboardStats, getClientDashboardStats } from '@/lib/api/dashboard';
 *
 * const adminStats = await getAdminDashboardStats();
 * const clientStats = await getClientDashboardStats();
 * ```
 */

import { createBrowserClient } from '@/lib/supabase/client';
import type { AdminDashboardStats, ClientDashboardStats } from '@repo/shared';

/**
 * Gets the current user's session token from Supabase
 *
 * @returns JWT access token
 * @throws Error if no session exists
 */
async function getSessionToken(): Promise<string> {
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session. Please sign in again.');
  }

  return session.access_token;
}

/**
 * Fetch admin dashboard statistics
 *
 * Requires admin or staff role.
 *
 * @returns Admin dashboard stats (totalClients, activeCases, pendingAppointments)
 * @throws Error if request fails or user lacks permissions
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const token = await getSessionToken();

  const response = await fetch('/api/dashboard/admin/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch admin dashboard stats');
  }

  return (await response.json()) as AdminDashboardStats;
}

/**
 * Fetch client dashboard statistics
 *
 * Requires authenticated client user with a client profile.
 *
 * @returns Client dashboard stats (myCases, upcomingAppointments, pendingInvoices)
 * @throws Error if request fails or user has no client profile
 */
export async function getClientDashboardStats(): Promise<ClientDashboardStats> {
  const token = await getSessionToken();

  const response = await fetch('/api/dashboard/client/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch client dashboard stats');
  }

  return (await response.json()) as ClientDashboardStats;
}
