import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LegalNewsService } from './legal-news.service';
import {
  CreateLegalNewsSchema,
  type CreateLegalNewsData,
  type LegalNewsResponse,
} from '@repo/shared';

/**
 * Controller responsible for handling legal news feed HTTP requests
 * Provides endpoints for fetching and creating legal news items
 *
 * @remarks
 * This controller enforces role-based access control:
 * - Public visitors can view the latest legal news
 * - Admin and Staff can create new legal news items
 *
 * All routes are prefixed with /api/legal-news
 *
 * @example
 * ```typescript
 * // Get latest legal news (Public)
 * GET /api/legal-news?limit=10
 *
 * // Create a legal news item (Admin/Staff only)
 * POST /api/legal-news
 * Body: {
 *   title: "New Tax Amendment Act 2026",
 *   summary: "The Federal Board of Revenue has announced...",
 *   sourceUrl: "https://fbr.gov.pk/amendments/2026",
 *   sourceName: "FBR Official"
 * }
 * ```
 */
@Controller('legal-news')
export class LegalNewsController {
  constructor(private readonly legalNewsService: LegalNewsService) {}

  /**
   * Get the latest legal news items
   * Publicly accessible — returns news items ordered by most recent
   *
   * @param limit - Optional maximum number of items to return (defaults to 20)
   * @returns Array of legal news items
   *
   * @example
   * ```typescript
   * // Get latest 20 news items (default)
   * GET /api/legal-news
   *
   * // Get latest 5 news items
   * GET /api/legal-news?limit=5
   *
   * // Get latest 50 news items
   * GET /api/legal-news?limit=50
   * ```
   */
  @Get()
  @Public()
  async getLatestNews(
    @Query('limit') limit?: string,
  ): Promise<LegalNewsResponse[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const safeLimit = Number.isNaN(parsedLimit) ? 20 : parsedLimit;
    return this.legalNewsService.getLatestNews(safeLimit);
  }

  /**
   * Create a new legal news item (admin/staff only)
   * The news item will be immediately visible on the public feed
   *
   * @param dto - The legal news creation data
   * @returns The created legal news item
   *
   * @example
   * ```typescript
   * POST /api/legal-news
   * Authorization: Bearer <admin-token>
   * Content-Type: application/json
   *
   * {
   *   "title": "Supreme Court Ruling on Corporate Governance",
   *   "summary": "The Supreme Court of Pakistan has issued a landmark ruling...",
   *   "sourceUrl": "https://supremecourt.gov.pk/ruling/2026-123",
   *   "sourceName": "Supreme Court of Pakistan",
   *   "imageUrl": "https://example.com/news-image.jpg"
   * }
   * ```
   */
  @Post()
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.CREATED)
  async createNewsItem(
    @Body(new ZodValidationPipe(CreateLegalNewsSchema))
    dto: CreateLegalNewsData,
  ): Promise<LegalNewsResponse> {
    return this.legalNewsService.createNewsItem(dto);
  }
}
