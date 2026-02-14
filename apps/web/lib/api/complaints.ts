/**
 * Complaints API Client
 *
 * Client-side functions for complaint management.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module ComplaintsAPI
 *
 * @example
 * ```typescript
 * import { submitComplaint, getComplaints, updateComplaintStatus } from '@/lib/api/complaints';
 *
 * // Submit new complaint (client with active subscription)
 * const complaint = await submitComplaint({
 *   targetOrganization: 'FBR',
 *   category: 'tax',
 *   description: 'Issue with tax return',
 * });
 *
 * // Get complaints list
 * const complaints = await getComplaints({ page: 1, status: 'pending' });
 *
 * // Update status (staff only)
 * const updated = await updateComplaintStatus('complaint-id', { status: 'in_progress' });
 * ```
 */

import { getSessionToken, type PaginationParams } from './auth-helpers';
import type {
  ComplaintResponse,
  CreateComplaintData,
  UpdateComplaintStatusData,
  AssignToData,
  ComplaintFilters,
  PaginatedComplaintsResponse,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type {
  ComplaintResponse,
  CreateComplaintData,
  UpdateComplaintStatusData,
  AssignToData,
  ComplaintFilters,
} from '@repo/shared';
export type { PaginationParams } from './auth-helpers';

/** Paginated complaints response shaped for frontend consumption */
export interface PaginatedComplaints {
  complaints: ComplaintResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


/**
 * Submit a new complaint (client with active subscription only)
 *
 * Creates a new complaint against a government organization. Requires an active subscription.
 *
 * @param data - Complaint data (targetOrganization, category, description, etc.)
 * @returns Created complaint record
 * @throws Error if request fails or user lacks active subscription
 *
 * @example
 * ```typescript
 * const complaint = await submitComplaint({
 *   targetOrganization: 'SECP',
 *   category: 'registration',
 *   description: 'Delay in company registration approval',
 *   urgencyLevel: 'high',
 * });
 * ```
 */
export async function submitComplaint(
  data: CreateComplaintData,
): Promise<ComplaintResponse> {
  const token = await getSessionToken();

  const response = await fetch('/api/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to submit complaint');
  }

  return (await response.json()) as ComplaintResponse;
}

/**
 * Fetch paginated list of complaints with optional filters
 *
 * Clients see only their own complaints. Staff see all complaints.
 *
 * @param params - Pagination and filter parameters (page, limit, status, targetOrganization, category)
 * @returns Paginated complaints response
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const complaints = await getComplaints({
 *   page: 1,
 *   limit: 20,
 *   status: 'pending',
 *   category: 'tax',
 * });
 * ```
 */
export async function getComplaints(
  params?: PaginationParams & Partial<ComplaintFilters>,
): Promise<PaginatedComplaints> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.status) queryParams.set('status', params.status);
  if (params?.targetOrganization) queryParams.set('targetOrganization', params.targetOrganization);
  if (params?.category) queryParams.set('category', params.category);

  const url = `/api/complaints${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch complaints');
  }

  const backendResponse = (await response.json()) as PaginatedComplaintsResponse;

  return {
    complaints: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Fetch a single complaint by ID
 *
 * Clients can only view their own complaints. Staff can view any complaint.
 *
 * @param id - UUID of the complaint
 * @returns Complaint record
 * @throws Error if request fails or complaint not found
 *
 * @example
 * ```typescript
 * const complaint = await getComplaintById('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Status:', complaint.status);
 * ```
 */
export async function getComplaintById(id: string): Promise<ComplaintResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/complaints/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch complaint');
  }

  return (await response.json()) as ComplaintResponse;
}

/**
 * Update complaint status (staff only)
 *
 * Updates the status of a complaint. Only staff members can perform this action.
 *
 * @param id - UUID of the complaint
 * @param data - Status update data
 * @returns Updated complaint record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const updated = await updateComplaintStatus('550e8400-e29b-41d4-a716-446655440000', {
 *   status: 'resolved',
 *   resolutionNotes: 'Issue resolved after contacting FBR',
 * });
 * ```
 */
export async function updateComplaintStatus(
  id: string,
  data: UpdateComplaintStatusData,
): Promise<ComplaintResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/complaints/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update complaint status');
  }

  return (await response.json()) as ComplaintResponse;
}

/**
 * Assign complaint to a staff member (staff only)
 *
 * Assigns a complaint to a specific attorney or staff member for handling.
 *
 * @param id - UUID of the complaint
 * @param data - Assignment data containing the user profile ID to assign to
 * @returns Updated complaint record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const assigned = await assignComplaint('550e8400-e29b-41d4-a716-446655440000', {
 *   assignedToId: '660e8400-e29b-41d4-a716-446655440001',
 * });
 * ```
 */
export async function assignComplaint(
  id: string,
  data: AssignToData,
): Promise<ComplaintResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/complaints/${id}/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to assign complaint');
  }

  return (await response.json()) as ComplaintResponse;
}
