import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { SafepayService } from '../payments/safepay.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import type {
  DbResult,
  DbListResult,
  DbCountResult,
} from '../database/db-result.types';
import {
  SubscriptionResponse,
  CancelSubscriptionData,
  PaginatedSubscriptionsResponse,
  PaginationParams,
  SubscriptionStatus,
} from '@repo/shared';

/** Database row shape for the subscriptions table */
interface SubscriptionRow {
  id: string;
  client_profile_id: string;
  plan_name: string;
  monthly_amount: number;
  currency: string;
  status: SubscriptionStatus;
  safepay_subscription_id: string | null;
  safepay_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Service responsible for managing subscription lifecycle
 * Handles subscription creation, retrieval, cancellation, and Safepay integration
 *
 * @remarks
 * This service integrates with Supabase for persistence and
 * SafepayService for payment processing. All database queries use
 * the admin client to bypass RLS restrictions.
 *
 * @example
 * ```typescript
 * const result = await subscriptionsService.createSubscription(user);
 * console.log(result.checkoutUrl); // Redirect client to this URL
 * ```
 */
@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly safepayService: SafepayService,
  ) {}

  /**
   * Creates a new subscription for the authenticated client
   * If a subscription already exists, reactivates it or throws error
   *
   * @param user - The authenticated user (must be CLIENT role)
   * @returns The created/reactivated subscription and Safepay checkout URL
   * @throws {BadRequestException} If user is not a CLIENT or missing clientProfileId
   * @throws {ForbiddenException} If user already has an active subscription
   * @throws {InternalServerErrorException} If database or Safepay operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const result = await service.createSubscription(user);
   *   // Redirect user to result.checkoutUrl
   * } catch (error) {
   *   if (error instanceof ForbiddenException) {
   *     // Handle already active subscription
   *   }
   * }
   * ```
   */
  async createSubscription(
    user: AuthUser,
  ): Promise<{ subscription: SubscriptionResponse; checkoutUrl: string }> {
    // Verify user is a CLIENT with clientProfileId
    if (user.userType !== UserType.CLIENT || !user.clientProfileId) {
      this.logger.error(
        `User ${user.id} attempted to create subscription without CLIENT role`,
      );
      throw new BadRequestException('Only clients can create subscriptions');
    }

    const adminClient = this.supabaseService.getAdminClient();
    const clientProfileId = user.clientProfileId;

    try {
      // Check if subscription already exists
      const { data: existingSubscription, error: fetchError } =
        (await adminClient
          .from('subscriptions')
          .select('*')
          .eq('client_profile_id', clientProfileId)
          .single()) as DbResult<SubscriptionRow>;

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        this.logger.error(
          `Failed to fetch existing subscription: ${fetchError.message}`,
        );
        throw new InternalServerErrorException(
          'Failed to check existing subscription',
        );
      }

      let subscription: SubscriptionRow;

      if (existingSubscription) {
        // Subscription exists - check status
        if (existingSubscription.status === SubscriptionStatus.ACTIVE) {
          throw new ForbiddenException(
            'You already have an active subscription',
          );
        }

        // Reactivate cancelled/expired subscription
        const { data: updated, error: updateError } = (await adminClient
          .from('subscriptions')
          .update({
            status: SubscriptionStatus.PENDING,
            cancelled_at: null,
            cancellation_reason: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubscription.id)
          .select()
          .single()) as DbResult<SubscriptionRow>;

        if (updateError || !updated) {
          this.logger.error(
            `Failed to reactivate subscription: ${updateError?.message}`,
          );
          throw new InternalServerErrorException(
            'Failed to reactivate subscription',
          );
        }

        subscription = updated;
        this.logger.log(
          `Reactivated subscription ${String(subscription.id)} for client ${clientProfileId}`,
        );
      } else {
        // Create new subscription
        const { data: created, error: insertError } = (await adminClient
          .from('subscriptions')
          .insert({
            client_profile_id: clientProfileId,
            plan_name: 'civic_retainer',
            monthly_amount: 700.0,
            currency: 'PKR',
            status: SubscriptionStatus.PENDING,
          })
          .select()
          .single()) as DbResult<SubscriptionRow>;

        if (insertError || !created) {
          this.logger.error(
            `Failed to create subscription: ${insertError?.message}`,
          );
          throw new InternalServerErrorException(
            'Failed to create subscription',
          );
        }

        subscription = created;
        this.logger.log(
          `Created new subscription ${String(subscription.id)} for client ${clientProfileId}`,
        );
      }

      // Create Safepay checkout session
      const { checkoutUrl } =
        await this.safepayService.createSubscriptionCheckout({
          planId: 'civic_retainer',
          reference: clientProfileId,
          customerEmail: user.email,
          returnUrl: `${process.env.FRONTEND_URL}/client/subscriptions/success`,
          cancelUrl: `${process.env.FRONTEND_URL}/client/subscriptions/cancel`,
        });

      return {
        subscription: this.mapSubscriptionRow(subscription),
        checkoutUrl,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error creating subscription: ${error}`);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating subscription',
      );
    }
  }

  /**
   * Retrieves the authenticated client's subscription
   *
   * @param user - The authenticated user (must be CLIENT role)
   * @returns The client's subscription details
   * @throws {BadRequestException} If user is not a CLIENT or missing clientProfileId
   * @throws {NotFoundException} If subscription does not exist
   * @throws {InternalServerErrorException} If database query fails
   *
   * @example
   * ```typescript
   * const subscription = await service.getMySubscription(user);
   * console.log(subscription.status); // 'active', 'cancelled', etc.
   * ```
   */
  async getMySubscription(user: AuthUser): Promise<SubscriptionResponse> {
    if (user.userType !== UserType.CLIENT || !user.clientProfileId) {
      throw new BadRequestException(
        'Only clients can retrieve their subscription',
      );
    }

    const adminClient = this.supabaseService.getAdminClient();

    try {
      const { data, error } = (await adminClient
        .from('subscriptions')
        .select('*')
        .eq('client_profile_id', user.clientProfileId)
        .single()) as DbResult<SubscriptionRow>;

      if (error || !data) {
        if (error?.code === 'PGRST116') {
          throw new NotFoundException('No subscription found for this client');
        }
        this.logger.error(`Failed to fetch subscription: ${error?.message}`);
        throw new InternalServerErrorException('Failed to fetch subscription');
      }

      return this.mapSubscriptionRow(data);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error fetching subscription: ${error}`);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscription',
      );
    }
  }

  /**
   * Cancels the authenticated client's active subscription
   *
   * @param user - The authenticated user (must be CLIENT role)
   * @param data - Cancellation data including optional reason
   * @returns The cancelled subscription details
   * @throws {BadRequestException} If user is not a CLIENT or missing clientProfileId
   * @throws {NotFoundException} If subscription does not exist
   * @throws {ForbiddenException} If subscription is not active
   * @throws {InternalServerErrorException} If database or Safepay operation fails
   *
   * @example
   * ```typescript
   * const cancelled = await service.cancelSubscription(user, {
   *   reason: 'Service no longer needed'
   * });
   * console.log(cancelled.cancelledAt); // ISO timestamp
   * ```
   */
  async cancelSubscription(
    user: AuthUser,
    data: CancelSubscriptionData,
  ): Promise<SubscriptionResponse> {
    if (user.userType !== UserType.CLIENT || !user.clientProfileId) {
      throw new BadRequestException(
        'Only clients can cancel their subscription',
      );
    }

    const adminClient = this.supabaseService.getAdminClient();

    try {
      // Fetch existing subscription
      const { data: existingSubscription, error: fetchError } =
        (await adminClient
          .from('subscriptions')
          .select('*')
          .eq('client_profile_id', user.clientProfileId)
          .single()) as DbResult<SubscriptionRow>;

      if (fetchError || !existingSubscription) {
        if (fetchError?.code === 'PGRST116') {
          throw new NotFoundException('No subscription found for this client');
        }
        this.logger.error(
          `Failed to fetch subscription: ${fetchError?.message}`,
        );
        throw new InternalServerErrorException('Failed to fetch subscription');
      }

      // Verify subscription is active
      if (existingSubscription.status !== SubscriptionStatus.ACTIVE) {
        throw new ForbiddenException(
          'Only active subscriptions can be cancelled',
        );
      }

      // Cancel on Safepay if subscription ID exists
      if (existingSubscription.safepay_subscription_id) {
        try {
          await this.safepayService.cancelSubscription(
            existingSubscription.safepay_subscription_id,
          );
          this.logger.log(
            `Cancelled Safepay subscription ${existingSubscription.safepay_subscription_id}`,
          );
        } catch (error) {
          this.logger.error(`Failed to cancel Safepay subscription: ${error}`);
          // Continue with local cancellation even if Safepay fails
        }
      }

      // Update subscription status
      const { data: updated, error: updateError } = (await adminClient
        .from('subscriptions')
        .update({
          status: SubscriptionStatus.CANCELLED,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: data.reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()) as DbResult<SubscriptionRow>;

      if (updateError || !updated) {
        this.logger.error(
          `Failed to cancel subscription: ${updateError?.message}`,
        );
        throw new InternalServerErrorException('Failed to cancel subscription');
      }

      this.logger.log(
        `Cancelled subscription ${updated.id} for client ${user.clientProfileId}`,
      );

      return this.mapSubscriptionRow(updated);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error cancelling subscription: ${error}`);
      throw new InternalServerErrorException(
        'An unexpected error occurred while cancelling subscription',
      );
    }
  }

  /**
   * Retrieves all subscriptions with pagination (staff only)
   *
   * @param pagination - Pagination parameters (page, limit, sort, order)
   * @returns Paginated list of all subscriptions
   * @throws {InternalServerErrorException} If database query fails
   *
   * @example
   * ```typescript
   * const result = await service.getAllSubscriptions({
   *   page: 1,
   *   limit: 20,
   *   sort: 'created_at',
   *   order: 'desc'
   * });
   * console.log(result.total); // Total subscription count
   * console.log(result.data); // Array of subscriptions
   * ```
   */
  async getAllSubscriptions(
    pagination: PaginationParams,
  ): Promise<PaginatedSubscriptionsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const {
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'desc',
    } = pagination;
    const offset = (page - 1) * limit;

    try {
      // Get total count
      const { count, error: countError } = (await adminClient
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })) as DbCountResult;

      if (countError) {
        this.logger.error(
          `Failed to count subscriptions: ${countError.message}`,
        );
        throw new InternalServerErrorException('Failed to count subscriptions');
      }

      // Get paginated data
      const { data, error: fetchError } = (await adminClient
        .from('subscriptions')
        .select('*')
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1)) as DbListResult<SubscriptionRow>;

      if (fetchError) {
        this.logger.error(
          `Failed to fetch subscriptions: ${fetchError.message}`,
        );
        throw new InternalServerErrorException('Failed to fetch subscriptions');
      }

      const subscriptions = (data || []).map((row) =>
        this.mapSubscriptionRow(row),
      );

      return {
        data: subscriptions,
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Unexpected error fetching subscriptions: ${error}`);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscriptions',
      );
    }
  }

  /**
   * Checks if a client has an active subscription
   * Used by other modules (e.g., ComplaintsModule) to verify subscription status
   *
   * @param clientProfileId - The client profile UUID
   * @returns True if client has active subscription, false otherwise
   *
   * @example
   * ```typescript
   * const hasActiveSubscription = await service.isSubscriptionActive(
   *   'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
   * );
   * if (!hasActiveSubscription) {
   *   throw new ForbiddenException('Active subscription required');
   * }
   * ```
   */
  async isSubscriptionActive(clientProfileId: string): Promise<boolean> {
    const adminClient = this.supabaseService.getAdminClient();

    try {
      const { data, error } = (await adminClient
        .from('subscriptions')
        .select('id')
        .eq('client_profile_id', clientProfileId)
        .eq('status', SubscriptionStatus.ACTIVE)
        .single()) as DbResult<{ id: string }>;

      if (error && error.code !== 'PGRST116') {
        this.logger.error(
          `Failed to check subscription status: ${error.message}`,
        );
        return false;
      }

      return !!data;
    } catch (error) {
      this.logger.error(
        `Unexpected error checking subscription status: ${error}`,
      );
      return false;
    }
  }

  /**
   * Maps database row (snake_case) to SubscriptionResponse (camelCase)
   *
   * @param row - Raw database row
   * @returns Typed SubscriptionResponse object
   * @private
   */
  private mapSubscriptionRow(row: SubscriptionRow): SubscriptionResponse {
    return {
      id: row.id,
      clientProfileId: row.client_profile_id,
      planName: row.plan_name,
      monthlyAmount: Number(row.monthly_amount),
      currency: row.currency,
      status: row.status,
      currentPeriodStart: row.current_period_start ?? null,
      currentPeriodEnd: row.current_period_end ?? null,
      cancelledAt: row.cancelled_at ?? null,
      cancellationReason: row.cancellation_reason ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
