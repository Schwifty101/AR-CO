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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ComplaintsService } from './complaints.service';
import {
  CreateComplaintSchema,
  ComplaintStatusCheckSchema,
  UpdateComplaintStatusSchema,
  AssignToSchema,
  ComplaintFiltersSchema,
  PaginationSchema,
  ReviewPaymentSchema,
  type CreateComplaintData,
  type ComplaintStatusCheckData,
  type UpdateComplaintStatusData,
  type AssignToData,
  type ReviewPaymentData,
  type ComplaintFilters,
  type ComplaintResponse,
  type ComplaintStatusResponse,
  type PaginatedComplaintsResponse,
  type PaginationParams,
} from '@repo/shared';

/**
 * Controller responsible for handling citizen complaint-related HTTP requests
 * Provides endpoints for guest complaint submission, manual payment, tracking,
 * assignment, and resolution.
 *
 * @remarks
 * This controller has a guest-capable access pattern (mirroring service
 * registrations):
 * - Guest (unauthenticated) users can submit, pay (upload screenshot), and check status
 * - Authenticated clients can view their own (email-claimed) complaints
 * - Staff/admin can view all complaints and manage payment/status/assignments
 *
 * All routes are prefixed with /api/complaints
 *
 * @example
 * ```typescript
 * // Guest submits a complaint (no auth required)
 * POST /api/complaints
 * Body: { title, description, targetOrganization, fullName, email, phoneNumber, … }
 *
 * // Guest uploads payment screenshot (no auth required)
 * POST /api/complaints/:id/payment-proof  (multipart/form-data: file)
 *
 * // Guest checks status (no auth required)
 * GET /api/complaints/status?complaintNumber=CMP-2026-0001&email=ahmed@example.com
 * ```
 */
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  /**
   * Submit a new complaint (guest/unauthenticated access)
   *
   * @param dto - The complaint creation data
   * @returns The created complaint with auto-generated complaint number
   */
  @Post()
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async submitComplaint(
    @Body(new ZodValidationPipe(CreateComplaintSchema))
    dto: CreateComplaintData,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.submitComplaint(dto);
  }

  /**
   * Get minimal complaint status for a guest user (no authentication required)
   * Requires both complaint number AND email to match for security
   *
   * @param dto - Guest status check data from query params
   * @returns Minimal complaint status (no sensitive info)
   * @throws {NotFoundException} If complaint not found or email mismatch
   */
  @Get('status')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getComplaintStatus(
    @Query(new ZodValidationPipe(ComplaintStatusCheckSchema))
    dto: ComplaintStatusCheckData,
  ): Promise<ComplaintStatusResponse> {
    return this.complaintsService.getComplaintStatus(dto);
  }

  /**
   * Claim all guest complaints matching the authenticated user's email.
   * Should be called silently on every login from the frontend.
   * Safe to call multiple times — already-linked complaints are skipped.
   *
   * @param user - The authenticated user
   * @returns Number of complaints claimed
   */
  @Post('claim')
  @HttpCode(HttpStatus.OK)
  async claimComplaints(
    @CurrentUser() user: AuthUser,
  ): Promise<{ claimed: number }> {
    return this.complaintsService.claimComplaints(user);
  }

  /**
   * Get all complaints with pagination and filtering
   * Clients see only their own complaints, staff see all complaints
   *
   * @param user - The authenticated user
   * @param pagination - Pagination parameters
   * @param filters - Optional filters (status, targetOrganization, category, paymentStatus)
   * @returns Paginated list of complaints
   */
  @Get()
  async getComplaints(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
    @Query(new ZodValidationPipe(ComplaintFiltersSchema))
    filters: ComplaintFilters,
  ): Promise<PaginatedComplaintsResponse> {
    return this.complaintsService.getComplaints(user, pagination, filters);
  }

  /**
   * Get a single complaint by ID
   * Clients can only view their own complaints, staff can view all
   *
   * @param id - The complaint ID
   * @param user - The authenticated user
   * @returns The complaint details
   */
  @Get(':id')
  async getComplaint(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.getComplaintById(id, user);
  }

  /**
   * Upload a manual payment screenshot for a complaint (PUBLIC - no auth)
   *
   * Accepts multipart/form-data with a `file` field (jpg/png/webp/pdf, ≤10 MB).
   * Advances the complaint to `awaiting_confirmation` for admin review. The
   * complaint UUID acts as the access token. Rate limited to 10/min per IP.
   *
   * @param id - The complaint UUID
   * @param file - Uploaded payment screenshot
   * @returns Updated complaint
   */
  @Post(':id/payment-proof')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else
          cb(
            new BadRequestException(
              'Only JPG, PNG, WEBP, and PDF files are allowed',
            ),
            false,
          );
      },
    }),
  )
  async uploadPaymentProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ComplaintResponse> {
    if (!file) {
      throw new BadRequestException('Payment screenshot file is required');
    }
    return this.complaintsService.uploadPaymentProof(id, file);
  }

  /**
   * Review a manual payment (admin/staff only): confirm or flag.
   *
   * Confirm marks the complaint paid and emails the client. Flag marks it
   * flagged and emails the client. Neither touches the complaint status lifecycle.
   *
   * @param id - The complaint UUID
   * @param user - Authenticated admin/staff user
   * @param dto - Review action + optional note
   * @returns Updated complaint
   */
  @Patch(':id/review-payment')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.OK)
  async reviewPayment(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ReviewPaymentSchema)) dto: ReviewPaymentData,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.reviewPayment(id, user, dto);
  }

  /**
   * Get a signed URL to view the uploaded payment screenshot (admin/staff only).
   *
   * @param id - The complaint UUID
   * @returns `{ url }` — signed URL valid for 1 hour
   */
  @Get(':id/payment-proof-url')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async getPaymentProofUrl(@Param('id') id: string): Promise<{ url: string }> {
    return this.complaintsService.getPaymentProofUrl(id);
  }

  /**
   * Update complaint status (staff only)
   * Automatically sets resolved_at timestamp when status is RESOLVED
   *
   * @param id - The complaint ID
   * @param dto - The status update data
   * @returns The updated complaint
   */
  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY)
  @HttpCode(HttpStatus.OK)
  async updateComplaintStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateComplaintStatusSchema))
    dto: UpdateComplaintStatusData,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.updateComplaintStatus(id, dto);
  }

  /**
   * Assign complaint to a user (staff/attorney) (staff only)
   * Automatically updates status to UNDER_REVIEW if currently SUBMITTED
   *
   * @param id - The complaint ID
   * @param dto - The assignment data (assignedToId)
   * @returns The updated complaint
   */
  @Patch(':id/assign')
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY)
  @HttpCode(HttpStatus.OK)
  async assignComplaint(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignToSchema))
    dto: AssignToData,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.assignComplaint(id, dto);
  }
}
