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
  ComplaintStatusResponse,
  CreateComplaintData,
  UpdateComplaintStatusData,
  AssignToData,
  ReviewPaymentData,
  ComplaintFilters,
  PaginatedComplaintsResponse,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type {
  ComplaintResponse,
  ComplaintStatusResponse,
  CreateComplaintData,
  UpdateComplaintStatusData,
  AssignToData,
  ReviewPaymentData,
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
 * Submit a new complaint (PUBLIC — no auth, no subscription required)
 *
 * Creates a complaint against a government organization. The complaint is filed
 * as a guest; payment (PKR 1,000) is collected via a screenshot upload as the
 * final step (see {@link uploadComplaintPaymentProof}).
 *
 * @param data - Complaint data (contact + structured intake)
 * @returns Created complaint record (includes the generated complaintNumber)
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const complaint = await submitComplaint({
 *   title: 'Unlawful tax assessment',
 *   description: 'Detailed account of the incident…',
 *   targetOrganization: 'FBR',
 *   fullName: 'Sara Ahmed',
 *   email: 'sara@example.com',
 *   phoneNumber: '+923001234567',
 *   declarationTruthful: true,
 *   declarationTerms: true,
 * });
 * ```
 */
export async function submitComplaint(
  data: CreateComplaintData,
): Promise<ComplaintResponse> {
  const response = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to submit complaint');
  }

  return (await response.json()) as ComplaintResponse;
}

/**
 * Upload a manual payment screenshot for a complaint (PUBLIC — no auth)
 *
 * Advances the complaint to `awaiting_confirmation` for admin review. The
 * complaint UUID acts as the access token.
 *
 * @param id - UUID of the complaint
 * @param file - The payment screenshot (jpg/png/webp/pdf, ≤10 MB)
 * @returns Updated complaint record
 * @throws Error if upload fails
 *
 * @example
 * ```typescript
 * await uploadComplaintPaymentProof(complaint.id, screenshotFile);
 * // complaint.paymentStatus === 'awaiting_confirmation'
 * ```
 */
export async function uploadComplaintPaymentProof(
  id: string,
  file: File,
): Promise<ComplaintResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/complaints/${id}/payment-proof`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to upload payment screenshot');
  }

  return (await response.json()) as ComplaintResponse;
}

/**
 * Review a complaint's manual payment (staff/admin only): confirm or flag.
 *
 * @param id - UUID of the complaint
 * @param data - Review action + optional note
 * @returns Updated complaint record
 *
 * @example
 * ```typescript
 * await reviewComplaintPayment(id, { action: 'confirm' });
 * await reviewComplaintPayment(id, { action: 'flag', note: 'Screenshot unreadable' });
 * ```
 */
export async function reviewComplaintPayment(
  id: string,
  data: ReviewPaymentData,
): Promise<ComplaintResponse> {
  const token = await getSessionToken();
  const response = await fetch(`/api/complaints/${id}/review-payment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to review payment');
  }

  return (await response.json()) as ComplaintResponse;
}

/**
 * Get a signed URL to view the uploaded payment screenshot (staff/admin only).
 *
 * @param id - UUID of the complaint
 * @returns Signed URL valid for 1 hour
 */
export async function getComplaintProofUrl(id: string): Promise<string> {
  const token = await getSessionToken();
  const response = await fetch(`/api/complaints/${id}/payment-proof-url`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to load payment proof');
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

/**
 * Check complaint status by complaint number and email (PUBLIC — no auth)
 *
 * @param complaintNumber - The complaint number (e.g. "CMP-2026-0001")
 * @param email - Email used when filing the complaint
 * @returns Minimal complaint status
 * @throws Error if not found or email mismatch
 */
export async function getComplaintStatus(
  complaintNumber: string,
  email: string,
): Promise<ComplaintStatusResponse> {
  const params = new URLSearchParams({ complaintNumber, email });
  const response = await fetch(`/api/complaints/status?${params.toString()}`);

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to check complaint status');
  }

  return (await response.json()) as ComplaintStatusResponse;
}

/**
 * Claim all guest complaints matching the logged-in user's email.
 * Safe to call on every login — idempotent and best-effort.
 *
 * @returns Number of complaints claimed
 */
export async function claimComplaints(): Promise<{ claimed: number }> {
  const token = await getSessionToken();
  const response = await fetch('/api/complaints/claim', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return { claimed: 0 };
  }

  return (await response.json()) as { claimed: number };
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
    const error = (await response.json().catch(() => ({}))) as { message?: string };
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
    const error = (await response.json().catch(() => ({}))) as { message?: string };
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
    const error = (await response.json().catch(() => ({}))) as { message?: string };
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
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to assign complaint');
  }

  return (await response.json()) as ComplaintResponse;
}
