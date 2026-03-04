/**
 * Dashboard Service
 *
 * Provides aggregate statistics for admin and client dashboards.
 * Uses the admin Supabase client to bypass RLS for cross-user aggregation.
 *
 * @module DashboardService
 *
 * @example
 * ```typescript
 * const adminStats = await dashboardService.getAdminStats();
 * // { totalClients: 42, activeCases: 15, pendingAppointments: 7 }
 *
 * const clientStats = await dashboardService.getClientStats('uuid-here');
 * // { myCases: 3, upcomingAppointments: 1, pendingInvoices: 2 }
 * ```
 */

import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import type {
  AdminDashboardStats,
  ClientDashboardStats,
  AdminAnalyticsStats,
  CaseAnalytics,
  RevenueAnalytics,
} from '@repo/shared';

/**
 * Service for computing dashboard statistics
 *
 * @class DashboardService
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get admin dashboard aggregate statistics
   *
   * Counts total clients, active cases, and upcoming pending/confirmed appointments.
   * Uses admin client to bypass RLS for cross-user aggregation.
   *
   * @returns Admin dashboard statistics
   */
  async getAdminStats(): Promise<AdminDashboardStats> {
    const client = this.supabaseService.getAdminClient();

    const [clientsResult, casesResult, appointmentsResult] = await Promise.all([
      client
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('user_type', 'client'),
      client
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'active']),
      client
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed'])
        .gte('appointment_date', new Date().toISOString().split('T')[0]),
    ]);

    if (clientsResult.error) {
      this.logger.error('Failed to count clients', clientsResult.error.message);
    }
    if (casesResult.error) {
      this.logger.error('Failed to count cases', casesResult.error.message);
    }
    if (appointmentsResult.error) {
      this.logger.error(
        'Failed to count appointments',
        appointmentsResult.error.message,
      );
    }

    return {
      totalClients: clientsResult.count ?? 0,
      activeCases: casesResult.count ?? 0,
      pendingAppointments: appointmentsResult.count ?? 0,
    };
  }

  /**
   * Get client dashboard statistics for a specific client
   *
   * Counts the client's cases, upcoming appointments, and pending invoices.
   * Uses admin client to bypass RLS for reliable cross-table counts.
   *
   * @param clientProfileId - UUID of the client_profiles row
   * @returns Client dashboard statistics
   */
  async getClientStats(clientProfileId: string): Promise<ClientDashboardStats> {
    const client = this.supabaseService.getAdminClient();

    const [casesResult, appointmentsResult, invoicesResult] = await Promise.all(
      [
        client
          .from('cases')
          .select('id', { count: 'exact', head: true })
          .eq('client_profile_id', clientProfileId),
        client
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('client_profile_id', clientProfileId)
          .in('status', ['pending', 'confirmed'])
          .gte('appointment_date', new Date().toISOString().split('T')[0]),
        client
          .from('invoices')
          .select('id', { count: 'exact', head: true })
          .eq('client_profile_id', clientProfileId)
          .in('status', ['draft', 'sent', 'overdue']),
      ],
    );

    if (casesResult.error) {
      this.logger.error(
        'Failed to count client cases',
        casesResult.error.message,
      );
    }
    if (appointmentsResult.error) {
      this.logger.error(
        'Failed to count client appointments',
        appointmentsResult.error.message,
      );
    }
    if (invoicesResult.error) {
      this.logger.error(
        'Failed to count client invoices',
        invoicesResult.error.message,
      );
    }

    return {
      myCases: casesResult.count ?? 0,
      upcomingAppointments: appointmentsResult.count ?? 0,
      pendingInvoices: invoicesResult.count ?? 0,
    };
  }

  /**
   * Get secondary analytics stats for admin dashboard
   *
   * Counts active subscribers, open complaints, and pending service registrations.
   * Uses admin client to bypass RLS for cross-user aggregation.
   *
   * @returns Analytics stats (activeSubscribers, openComplaints, pendingRegistrations)
   */
  async getAnalyticsStats(): Promise<AdminAnalyticsStats> {
    const client = this.supabaseService.getAdminClient();

    const [subscribersResult, complaintsResult, registrationsResult] =
      await Promise.all([
        client
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        client
          .from('complaints')
          .select('id', { count: 'exact', head: true })
          .in('status', ['submitted', 'under_review', 'escalated']),
        client
          .from('service_registrations')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending_payment', 'paid', 'in_progress']),
      ]);

    if (subscribersResult.error) {
      this.logger.error(
        'Failed to count subscribers',
        subscribersResult.error.message,
      );
    }
    if (complaintsResult.error) {
      this.logger.error(
        'Failed to count complaints',
        complaintsResult.error.message,
      );
    }
    if (registrationsResult.error) {
      this.logger.error(
        'Failed to count registrations',
        registrationsResult.error.message,
      );
    }

    return {
      activeSubscribers: subscribersResult.count ?? 0,
      openComplaints: complaintsResult.count ?? 0,
      pendingRegistrations: registrationsResult.count ?? 0,
    };
  }

  /**
   * Get recent activity log entries for admin dashboard feed
   *
   * Queries activity_logs table with user profile join for display names.
   * Uses admin client to bypass RLS.
   *
   * @param limit - Maximum number of entries to return (default 10)
   * @returns Array of recent activity entries with user names
   */
  async getRecentActivities(limit = 10) {
    const client = this.supabaseService.getAdminClient();

    const { data, error } = await client
      .from('activity_logs')
      .select(
        `
        id,
        user_id,
        action,
        entity_type,
        entity_id,
        metadata,
        ip_address,
        user_agent,
        created_at,
        user_profiles!activity_logs_user_id_fkey(full_name)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error('Failed to fetch recent activities', error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => {
      const profile = row.user_profiles as { full_name: string } | null;
      return {
        id: row.id,
        userId: row.user_id,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        metadata: row.metadata ?? {},
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at,
        userName: profile?.full_name ?? null,
      };
    });
  }

  /**
   * Get case analytics: breakdown by status, priority, resolution rate
   *
   * Uses admin client to bypass RLS for full case aggregation.
   *
   * @returns Case analytics object
   */
  async getCaseAnalytics(): Promise<CaseAnalytics> {
    const client = this.supabaseService.getAdminClient();

    const { data: cases, error } = await client
      .from('cases')
      .select('status, priority, created_at, updated_at');

    if (error) {
      this.logger.error('Failed to fetch case analytics', error.message);
      return {
        byStatus: {},
        byPriority: {},
        resolutionRate: 0,
        avgResolutionDays: 0,
        totalCases: 0,
      };
    }

    const allCases = cases ?? [];
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let resolvedCount = 0;
    let totalResolutionDays = 0;

    for (const c of allCases) {
      const status = c.status as string;
      const priority = c.priority as string;
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      byPriority[priority] = (byPriority[priority] ?? 0) + 1;

      if (status === 'resolved' || status === 'closed') {
        resolvedCount++;
        const created = new Date(c.created_at as string).getTime();
        const updated = new Date(c.updated_at as string).getTime();
        totalResolutionDays += (updated - created) / (1000 * 60 * 60 * 24);
      }
    }

    const total = allCases.length;
    return {
      byStatus,
      byPriority,
      resolutionRate: total > 0 ? Math.round((resolvedCount / total) * 100) : 0,
      avgResolutionDays:
        resolvedCount > 0 ? Math.round(totalResolutionDays / resolvedCount) : 0,
      totalCases: total,
    };
  }

  /**
   * Get revenue analytics (placeholder)
   *
   * TODO: Integrate with Task 10 (Lemon Squeezy Invoices Module) when complete.
   * Currently returns dummy data structure matching RevenueAnalytics type.
   * Replace the dummy values with real queries against invoices/payments tables.
   *
   * @param _startDate - Start of period (unused until Task 10)
   * @param _endDate - End of period (unused until Task 10)
   * @returns Placeholder revenue analytics
   */
  getRevenueAnalytics(
    _startDate?: string,
    _endDate?: string,
  ): RevenueAnalytics {
    // TODO (Task 10): Replace with real queries against invoices table:
    //   - totalRevenue: SUM(amount) from invoices WHERE status = 'paid'
    //   - periodRevenue: SUM(amount) from invoices WHERE paid_at BETWEEN startDate AND endDate
    //   - revenueByType: GROUP BY payment_type (subscription, consultation, service)
    //   - trend: GROUP BY month/week for time-series chart
    this.logger.warn(
      'getRevenueAnalytics: returning placeholder data — integrate with Task 10 invoices',
    );

    return {
      totalRevenue: 0,
      periodRevenue: 0,
      revenueByType: {
        subscription: 0,
        consultation: 0,
        service: 0,
      },
      trend: [],
    };
  }
}
