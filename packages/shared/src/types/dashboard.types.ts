/**
 * Dashboard Types
 *
 * TypeScript types inferred from dashboard Zod schemas.
 *
 * @module DashboardTypes
 *
 * @example
 * ```typescript
 * import type { AdminDashboardStats, ClientDashboardStats } from '@repo/shared';
 *
 * const stats: AdminDashboardStats = {
 *   totalClients: 42,
 *   activeCases: 15,
 *   pendingAppointments: 7,
 * };
 * ```
 */

import type { z } from 'zod';
import type {
  AdminDashboardStatsSchema,
  ClientDashboardStatsSchema,
} from '../schemas/dashboard.schemas';

/** Admin dashboard statistics */
export type AdminDashboardStats = z.infer<typeof AdminDashboardStatsSchema>;

/** Client dashboard statistics */
export type ClientDashboardStats = z.infer<typeof ClientDashboardStatsSchema>;
