/**
 * Admin API Client
 *
 * Client-side functions for admin analytics, CRM interactions, and dashboard feeds.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module AdminAPI
 *
 * @example
 * ```typescript
 * import { getAnalyticsStats, getClientInteractions } from '@/lib/api/admin';
 *
 * const analytics = await getAnalyticsStats();
 * const interactions = await getClientInteractions('client-uuid');
 * ```
 */

import { getSessionToken, type PaginationParams } from '@/lib/api/auth-helpers';
import type {
  AdminAnalyticsStats,
  CaseAnalytics,
  ActivityLogResponse,
  PaginatedInteractionsResponse,
  InteractionResponse,
  CreateInteractionData,
  UpdateInteractionData,
} from '@repo/shared';

// ── Analytics ──

/**
 * Fetch secondary analytics stats (subscribers, complaints, registrations)
 *
 * @returns Analytics stats for admin dashboard cards
 * @throws Error if request fails
 */
export async function getAnalyticsStats(): Promise<AdminAnalyticsStats> {
  const token = await getSessionToken();

  const response = await fetch('/api/dashboard/admin/analytics', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch analytics stats');
  }

  return (await response.json()) as AdminAnalyticsStats;
}

/**
 * Fetch recent activity log entries for dashboard feed
 *
 * @param limit - Max entries to return (default 10)
 * @returns Array of recent activity entries
 * @throws Error if request fails
 */
export async function getRecentActivities(
  limit = 10,
): Promise<ActivityLogResponse[]> {
  const token = await getSessionToken();

  const response = await fetch(
    `/api/dashboard/admin/recent-activities?limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch recent activities');
  }

  return (await response.json()) as ActivityLogResponse[];
}

/**
 * Fetch case analytics breakdown (by status, priority, resolution rate)
 *
 * @returns Case analytics data
 * @throws Error if request fails
 */
export async function getCaseAnalytics(): Promise<CaseAnalytics> {
  const token = await getSessionToken();

  const response = await fetch('/api/dashboard/admin/case-analytics', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch case analytics');
  }

  return (await response.json()) as CaseAnalytics;
}

// ── CRM Interactions ──

/**
 * Fetch interactions for a specific client
 *
 * @param clientProfileId - UUID of the client profile
 * @param params - Pagination parameters
 * @returns Paginated interactions list
 * @throws Error if request fails
 */
export async function getClientInteractions(
  clientProfileId: string,
  params?: PaginationParams,
): Promise<PaginatedInteractionsResponse> {
  const token = await getSessionToken();
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const response = await fetch(
    `/api/admin/clients/${clientProfileId}/interactions?${query}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch client interactions');
  }

  return (await response.json()) as PaginatedInteractionsResponse;
}

/**
 * Log a new interaction with a client
 *
 * @param clientProfileId - UUID of the client profile
 * @param data - Interaction data (type, subject, notes, scheduledAt)
 * @returns Created interaction
 * @throws Error if request fails
 */
export async function createInteraction(
  clientProfileId: string,
  data: CreateInteractionData,
): Promise<InteractionResponse> {
  const token = await getSessionToken();

  const response = await fetch(
    `/api/admin/clients/${clientProfileId}/interactions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to create interaction');
  }

  return (await response.json()) as InteractionResponse;
}

/**
 * Update an existing interaction
 *
 * @param interactionId - UUID of the interaction
 * @param data - Fields to update
 * @returns Updated interaction
 * @throws Error if request fails
 */
export async function updateInteraction(
  interactionId: string,
  data: UpdateInteractionData,
): Promise<InteractionResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/admin/interactions/${interactionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update interaction');
  }

  return (await response.json()) as InteractionResponse;
}

/**
 * Mark an interaction as completed
 *
 * @param interactionId - UUID of the interaction
 * @returns Updated interaction with completedAt timestamp
 * @throws Error if request fails
 */
export async function completeInteraction(
  interactionId: string,
): Promise<InteractionResponse> {
  const token = await getSessionToken();

  const response = await fetch(
    `/api/admin/interactions/${interactionId}/complete`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to complete interaction');
  }

  return (await response.json()) as InteractionResponse;
}

/**
 * Fetch upcoming scheduled interactions across all clients
 *
 * @param params - Pagination parameters
 * @returns Paginated upcoming interactions
 * @throws Error if request fails
 */
export async function getUpcomingInteractions(
  params?: PaginationParams,
): Promise<PaginatedInteractionsResponse> {
  const token = await getSessionToken();
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const response = await fetch(
    `/api/admin/interactions/upcoming?${query}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch upcoming interactions');
  }

  return (await response.json()) as PaginatedInteractionsResponse;
}
