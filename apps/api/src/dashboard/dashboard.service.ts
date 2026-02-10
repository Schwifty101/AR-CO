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
import type { AdminDashboardStats, ClientDashboardStats } from '@repo/shared';

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
      this.logger.error('Failed to count appointments', appointmentsResult.error.message);
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

    const [casesResult, appointmentsResult, invoicesResult] = await Promise.all([
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
    ]);

    if (casesResult.error) {
      this.logger.error('Failed to count client cases', casesResult.error.message);
    }
    if (appointmentsResult.error) {
      this.logger.error('Failed to count client appointments', appointmentsResult.error.message);
    }
    if (invoicesResult.error) {
      this.logger.error('Failed to count client invoices', invoicesResult.error.message);
    }

    return {
      myCases: casesResult.count ?? 0,
      upcomingAppointments: appointmentsResult.count ?? 0,
      pendingInvoices: invoicesResult.count ?? 0,
    };
  }
}
