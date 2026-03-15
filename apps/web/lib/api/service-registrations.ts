/**
 * Service Registrations API Client
 *
 * Client-side functions for facilitation service registration and payment.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * NOTE: Guest registration endpoints (createRegistration, initiatePayment, checkRegistrationStatus)
 * are PUBLIC and do not require authentication.
 *
 * @module ServiceRegistrationsAPI
 *
 * @example
 * ```typescript
 * import { createRegistration, initiatePayment, checkRegistrationStatus } from '@/lib/api/service-registrations';
 *
 * // Guest user flow (no auth required)
 * const registration = await createRegistration({
 *   serviceId: 'service-uuid',
 *   fullName: 'John Doe',
 *   email: 'john@example.com',
 *   phoneNumber: '+923001234567',
 * });
 *
 * const { checkoutUrl } = await initiatePayment(
 *   registration.id,
 *   'https://example.com/success',
 *   'https://example.com/cancel'
 * );
 * window.location.href = checkoutUrl;
 *
 * // Check status later (no auth)
 * const status = await checkRegistrationStatus('REG-001', 'john@example.com');
 * ```
 */

import { getSessionToken, type PaginationParams } from './auth-helpers';
import type {
  ServiceRegistrationResponse,
  CreateServiceRegistrationData,
  UpdateRegistrationStatusData,
  AssignToData,
  GuestStatusResponse,
  PaginatedServiceRegistrationsResponse,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type {
  ServiceRegistrationResponse,
  CreateServiceRegistrationData,
  UpdateRegistrationStatusData,
  AssignToData,
  GuestStatusResponse,
} from '@repo/shared';
export type { PaginationParams } from './auth-helpers';

/** Paginated service registrations response shaped for frontend consumption */
export interface PaginatedRegistrations {
  registrations: ServiceRegistrationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


// ==================== PUBLIC ENDPOINTS (No Auth Required) ====================

/**
 * Create a new service registration (PUBLIC - no auth required)
 *
 * Guest users can submit service registration requests without authentication.
 * A unique reference number is generated for status tracking.
 *
 * @param data - Registration data (serviceId, fullName, email, phoneNumber, etc.)
 * @returns Created registration record
 * @throws Error if request fails or validation errors occur
 *
 * @example
 * ```typescript
 * const registration = await createRegistration({
 *   serviceId: '550e8400-e29b-41d4-a716-446655440000',
 *   fullName: 'Jane Smith',
 *   email: 'jane@example.com',
 *   phoneNumber: '+923001234567',
 *   address: '123 Main St, Karachi',
 * });
 * console.log('Reference:', registration.referenceNumber);
 * ```
 */
export async function createRegistration(
  data: CreateServiceRegistrationData,
): Promise<ServiceRegistrationResponse> {
  const response = await fetch('/api/service-registrations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to create service registration');
  }

  return (await response.json()) as ServiceRegistrationResponse;
}

/**
 * Initiate payment for a service registration (PUBLIC - no auth required)
 *
 * Generates a Safepay checkout URL for the registration. Guest users can pay
 * without logging in.
 *
 * @param registrationId - UUID of the registration
 * @param returnUrl - URL to redirect to after successful payment
 * @param cancelUrl - URL to redirect to if payment is cancelled
 * @returns Object containing Safepay checkout URL and registration ID
 * @throws Error if request fails or registration not found
 *
 * @example
 * ```typescript
 * const { checkoutUrl, registrationId } = await initiatePayment(
 *   'reg-uuid',
 *   'https://example.com/payment-success',
 *   'https://example.com/payment-cancel'
 * );
 * window.location.href = checkoutUrl; // Redirect to Safepay
 * ```
 */
export async function initiatePayment(
  registrationId: string,
  returnUrl: string,
  cancelUrl: string,
): Promise<{ checkoutUrl: string; registrationId: string }> {
  const response = await fetch(`/api/service-registrations/${registrationId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ returnUrl, cancelUrl }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to initiate payment');
  }

  return (await response.json()) as { checkoutUrl: string; registrationId: string };
}

/**
 * Check registration status by reference number and email (PUBLIC - no auth required)
 *
 * Allows guest users to track their registration status using the reference
 * number and email provided during registration.
 *
 * @param ref - Registration reference number (e.g., "REG-001")
 * @param email - Email address used during registration
 * @returns Guest status response with registration details
 * @throws Error if request fails or registration not found
 *
 * @example
 * ```typescript
 * const status = await checkRegistrationStatus('REG-12345', 'jane@example.com');
 * console.log('Status:', status.status);
 * console.log('Payment Status:', status.paymentStatus);
 * ```
 */
export async function checkRegistrationStatus(
  ref: string,
  email: string,
): Promise<GuestStatusResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set('ref', ref);
  queryParams.set('email', email);

  const response = await fetch(`/api/service-registrations/status?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to check registration status');
  }

  return (await response.json()) as GuestStatusResponse;
}

// ==================== AUTHENTICATED ENDPOINTS ====================

/**
 * Fetch paginated list of service registrations
 *
 * Clients see only their own registrations. Staff see all registrations.
 *
 * @param params - Pagination parameters (page, limit)
 * @returns Paginated registrations response
 * @throws Error if request fails or user not authenticated
 *
 * @example
 * ```typescript
 * const registrations = await getMyRegistrations({ page: 1, limit: 20 });
 * console.log(`Total registrations: ${registrations.total}`);
 * ```
 */
export async function getMyRegistrations(
  params?: PaginationParams,
): Promise<PaginatedRegistrations> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `/api/service-registrations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch registrations');
  }

  const backendResponse = (await response.json()) as PaginatedServiceRegistrationsResponse;

  return {
    registrations: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Fetch a single service registration by ID
 *
 * Clients can only view their own registrations. Staff can view any registration.
 *
 * @param id - UUID of the registration
 * @returns Service registration record
 * @throws Error if request fails or registration not found
 *
 * @example
 * ```typescript
 * const registration = await getRegistrationById('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Service:', registration.serviceTitle);
 * ```
 */
export async function getRegistrationById(id: string): Promise<ServiceRegistrationResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/service-registrations/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch registration');
  }

  return (await response.json()) as ServiceRegistrationResponse;
}

/**
 * Update service registration status (staff only)
 *
 * Updates the processing status of a registration. Only staff can perform this action.
 *
 * @param id - UUID of the registration
 * @param data - Status update data
 * @returns Updated registration record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const updated = await updateRegistrationStatus('550e8400-e29b-41d4-a716-446655440000', {
 *   status: 'completed',
 *   staffNotes: 'All documents submitted to SECP',
 * });
 * ```
 */
export async function updateRegistrationStatus(
  id: string,
  data: UpdateRegistrationStatusData,
): Promise<ServiceRegistrationResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/service-registrations/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to update registration status');
  }

  return (await response.json()) as ServiceRegistrationResponse;
}

/**
 * Assign service registration to a staff member (staff only)
 *
 * Assigns a registration to a specific staff member for processing.
 *
 * @param id - UUID of the registration
 * @param data - Assignment data containing the user profile ID to assign to
 * @returns Updated registration record with assignedToId and assignedToName
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const assigned = await assignRegistration('550e8400-e29b-41d4-a716-446655440000', {
 *   assignedToId: '660e8400-e29b-41d4-a716-446655440001',
 * });
 * ```
 */
export async function assignRegistration(
  id: string,
  data: AssignToData,
): Promise<ServiceRegistrationResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/service-registrations/${id}/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to assign registration');
  }

  return (await response.json()) as ServiceRegistrationResponse;
}

// ==================== DOCUMENT ENDPOINTS ====================

/** Inline type for document response (until shared package export is available) */
export interface ServiceRegistrationDocument {
  id: string;
  registrationId: string;
  documentTypeId: string;
  documentTypeName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  uploadedAt: string;
}

/**
 * Upload a document for a service registration (PUBLIC - no auth required)
 *
 * @param registrationId - UUID of the registration
 * @param file - The file to upload
 * @param documentTypeId - Document type identifier (e.g., "cnic")
 * @param documentTypeName - Human-readable name (e.g., "CNIC Copy")
 * @returns Uploaded document metadata
 * @throws Error if upload fails
 *
 * @example
 * ```typescript
 * const doc = await uploadRegistrationDocument(
 *   'reg-uuid',
 *   file,
 *   'cnic',
 *   'CNIC Copy'
 * );
 * ```
 */
export async function uploadRegistrationDocument(
  registrationId: string,
  file: File,
  documentTypeId: string,
  documentTypeName: string,
): Promise<ServiceRegistrationDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentTypeId', documentTypeId);
  formData.append('documentTypeName', documentTypeName);

  const response = await fetch(`/api/service-registrations/${registrationId}/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || `Failed to upload document: ${file.name}`);
  }

  return (await response.json()) as ServiceRegistrationDocument;
}

/**
 * List all documents for a service registration (staff/admin only)
 *
 * @param registrationId - UUID of the registration
 * @returns Array of document metadata
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const docs = await listRegistrationDocuments('reg-uuid');
 * ```
 */
export async function listRegistrationDocuments(
  registrationId: string,
): Promise<ServiceRegistrationDocument[]> {
  const token = await getSessionToken();

  const response = await fetch(`/api/service-registrations/${registrationId}/documents`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch documents');
  }

  return (await response.json()) as ServiceRegistrationDocument[];
}

/**
 * Get a signed download URL for a document (staff/admin only, 1-hour expiry)
 *
 * @param registrationId - UUID of the registration
 * @param docId - UUID of the document
 * @returns Signed URL and original file name
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const { url, fileName } = await getDocumentDownloadUrl('reg-uuid', 'doc-uuid');
 * window.open(url, '_blank');
 * ```
 */
export async function getDocumentDownloadUrl(
  registrationId: string,
  docId: string,
): Promise<{ url: string; fileName: string }> {
  const token = await getSessionToken();

  const response = await fetch(
    `/api/service-registrations/${registrationId}/documents/${docId}/url`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to get download URL');
  }

  return (await response.json()) as { url: string; fileName: string };
}

/**
 * Claim all guest registrations matching the authenticated user's email (silent)
 *
 * Called automatically on login to link any guest-submitted registrations
 * to the user's account. Safe to call multiple times.
 *
 * @returns Number of registrations claimed
 *
 * @example
 * ```typescript
 * const { claimed } = await claimRegistrations();
 * // claimed = 2 means 2 guest registrations were linked to this account
 * ```
 */
export async function claimRegistrations(): Promise<{ claimed: number }> {
  const token = await getSessionToken();

  const response = await fetch('/api/service-registrations/claim', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Non-fatal — silently return 0 on failure
    return { claimed: 0 };
  }

  return (await response.json()) as { claimed: number };
}
