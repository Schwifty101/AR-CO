/**
 * Admin Controller
 *
 * REST endpoints for CRM client interactions and system activity logs.
 * All endpoints require ADMIN, ATTORNEY, or STAFF role.
 *
 * @module AdminController
 *
 * @example
 * ```
 * GET  /api/admin/activity-logs                          -> Query activity logs
 * GET  /api/admin/clients/:clientProfileId/interactions  -> Client interactions list
 * POST /api/admin/clients/:clientProfileId/interactions  -> Log new interaction
 * PATCH /api/admin/interactions/:id                      -> Update interaction
 * PATCH /api/admin/interactions/:id/complete             -> Mark interaction complete
 * GET  /api/admin/interactions/upcoming                  -> Upcoming interactions
 * ```
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UsePipes,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ClientInteractionsService } from './client-interactions.service';
import { ActivityLogsService } from './activity-logs.service';
import { CreateInteractionSchema, UpdateInteractionSchema } from '@repo/shared';
import type {
  CreateInteractionData,
  UpdateInteractionData,
  InteractionResponse,
  PaginatedInteractionsResponse,
  PaginatedActivityLogsResponse,
} from '@repo/shared';

/** @class AdminController */
@Controller('admin')
@Roles(UserType.ADMIN, UserType.ATTORNEY, UserType.STAFF)
export class AdminController {
  constructor(
    private readonly interactionsService: ClientInteractionsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  // -- Activity Logs --

  /**
   * Query activity logs with filters and pagination
   *
   * @returns Paginated activity log entries
   */
  @Get('activity-logs')
  async getActivityLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaginatedActivityLogsResponse> {
    const pagination = {
      page: Math.max(parseInt(page || '1', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit || '20', 10) || 20, 1), 100),
    };
    const filters = {
      ...(action && { action }),
      ...(entityType && { entityType }),
      ...(userId && { userId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    return this.activityLogsService.getLogs(pagination, filters);
  }

  // -- Client Interactions --

  /**
   * Get interactions for a specific client
   *
   * @param clientProfileId - UUID of the client profile
   * @returns Paginated interactions list
   */
  @Get('clients/:clientProfileId/interactions')
  async getClientInteractions(
    @Param('clientProfileId') clientProfileId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedInteractionsResponse> {
    const pagination = {
      page: Math.max(parseInt(page || '1', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit || '20', 10) || 20, 1), 100),
    };
    return this.interactionsService.getClientInteractions(
      clientProfileId,
      pagination,
    );
  }

  /**
   * Log a new interaction with a client
   *
   * @param clientProfileId - UUID of the client profile
   * @param dto - Interaction data
   * @param user - Current authenticated user (used as staff_user_id)
   * @returns Created interaction
   */
  @Post('clients/:clientProfileId/interactions')
  @UsePipes(new ZodValidationPipe(CreateInteractionSchema))
  async createInteraction(
    @Param('clientProfileId') clientProfileId: string,
    @Body() dto: CreateInteractionData,
    @CurrentUser() user: AuthUser,
  ): Promise<InteractionResponse> {
    return this.interactionsService.logInteraction(clientProfileId, dto, user);
  }

  /**
   * Get upcoming scheduled interactions (across all clients)
   *
   * @returns Paginated upcoming interactions
   */
  @Get('interactions/upcoming')
  async getUpcomingInteractions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedInteractionsResponse> {
    const pagination = {
      page: Math.max(parseInt(page || '1', 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit || '20', 10) || 20, 1), 100),
    };
    return this.interactionsService.getUpcomingInteractions(pagination);
  }

  /**
   * Update an existing interaction
   *
   * @param id - UUID of the interaction
   * @param dto - Fields to update
   * @returns Updated interaction
   */
  @Patch('interactions/:id')
  @UsePipes(new ZodValidationPipe(UpdateInteractionSchema))
  async updateInteraction(
    @Param('id') id: string,
    @Body() dto: UpdateInteractionData,
  ): Promise<InteractionResponse> {
    return this.interactionsService.updateInteraction(id, dto);
  }

  /**
   * Mark an interaction as completed
   *
   * @param id - UUID of the interaction
   * @returns Updated interaction with completedAt timestamp
   */
  @Patch('interactions/:id/complete')
  async completeInteraction(
    @Param('id') id: string,
  ): Promise<InteractionResponse> {
    return this.interactionsService.completeInteraction(id);
  }
}
