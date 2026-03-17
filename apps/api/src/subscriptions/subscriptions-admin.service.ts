/**
 * Subscriptions Admin Service
 *
 * Admin/staff-only subscription queries:
 * - Paginated listing with status filters and user info enrichment
 * - Single subscription detail view with event history
 *
 * @module SubscriptionsModule
 *
 * @example
 * ```typescript
 * const result = await subscriptionsAdminService.getSubscriptions({
 *   page: 1, limit: 20, status: SubscriptionStatus.ACTIVE,
 * });
 * const detail = await subscriptionsAdminService.getSubscriptionById('sub-uuid');
 * ```
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SubscriptionStatus } from '@repo/shared';
import type {
  SubscriptionDetail,
  PaginatedSubscriptionsResponse,
  SubscriptionFilters,
} from '@repo/shared';
import { SupabaseService } from '../database/supabase.service';
import {
  type SubscriptionPlanRow,
  type UserSubscriptionRow,
  type SubscriptionEventRow,
  mapSubscriptionRow,
  mapEventRow,
} from './subscriptions.types';

/**
 * Service providing admin-scoped subscription queries.
 *
 * Joins user_profiles and auth.users to enrich subscription listings with
 * display names and email addresses. Uses getAdminClient() exclusively to
 * bypass Row Level Security for cross-user queries.
 *
 * @example
 * ```typescript
 * @Module({
 *   providers: [SubscriptionsAdminService],
 * })
 * export class SubscriptionsModule {}
 * ```
 */
@Injectable()
export class SubscriptionsAdminService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * List all subscriptions with filters and pagination.
   *
   * Joins subscription_plans and user_profiles. Fetches auth emails separately
   * using the admin auth API for each unique user ID in the result set.
   *
   * @param filters - Pagination and optional status filter
   * @returns Paginated subscriptions with user info
   *
   * @example
   * ```typescript
   * const result = await subscriptionsAdminService.getSubscriptions({
   *   page: 1, limit: 20, status: SubscriptionStatus.ACTIVE,
   * });
   * // result.data[0].userName, result.total, result.page
   * ```
   */
  async getSubscriptions(
    filters: SubscriptionFilters,
  ): Promise<PaginatedSubscriptionsResponse> {
    const client = this.supabaseService.getAdminClient();
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let query = client
      .from('user_subscriptions')
      .select('*, subscription_plans(*), user_profiles!inner(full_name)', {
        count: 'exact',
      });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    const rows = (data || []) as Array<
      UserSubscriptionRow & {
        subscription_plans: SubscriptionPlanRow;
        user_profiles: { full_name: string };
      }
    >;

    // Fetch emails from auth.users for each unique user
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const emailMap = new Map<string, string>();
    await Promise.all(
      userIds.map(async (uid) => {
        const { data: authData } = await client.auth.admin.getUserById(uid);
        if (authData?.user?.email) {
          emailMap.set(uid, authData.user.email);
        }
      }),
    );

    return {
      data: rows.map((row) => ({
        ...mapSubscriptionRow(row, row.subscription_plans),
        userId: row.user_id,
        userEmail: emailMap.get(row.user_id) || '',
        userName: row.user_profiles?.full_name || '',
      })),
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Get a single subscription by ID with full event history.
   *
   * @param id - UUID of the user_subscriptions record
   * @returns Subscription detail with events array
   * @throws {HttpException} NOT_FOUND if subscription does not exist
   *
   * @example
   * ```typescript
   * const detail = await subscriptionsAdminService.getSubscriptionById('sub-uuid');
   * console.log(detail.events.length);
   * ```
   */
  async getSubscriptionById(id: string): Promise<SubscriptionDetail> {
    const client = this.supabaseService.getAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: rawSubById, error } = await client
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('id', id)
      .single();

    if (error || !rawSubById) {
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
    }

    const subRow = rawSubById as unknown as UserSubscriptionRow & {
      subscription_plans: SubscriptionPlanRow;
    };
    const plan = subRow.subscription_plans;

    const { data: events } = await client
      .from('subscription_events')
      .select('*')
      .eq('subscription_id', id)
      .order('created_at', { ascending: false });

    return {
      ...mapSubscriptionRow(subRow, plan),
      events: ((events || []) as SubscriptionEventRow[]).map(mapEventRow),
    };
  }
}

// Re-export SubscriptionStatus so callers of this file don't need a separate import
export { SubscriptionStatus };
