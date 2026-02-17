/**
 * Shared types and utilities for the Consultations module.
 *
 * Contains the database row interface, row-to-DTO mapper, and constants
 * used by both ConsultationsService and ConsultationsPaymentService.
 *
 * @module ConsultationsModule
 */

import type { ConsultationResponse } from '@repo/shared';

/**
 * Cal.com v2 webhook payload structure for BOOKING_CREATED events.
 *
 * Cal.com webhooks use `responses.email.value` for attendee email (v2 format)
 * rather than `attendees[0].email` (v1 format).
 *
 * @see https://cal.com/docs/api-reference/v2/introduction
 */
export interface CalcomWebhookPayload {
  /** Webhook event type (e.g., 'BOOKING_CREATED', 'BOOKING_CANCELLED') */
  triggerEvent: string;
  /** Booking data payload */
  payload: {
    /** Cal.com booking UID */
    uid: string;
    /** Cal.com booking numeric ID */
    id: number;
    /** ISO 8601 start time */
    startTime: string;
    /** Optional meeting URL */
    meetingUrl?: string;
    /** Optional metadata with custom fields */
    metadata?: Record<string, unknown>;
    /** v2 format: form responses including email */
    responses?: Record<string, { value: string }>;
  };
}

/**
 * Database row interface for consultation_bookings table (snake_case)
 *
 * Maps to the consultation_bookings table schema:
 * - id: UUID primary key
 * - reference_number: Unique reference (e.g., 'CON-2026-0001')
 * - full_name, email, phone_number: Guest contact info
 * - practice_area, urgency, issue_summary, etc.: Case details
 * - consultation_fee: Fixed fee in PKR (50000)
 * - payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
 * - safepay_tracker_token, safepay_transaction_ref: Payment tracking
 * - calcom_booking_uid, calcom_booking_id: Cal.com integration
 * - booking_date, booking_time, meeting_link: Scheduled consultation
 * - booking_status: Lifecycle status
 * - created_at, updated_at: Timestamps
 */
export interface ConsultationRow {
  id: string;
  reference_number: string;
  full_name: string;
  email: string;
  phone_number: string;
  practice_area: string;
  urgency: string;
  issue_summary: string;
  relevant_dates: string | null;
  opposing_party: string | null;
  additional_notes: string | null;
  consultation_fee: number;
  payment_status: string;
  safepay_tracker_token: string | null;
  safepay_transaction_ref: string | null;
  calcom_booking_uid: string | null;
  calcom_booking_id: number | null;
  booking_date: string | null;
  booking_time: string | null;
  meeting_link: string | null;
  booking_status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fixed consultation fee in PKR (Pakistani Rupees)
 */
export const CONSULTATION_FEE_PKR = 50000;

/**
 * Maps snake_case database row to camelCase DTO
 *
 * @param row - Database row from consultation_bookings table
 * @returns Mapped consultation response object
 *
 * @example
 * ```typescript
 * const mapped = mapConsultationRow(dbRow);
 * // mapped.fullName === dbRow.full_name
 * ```
 */
export function mapConsultationRow(row: ConsultationRow): ConsultationResponse {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    fullName: row.full_name,
    email: row.email,
    phoneNumber: row.phone_number,
    practiceArea: row.practice_area,
    urgency: row.urgency as unknown as ConsultationResponse['urgency'],
    issueSummary: row.issue_summary,
    relevantDates: row.relevant_dates,
    opposingParty: row.opposing_party,
    additionalNotes: row.additional_notes,
    consultationFee: row.consultation_fee,
    paymentStatus:
      row.payment_status as unknown as ConsultationResponse['paymentStatus'],
    safepayTrackerToken: row.safepay_tracker_token,
    safepayTransactionRef: row.safepay_transaction_ref,
    calcomBookingUid: row.calcom_booking_uid,
    calcomBookingId: row.calcom_booking_id,
    bookingDate: row.booking_date,
    bookingTime: row.booking_time,
    meetingLink: row.meeting_link,
    bookingStatus:
      row.booking_status as unknown as ConsultationResponse['bookingStatus'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
