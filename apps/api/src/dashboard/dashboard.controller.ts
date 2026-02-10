/**
 * Dashboard Controller
 *
 * REST endpoints for admin and client dashboard statistics.
 *
 * @module DashboardController
 *
 * @example
 * ```
 * GET /api/dashboard/admin/stats   -> Admin/staff only
 * GET /api/dashboard/client/stats  -> Authenticated clients
 * ```
 */

import {
  Controller,
  Get,
  ForbiddenException,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { DashboardService } from './dashboard.service';
import type { AdminDashboardStats, ClientDashboardStats } from '@repo/shared';

/**
 * Controller for dashboard statistics endpoints
 *
 * @class DashboardController
 */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get admin dashboard statistics
   *
   * Returns aggregate counts of clients, active cases, and pending appointments.
   * Restricted to admin and staff users.
   *
   * @returns Admin dashboard statistics
   */
  @Get('admin/stats')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async getAdminStats(): Promise<AdminDashboardStats> {
    return this.dashboardService.getAdminStats();
  }

  /**
   * Get client dashboard statistics
   *
   * Returns counts of the client's cases, upcoming appointments, and pending invoices.
   * Requires a valid client profile.
   *
   * @param user - Authenticated user from JWT
   * @returns Client dashboard statistics
   * @throws ForbiddenException if user has no client profile
   */
  @Get('client/stats')
  async getClientStats(
    @CurrentUser() user: AuthUser,
  ): Promise<ClientDashboardStats> {
    if (!user.clientProfileId) {
      throw new ForbiddenException('No client profile found for this user');
    }
    return this.dashboardService.getClientStats(user.clientProfileId);
  }
}
