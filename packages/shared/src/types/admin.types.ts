/**
 * Admin Types
 *
 * TypeScript types inferred from admin Zod schemas.
 *
 * @module AdminTypes
 *
 * @example
 * ```typescript
 * import type { CreateInteractionData, ActivityLogResponse } from '@repo/shared';
 * ```
 */

import type { z } from 'zod';
import type {
  CreateInteractionSchema,
  UpdateInteractionSchema,
  InteractionResponseSchema,
  PaginatedInteractionsResponseSchema,
  CreateActivityLogSchema,
  ActivityLogResponseSchema,
  ActivityLogFiltersSchema,
  PaginatedActivityLogsResponseSchema,
  AdminAnalyticsStatsSchema,
  CaseAnalyticsSchema,
  RevenueAnalyticsSchema,
} from '../schemas/admin.schemas';

/** Data for creating a client interaction */
export type CreateInteractionData = z.infer<typeof CreateInteractionSchema>;

/** Data for updating a client interaction */
export type UpdateInteractionData = z.infer<typeof UpdateInteractionSchema>;

/** Client interaction response from API */
export type InteractionResponse = z.infer<typeof InteractionResponseSchema>;

/** Paginated interactions response */
export type PaginatedInteractionsResponse = z.infer<typeof PaginatedInteractionsResponseSchema>;

/** Data for creating an activity log entry */
export type CreateActivityLogData = z.infer<typeof CreateActivityLogSchema>;

/** Activity log response from API */
export type ActivityLogResponse = z.infer<typeof ActivityLogResponseSchema>;

/** Activity log query filters */
export type ActivityLogFilters = z.infer<typeof ActivityLogFiltersSchema>;

/** Paginated activity logs response */
export type PaginatedActivityLogsResponse = z.infer<typeof PaginatedActivityLogsResponseSchema>;

/** Secondary admin dashboard analytics */
export type AdminAnalyticsStats = z.infer<typeof AdminAnalyticsStatsSchema>;

/** Case analytics breakdown */
export type CaseAnalytics = z.infer<typeof CaseAnalyticsSchema>;

/** Revenue analytics (placeholder until Task 10) */
export type RevenueAnalytics = z.infer<typeof RevenueAnalyticsSchema>;
