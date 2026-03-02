/**
 * Admin Schemas
 *
 * Zod schemas for admin module: client interactions, activity logs, and analytics.
 *
 * @module AdminSchemas
 *
 * @example
 * ```typescript
 * import { CreateInteractionSchema, ActivityLogResponseSchema } from '@repo/shared';
 *
 * const data = CreateInteractionSchema.parse(requestBody);
 * ```
 */

import { z } from 'zod';

// ── Interaction Schemas ──

/** Schema for creating a client interaction */
export const CreateInteractionSchema = z.object({
  interactionType: z.enum(['call', 'email', 'meeting', 'whatsapp', 'other']),
  subject: z.string().min(1, 'Subject is required').max(255),
  notes: z.string().max(5000).optional(),
  scheduledAt: z.string().datetime().optional(),
});

/** Schema for updating an existing client interaction */
export const UpdateInteractionSchema = z.object({
  interactionType: z.enum(['call', 'email', 'meeting', 'whatsapp', 'other']).optional(),
  subject: z.string().min(1).max(255).optional(),
  notes: z.string().max(5000).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

/** Schema for a client interaction response from the API */
export const InteractionResponseSchema = z.object({
  id: z.string().uuid(),
  clientProfileId: z.string().uuid(),
  staffUserId: z.string().uuid(),
  interactionType: z.enum(['call', 'email', 'meeting', 'whatsapp', 'other']),
  subject: z.string(),
  notes: z.string().nullable(),
  scheduledAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  staffName: z.string(),
});

/** Schema for paginated interactions response */
export const PaginatedInteractionsResponseSchema = z.object({
  data: z.array(InteractionResponseSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

// ── Activity Log Schemas ──

/** Schema for creating an activity log entry */
export const CreateActivityLogSchema = z.object({
  action: z.string().min(1).max(100),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Schema for an activity log response */
export const ActivityLogResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().uuid().nullable(),
  metadata: z.record(z.unknown()),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
  userName: z.string().nullable(),
});

/** Schema for activity log query filters */
export const ActivityLogFiltersSchema = z.object({
  action: z.string().optional(),
  entityType: z.string().optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/** Schema for paginated activity logs response */
export const PaginatedActivityLogsResponseSchema = z.object({
  data: z.array(ActivityLogResponseSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

// ── Analytics Schemas ──

/** Schema for secondary admin dashboard analytics stats */
export const AdminAnalyticsStatsSchema = z.object({
  activeSubscribers: z.number().int().min(0),
  openComplaints: z.number().int().min(0),
  pendingRegistrations: z.number().int().min(0),
});

/** Schema for case analytics breakdown */
export const CaseAnalyticsSchema = z.object({
  byStatus: z.record(z.number().int().min(0)),
  byPriority: z.record(z.number().int().min(0)),
  resolutionRate: z.number().min(0).max(100),
  avgResolutionDays: z.number().min(0),
  totalCases: z.number().int().min(0),
});

/**
 * Schema for revenue analytics
 * NOTE: Placeholder — will be populated when Task 10 (Payments/Invoices) is completed
 */
export const RevenueAnalyticsSchema = z.object({
  totalRevenue: z.number().min(0),
  periodRevenue: z.number().min(0),
  revenueByType: z.record(z.number().min(0)),
  trend: z.array(z.object({
    period: z.string(),
    amount: z.number().min(0),
  })),
});
