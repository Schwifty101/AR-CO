import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { GoogleDocsService } from './google-docs.service';
import { SeoService } from './seo.service';
import { AuditService } from '../audit/audit.service';
import {
  validateSortColumn,
  sanitizePostgrestFilter,
} from '../common/utils/query-helpers';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  PostStatus,
  UserType,
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
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for blog_posts with joined relations */
interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author_id: string;
  category_id: string | null;
  content_type: string;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  read_time: string | null;
  is_featured: boolean;
  google_doc_id: string | null;
  google_doc_url: string | null;
  metadata: Record<string, unknown>;
  author_changed_by: string | null;
  author_changed_at: string | null;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  author: { full_name: string } | null;
  category: { name: string; slug: string } | null;
}

/** Database row shape for blog_categories */
interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const POST_SELECT_WITH_JOINS =
  '*, author:user_profiles!blog_posts_author_id_fkey(full_name), category:blog_categories!blog_posts_category_id_fkey(name, slug)' as const;

const ALLOWED_POST_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'published_at',
  'view_count',
  'title',
] as const;

/**
 * Service for managing blog posts and case studies
 *
 * Handles creation from Google Docs, SEO generation, CRUD operations,
 * and category management.
 *
 * @example
 * ```typescript
 * const post = await blogService.createPost(
 *   { googleDocUrl: 'https://docs.google.com/document/d/1abc/edit', contentType: ContentType.BLOG },
 *   currentUser,
 * );
 * ```
 */
@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly googleDocsService: GoogleDocsService,
    private readonly seoService: SeoService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new content post from a Google Doc URL
   *
   * @param dto - Creation data with Google Doc URL and content type
   * @param user - Authenticated staff user (becomes author)
   * @returns Created post with SEO fields
   */
  async createPost(
    dto: CreateContentPostData,
    user: AuthUser,
  ): Promise<ContentPostResponse> {
    this.logger.log(`Creating post from Google Doc for user ${user.id}`);

    // Fetch and parse Google Doc
    const parsed = await this.googleDocsService.fetchAndParse(dto.googleDocUrl);
    const docId = this.googleDocsService.extractDocId(dto.googleDocUrl);

    // Auto-generate SEO fields
    const seo = await this.seoService.generateSeoFields(
      parsed.title,
      parsed.htmlContent,
    );

    // Merge case study metadata from template parsing with any manual overrides
    const metadata = {
      ...(parsed.caseStudyMetadata || {}),
      ...(dto.metadata || {}),
    };

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_posts')
      .insert({
        title: parsed.title,
        slug: seo.slug,
        excerpt: seo.excerpt,
        content: parsed.htmlContent,
        author_id: user.id,
        category_id: dto.categoryId ?? null,
        content_type: dto.contentType,
        status: PostStatus.DRAFT,
        meta_title: seo.metaTitle,
        meta_description: seo.metaDescription,
        read_time: seo.readTime,
        is_featured: dto.isFeatured,
        google_doc_id: docId,
        google_doc_url: dto.googleDocUrl,
        metadata,
      })
      .select(POST_SELECT_WITH_JOINS)
      .single()) as DbResult<BlogPostRow>;

    if (error || !data) {
      this.logger.error('Failed to create post', error);
      throw new InternalServerErrorException('Failed to create post');
    }

    this.logger.log(`Post created: ${data.slug}`);
    return this.mapPostRow(data);
  }

  /**
   * Update an existing content post
   *
   * @param postId - Post UUID
   * @param dto - Update data (partial)
   * @returns Updated post
   */
  async updatePost(
    postId: string,
    dto: UpdateContentPostData,
    user: AuthUser,
  ): Promise<ContentPostResponse> {
    this.logger.log(`Updating post ${postId}`);

    const adminClient = this.supabaseService.getAdminClient();
    const { data: existingPost, error: existingPostError } = (await adminClient
      .from('blog_posts')
      .select('author_id')
      .eq('id', postId)
      .single()) as DbResult<{ author_id: string }>;

    if (existingPostError || !existingPost) {
      throw new NotFoundException('Post not found');
    }

    const updateData: Record<string, unknown> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.excerpt !== undefined) updateData.excerpt = dto.excerpt;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.authorId !== undefined) {
      if (user.userType !== UserType.ADMIN) {
        throw new ForbiddenException('Only admins can change post author');
      }

      if (dto.authorId !== existingPost.author_id) {
        const { data: targetAuthor, error: targetAuthorError } =
          (await adminClient
            .from('user_profiles')
            .select('id')
            .eq('id', dto.authorId)
            .in('user_type', [UserType.ADMIN, UserType.STAFF])
            .single()) as DbResult<{ id: string }>;

        if (targetAuthorError || !targetAuthor) {
          throw new BadRequestException(
            'Author must be an existing admin or staff user',
          );
        }

        updateData.author_id = dto.authorId;
        updateData.author_changed_by = user.id;
        updateData.author_changed_at = new Date().toISOString();
      }
    }
    if (dto.featuredImage !== undefined)
      updateData.featured_image = dto.featuredImage;
    if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
    if (dto.contentType !== undefined)
      updateData.content_type = dto.contentType;
    if (dto.metaTitle !== undefined) updateData.meta_title = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      updateData.meta_description = dto.metaDescription;
    if (dto.isFeatured !== undefined) updateData.is_featured = dto.isFeatured;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === PostStatus.PUBLISHED) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = (await adminClient
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select(POST_SELECT_WITH_JOINS)
      .single()) as DbResult<BlogPostRow>;

    if (error || !data) {
      this.logger.error(`Failed to update post ${postId}`, error);
      throw new NotFoundException('Post not found');
    }

    if (
      dto.authorId !== undefined &&
      dto.authorId !== existingPost.author_id &&
      data.author_id === dto.authorId
    ) {
      await this.auditService.log({
        userId: user.id,
        action: 'CHANGE_AUTHOR',
        entityType: 'blog_post',
        entityId: postId,
        metadata: {
          oldAuthorId: existingPost.author_id,
          newAuthorId: dto.authorId,
        },
      });
    }

    return this.mapPostRow(data);
  }

  /**
   * Re-sync content from the linked Google Doc
   *
   * @param postId - Post UUID
   * @returns Updated post with fresh content and re-generated SEO
   */
  async syncFromGoogleDoc(postId: string): Promise<ContentPostResponse> {
    this.logger.log(`Syncing post ${postId} from Google Doc`);

    const adminClient = this.supabaseService.getAdminClient();

    // Fetch the existing post to get the google_doc_id
    const { data: existing, error: fetchError } = (await adminClient
      .from('blog_posts')
      .select('google_doc_id, google_doc_url')
      .eq('id', postId)
      .single()) as DbResult<{
      google_doc_id: string | null;
      google_doc_url: string | null;
    }>;

    if (fetchError || !existing?.google_doc_id) {
      throw new NotFoundException('Post not found or no Google Doc linked');
    }

    // Re-fetch and parse the document
    const parsed = await this.googleDocsService.fetchAndParse(
      existing.google_doc_id,
    );
    const seo = await this.seoService.generateSeoFields(
      parsed.title,
      parsed.htmlContent,
    );

    const updateData: Record<string, unknown> = {
      title: parsed.title,
      content: parsed.htmlContent,
      excerpt: seo.excerpt,
      meta_title: seo.metaTitle,
      meta_description: seo.metaDescription,
      read_time: seo.readTime,
    };

    // Update case study metadata if found
    if (parsed.caseStudyMetadata) {
      updateData.metadata = parsed.caseStudyMetadata;
    }

    const { data, error } = (await adminClient
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select(POST_SELECT_WITH_JOINS)
      .single()) as DbResult<BlogPostRow>;

    if (error || !data) {
      this.logger.error(`Failed to sync post ${postId}`, error);
      throw new InternalServerErrorException('Failed to sync from Google Doc');
    }

    this.logger.log(`Post ${postId} synced successfully`);
    return this.mapPostRow(data);
  }

  /**
   * Delete a content post
   *
   * @param postId - Post UUID
   */
  async deletePost(postId: string): Promise<void> {
    this.logger.log(`Deleting post ${postId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_posts')
      .delete()
      .eq('id', postId)
      .select('id')
      .single()) as DbResult<{ id: string }>;

    if (error || !data) {
      throw new NotFoundException('Post not found');
    }
  }

  /**
   * Get published posts with pagination and filters (public)
   *
   * @param pagination - Pagination parameters
   * @param filters - Content type, category, search, featured filters
   * @returns Paginated published posts
   */
  async getPublishedPosts(
    pagination: PaginationParams,
    filters: ContentFilters,
  ): Promise<PaginatedContentPostsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit, sort, order } = pagination;
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('blog_posts')
      .select(POST_SELECT_WITH_JOINS, { count: 'exact' })
      .eq('status', PostStatus.PUBLISHED);

    if (filters.contentType) {
      query = query.eq('content_type', filters.contentType);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.isFeatured) {
      query = query.eq('is_featured', true);
    }
    if (filters.search) {
      const sanitized = sanitizePostgrestFilter(filters.search);
      query = query.or(
        `title.ilike.%${sanitized}%,excerpt.ilike.%${sanitized}%`,
      );
    }

    const validSort = validateSortColumn(sort, ALLOWED_POST_SORT_COLUMNS);
    query = query
      .order(validSort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = (await query) as DbListResult<BlogPostRow>;

    if (error) {
      this.logger.error('Failed to fetch published posts', error);
      throw new InternalServerErrorException('Failed to fetch posts');
    }

    return {
      data: (data ?? []).map((row) => this.mapPostRow(row)),
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Get a single post by slug (public)
   *
   * @param slug - URL slug
   * @returns Post details
   * @throws {NotFoundException} If post not found
   */
  async getPostBySlug(slug: string): Promise<ContentPostResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_posts')
      .select(POST_SELECT_WITH_JOINS)
      .eq('slug', slug)
      .eq('status', PostStatus.PUBLISHED)
      .single()) as DbResult<BlogPostRow>;

    if (error || !data) {
      throw new NotFoundException('Post not found');
    }

    return this.mapPostRow(data);
  }

  /**
   * Get all posts for admin (staff only, includes drafts/archived)
   *
   * @param pagination - Pagination parameters
   * @param filters - Content type, category, status, search filters
   * @returns Paginated posts including all statuses
   */
  async getAllPosts(
    pagination: PaginationParams,
    filters: ContentFilters,
  ): Promise<PaginatedContentPostsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit, sort, order } = pagination;
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('blog_posts')
      .select(POST_SELECT_WITH_JOINS, { count: 'exact' });

    if (filters.contentType) {
      query = query.eq('content_type', filters.contentType);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      const sanitized = sanitizePostgrestFilter(filters.search);
      query = query.or(
        `title.ilike.%${sanitized}%,excerpt.ilike.%${sanitized}%`,
      );
    }

    const validSort = validateSortColumn(sort, ALLOWED_POST_SORT_COLUMNS);
    query = query
      .order(validSort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = (await query) as DbListResult<BlogPostRow>;

    if (error) {
      this.logger.error('Failed to fetch all posts', error);
      throw new InternalServerErrorException('Failed to fetch posts');
    }

    return {
      data: (data ?? []).map((row) => this.mapPostRow(row)),
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Increment view count for a post (fire-and-forget, no error thrown)
   *
   * Uses a simple read-then-increment approach since there is no RPC function.
   *
   * @param postId - Post UUID
   */
  async incrementViewCount(postId: string): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data } = (await adminClient
      .from('blog_posts')
      .select('view_count')
      .eq('id', postId)
      .single()) as DbResult<{ view_count: number }>;

    if (data) {
      await adminClient
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', postId);
    }
  }

  // ─── Category Methods ───

  /**
   * Get all blog categories
   *
   * @returns List of categories ordered by name
   */
  async getCategories(): Promise<CategoryResponse[]> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_categories')
      .select('*')
      .order('name', { ascending: true })) as DbListResult<CategoryRow>;

    if (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }

    return (data ?? []).map((row) => this.mapCategoryRow(row));
  }

  /**
   * Create a blog category with auto-generated slug
   *
   * @param dto - Category name and optional description
   * @returns Created category
   */
  async createCategory(dto: CreateCategoryData): Promise<CategoryResponse> {
    const slug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_categories')
      .insert({
        name: dto.name,
        slug,
        description: dto.description ?? null,
      })
      .select('*')
      .single()) as DbResult<CategoryRow>;

    if (error || !data) {
      this.logger.error('Failed to create category', error);
      throw new InternalServerErrorException('Failed to create category');
    }

    return this.mapCategoryRow(data);
  }

  /**
   * Update a blog category
   *
   * @param categoryId - Category UUID
   * @param dto - Update data (name, description)
   * @returns Updated category
   */
  async updateCategory(
    categoryId: string,
    dto: UpdateCategoryData,
  ): Promise<CategoryResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      updateData.slug = dto.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
    }
    if (dto.description !== undefined) updateData.description = dto.description;

    const { data, error } = (await adminClient
      .from('blog_categories')
      .update(updateData)
      .eq('id', categoryId)
      .select('*')
      .single()) as DbResult<CategoryRow>;

    if (error || !data) {
      throw new NotFoundException('Category not found');
    }

    return this.mapCategoryRow(data);
  }

  /**
   * Delete a blog category
   *
   * @param categoryId - Category UUID
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_categories')
      .delete()
      .eq('id', categoryId)
      .select('id')
      .single()) as DbResult<{ id: string }>;

    if (error || !data) {
      throw new NotFoundException('Category not found');
    }
  }

  // ─── Row Mappers ───

  /** Maps a blog_posts DB row (snake_case) to ContentPostResponse (camelCase) */
  private mapPostRow(row: BlogPostRow): ContentPostResponse {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      featuredImage: row.featured_image,
      authorId: row.author_id,
      authorName: row.author?.full_name ?? null,
      categoryId: row.category_id,
      categoryName: row.category?.name ?? null,
      categorySlug: row.category?.slug ?? null,
      contentType: row.content_type as ContentPostResponse['contentType'],
      status: row.status as ContentPostResponse['status'],
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      readTime: row.read_time,
      isFeatured: row.is_featured,
      googleDocId: row.google_doc_id,
      googleDocUrl: row.google_doc_url,
      metadata: row.metadata || {},
      authorChangedBy: row.author_changed_by ?? null,
      authorChangedAt: row.author_changed_at ?? null,
      publishedAt: row.published_at,
      viewCount: row.view_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /** Maps a blog_categories DB row (snake_case) to CategoryResponse (camelCase) */
  private mapCategoryRow(row: CategoryRow): CategoryResponse {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
