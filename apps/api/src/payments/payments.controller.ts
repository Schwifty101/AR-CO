/**
 * Payments Controller
 *
 * Provides aggregated payment history across all payment flows:
 * consultations, service registrations, and subscriptions.
 *
 * @module PaymentsModule
 *
 * @example
 * ```http
 * GET /api/payments/history?page=1&limit=20
 * ```
 */

import { Controller, Get, Query } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { STAFF_ROLES } from '../common/constants/roles';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { PaginationSchema, type PaginationParams } from '@repo/shared';

/** A single entry in the aggregated payment history */
export interface PaymentHistoryEntry {
  type: 'consultation' | 'service' | 'subscription';
  referenceNumber: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
}

/**
 * Exposes aggregated payment history for the authenticated user.
 *
 * All routes require JWT authentication (applied globally via JwtAuthGuard).
 */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Returns aggregated payment history across consultations, service registrations,
   * and subscriptions. Clients see their own; staff see all.
   *
   * Results are sorted by paidAt descending and paginated.
   *
   * @example GET /api/payments/history?page=1&limit=20
   */
  @Get('history')
  async getPaymentHistory(
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationParams,
    @CurrentUser() user: AuthUser,
  ): Promise<{ data: PaymentHistoryEntry[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = pagination;
    const adminClient = this.supabaseService.getAdminClient();
    const isStaff = STAFF_ROLES.includes(user.userType);

    const [consultations, services, subscriptions] = await Promise.all([
      this.fetchConsultationPayments(adminClient, user, isStaff),
      this.fetchServicePayments(adminClient, user, isStaff),
      this.fetchSubscriptionPayments(adminClient, user, isStaff),
    ]);

    const all: PaymentHistoryEntry[] = [
      ...consultations,
      ...services,
      ...subscriptions,
    ].sort((a, b) => {
      const dateA = a.paidAt ? new Date(a.paidAt).getTime() : 0;
      const dateB = b.paidAt ? new Date(b.paidAt).getTime() : 0;
      return dateB - dateA;
    });

    const total = all.length;
    const offset = (page - 1) * limit;
    const data = all.slice(offset, offset + limit);

    return { data, total, page, limit };
  }

  /** Fetches paid consultation bookings */
  private async fetchConsultationPayments(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminClient: any,
    user: AuthUser,
    isStaff: boolean,
  ): Promise<PaymentHistoryEntry[]> {
    let query = adminClient
      .from('consultation_bookings')
      .select('reference_number, consultation_fee, updated_at')
      .eq('payment_status', 'paid');

    if (!isStaff) {
      query = query.eq('email', user.email);
    }

    const { data } = await query;
    return (data ?? []).map(
      (row: { reference_number: string; consultation_fee: number; updated_at: string }) => ({
        type: 'consultation' as const,
        referenceNumber: row.reference_number,
        description: 'Legal Consultation Fee',
        amount: row.consultation_fee,
        currency: 'PKR',
        status: 'paid',
        paidAt: row.updated_at,
      }),
    );
  }

  /** Fetches paid service registrations */
  private async fetchServicePayments(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminClient: any,
    user: AuthUser,
    isStaff: boolean,
  ): Promise<PaymentHistoryEntry[]> {
    let query = adminClient
      .from('service_registrations')
      .select('reference_number, paid_amount, updated_at, services!inner(name)')
      .eq('payment_status', 'paid');

    if (!isStaff && user.clientProfileId) {
      query = query.eq('client_profile_id', user.clientProfileId);
    } else if (!isStaff) {
      return [];
    }

    const { data } = await query;
    return (data ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (row: any) => ({
        type: 'service' as const,
        referenceNumber: row.reference_number,
        description: `${row.services?.name ?? 'Service'} - Registration Fee`,
        amount: Number(row.paid_amount ?? 0),
        currency: 'PKR',
        status: 'paid',
        paidAt: row.updated_at,
      }),
    );
  }

  /** Fetches active/paid subscriptions */
  private async fetchSubscriptionPayments(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminClient: any,
    user: AuthUser,
    isStaff: boolean,
  ): Promise<PaymentHistoryEntry[]> {
    let query = adminClient
      .from('user_subscriptions')
      .select('id, status, last_paid_at, subscription_plans!inner(name, amount, currency)')
      .in('status', ['active', 'cancelled', 'ended']);

    if (!isStaff) {
      query = query.eq('user_id', user.id);
    }

    const { data } = await query;
    return (data ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (row: any) => ({
        type: 'subscription' as const,
        referenceNumber: row.id,
        description: `${row.subscription_plans?.name ?? 'Subscription'} Plan`,
        amount: row.subscription_plans?.amount ?? 0,
        currency: row.subscription_plans?.currency ?? 'PKR',
        status: row.status,
        paidAt: row.last_paid_at ?? null,
      }),
    );
  }
}
