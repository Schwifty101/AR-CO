import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { BlogService } from './blog.service';
import {
  CreateContentPostSchema,
  UpdateContentPostSchema,
  ContentFiltersSchema,
  PaginationSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  type CreateContentPostData,
  type UpdateContentPostData,
  type ContentFilters,
  type ContentPostResponse,
  type PaginatedContentPostsResponse,
  type PaginationParams,
  type CategoryResponse,
  type CreateCategoryData,
  type UpdateCategoryData,
} from '@repo/shared';

/**
 * Controller responsible for handling blog content and category HTTP requests
 * Provides endpoints for blog post CRUD, category management, and public content access
 *
 * @remarks
 * This controller enforces role-based access control:
 * - Public visitors can read published posts and categories
 * - Admin and Staff can create, update, sync, and manage all posts and categories
 * - Only Admin can delete posts and categories
 *
 * All routes are prefixed with /api/content
 *
 * @example
 * ```typescript
 * // Get published posts (Public)
 * GET /api/content/posts?page=1&limit=10
 *
 * // Get all posts including drafts (Admin/Staff only)
 * GET /api/content/posts/admin?page=1&limit=10&status=draft
 *
 * // Create a new blog post (Admin/Staff only)
 * POST /api/content/posts
 * Body: {
 *   title: "Understanding Corporate Tax Law",
 *   content: "...",
 *   categoryId: "category-uuid",
 *   status: "draft"
 * }
 *
 * // Manage categories
 * GET /api/content/categories
 * POST /api/content/categories
 * ```
 */
@Controller('content')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * Get published blog posts with pagination and filtering
   * Publicly accessible — returns only published posts
   *
   * @param pagination - Pagination parameters (page, limit, sort, order)
   * @param filters - Optional filters (status, categoryId, search, etc.)
   * @returns Paginated list of published blog posts
   *
   * @example
   * ```typescript
   * // Get first page of published posts
   * GET /api/content/posts?page=1&limit=10
   *
   * // Filter by category
   * GET /api/content/posts?page=1&limit=10&categoryId=category-uuid
   *
   * // Search published posts
   * GET /api/content/posts?page=1&limit=10&search=corporate+law
   * ```
   */
  @Get('posts')
  @Public()
  async getPublishedPosts(
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
    @Query(new ZodValidationPipe(ContentFiltersSchema))
    filters: ContentFilters,
  ): Promise<PaginatedContentPostsResponse> {
    return this.blogService.getPublishedPosts(pagination, filters);
  }

  /**
   * Get all blog posts including drafts (admin/staff only)
   * Returns posts in all statuses for content management
   *
   * @param pagination - Pagination parameters (page, limit, sort, order)
   * @param filters - Optional filters (status, categoryId, search, authorId, etc.)
   * @returns Paginated list of all blog posts
   *
   * @example
   * ```typescript
   * // Get all posts including drafts
   * GET /api/content/posts/admin?page=1&limit=10
   *
   * // Filter by status
   * GET /api/content/posts/admin?page=1&limit=10&status=draft
   *
   * // Filter by author
   * GET /api/content/posts/admin?page=1&limit=10&authorId=user-uuid
   * ```
   */
  @Get('posts/admin')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async getAllPosts(
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
    @Query(new ZodValidationPipe(ContentFiltersSchema))
    filters: ContentFilters,
  ): Promise<PaginatedContentPostsResponse> {
    return this.blogService.getAllPosts(pagination, filters);
  }

  /**
   * Get a single blog post by its URL slug
   * Publicly accessible — returns the post only if published (or if user is admin/staff)
   *
   * @param slug - The URL-friendly slug of the blog post
   * @returns The blog post details
   * @throws {NotFoundException} If post does not exist or is not published
   *
   * @example
   * ```typescript
   * GET /api/content/posts/understanding-corporate-tax-law
   * ```
   */
  @Get('posts/:slug')
  @Public()
  async getPostBySlug(
    @Param('slug') slug: string,
  ): Promise<ContentPostResponse> {
    return this.blogService.getPostBySlug(slug);
  }

  /**
   * Increment the view count for a blog post
   * Publicly accessible — used for analytics tracking
   *
   * @param id - The blog post ID
   * @throws {NotFoundException} If post does not exist
   *
   * @example
   * ```typescript
   * POST /api/content/posts/post-uuid-123/view
   * ```
   */
  @Post('posts/:id/view')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementView(@Param('id') id: string): Promise<void> {
    return this.blogService.incrementViewCount(id);
  }

  /**
   * Create a new blog post (admin/staff only)
   * The post can be created as draft or published immediately
   *
   * @param dto - The blog post creation data
   * @param user - The authenticated admin/staff user (becomes the author)
   * @returns The created blog post
   *
   * @example
   * ```typescript
   * POST /api/content/posts
   * Authorization: Bearer <admin-token>
   * Content-Type: application/json
   *
   * {
   *   "title": "Understanding Corporate Tax Law in Pakistan",
   *   "content": "## Introduction\n\nCorporate tax law...",
   *   "excerpt": "A comprehensive guide to corporate tax obligations",
   *   "categoryId": "category-uuid-123",
   *   "tags": ["tax", "corporate", "pakistan"],
   *   "status": "draft",
   *   "featuredImageUrl": "https://example.com/image.jpg"
   * }
   * ```
   */
  @Post('posts')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body(new ZodValidationPipe(CreateContentPostSchema))
    dto: CreateContentPostData,
    @CurrentUser() user: AuthUser,
  ): Promise<ContentPostResponse> {
    return this.blogService.createPost(dto, user);
  }

  /**
   * Update an existing blog post (admin/staff only)
   * Supports partial updates — only provided fields are changed
   *
   * @param id - The blog post ID
   * @param dto - The partial update data
   * @returns The updated blog post
   * @throws {NotFoundException} If post does not exist
   *
   * @example
   * ```typescript
   * PATCH /api/content/posts/post-uuid-123
   * Authorization: Bearer <admin-token>
   * Content-Type: application/json
   *
   * {
   *   "title": "Updated Title",
   *   "status": "published"
   * }
   * ```
   */
  @Patch('posts/:id')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async updatePost(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateContentPostSchema))
    dto: UpdateContentPostData,
  ): Promise<ContentPostResponse> {
    return this.blogService.updatePost(id, dto);
  }

  /**
   * Sync a blog post's metadata (admin/staff only)
   * Refreshes computed fields like reading time, SEO metadata, etc.
   *
   * @param id - The blog post ID
   * @returns The synced blog post with updated metadata
   * @throws {NotFoundException} If post does not exist
   *
   * @example
   * ```typescript
   * POST /api/content/posts/post-uuid-123/sync
   * Authorization: Bearer <admin-token>
   * ```
   */
  @Post('posts/:id/sync')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async syncPost(@Param('id') id: string): Promise<ContentPostResponse> {
    return this.blogService.syncFromGoogleDoc(id);
  }

  /**
   * Delete a blog post permanently (admin only)
   * This action cannot be undone
   *
   * @param id - The blog post ID
   * @throws {NotFoundException} If post does not exist
   *
   * @example
   * ```typescript
   * DELETE /api/content/posts/post-uuid-123
   * Authorization: Bearer <admin-token>
   * ```
   */
  @Delete('posts/:id')
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.blogService.deletePost(id);
  }

  /**
   * Get all content categories
   * Publicly accessible — used for navigation and filtering
   *
   * @returns Array of all content categories
   *
   * @example
   * ```typescript
   * GET /api/content/categories
   * ```
   */
  @Get('categories')
  @Public()
  async getCategories(): Promise<CategoryResponse[]> {
    return this.blogService.getCategories();
  }

  /**
   * Create a new content category (admin/staff only)
   *
   * @param dto - The category creation data
   * @returns The created category
   *
   * @example
   * ```typescript
   * POST /api/content/categories
   * Authorization: Bearer <admin-token>
   * Content-Type: application/json
   *
   * {
   *   "name": "Corporate Law",
   *   "slug": "corporate-law",
   *   "description": "Articles about corporate legal matters"
   * }
   * ```
   */
  @Post('categories')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body(new ZodValidationPipe(CreateCategorySchema))
    dto: CreateCategoryData,
  ): Promise<CategoryResponse> {
    return this.blogService.createCategory(dto);
  }

  /**
   * Update an existing content category (admin/staff only)
   * Supports partial updates — only provided fields are changed
   *
   * @param id - The category ID
   * @param dto - The partial update data
   * @returns The updated category
   * @throws {NotFoundException} If category does not exist
   *
   * @example
   * ```typescript
   * PATCH /api/content/categories/category-uuid-123
   * Authorization: Bearer <admin-token>
   * Content-Type: application/json
   *
   * {
   *   "name": "Updated Category Name",
   *   "description": "Updated description"
   * }
   * ```
   */
  @Patch('categories/:id')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async updateCategory(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCategorySchema))
    dto: UpdateCategoryData,
  ): Promise<CategoryResponse> {
    return this.blogService.updateCategory(id, dto);
  }

  /**
   * Delete a content category permanently (admin only)
   * This action cannot be undone — posts in this category will be uncategorized
   *
   * @param id - The category ID
   * @throws {NotFoundException} If category does not exist
   *
   * @example
   * ```typescript
   * DELETE /api/content/categories/category-uuid-123
   * Authorization: Bearer <admin-token>
   * ```
   */
  @Delete('categories/:id')
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.blogService.deleteCategory(id);
  }
}
