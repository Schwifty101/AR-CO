/**
 * Consultations Payment Service
 *
 * Handles payment processing and Cal.com webhook integration
 * for the consultation booking lifecycle:
 * - Safepay payment session creation and verification
 * - Cal.com BOOKING_CREATED webhook handling
 *
 * @module ConsultationsModule
 *
 * @example
 * ```typescript
 * // Initiate payment for a booking
 * const session = await consultationsPaymentService.initiatePayment('booking-uuid');
 * // session.trackerToken -> 'track_xxx'
 *
 * // Confirm payment after Safepay callback
 * const updated = await consultationsPaymentService.confirmPayment('booking-uuid', {
 *   trackerToken: 'track_xxx',
 * });
 * ```
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { SafepayService } from '../payments/safepay.service';
import type { DbResult } from '../database/db-result.types';
import type {
  ConsultationPaymentInitResponse,
  ConfirmConsultationPaymentData,
  ConsultationResponse,
} from '@repo/shared';
import {
  ConsultationBookingStatus,
  ConsultationPaymentStatus,
} from '@repo/shared';
import {
  ConsultationRow,
  CONSULTATION_FEE_PKR,
  mapConsultationRow,
} from './consultations.types';

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

@Injectable()
export class ConsultationsPaymentService {
  private readonly logger = new Logger(ConsultationsPaymentService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly safepayService: SafepayService,
  ) {}

  /**
   * Initiates payment session for a booking (Step 2: Payment initiation)
   *
   * Creates a Safepay payment session and stores the tracker token.
   * Amount is fixed at CONSULTATION_FEE_PKR.
   *
   * @param bookingId - UUID of the consultation booking
   * @returns Payment session credentials for SafepayButton frontend component
   * @throws {NotFoundException} If booking not found
   * @throws {BadRequestException} If booking already paid
   *
   * @example
   * ```typescript
   * const paymentSession = await consultationsPaymentService.initiatePayment('booking-uuid');
   * // paymentSession.trackerToken -> 'track_xxx'
   * // paymentSession.publicKey -> 'sec_xxx'
   * // Frontend uses these to render SafepayButton
   * ```
   */
  async initiatePayment(
    bookingId: string,
  ): Promise<ConsultationPaymentInitResponse> {
    this.logger.log(`Initiating payment for booking: ${bookingId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data: booking, error } = (await adminClient
      .from('consultation_bookings')
      .select('id, reference_number, payment_status')
      .eq('id', bookingId)
      .single()) as DbResult<{
      id: string;
      reference_number: string;
      payment_status: string;
    }>;

    if (error || !booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      (booking.payment_status as ConsultationPaymentStatus) ===
      ConsultationPaymentStatus.PAID
    ) {
      throw new BadRequestException('Booking is already paid');
    }

    // Create Safepay payment session
    const amountInPaisa = CONSULTATION_FEE_PKR * 100;
    const session = await this.safepayService.createPaymentSession({
      amount: amountInPaisa,
      currency: 'PKR',
      orderId: booking.reference_number,
      metadata: {
        type: 'consultation',
        referenceId: booking.id,
      },
    });

    // Store tracker token in booking
    const { error: updateError } = await adminClient
      .from('consultation_bookings')
      .update({ safepay_tracker_token: session.trackerToken })
      .eq('id', bookingId);

    if (updateError) {
      this.logger.error('Failed to store tracker token', updateError);
      throw new BadRequestException(
        `Failed to update booking: ${updateError.message}`,
      );
    }

    this.logger.log(
      `Payment session created: ${session.trackerToken} for ${booking.reference_number}`,
    );

    return session;
  }

  /**
   * Confirms payment after Safepay callback (Step 3: Payment verification)
   *
   * Verifies payment with Safepay SDK, updates booking status, and stores transaction reference.
   * Idempotent: safe to call multiple times (won't duplicate if already paid).
   *
   * @param bookingId - UUID of the consultation booking
   * @param dto - Tracker token from SafepayButton onPayment callback
   * @returns Updated booking with payment_confirmed status
   * @throws {NotFoundException} If booking not found
   * @throws {BadRequestException} If payment verification fails
   *
   * @example
   * ```typescript
   * const updated = await consultationsPaymentService.confirmPayment('booking-uuid', {
   *   trackerToken: 'track_xxx',
   * });
   * // updated.paymentStatus -> 'paid'
   * // updated.bookingStatus -> 'payment_confirmed'
   * ```
   */
  async confirmPayment(
    bookingId: string,
    dto: ConfirmConsultationPaymentData,
  ): Promise<ConsultationResponse> {
    this.logger.log(
      `Confirming payment for booking: ${bookingId} with tracker: ${dto.trackerToken}`,
    );

    const adminClient = this.supabaseService.getAdminClient();

    const { data: booking, error: fetchError } = (await adminClient
      .from('consultation_bookings')
      .select('*')
      .eq('id', bookingId)
      .single()) as DbResult<ConsultationRow>;

    if (fetchError || !booking) {
      throw new NotFoundException('Booking not found');
    }

    // Idempotency check
    if (
      (booking.payment_status as ConsultationPaymentStatus) ===
      ConsultationPaymentStatus.PAID
    ) {
      this.logger.log(
        `Booking ${bookingId} already paid - returning existing record`,
      );
      return mapConsultationRow(booking);
    }

    // Verify payment with Safepay
    const verification = await this.safepayService.verifyPayment(
      dto.trackerToken,
    );

    if (!verification.isPaid) {
      this.logger.warn(
        `Payment verification failed for ${bookingId}: state=${verification.state}`,
      );
      throw new BadRequestException(
        `Payment not confirmed. Status: ${verification.state}`,
      );
    }

    // Update booking to payment_confirmed
    const { data: updated, error: updateError } = (await adminClient
      .from('consultation_bookings')
      .update({
        payment_status: ConsultationPaymentStatus.PAID,
        safepay_transaction_ref: verification.reference,
        booking_status: ConsultationBookingStatus.PAYMENT_CONFIRMED,
      })
      .eq('id', bookingId)
      .select()
      .single()) as DbResult<ConsultationRow>;

    if (updateError || !updated) {
      this.logger.error('Failed to update booking after payment', updateError);
      throw new BadRequestException(
        `Failed to update booking: ${updateError?.message ?? 'Unknown error'}`,
      );
    }

    this.logger.log(
      `Payment confirmed for booking: ${booking.reference_number} (transaction: ${verification.reference})`,
    );

    return mapConsultationRow(updated);
  }

  /**
   * Handles Cal.com webhook for appointment scheduling (Step 4: Cal.com integration)
   *
   * Triggered when guest books an appointment via embedded Cal.com.
   * Matches booking by:
   * 1. metadata.referenceNumber (if present)
   * 2. Fallback: attendee email + payment_confirmed status + no existing calcom_booking_uid
   *
   * Idempotent: skips update if calcom_booking_uid already linked.
   *
   * @param payload - Cal.com webhook payload (BOOKING_CREATED event)
   * @returns Updated booking or null if not found
   *
   * @example
   * ```typescript
   * // Cal.com sends webhook after guest schedules
   * const updated = await consultationsPaymentService.handleCalcomWebhook({
   *   triggerEvent: 'BOOKING_CREATED',
   *   payload: {
   *     uid: 'calcom-uid',
   *     id: 12345,
   *     startTime: '2026-03-15T10:00:00Z',
   *     metadata: { referenceNumber: 'CON-2026-0042' },
   *     responses: { email: { value: 'jane@example.com' } },
   *   },
   * });
   * ```
   */
  async handleCalcomWebhook(
    payload: CalcomWebhookPayload,
  ): Promise<ConsultationResponse | null> {
    this.logger.log(
      `Handling Cal.com webhook: ${payload.triggerEvent ?? 'unknown event'}`,
    );

    // Only handle BOOKING_CREATED events
    if (payload.triggerEvent !== 'BOOKING_CREATED') {
      this.logger.log('Ignoring non-BOOKING_CREATED event');
      return null;
    }

    const bookingData = payload.payload;
    const calcomUid = bookingData.uid;
    const calcomId = bookingData.id;
    const startTime = bookingData.startTime;
    const metadata = bookingData.metadata;

    const adminClient = this.supabaseService.getAdminClient();

    // Strategy 1: Match by metadata.referenceNumber
    const referenceNumber = metadata?.referenceNumber as string | undefined;
    let booking: ConsultationRow | null = null;

    if (referenceNumber) {
      this.logger.log(
        `Attempting match by referenceNumber: ${referenceNumber}`,
      );
      const { data } = (await adminClient
        .from('consultation_bookings')
        .select('*')
        .eq('reference_number', referenceNumber)
        .maybeSingle()) as DbResult<ConsultationRow>;
      booking = data;
    }

    // Strategy 2: Fallback - match by attendee email + payment_confirmed + no calcom_booking_uid
    if (!booking) {
      const attendeeEmail = bookingData.responses?.email?.value;

      if (attendeeEmail) {
        this.logger.log(`Attempting match by attendee email: ${attendeeEmail}`);
        const { data } = (await adminClient
          .from('consultation_bookings')
          .select('*')
          .eq('email', attendeeEmail)
          .eq('booking_status', ConsultationBookingStatus.PAYMENT_CONFIRMED)
          .is('calcom_booking_uid', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()) as DbResult<ConsultationRow>;
        booking = data;
      }
    }

    if (!booking) {
      this.logger.warn(
        `No matching booking found for Cal.com webhook: ${calcomUid}`,
      );
      return null;
    }

    // Idempotency: skip if already linked
    if (booking.calcom_booking_uid) {
      this.logger.log(
        `Booking ${booking.reference_number} already linked to Cal.com UID ${booking.calcom_booking_uid}`,
      );
      return mapConsultationRow(booking);
    }

    // Update booking with Cal.com details
    const bookingDateTime = new Date(startTime);
    const meetingUrl =
      (metadata?.videoCallUrl as string) ?? bookingData.meetingUrl ?? null;

    const { data: updated, error } = (await adminClient
      .from('consultation_bookings')
      .update({
        calcom_booking_uid: calcomUid,
        calcom_booking_id: calcomId,
        booking_date: bookingDateTime.toISOString().split('T')[0],
        booking_time: bookingDateTime.toISOString().split('T')[1].slice(0, 5),
        meeting_link: meetingUrl,
        booking_status: ConsultationBookingStatus.BOOKED,
      })
      .eq('id', booking.id)
      .select()
      .single()) as DbResult<ConsultationRow>;

    if (error || !updated) {
      this.logger.error('Failed to update booking with Cal.com data', error);
      throw new BadRequestException(
        'Failed to update booking with Cal.com data',
      );
    }

    this.logger.log(
      `Booking ${booking.reference_number} linked to Cal.com UID ${calcomUid}`,
    );

    return mapConsultationRow(updated);
  }
}
