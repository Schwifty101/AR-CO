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
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ComplaintsService } from './complaints.service';
import {
  CreateComplaintSchema,
  UpdateComplaintStatusSchema,
  AssignToSchema,
  ComplaintFiltersSchema,
  PaginationSchema,
  type CreateComplaintData,
  type UpdateComplaintStatusData,
  type AssignToData,
  type ComplaintFilters,
  type ComplaintResponse,
  type PaginatedComplaintsResponse,
  type PaginationParams,
} from '@repo/shared';

/**
 * Controller responsible for handling citizen complaint-related HTTP requests
 * Provides endpoints for complaint submission, tracking, assignment, and resolution
 *
 * @remarks
 * This controller enforces role-based access control:
 * - Clients can submit and view their own complaints
 * - Staff can view all complaints and manage status/assignments
 *
 * All routes are prefixed with /api/complaints
 *
 * @example
 * ```typescript
 * // Submit a new complaint (Client only)
 * POST /api/complaints
 * Body: {
 *   title: "Road Damage",
 *   description: "Severe potholes on Main Street",
 *   targetOrganization: "City Public Works",
 *   location: "Main Street, Downtown",
 *   category: "infrastructure"
 * }
 *
 * // Get all complaints (Client sees own, Staff sees all)
 * GET /api/complaints?page=1&limit=10&status=under_review
 *
 * // Update complaint status (Staff only)
 * PATCH /api/complaints/:id/status
 * Body: { status: "resolved", resolutionNotes: "Issue fixed" }
 * ```
 */
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  /**
   * Submit a new complaint
   * Requires client role and active subscription
   *
   * @param user - The authenticated client user
   * @param dto - The complaint creation data
   * @returns The created complaint with auto-generated complaint number
   * @throws {ForbiddenException} If client does not have an active subscription
   *
   * @example
   * ```typescript
   * POST /api/complaints
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * {
   *   "title": "Water Supply Issue",
   *   "description": "No water for 3 days",
   *   "targetOrganization": "Water Authority",
   *   "location": "Block 5, Gulshan-e-Iqbal",
   *   "category": "utilities",
   *   "evidenceUrls": ["https://example.com/photo.jpg"]
   * }
   * ```
   */
  @Post()
  @Roles(UserType.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async submitComplaint(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateComplaintSchema))
    dto: CreateComplaintData,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.submitComplaint(user, dto);
  }

  /**
   * Get all complaints with pagination and filtering
   * Clients see only their own complaints, staff see all complaints
   *
   * @param user - The authenticated user
   * @param pagination - Pagination parameters
   * @param filters - Optional filters (status, targetOrganization, category)
   * @returns Paginated list of complaints
   *
   * @example
   * ```typescript
   * // Get first page of complaints with status filter
   * GET /api/complaints?page=1&limit=10&sort=created_at&order=desc&status=under_review
   *
   * // Search by target organization
   * GET /api/complaints?page=1&limit=20&targetOrganization=Municipal
   *
   * // Filter by category
   * GET /api/complaints?page=1&limit=10&category=infrastructure
   * ```
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
   * @throws {NotFoundException} If complaint does not exist
   * @throws {ForbiddenException} If client tries to access another client's complaint
   *
   * @example
   * ```typescript
   * GET /api/complaints/complaint-uuid-123
   * Authorization: Bearer <token>
   * ```
   */
  @Get(':id')
  async getComplaint(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.getComplaintById(id, user);
  }

  /**
   * Update complaint status (staff only)
   * Automatically sets resolved_at timestamp when status is RESOLVED
   *
   * @param id - The complaint ID
   * @param dto - The status update data
   * @returns The updated complaint
   * @throws {NotFoundException} If complaint does not exist
   *
   * @example
   * ```typescript
   * PATCH /api/complaints/complaint-uuid-123/status
   * Authorization: Bearer <staff-token>
   * Content-Type: application/json
   *
   * {
   *   "status": "resolved",
   *   "staffNotes": "Issue verified and escalated",
   *   "resolutionNotes": "Road repair scheduled for next week"
   * }
   * ```
   */
  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.STAFF)
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
   * @throws {NotFoundException} If complaint does not exist
   *
   * @example
   * ```typescript
   * PATCH /api/complaints/complaint-uuid-123/assign
   * Authorization: Bearer <staff-token>
   * Content-Type: application/json
   *
   * {
   *   "assignedToId": "user-profile-uuid-789"
   * }
   * ```
   */
  @Patch(':id/assign')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.OK)
  async assignComplaint(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignToSchema))
    dto: AssignToData,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.assignComplaint(id, dto);
  }
}
