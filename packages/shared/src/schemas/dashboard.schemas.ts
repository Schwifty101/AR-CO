/**
 * Dashboard Schemas
 *
 * Zod schemas for admin and client dashboard statistics responses.
 *
 * @module DashboardSchemas
 *
 * @example
 * ```typescript
 * import { AdminDashboardStatsSchema, ClientDashboardStatsSchema } from '@repo/shared';
 *
 * const stats = AdminDashboardStatsSchema.parse(data);
 * ```
 */

import { z } from 'zod';

/** Schema for admin dashboard aggregate statistics */
export const AdminDashboardStatsSchema = z.object({
  totalClients: z.number().int().min(0),
  activeCases: z.number().int().min(0),
  pendingAppointments: z.number().int().min(0),
});

/** Schema for client dashboard aggregate statistics */
export const ClientDashboardStatsSchema = z.object({
  myCases: z.number().int().min(0),
  upcomingAppointments: z.number().int().min(0),
  pendingInvoices: z.number().int().min(0),
});
