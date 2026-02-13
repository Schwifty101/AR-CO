/**
 * Cases API Client
 *
 * Client-side functions for case management operations.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module CasesAPI
 *
 * @example
 * ```typescript
 * import { getCases, getCaseById, createCase, updateCaseStatus } from '@/lib/api/cases';
 *
 * // Fetch cases list (role-filtered)
 * const cases = await getCases({ page: 1, status: 'active' });
 *
 * // Get single case detail
 * const caseDetail = await getCaseById('case-uuid');
 *
 * // Create new case (staff only)
 * const newCase = await createCase({
 *   clientProfileId: 'client-uuid',
 *   practiceAreaId: 'practice-area-uuid',
 *   title: 'Tax Compliance Review',
 * });
 *
 * // Update status (staff only)
 * await updateCaseStatus('case-uuid', { status: 'active' });
 * ```
 */

import { getSessionToken, type PaginationParams } from './auth-helpers';
import type {
  CaseResponse,
  CaseActivityResponse,
  CreateCaseData,
  UpdateCaseData,
  UpdateCaseStatusData,
  AssignAttorneyData,
  CreateCaseActivityData,
  CaseFilters,
  PaginatedCasesResponse,
  PaginatedCaseActivitiesResponse,
} from '@repo/shared';
import { CaseStatus, CasePriority, CaseActivityType } from '@repo/shared';

// Re-export types and enums for consumers that import from this module
export type {
  CaseResponse,
  CaseActivityResponse,
  CreateCaseData,
  UpdateCaseData,
  UpdateCaseStatusData,
  AssignAttorneyData,
  CreateCaseActivityData,
  CaseFilters,
} from '@repo/shared';
export type { PaginationParams } from './auth-helpers';
export { CaseStatus, CasePriority, CaseActivityType };

/** Paginated cases response shaped for frontend consumption */
export interface PaginatedCases {
  cases: CaseResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Paginated case activities response shaped for frontend consumption */
export interface PaginatedCaseActivities {
  activities: CaseActivityResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch paginated list of cases with optional filters
 *
 * Clients see only their own cases. Staff see all cases.
 *
 * @param params - Pagination and filter parameters
 * @returns Paginated cases response
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const cases = await getCases({ page: 1, limit: 20, status: 'active', priority: 'high' });
 * ```
 */
export async function getCases(
  params?: PaginationParams & Partial<CaseFilters>,
): Promise<PaginatedCases> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.status) queryParams.set('status', params.status);
  if (params?.priority) queryParams.set('priority', params.priority);
  if (params?.clientProfileId) queryParams.set('clientProfileId', params.clientProfileId);
  if (params?.attorneyProfileId) queryParams.set('attorneyProfileId', params.attorneyProfileId);
  if (params?.practiceAreaId) queryParams.set('practiceAreaId', params.practiceAreaId);
  if (params?.search) queryParams.set('search', params.search);

  const url = `/api/cases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch cases');
  }

  const backendResponse = (await response.json()) as PaginatedCasesResponse;

  return {
    cases: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Fetch a single case by ID
 *
 * Clients can only view their own cases. Staff can view any case.
 *
 * @param id - UUID of the case
 * @returns Case detail with joined data
 * @throws Error if request fails or case not found
 *
 * @example
 * ```typescript
 * const caseDetail = await getCaseById('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getCaseById(id: string): Promise<CaseResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/cases/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch case');
  }

  return (await response.json()) as CaseResponse;
}

/**
 * Create a new case (staff only)
 *
 * @param data - Case creation data
 * @returns Created case record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const newCase = await createCase({
 *   clientProfileId: 'client-uuid',
 *   practiceAreaId: 'pa-uuid',
 *   title: 'Tax Audit Defense',
 *   priority: 'high',
 * });
 * ```
 */
export async function createCase(data: CreateCaseData): Promise<CaseResponse> {
  const token = await getSessionToken();

  const response = await fetch('/api/cases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to create case');
  }

  return (await response.json()) as CaseResponse;
}

/**
 * Update case fields (staff only)
 *
 * @param id - UUID of the case
 * @param data - Fields to update
 * @returns Updated case record
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const updated = await updateCase('case-uuid', { title: 'Updated Title' });
 * ```
 */
export async function updateCase(
  id: string,
  data: UpdateCaseData,
): Promise<CaseResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/cases/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update case');
  }

  return (await response.json()) as CaseResponse;
}

/**
 * Update case status with auto-activity logging (staff only)
 *
 * @param id - UUID of the case
 * @param data - New status
 * @returns Updated case record
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const updated = await updateCaseStatus('case-uuid', { status: 'resolved' });
 * ```
 */
export async function updateCaseStatus(
  id: string,
  data: UpdateCaseStatusData,
): Promise<CaseResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/cases/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update case status');
  }

  return (await response.json()) as CaseResponse;
}

/**
 * Delete a case (admin only)
 *
 * @param id - UUID of the case
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * await deleteCase('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function deleteCase(id: string): Promise<void> {
  const token = await getSessionToken();

  const response = await fetch(`/api/cases/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to delete case');
  }
}

/**
 * Assign an attorney to a case (staff only)
 *
 * @param id - UUID of the case
 * @param data - Attorney assignment data
 * @returns Updated case record
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const updated = await assignAttorney('case-uuid', { attorneyProfileId: 'attorney-uuid' });
 * ```
 */
export async function assignAttorney(
  id: string,
  data: AssignAttorneyData,
): Promise<CaseResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/cases/${id}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to assign attorney');
  }

  return (await response.json()) as CaseResponse;
}

/**
 * Fetch paginated activities for a case
 *
 * @param caseId - UUID of the case
 * @param params - Pagination parameters
 * @returns Paginated case activities
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const activities = await getCaseActivities('case-uuid', { page: 1, limit: 20 });
 * ```
 */
export async function getCaseActivities(
  caseId: string,
  params?: PaginationParams,
): Promise<PaginatedCaseActivities> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `/api/cases/${caseId}/activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch case activities');
  }

  const backendResponse = (await response.json()) as PaginatedCaseActivitiesResponse;

  return {
    activities: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Add an activity to a case (staff only)
 *
 * @param caseId - UUID of the case
 * @param data - Activity creation data
 * @returns The created activity
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const activity = await addCaseActivity('case-uuid', {
 *   activityType: 'note_added',
 *   title: 'Client meeting notes',
 *   description: 'Discussed settlement terms',
 * });
 * ```
 */
export async function addCaseActivity(
  caseId: string,
  data: CreateCaseActivityData,
): Promise<CaseActivityResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/cases/${caseId}/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to add case activity');
  }

  return (await response.json()) as CaseActivityResponse;
}
