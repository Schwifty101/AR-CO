/**
 * Consultations Controller
 *
 * Exposes REST endpoints for consultation booking management:
 * - Guest endpoints: Create booking, check status
 * - Cal.com webhook: Receive appointment scheduling events
 * - Staff endpoints: List bookings, view details, cancel bookings
 *
 * @module ConsultationsModule
 *
 * @example
 * ```typescript
 * // Guest creates booking
 * POST /api/consultations
 * Body: { fullName, email, phoneNumber, practiceArea, issueSummary, ... }
 * Returns: { id, referenceNumber, ... }
 *
 * // Guest checks status
 * GET /api/consultations/status?referenceNumber=CON-2026-0042&email=jane@example.com
 * Returns: { referenceNumber, bookingStatus, paymentStatus, ... }
 *
 * // Cal.com webhook
 * POST /api/consultations/webhook/calcom
 * Body: Cal.com BOOKING_CREATED payload
 *
 * // Staff list bookings
 * GET /api/consultations?page=1&limit=20&bookingStatus=booked
 *
 * // Staff cancel booking
 * PATCH /api/consultations/:id/cancel
 * ```
 */

import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ConsultationsService } from './consultations.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UserType } from '../common/enums/user-type.enum';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateConsultationSchema,
  ConsultationStatusCheckSchema,
  PaginationSchema,
  ConsultationFiltersSchema,
  ConfirmConsultationPaymentSchema,
} from '@repo/shared';
import type {
  CreateConsultationData,
  ConsultationStatusCheckData,
  ConsultationResponse,
  ConsultationStatusResponse,
  PaginatedConsultationsResponse,
  ConsultationFilters,
  PaginationParams,
  ConsultationPaymentInitResponse,
  ConfirmConsultationPaymentData,
} from '@repo/shared';
import type { CalcomWebhookPayload } from './consultations.types';

/**
 * Consultations REST API controller
 *
 * Provides endpoints for guest consultation booking and staff management.
 * Guest endpoints are public with rate limiting. Staff endpoints require auth.
 */
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  /**
   * Create a new consultation booking (Guest endpoint - Step 1)
   *
   * Guest submits intake form with personal info and case details.
   * Returns booking with unique reference number (e.g., 'CON-2026-0042').
   *
   * Rate limited to 5 requests per minute per IP to prevent spam.
   *
   * @param dto - Guest-provided consultation details
   * @returns Created booking with reference number
   *
   * @example
   * ```bash
   * curl -X POST http://localhost:4000/api/consultations \
   *   -H "Content-Type: application/json" \
   *   -d '{
   *     "fullName": "Jane Doe",
   *     "email": "jane@example.com",
   *     "phoneNumber": "+923001234567",
   *     "practiceArea": "Corporate Law",
   *     "urgency": "high",
   *     "issueSummary": "Need legal advice on partnership agreement..."
   *   }'
   * ```
   */
  @Post()
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body(new ZodValidationPipe(CreateConsultationSchema))
    dto: CreateConsultationData,
  ): Promise<ConsultationResponse> {
    return this.consultationsService.createBooking(dto);
  }

  /**
   * Check booking status (Guest endpoint)
   *
   * Guest can track booking progress by providing reference number and email.
   * Returns minimal info for privacy (no full case details).
   *
   * Rate limited to 20 requests per minute per IP.
   *
   * @param query - Reference number and email for verification
   * @returns Guest-safe status response
   *
   * @example
   * ```bash
   * curl "http://localhost:4000/api/consultations/status?referenceNumber=CON-2026-0042&email=jane@example.com"
   * ```
   */
  @Get('status')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getBookingStatus(
    @Query(new ZodValidationPipe(ConsultationStatusCheckSchema))
    query: ConsultationStatusCheckData,
  ): Promise<ConsultationStatusResponse> {
    return this.consultationsService.getBookingStatus(query);
  }

  /**
   * Cal.com webhook endpoint (Public - no rate limit)
   *
   * Receives BOOKING_CREATED events from Cal.com when guest schedules appointment.
   * Links Cal.com booking to consultation booking in database.
   *
   * No throttling to prevent webhook delivery failures.
   *
   * @param payload - Cal.com webhook payload
   * @returns OK status (webhook handlers should return quickly)
   *
   * @example
   * ```bash
   * # Cal.com sends this webhook automatically
   * curl -X POST http://localhost:4000/api/consultations/webhook/calcom \
   *   -H "Content-Type: application/json" \
   *   -d '{ "triggerEvent": "BOOKING_CREATED", "payload": { ... } }'
   * ```
   */
  @Post('webhook/calcom')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleCalcomWebhook(
    @Body() payload: CalcomWebhookPayload,
  ): Promise<{ received: boolean }> {
    await this.consultationsService.handleCalcomWebhook(payload);
    return { received: true };
  }

  /**
   * List all consultation bookings (Staff endpoint)
   *
   * Returns paginated list with filtering and search capabilities.
   * Requires ADMIN or STAFF role.
   *
   * @param paginationQuery - Page, limit, sort, order
   * @param filtersQuery - Optional filters (bookingStatus, paymentStatus, practiceArea)
   * @param search - Optional search query (searches name and email)
   * @returns Paginated consultation bookings
   *
   * @example
   * ```bash
   * curl -H "Authorization: Bearer <token>" \
   *   "http://localhost:4000/api/consultations?page=1&limit=20&bookingStatus=booked&search=jane"
   * ```
   */
  @Get()
  @Roles(UserType.ADMIN, UserType.STAFF)
  async getBookings(
    @Query(new ZodValidationPipe(PaginationSchema))
    paginationQuery: PaginationParams,
    @Query(new ZodValidationPipe(ConsultationFiltersSchema))
    filtersQuery: ConsultationFilters,
    @Query('search') search?: string,
  ): Promise<PaginatedConsultationsResponse> {
    return this.consultationsService.getBookings(
      paginationQuery,
      filtersQuery,
      search,
    );
  }

  /**
   * Get my consultations (Client endpoint)
   *
   * Returns consultations matching the authenticated user's email.
   * Allows logged-in clients to see their booking history.
   *
   * @param user - Authenticated user from JWT
   * @param paginationQuery - Pagination parameters
   * @returns Paginated consultations for the user
   *
   * @example
   * ```bash
   * curl -H "Authorization: Bearer <token>" \
   *   "http://localhost:4000/api/consultations/my?page=1&limit=10"
   * ```
   */
  @Get('my')
  async getMyConsultations(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(PaginationSchema))
    paginationQuery: PaginationParams,
  ): Promise<PaginatedConsultationsResponse> {
    return this.consultationsService.getMyConsultations(
      user.email,
      paginationQuery,
    );
  }

  /**
   * Initiate payment for a consultation booking (Guest endpoint - Step 2)
   *
   * Creates Safepay checkout session and returns URL for guest to complete payment.
   * Guest submits payment via Safepay popup, then returns to callback page.
   *
   * Rate limited to 10 requests per minute per IP.
   *
   * @param id - UUID of the consultation booking
   * @returns Safepay checkout URL, amount, currency, order ID
   *
   * @example
   * ```bash
   * curl -X POST http://localhost:4000/api/consultations/abc-uuid/pay
   * ```
   */
  @Post(':id/pay')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async initiatePayment(
    @Param('id') id: string,
  ): Promise<ConsultationPaymentInitResponse> {
    return this.consultationsService.initiatePayment(id);
  }

  /**
   * Confirm Safepay payment (Guest endpoint - Step 3)
   *
   * Verifies payment via Safepay Reporter API and updates booking status.
   * This gates access to Cal.com scheduling (Step 4).
   *
   * Idempotent: safe to call multiple times (returns existing booking if already paid).
   *
   * Rate limited to 10 requests per minute per IP.
   *
   * @param id - UUID of the consultation booking
   * @param dto - Contains trackerToken from payment redirect callback
   * @returns Updated booking with payment_confirmed status
   *
   * @example
   * ```bash
   * curl -X POST http://localhost:4000/api/consultations/abc-uuid/confirm-payment \
   *   -H "Content-Type: application/json" \
   *   -d '{ "trackerToken": "track_xxx" }'
   * ```
   */
  @Post(':id/confirm-payment')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async confirmPayment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ConfirmConsultationPaymentSchema))
    dto: ConfirmConsultationPaymentData,
  ): Promise<ConsultationResponse> {
    return this.consultationsService.confirmPayment(id, dto);
  }

  /**
   * Get booking by ID (Staff endpoint)
   *
   * Returns full booking details including payment and Cal.com info.
   * Requires ADMIN or STAFF role.
   *
   * @param id - UUID of the consultation booking
   * @returns Full booking details
   *
   * @example
   * ```bash
   * curl -H "Authorization: Bearer <token>" \
   *   http://localhost:4000/api/consultations/abc-uuid
   * ```
   */
  @Get(':id')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async getBookingById(@Param('id') id: string): Promise<ConsultationResponse> {
    return this.consultationsService.getBookingById(id);
  }

  /**
   * Cancel a consultation booking (Staff endpoint)
   *
   * Sets booking status to 'cancelled'. Does not automatically process refunds.
   * Requires ADMIN or STAFF role.
   *
   * @param id - UUID of the consultation booking
   * @returns Updated booking with cancelled status
   *
   * @example
   * ```bash
   * curl -X PATCH -H "Authorization: Bearer <token>" \
   *   http://localhost:4000/api/consultations/abc-uuid/cancel
   * ```
   */
  @Patch(':id/cancel')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async cancelBooking(@Param('id') id: string): Promise<ConsultationResponse> {
    return this.consultationsService.cancelBooking(id);
  }
}
