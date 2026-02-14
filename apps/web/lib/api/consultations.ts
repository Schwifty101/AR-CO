/**
 * Consultations API Client
 *
 * Client-side functions for consultation booking management.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * Most endpoints are public (guest flow), except staff listing endpoint.
 *
 * @module ConsultationsAPI
 *
 * @example
 * ```typescript
 * import {
 *   createConsultation,
 *   initiatePayment,
 *   confirmPayment,
 *   checkBookingStatus,
 *   getConsultations,
 * } from '@/lib/api/consultations';
 *
 * // Guest: Create consultation booking
 * const booking = await createConsultation({
 *   fullName: 'John Doe',
 *   email: 'john@example.com',
 *   phoneNumber: '+923001234567',
 *   practiceArea: 'Corporate Law',
 *   urgency: 'medium',
 *   issueSummary: 'Need advice on company registration',
 * });
 *
 * // Guest: Initiate payment flow
 * const payment = await initiatePayment(booking.id);
 *
 * // Guest: Confirm payment after Safepay redirect
 * const confirmed = await confirmPayment(booking.id, 'tracker-token-from-safepay');
 *
 * // Guest: Check booking status
 * const status = await checkBookingStatus({
 *   referenceNumber: 'CON-2026-0001',
 *   email: 'john@example.com',
 * });
 *
 * // Staff: Get all consultations (authenticated)
 * const consultations = await getConsultations({ page: 1, status: 'pending' });
 * ```
 */

import { getSessionToken, type PaginationParams } from './auth-helpers';
import type {
  CreateConsultationData,
  ConsultationResponse,
  ConsultationPaymentInitResponse,
  ConfirmConsultationPaymentData,
  ConsultationStatusResponse,
  ConsultationStatusCheckData,
  PaginatedConsultationsResponse,
  ConsultationFilters,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type {
  CreateConsultationData,
  ConsultationResponse,
  ConsultationPaymentInitResponse,
  ConfirmConsultationPaymentData,
  ConsultationStatusResponse,
  ConsultationStatusCheckData,
  ConsultationFilters,
} from '@repo/shared';
export type { PaginationParams } from './auth-helpers';

/** Paginated consultations response shaped for frontend consumption */
export interface PaginatedConsultations {
  consultations: ConsultationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Create a new consultation booking (guest endpoint)
 *
 * Creates a consultation booking record with guest contact information and case details.
 * Does not require authentication. Returns a booking with a unique reference number.
 *
 * @param data - Consultation booking data (personal info, case type, description, etc.)
 * @returns Created consultation booking record
 * @throws Error if request fails or validation errors occur
 *
 * @example
 * ```typescript
 * const booking = await createConsultation({
 *   fullName: 'Sarah Ahmed',
 *   email: 'sarah@example.com',
 *   phoneNumber: '+923001234567',
 *   practiceArea: 'Tax Law',
 *   urgency: 'high',
 *   issueSummary: 'Need help with tax audit appeal',
 * });
 * console.log('Reference:', booking.referenceNumber);
 * ```
 */
export async function createConsultation(
  data: CreateConsultationData,
): Promise<ConsultationResponse> {
  const response = await fetch('/api/consultations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to create consultation booking');
  }

  return (await response.json()) as ConsultationResponse;
}

/**
 * Initiate payment for a consultation booking (guest endpoint)
 *
 * Initiates a Safepay payment session for the consultation fee. Returns Safepay
 * tracker token and environment credentials for embedding the payment UI.
 *
 * @param bookingId - UUID of the consultation booking
 * @returns Payment initialization data (tracker token, environment, client ID)
 * @throws Error if request fails or booking not found
 *
 * @example
 * ```typescript
 * const payment = await initiatePayment('550e8400-e29b-41d4-a716-446655440000');
 * // Use payment.tracker, payment.environment, payment.clientId for Safepay embed
 * ```
 */
export async function initiatePayment(
  bookingId: string,
): Promise<ConsultationPaymentInitResponse> {
  const response = await fetch(`/api/consultations/${bookingId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to initiate payment');
  }

  return (await response.json()) as ConsultationPaymentInitResponse;
}

/**
 * Confirm payment for a consultation booking (guest endpoint)
 *
 * Confirms a payment after Safepay redirect. Verifies the payment status with Safepay
 * and updates booking status to 'payment_confirmed'. Unlocks Cal.com scheduling link.
 *
 * @param bookingId - UUID of the consultation booking
 * @param trackerToken - Safepay tracker token from payment redirect
 * @returns Updated consultation booking with payment_confirmed status
 * @throws Error if request fails, payment invalid, or booking not found
 *
 * @example
 * ```typescript
 * // After Safepay redirect: ?tracker=tok_123abc
 * const confirmed = await confirmPayment(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'tok_123abc'
 * );
 * console.log('Status:', confirmed.bookingStatus); // 'payment_confirmed'
 * ```
 */
export async function confirmPayment(
  bookingId: string,
  trackerToken: string,
): Promise<ConsultationResponse> {
  const response = await fetch(`/api/consultations/${bookingId}/confirm-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trackerToken } satisfies ConfirmConsultationPaymentData),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to confirm payment');
  }

  return (await response.json()) as ConsultationResponse;
}

/**
 * Check consultation booking status (guest endpoint)
 *
 * Allows guests to check their booking status using reference number and email.
 * Returns sanitized status information without sensitive data.
 *
 * @param params - Status check parameters (referenceNumber, email)
 * @returns Guest-safe consultation status response
 * @throws Error if request fails or booking not found
 *
 * @example
 * ```typescript
 * const status = await checkBookingStatus({
 *   referenceNumber: 'REF-ABCD1234',
 *   email: 'john@example.com',
 * });
 * console.log('Status:', status.bookingStatus);
 * console.log('Date:', status.bookingDate);
 * ```
 */
export async function checkBookingStatus(
  params: ConsultationStatusCheckData,
): Promise<ConsultationStatusResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set('referenceNumber', params.referenceNumber);
  queryParams.set('email', params.email);

  const response = await fetch(`/api/consultations/status?${queryParams.toString()}`);

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to check booking status');
  }

  return (await response.json()) as ConsultationStatusResponse;
}

/**
 * Fetch paginated list of consultations with optional filters (staff endpoint)
 *
 * Fetches all consultation bookings. Requires authentication (staff only).
 * Supports pagination and filtering by booking status, payment status, and practice area.
 *
 * @param params - Pagination and filter parameters (page, limit, bookingStatus, paymentStatus, practiceArea)
 * @returns Paginated consultations response
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const consultations = await getConsultations({
 *   page: 1,
 *   limit: 20,
 *   bookingStatus: 'scheduled',
 *   paymentStatus: 'paid',
 *   practiceArea: 'Corporate Law',
 * });
 * console.log('Total:', consultations.total);
 * ```
 */
export async function getConsultations(
  params?: PaginationParams & Partial<ConsultationFilters>,
): Promise<PaginatedConsultations> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.bookingStatus) queryParams.set('bookingStatus', params.bookingStatus);
  if (params?.paymentStatus) queryParams.set('paymentStatus', params.paymentStatus);
  if (params?.practiceArea) queryParams.set('practiceArea', params.practiceArea);

  const url = `/api/consultations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch consultations');
  }

  const backendResponse = (await response.json()) as PaginatedConsultationsResponse;

  return {
    consultations: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Fetch a single consultation booking by ID (staff endpoint)
 *
 * Retrieves full booking details including payment and scheduling data.
 * Requires authentication (staff/admin only).
 *
 * @param id - UUID of the consultation booking
 * @returns Full consultation booking details
 * @throws Error if request fails, booking not found, or user lacks permissions
 *
 * @example
 * ```typescript
 * const booking = await getConsultationById('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Reference:', booking.referenceNumber);
 * console.log('Status:', booking.bookingStatus);
 * ```
 */
export async function getConsultationById(
  id: string,
): Promise<ConsultationResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/consultations/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch consultation');
  }

  return (await response.json()) as ConsultationResponse;
}

/**
 * Cancel a consultation booking (staff endpoint)
 *
 * Sets booking status to 'cancelled'. Cannot cancel already completed or cancelled bookings.
 * Does not process refunds automatically. Requires authentication (staff/admin only).
 *
 * @param id - UUID of the consultation booking
 * @returns Updated consultation booking with cancelled status
 * @throws Error if request fails, booking not found, already cancelled/completed, or user lacks permissions
 *
 * @example
 * ```typescript
 * const cancelled = await cancelConsultation('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Status:', cancelled.bookingStatus); // 'cancelled'
 * ```
 */
export async function cancelConsultation(
  id: string,
): Promise<ConsultationResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/consultations/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to cancel consultation');
  }

  return (await response.json()) as ConsultationResponse;
}
