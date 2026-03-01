import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { TestimonialsService } from './testimonials.service';
import {
  CreateTestimonialSchema,
  PaginationSchema,
  type CreateTestimonialData,
  type TestimonialResponse,
  type PaginatedTestimonialsResponse,
  type PaginationParams,
} from '@repo/shared';

/**
 * Controller responsible for handling client testimonial HTTP requests
 * Provides endpoints for testimonial submission, approval, and public display
 *
 * @remarks
 * This controller enforces role-based access control:
 * - Public visitors can view approved testimonials
 * - Clients can submit new testimonials
 * - Admin and Staff can view all testimonials (including pending/rejected)
 * - Only Admin can approve or reject testimonials
 *
 * All routes are prefixed with /api/testimonials
 *
 * @example
 * ```typescript
 * // Get approved testimonials (Public)
 * GET /api/testimonials?page=1&limit=10
 *
 * // Submit a testimonial (Client only)
 * POST /api/testimonials
 * Body: {
 *   content: "Excellent legal representation!",
 *   rating: 5
 * }
 *
 * // View all testimonials including pending (Admin/Staff)
 * GET /api/testimonials/all?page=1&limit=10
 *
 * // Approve a testimonial (Admin only)
 * POST /api/testimonials/:id/approve
 * ```
 */
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  /**
   * Get approved testimonials with pagination
   * Publicly accessible — returns only testimonials that have been approved by admin
   *
   * @param pagination - Pagination parameters (page, limit, sort, order)
   * @returns Paginated list of approved testimonials
   *
   * @example
   * ```typescript
   * // Get first page of approved testimonials
   * GET /api/testimonials?page=1&limit=10
   *
   * // Get testimonials sorted by most recent
   * GET /api/testimonials?page=1&limit=5&sort=created_at&order=desc
   * ```
   */
  @Get()
  @Public()
  async getApprovedTestimonials(
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<PaginatedTestimonialsResponse> {
    return this.testimonialsService.getApprovedTestimonials(pagination);
  }

  /**
   * Submit a new testimonial (client only)
   * The testimonial will be in pending status until approved by an admin
   *
   * @param dto - The testimonial creation data
   * @param user - The authenticated client user
   * @returns The created testimonial in pending status
   *
   * @example
   * ```typescript
   * POST /api/testimonials
   * Authorization: Bearer <client-token>
   * Content-Type: application/json
   *
   * {
   *   "content": "AR&CO provided exceptional legal counsel for our corporate merger. Highly recommended!",
   *   "rating": 5
   * }
   * ```
   */
  @Post()
  @Roles(UserType.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async submitTestimonial(
    @Body(new ZodValidationPipe(CreateTestimonialSchema))
    dto: CreateTestimonialData,
    @CurrentUser() user: AuthUser,
  ): Promise<TestimonialResponse> {
    return this.testimonialsService.submitTestimonial(dto, user);
  }

  /**
   * Get all testimonials including pending and rejected (admin/staff only)
   * Used for testimonial moderation and management
   *
   * @param pagination - Pagination parameters (page, limit, sort, order)
   * @returns Paginated list of all testimonials with their statuses
   *
   * @example
   * ```typescript
   * // Get all testimonials for moderation
   * GET /api/testimonials/all?page=1&limit=10
   *
   * // Get testimonials sorted by submission date
   * GET /api/testimonials/all?page=1&limit=20&sort=created_at&order=desc
   * ```
   */
  @Get('all')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async getAllTestimonials(
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<PaginatedTestimonialsResponse> {
    return this.testimonialsService.getAllTestimonials(pagination);
  }

  /**
   * Approve a pending testimonial (admin only)
   * Makes the testimonial visible on the public website
   *
   * @param id - The testimonial ID
   * @param user - The authenticated admin user (recorded as approver)
   * @returns The approved testimonial
   * @throws {NotFoundException} If testimonial does not exist
   *
   * @example
   * ```typescript
   * POST /api/testimonials/testimonial-uuid-123/approve
   * Authorization: Bearer <admin-token>
   * ```
   */
  @Post(':id/approve')
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approveTestimonial(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<TestimonialResponse> {
    return this.testimonialsService.approveTestimonial(id, user.id);
  }

  /**
   * Reject a pending testimonial (admin only)
   * Removes the testimonial from the approval queue
   *
   * @param id - The testimonial ID
   * @throws {NotFoundException} If testimonial does not exist
   *
   * @example
   * ```typescript
   * POST /api/testimonials/testimonial-uuid-123/reject
   * Authorization: Bearer <admin-token>
   * ```
   */
  @Post(':id/reject')
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectTestimonial(@Param('id') id: string): Promise<void> {
    return this.testimonialsService.rejectTestimonial(id);
  }
}
