import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SubscriptionsService } from './subscriptions.service';
import {
  CancelSubscriptionSchema,
  PaginationSchema,
  type CancelSubscriptionData,
  type PaginationParams,
  type SubscriptionResponse,
  type PaginatedSubscriptionsResponse,
} from '@repo/shared';

/**
 * Controller for subscription management endpoints
 * Handles subscription creation, retrieval, and cancellation for clients
 *
 * @remarks
 * All endpoints require authentication via JWT.
 * Client-specific endpoints require CLIENT role.
 * Staff endpoints require ADMIN, STAFF, or ATTORNEY roles.
 *
 * @example
 * POST /api/subscriptions - Create or reactivate subscription
 * GET /api/subscriptions/me - Get client's own subscription
 * POST /api/subscriptions/cancel - Cancel active subscription
 * GET /api/subscriptions - List all subscriptions (staff only)
 */
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Creates a new subscription for the authenticated client
   * Returns subscription details and Safepay checkout URL
   *
   * @param user - Authenticated client user
   * @returns Subscription object and checkout URL for payment
   *
   * @example
   * ```typescript
   * // POST /api/subscriptions
   * // Response:
   * {
   *   "subscription": {
   *     "id": "uuid",
   *     "clientProfileId": "uuid",
   *     "planName": "civic_retainer",
   *     "monthlyAmount": 700,
   *     "currency": "PKR",
   *     "status": "pending",
   *     ...
   *   },
   *   "checkoutUrl": "https://sandbox.api.getsafepay.pk/checkout/..."
   * }
   * ```
   */
  @Post()
  @Roles(UserType.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async createSubscription(
    @CurrentUser() user: AuthUser,
  ): Promise<{ subscription: SubscriptionResponse; checkoutUrl: string }> {
    return this.subscriptionsService.createSubscription(user);
  }

  /**
   * Retrieves the authenticated client's subscription
   * Returns 404 if no subscription exists
   *
   * @param user - Authenticated client user
   * @returns The client's subscription details
   *
   * @example
   * ```typescript
   * // GET /api/subscriptions/me
   * // Response:
   * {
   *   "id": "uuid",
   *   "clientProfileId": "uuid",
   *   "planName": "civic_retainer",
   *   "status": "active",
   *   "currentPeriodStart": "2024-01-01T00:00:00Z",
   *   "currentPeriodEnd": "2024-02-01T00:00:00Z",
   *   ...
   * }
   * ```
   */
  @Get('me')
  @Roles(UserType.CLIENT)
  async getMySubscription(
    @CurrentUser() user: AuthUser,
  ): Promise<SubscriptionResponse> {
    return this.subscriptionsService.getMySubscription(user);
  }

  /**
   * Cancels the authenticated client's active subscription
   * Optionally accepts a cancellation reason
   *
   * @param user - Authenticated client user
   * @param dto - Cancellation data (optional reason)
   * @returns The cancelled subscription details
   *
   * @example
   * ```typescript
   * // POST /api/subscriptions/cancel
   * // Body:
   * {
   *   "reason": "Service no longer needed"
   * }
   * // Response:
   * {
   *   "id": "uuid",
   *   "status": "cancelled",
   *   "cancelledAt": "2024-01-15T12:00:00Z",
   *   "cancellationReason": "Service no longer needed",
   *   ...
   * }
   * ```
   */
  @Post('cancel')
  @Roles(UserType.CLIENT)
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CancelSubscriptionSchema))
    dto: CancelSubscriptionData,
  ): Promise<SubscriptionResponse> {
    return this.subscriptionsService.cancelSubscription(user, dto);
  }

  /**
   * Retrieves all subscriptions with pagination (staff only)
   * Supports sorting and filtering via query parameters
   *
   * @param pagination - Pagination and sorting parameters
   * @returns Paginated list of all subscriptions
   *
   * @example
   * ```typescript
   * // GET /api/subscriptions?page=1&limit=20&sort=created_at&order=desc
   * // Response:
   * {
   *   "data": [...],
   *   "total": 150,
   *   "page": 1,
   *   "limit": 20,
   *   "totalPages": 8
   * }
   * ```
   */
  @Get()
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY)
  async getAllSubscriptions(
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<PaginatedSubscriptionsResponse> {
    return this.subscriptionsService.getAllSubscriptions(pagination);
  }
}
