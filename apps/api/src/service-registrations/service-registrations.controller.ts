import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ServiceRegistrationsService } from './service-registrations.service';
import { ServiceRegistrationsPaymentService } from './service-registrations-payment.service';
import {
  CreateServiceRegistrationSchema,
  GuestStatusCheckSchema,
  UpdateRegistrationStatusSchema,
  PaginationSchema,
  type CreateServiceRegistrationData,
  type GuestStatusCheckData,
  type UpdateRegistrationStatusData,
  type ServiceRegistrationResponse,
  type GuestStatusResponse,
  type PaginatedServiceRegistrationsResponse,
  type PaginationParams,
} from '@repo/shared';
import { z } from 'zod';

/**
 * Schema for initiating payment on a service registration
 * Requires return and cancel URLs for Safepay redirect flow
 */
const InitiatePaymentSchema = z.object({
  returnUrl: z.string().url('Valid return URL required'),
  cancelUrl: z.string().url('Valid cancel URL required'),
});

type InitiatePaymentData = z.infer<typeof InitiatePaymentSchema>;

/**
 * Schema for assigning a registration to a staff member
 */
const AssignRegistrationSchema = z.object({
  staffId: z.string().uuid('Valid staff ID is required'),
});

type AssignRegistrationData = z.infer<typeof AssignRegistrationSchema>;

/**
 * Controller responsible for handling service registration-related HTTP requests
 * Provides endpoints for guest registration, payment, status checking, and staff management
 *
 * @remarks
 * This controller has a unique access pattern:
 * - Guest (unauthenticated) users can register, pay, and check status
 * - Authenticated clients can view their own registrations
 * - Staff can view all registrations and manage assignments/status
 *
 * All routes are prefixed with /api/service-registrations
 *
 * @example
 * ```typescript
 * // Guest registration (no auth required)
 * POST /api/service-registrations
 * Body: {
 *   serviceId: "service-uuid-123",
 *   fullName: "Ahmed Khan",
 *   email: "ahmed@example.com",
 *   phoneNumber: "+923001234567",
 *   cnic: "42101-1234567-1",
 *   address: "Block 5, Gulshan-e-Iqbal",
 *   descriptionOfNeed: "Need SECP registration"
 * }
 *
 * // Guest initiates payment (no auth required)
 * POST /api/service-registrations/:id/pay
 * Body: {
 *   returnUrl: "https://arco.pk/payment/success",
 *   cancelUrl: "https://arco.pk/payment/cancel"
 * }
 *
 * // Guest checks status (no auth required)
 * GET /api/service-registrations/status?ref=REG-2026-0001&email=ahmed@example.com
 *
 * // Client views their registrations (auth required)
 * GET /api/service-registrations?page=1&limit=10
 *
 * // Staff updates status (staff only)
 * PATCH /api/service-registrations/:id/status
 * Body: { status: "completed", staffNotes: "Certificate issued" }
 * ```
 */
@Controller('service-registrations')
export class ServiceRegistrationsController {
  constructor(
    private readonly serviceRegistrationsService: ServiceRegistrationsService,
    private readonly paymentService: ServiceRegistrationsPaymentService,
  ) {}

  /**
   * Create a new service registration (guest/unauthenticated access)
   * No authentication required - allows public to register for facilitation services
   *
   * @param dto - The registration creation data
   * @returns The created registration with reference number
   * @throws {NotFoundException} If service does not exist or is inactive
   *
   * @example
   * ```typescript
   * POST /api/service-registrations
   * Content-Type: application/json
   *
   * {
   *   "serviceId": "service-uuid-123",
   *   "fullName": "Sara Ahmed",
   *   "email": "sara@example.com",
   *   "phoneNumber": "+923001234567",
   *   "cnic": "42101-1234567-1",
   *   "address": "DHA Phase 5, Karachi",
   *   "descriptionOfNeed": "Need business NTN registration"
   * }
   * ```
   */
  @Post()
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async createRegistration(
    @Body(new ZodValidationPipe(CreateServiceRegistrationSchema))
    dto: CreateServiceRegistrationData,
  ): Promise<ServiceRegistrationResponse> {
    return this.serviceRegistrationsService.createRegistration(dto);
  }

  /**
   * Initiate payment for a service registration (guest/unauthenticated access)
   * Creates Safepay checkout session and returns checkout URL
   *
   * @param id - The registration ID
   * @param dto - Payment initiation data (returnUrl, cancelUrl)
   * @returns Checkout URL and registration ID
   * @throws {NotFoundException} If registration does not exist
   * @throws {BadRequestException} If payment already completed
   *
   * @example
   * ```typescript
   * POST /api/service-registrations/registration-uuid-123/pay
   * Content-Type: application/json
   *
   * {
   *   "returnUrl": "https://arco.pk/payment/success",
   *   "cancelUrl": "https://arco.pk/payment/cancel"
   * }
   *
   * Response:
   * {
   *   "checkoutUrl": "https://sandbox.api.getsafepay.com/checkout/...",
   *   "registrationId": "registration-uuid-123"
   * }
   * ```
   */
  @Post(':id/pay')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async initiatePayment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(InitiatePaymentSchema))
    dto: InitiatePaymentData,
  ): Promise<{ checkoutUrl: string; registrationId: string }> {
    return this.paymentService.initiatePayment(
      id,
      dto.returnUrl,
      dto.cancelUrl,
    );
  }

  /**
   * Get minimal status information for a guest user (no authentication required)
   * Requires both reference number AND email to match for security
   *
   * @param dto - Guest status check data from query params
   * @returns Minimal registration status (no sensitive info)
   * @throws {NotFoundException} If registration not found or email mismatch
   *
   * @example
   * ```typescript
   * GET /api/service-registrations/status?referenceNumber=REG-2026-0001&email=sara@example.com
   *
   * Response:
   * {
   *   "referenceNumber": "REG-2026-0001",
   *   "status": "in_progress",
   *   "paymentStatus": "paid",
   *   "createdAt": "2026-02-11T10:00:00Z"
   * }
   * ```
   */
  @Get('status')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getRegistrationStatus(
    @Query(new ZodValidationPipe(GuestStatusCheckSchema))
    dto: GuestStatusCheckData,
  ): Promise<GuestStatusResponse> {
    return this.serviceRegistrationsService.getRegistrationStatus(dto);
  }

  /**
   * Get all service registrations with pagination
   * Clients see only their own registrations, staff see all registrations
   *
   * @param user - The authenticated user
   * @param pagination - Pagination parameters
   * @returns Paginated list of registrations
   *
   * @example
   * ```typescript
   * // Client viewing their own registrations
   * GET /api/service-registrations?page=1&limit=10&sort=created_at&order=desc
   * Authorization: Bearer <client-token>
   *
   * // Staff viewing all registrations
   * GET /api/service-registrations?page=1&limit=20&sort=created_at&order=desc
   * Authorization: Bearer <staff-token>
   * ```
   */
  @Get()
  async getRegistrations(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<PaginatedServiceRegistrationsResponse> {
    return this.serviceRegistrationsService.getRegistrations(user, pagination);
  }

  /**
   * Get a single service registration by ID
   * Clients can only view their own registrations, staff can view all
   *
   * @param id - The registration ID
   * @param user - The authenticated user
   * @returns The registration details
   * @throws {NotFoundException} If registration does not exist
   * @throws {ForbiddenException} If client tries to access another client's registration
   *
   * @example
   * ```typescript
   * GET /api/service-registrations/registration-uuid-123
   * Authorization: Bearer <token>
   * ```
   */
  @Get(':id')
  async getRegistration(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ServiceRegistrationResponse> {
    return this.serviceRegistrationsService.getRegistrationById(id, user);
  }

  /**
   * Update service registration status (staff only)
   * Allows updating status and adding staff notes
   *
   * @param id - The registration ID
   * @param dto - The status update data
   * @returns The updated registration
   * @throws {NotFoundException} If registration does not exist
   *
   * @example
   * ```typescript
   * PATCH /api/service-registrations/registration-uuid-123/status
   * Authorization: Bearer <staff-token>
   * Content-Type: application/json
   *
   * {
   *   "status": "completed",
   *   "staffNotes": "NTN certificate issued and emailed to client"
   * }
   * ```
   */
  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.OK)
  async updateRegistrationStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateRegistrationStatusSchema))
    dto: UpdateRegistrationStatusData,
  ): Promise<ServiceRegistrationResponse> {
    return this.serviceRegistrationsService.updateRegistrationStatus(id, dto);
  }

  /**
   * Assign service registration to a staff member (staff only)
   * Automatically updates status to IN_PROGRESS if currently PENDING_PAYMENT or PAID
   *
   * @param id - The registration ID
   * @param dto - The assignment data (staffId)
   * @returns The updated registration
   * @throws {NotFoundException} If registration does not exist
   *
   * @example
   * ```typescript
   * PATCH /api/service-registrations/registration-uuid-123/assign
   * Authorization: Bearer <staff-token>
   * Content-Type: application/json
   *
   * {
   *   "staffId": "staff-uuid-789"
   * }
   * ```
   */
  @Patch(':id/assign')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.OK)
  async assignRegistration(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignRegistrationSchema))
    dto: AssignRegistrationData,
  ): Promise<ServiceRegistrationResponse> {
    return this.serviceRegistrationsService.assignRegistration(id, dto.staffId);
  }
}
