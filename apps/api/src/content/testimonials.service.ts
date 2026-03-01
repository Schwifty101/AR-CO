import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  type CreateTestimonialData,
  type TestimonialResponse,
  type PaginatedTestimonialsResponse,
  type PaginationParams,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for the testimonials table */
interface TestimonialRow {
  id: string;
  client_profile_id: string;
  content: string;
  rating: number;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  client_profile: { company_name: string } | null;
}

/** Supabase select clause that joins client profile for display name */
const TESTIMONIAL_SELECT_WITH_CLIENT =
  '*, client_profile:client_profiles!testimonials_client_profile_id_fkey(company_name)' as const;

/**
 * Service for managing client testimonials
 *
 * Handles submission, approval workflow, and retrieval of testimonials.
 * Clients submit testimonials which require admin approval before public display.
 *
 * @example
 * ```typescript
 * const testimonial = await testimonialsService.submitTestimonial(
 *   { content: 'Great service!', rating: 5 },
 *   currentUser,
 * );
 * ```
 */
@Injectable()
export class TestimonialsService {
  private readonly logger = new Logger(TestimonialsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Submit a new testimonial from a client
   *
   * @param dto - Testimonial content and rating
   * @param user - Authenticated client user
   * @returns Created testimonial (pending approval)
   */
  async submitTestimonial(
    dto: CreateTestimonialData,
    user: AuthUser,
  ): Promise<TestimonialResponse> {
    if (!user.clientProfileId) {
      throw new BadRequestException('Client profile not found');
    }

    this.logger.log(`Client ${user.clientProfileId} submitting testimonial`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('testimonials')
      .insert({
        client_profile_id: user.clientProfileId,
        content: dto.content,
        rating: dto.rating,
      })
      .select(TESTIMONIAL_SELECT_WITH_CLIENT)
      .single()) as DbResult<TestimonialRow>;

    if (error || !data) {
      this.logger.error('Failed to submit testimonial', error);
      throw new InternalServerErrorException('Failed to submit testimonial');
    }

    this.logger.log(`Testimonial ${data.id} submitted successfully`);
    return this.mapTestimonialRow(data);
  }

  /**
   * Get approved testimonials for public display
   *
   * @param pagination - Pagination parameters
   * @returns Paginated list of approved testimonials
   */
  async getApprovedTestimonials(
    pagination: PaginationParams,
  ): Promise<PaginatedTestimonialsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const { data, error, count } = (await adminClient
      .from('testimonials')
      .select(TESTIMONIAL_SELECT_WITH_CLIENT, { count: 'exact' })
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)) as DbListResult<TestimonialRow>;

    if (error) {
      this.logger.error('Failed to fetch approved testimonials', error);
      throw new InternalServerErrorException('Failed to fetch testimonials');
    }

    return {
      data: (data ?? []).map((row) => this.mapTestimonialRow(row)),
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Get all testimonials for staff review (includes unapproved)
   *
   * @param pagination - Pagination parameters
   * @returns Paginated list of all testimonials
   */
  async getAllTestimonials(
    pagination: PaginationParams,
  ): Promise<PaginatedTestimonialsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const { data, error, count } = (await adminClient
      .from('testimonials')
      .select(TESTIMONIAL_SELECT_WITH_CLIENT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)) as DbListResult<TestimonialRow>;

    if (error) {
      this.logger.error('Failed to fetch all testimonials', error);
      throw new InternalServerErrorException('Failed to fetch testimonials');
    }

    return {
      data: (data ?? []).map((row) => this.mapTestimonialRow(row)),
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Approve a testimonial for public display
   *
   * @param testimonialId - Testimonial UUID
   * @param approverId - User ID of the approving admin
   * @returns Updated testimonial
   */
  async approveTestimonial(
    testimonialId: string,
    approverId: string,
  ): Promise<TestimonialResponse> {
    this.logger.log(`Approving testimonial ${testimonialId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('testimonials')
      .update({
        is_approved: true,
        approved_by: approverId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', testimonialId)
      .select(TESTIMONIAL_SELECT_WITH_CLIENT)
      .single()) as DbResult<TestimonialRow>;

    if (error || !data) {
      this.logger.error(`Failed to approve testimonial ${testimonialId}`, error);
      throw new NotFoundException('Testimonial not found');
    }

    this.logger.log(`Testimonial ${testimonialId} approved`);
    return this.mapTestimonialRow(data);
  }

  /**
   * Reject (delete) a testimonial
   *
   * @param testimonialId - Testimonial UUID
   */
  async rejectTestimonial(testimonialId: string): Promise<void> {
    this.logger.log(`Rejecting testimonial ${testimonialId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient
      .from('testimonials')
      .delete()
      .eq('id', testimonialId);

    if (error) {
      this.logger.error(`Failed to reject testimonial ${testimonialId}`, error);
      throw new InternalServerErrorException('Failed to reject testimonial');
    }
  }

  /**
   * Maps a database row (snake_case) to a TestimonialResponse (camelCase)
   */
  private mapTestimonialRow(row: TestimonialRow): TestimonialResponse {
    return {
      id: row.id,
      clientProfileId: row.client_profile_id,
      clientName: row.client_profile?.company_name ?? null,
      content: row.content,
      rating: row.rating,
      isApproved: row.is_approved,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
