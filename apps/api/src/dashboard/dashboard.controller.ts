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

import { Controller, Get, Query, ForbiddenException } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { DashboardService } from './dashboard.service';
import type {
  AdminDashboardStats,
  ClientDashboardStats,
  AdminAnalyticsStats,
  CaseAnalytics,
  RevenueAnalytics,
} from '@repo/shared';

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
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY)
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

  /**
   * Get secondary analytics stats (subscribers, complaints, registrations)
   *
   * @returns Analytics stats for admin dashboard cards
   */
  @Get('admin/analytics')
  @Roles(UserType.ADMIN, UserType.ATTORNEY, UserType.STAFF)
  async getAnalyticsStats(): Promise<AdminAnalyticsStats> {
    return this.dashboardService.getAnalyticsStats();
  }

  /**
   * Get recent activity log entries for dashboard feed
   *
   * @param limit - Max entries to return (default 10, max 50)
   * @returns Array of recent activity entries
   */
  @Get('admin/recent-activities')
  @Roles(UserType.ADMIN, UserType.ATTORNEY, UserType.STAFF)
  async getRecentActivities(@Query('limit') limit?: string) {
    const parsedLimit = Math.min(
      Math.max(parseInt(limit || '10', 10) || 10, 1),
      50,
    );
    return this.dashboardService.getRecentActivities(parsedLimit);
  }

  /**
   * Get case analytics breakdown
   *
   * @returns Case analytics (byStatus, byPriority, resolutionRate)
   */
  @Get('admin/case-analytics')
  @Roles(UserType.ADMIN, UserType.ATTORNEY, UserType.STAFF)
  async getCaseAnalytics(): Promise<CaseAnalytics> {
    return this.dashboardService.getCaseAnalytics();
  }

  /**
   * Get revenue analytics (placeholder until Task 10)
   *
   * @param startDate - ISO date string for period start
   * @param endDate - ISO date string for period end
   * @returns Revenue analytics placeholder
   */
  @Get('admin/revenue-analytics')
  @Roles(UserType.ADMIN, UserType.ATTORNEY, UserType.STAFF)
  getRevenueAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): RevenueAnalytics {
    return this.dashboardService.getRevenueAnalytics(startDate, endDate);
  }
}
