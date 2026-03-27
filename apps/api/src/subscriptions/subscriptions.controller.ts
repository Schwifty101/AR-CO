/**
 * Subscriptions Controller
 *
 * Exposes REST endpoints for subscription management:
 * - Public: List plans
 * - Client: Subscribe, view my subscription, cancel
 * - Admin/Staff: List all subscriptions, view detail, cancel
 *
 * @module SubscriptionsModule
 *
 * @example
 * ```typescript
 * // Public - list plans
 * GET /api/subscriptions/plans
 *
 * // Client - initiate subscription
 * POST /api/subscriptions/subscribe { planSlug: 'premium-monthly' }
 *
 * // Client - get my subscription
 * GET /api/subscriptions/my-subscription
 *
 * // Admin - list all subscriptions
 * GET /api/subscriptions?status=active&page=1&limit=20
 * ```
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { SubscriptionStatus } from '@repo/shared';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { SubscriptionsService } from './subscriptions.service';

/**
 * Subscriptions REST API controller.
 *
 * Route prefix: /api/subscriptions (global prefix 'api' set in main.ts).
 */
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * List active subscription plans (public).
   *
   * @returns Array of active plans sorted by amount ascending
   *
   * @example
   * ```bash
   * curl http://localhost:4000/api/subscriptions/plans
   * ```
   */
  @Public()
  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  /**
   * Initiate subscription checkout (client only).
   *
   * @param user - Authenticated client user
   * @param body - Contains planSlug identifying the desired plan
   * @returns Checkout URL, subscription ID, and reference
   *
   * @example
   * ```bash
   * curl -X POST -H "Authorization: Bearer <token>" \
   *   -H "Content-Type: application/json" \
   *   -d '{ "planSlug": "premium-monthly" }' \
   *   http://localhost:4000/api/subscriptions/subscribe
   * ```
   */
  @Roles(UserType.CLIENT)
  @Post('subscribe')
  async subscribe(
    @CurrentUser() user: AuthUser,
    @Body() body: { planSlug: string },
  ) {
    return this.subscriptionsService.initiateSubscription(user, body.planSlug);
  }

  /**
   * Get current user's active subscription with events (client only).
   *
   * @param user - Authenticated client user
   * @returns Subscription detail or null
   *
   * @example
   * ```bash
   * curl -H "Authorization: Bearer <token>" \
   *   http://localhost:4000/api/subscriptions/my-subscription
   * ```
   */
  @Roles(UserType.CLIENT)
  @Get('my-subscription')
  async getMySubscription(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.getMySubscription(user.id);
  }

  /**
   * List all subscriptions with filters (admin/staff only).
   *
   * @param status - Optional status filter
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 20)
   * @returns Paginated subscriptions with user info
   *
   * @example
   * ```bash
   * curl -H "Authorization: Bearer <token>" \
   *   "http://localhost:4000/api/subscriptions?status=active&page=1&limit=20"
   * ```
   */
  @Roles(UserType.ADMIN)
  @Get()
  async getSubscriptions(
    @Query('status') status?: SubscriptionStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.subscriptionsService.getSubscriptions({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sort: 'created_at',
      order: 'desc',
    });
  }

  /**
   * Get subscription detail by ID (admin/staff only).
   *
   * @param id - UUID of the user_subscriptions record
   * @returns Subscription detail with event history
   *
   * @example
   * ```bash
   * curl -H "Authorization: Bearer <token>" \
   *   http://localhost:4000/api/subscriptions/sub-uuid
   * ```
   */
  @Roles(UserType.ADMIN)
  @Get(':id')
  async getSubscriptionById(@Param('id') id: string) {
    return this.subscriptionsService.getSubscriptionById(id);
  }

  /**
   * Cancel a subscription (client, admin, or staff).
   *
   * Clients can only cancel their own subscription.
   * Admins/staff can cancel any subscription.
   *
   * @param id - UUID of the user_subscriptions record
   * @param user - Authenticated user performing the cancellation
   * @returns Success confirmation
   *
   * @example
   * ```bash
   * curl -X PATCH -H "Authorization: Bearer <token>" \
   *   http://localhost:4000/api/subscriptions/sub-uuid/cancel
   * ```
   */
  @Roles(UserType.CLIENT, UserType.ADMIN)
  @Patch(':id/cancel')
  async cancelSubscription(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.subscriptionsService.cancelSubscription(id, user);
    return { success: true };
  }

  /**
   * Resume a cancelled subscription (client only).
   *
   * Lifts the cancellation on LemonSqueezy and restores ACTIVE status locally.
   * Only subscriptions in CANCELLED state can be resumed (not ENDED).
   *
   * @param id - UUID of the user_subscriptions record
   * @param user - Authenticated client user
   * @returns Success confirmation
   *
   * @example
   * ```bash
   * curl -X PATCH -H "Authorization: Bearer <token>" \
   *   http://localhost:4000/api/subscriptions/sub-uuid/resume
   * ```
   */
  @Roles(UserType.CLIENT)
  @Patch(':id/resume')
  async resumeSubscription(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.subscriptionsService.resumeSubscription(id, user);
    return { success: true };
  }

  /**
   * Get real-time subscription status for the current user (client only).
   *
   * Checks local DB status and, when available, fetches live status from
   * LemonSqueezy for an up-to-date comparison.
   *
   * @param user - Authenticated client user
   * @returns Local status, live LS status, period end, and ends_at
   *
   * @example
   * ```bash
   * curl -H "Authorization: Bearer <token>" \
   *   http://localhost:4000/api/subscriptions/me/status
   * ```
   */
  @Roles(UserType.CLIENT)
  @Get('me/status')
  async getMySubscriptionStatus(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.getMySubscriptionStatus(user.id);
  }

}
