/**
 * Subscriptions Controller
 *
 * Exposes REST endpoints for subscription management:
 * - Public: List plans
 * - Client: Subscribe, view my subscription, cancel
 * - Admin/Staff: List all subscriptions, view detail, sync plans, cancel
 * - Webhook: Safepay subscription lifecycle events
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
 *
 * // Admin - sync plan to Safepay
 * POST /api/subscriptions/plans/:id/sync
 *
 * // Safepay webhook
 * POST /api/subscriptions/webhook/safepay
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
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { SubscriptionStatus } from '@repo/shared';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { SubscriptionsService } from './subscriptions.service';
import type { SafepaySubscriptionWebhookPayload } from './subscriptions.types';

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
   * Safepay subscription webhook handler (public, verified by signature).
   *
   * @param body - Safepay webhook payload
   * @param headers - HTTP headers containing X-SFPY-SIGNATURE
   * @returns Acknowledgment
   *
   * @example
   * ```bash
   * # Safepay sends this automatically
   * POST /api/subscriptions/webhook/safepay
   * ```
   */
  @Public()
  @Post('webhook/safepay')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: unknown,
    @Headers() headers: Record<string, string>,
  ) {
    await this.subscriptionsService.handleWebhook(
      body as SafepaySubscriptionWebhookPayload,
      headers,
    );
    return { received: true };
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
  @Roles(UserType.ADMIN, UserType.STAFF)
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
  @Roles(UserType.ADMIN, UserType.STAFF)
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
  @Roles(UserType.CLIENT, UserType.ADMIN, UserType.STAFF)
  @Patch(':id/cancel')
  async cancelSubscription(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.subscriptionsService.cancelSubscription(id, user);
    return { success: true };
  }

  /**
   * Sync a local plan to Safepay (admin only, one-time operation).
   *
   * Creates the plan on Safepay and stores the returned plan token.
   * Idempotent - returns existing token if already synced.
   *
   * @param id - UUID of the subscription_plans record
   * @returns Safepay plan token
   *
   * @example
   * ```bash
   * curl -X POST -H "Authorization: Bearer <token>" \
   *   http://localhost:4000/api/subscriptions/plans/plan-uuid/sync
   * ```
   */
  @Roles(UserType.ADMIN)
  @Post('plans/:id/sync')
  async syncPlan(@Param('id') id: string) {
    const planToken = await this.subscriptionsService.syncPlanToSafepay(id);
    return { planToken };
  }
}
