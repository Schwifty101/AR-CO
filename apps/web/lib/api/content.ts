/**
 * Content API Client
 *
 * Client-side functions for content management including blog posts,
 * categories, testimonials, and legal news.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module ContentAPI
 *
 * @example
 * ```typescript
 * import {
 *   getPublishedPosts,
 *   getPostBySlug,
 *   createPost,
 *   getCategories,
 *   getApprovedTestimonials,
 *   getLatestNews,
 * } from '@/lib/api/content';
 *
 * // Get published blog posts (public)
 * const posts = await getPublishedPosts({ page: 1, limit: 10, contentType: 'blog_post' });
 *
 * // Get a single post by slug (public)
 * const post = await getPostBySlug('understanding-tax-law-2026');
 *
 * // Create a new post (admin only)
 * const newPost = await createPost({
 *   title: 'New Blog Post',
 *   contentType: 'blog_post',
 *   body: 'Post content here...',
 * });
 *
 * // Get approved testimonials (public)
 * const testimonials = await getApprovedTestimonials({ page: 1, limit: 5 });
 *
 * // Get latest legal news (public)
 * const news = await getLatestNews(5);
 * ```
 */

import { getSessionToken, type PaginationParams } from './auth-helpers';
import type {
  ContentPostResponse,
  PaginatedContentPostsResponse,
  CreateContentPostData,
  UpdateContentPostData,
  ContentFilters,
  CategoryResponse,
  CreateCategoryData,
  UpdateCategoryData,
  TestimonialResponse,
  PaginatedTestimonialsResponse,
  CreateTestimonialData,
  LegalNewsResponse,
  CreateLegalNewsData,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type {
  ContentPostResponse,
  PaginatedContentPostsResponse,
  CreateContentPostData,
  UpdateContentPostData,
  ContentFilters,
  CategoryResponse,
  CreateCategoryData,
  UpdateCategoryData,
  TestimonialResponse,
  PaginatedTestimonialsResponse,
  CreateTestimonialData,
  LegalNewsResponse,
  CreateLegalNewsData,
} from '@repo/shared';
export type { PaginationParams } from './auth-helpers';

/** Paginated content posts response shaped for frontend consumption */
export interface PaginatedContent {
  posts: ContentPostResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Paginated testimonials response shaped for frontend consumption */
export interface PaginatedTestimonials {
  testimonials: TestimonialResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


// ---------------------------------------------------------------------------
// Blog/Content Posts
// ---------------------------------------------------------------------------

/**
 * Fetch paginated list of published content posts (public)
 *
 * Returns only published posts visible to the public. Supports filtering
 * by content type, category, search term, and featured status.
 *
 * @param params - Pagination and filter parameters
 * @returns Paginated content posts response
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const posts = await getPublishedPosts({
 *   page: 1,
 *   limit: 10,
 *   contentType: 'blog_post',
 *   categoryId: 'category-uuid',
 *   search: 'tax law',
 *   isFeatured: true,
 * });
 * console.log('Total posts:', posts.total);
 * ```
 */
export async function getPublishedPosts(
  params?: PaginationParams & Partial<ContentFilters>,
): Promise<PaginatedContent> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.contentType) queryParams.set('contentType', params.contentType);
  if (params?.categoryId) queryParams.set('categoryId', params.categoryId);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.isFeatured !== undefined) queryParams.set('isFeatured', params.isFeatured.toString());

  const url = `/api/content/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch published posts');
  }

  const backendResponse = (await response.json()) as PaginatedContentPostsResponse;

  return {
    posts: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Fetch a single content post by its URL slug (public)
 *
 * Returns the full post content including body, metadata, and category.
 * Used for rendering individual blog post / legal update pages.
 *
 * @param slug - URL-friendly slug of the post (e.g., 'understanding-tax-law-2026')
 * @returns Content post record
 * @throws Error if request fails or post not found
 *
 * @example
 * ```typescript
 * const post = await getPostBySlug('understanding-tax-law-2026');
 * console.log('Title:', post.title);
 * console.log('Author:', post.authorName);
 * ```
 */
export async function getPostBySlug(slug: string): Promise<ContentPostResponse> {
  const response = await fetch(`/api/content/posts/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch post');
  }

  return (await response.json()) as ContentPostResponse;
}

/**
 * Fetch paginated list of all content posts for admin management (auth required)
 *
 * Returns posts in all statuses (draft, published, archived) for admin content
 * management. Supports filtering by content type, category, status, and search.
 *
 * @param params - Pagination and filter parameters including status
 * @returns Paginated content posts response
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const posts = await getAdminPosts({
 *   page: 1,
 *   limit: 20,
 *   contentType: 'blog_post',
 *   status: 'draft',
 *   search: 'corporate',
 * });
 * console.log('Draft posts:', posts.total);
 * ```
 */
export async function getAdminPosts(
  params?: PaginationParams & Partial<ContentFilters>,
): Promise<PaginatedContent> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.contentType) queryParams.set('contentType', params.contentType);
  if (params?.categoryId) queryParams.set('categoryId', params.categoryId);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.search) queryParams.set('search', params.search);

  const url = `/api/content/posts/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch admin posts');
  }

  const backendResponse = (await response.json()) as PaginatedContentPostsResponse;

  return {
    posts: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Create a new content post (auth required)
 *
 * Creates a new blog post or legal update. Only admin/staff can create posts.
 * The post is created in draft status by default.
 *
 * @param data - Content post data (title, contentType, body, categoryId, etc.)
 * @returns Created content post record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const post = await createPost({
 *   title: 'Understanding Corporate Tax Changes in 2026',
 *   contentType: 'blog_post',
 *   body: '<p>The recent changes to corporate tax law...</p>',
 *   categoryId: 'category-uuid',
 *   excerpt: 'A summary of key corporate tax changes.',
 *   isFeatured: false,
 * });
 * console.log('Created post:', post.id);
 * ```
 */
export async function createPost(
  data: CreateContentPostData,
): Promise<ContentPostResponse> {
  const token = await getSessionToken();

  const response = await fetch('/api/content/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to create post');
  }

  return (await response.json()) as ContentPostResponse;
}

/**
 * Update an existing content post (auth required)
 *
 * Updates one or more fields of a content post. Only admin/staff can update posts.
 * All fields in the update data are optional (partial update).
 *
 * @param id - UUID of the content post
 * @param data - Partial content post data to update
 * @returns Updated content post record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const updated = await updatePost('550e8400-e29b-41d4-a716-446655440000', {
 *   title: 'Updated Title',
 *   status: 'published',
 *   isFeatured: true,
 * });
 * console.log('Updated post status:', updated.status);
 * ```
 */
export async function updatePost(
  id: string,
  data: UpdateContentPostData,
): Promise<ContentPostResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/content/posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update post');
  }

  return (await response.json()) as ContentPostResponse;
}

/**
 * Sync a content post from external source (auth required)
 *
 * Triggers a re-sync of the post content from its external source (e.g., Notion).
 * Only admin/staff can sync posts.
 *
 * @param id - UUID of the content post to sync
 * @returns Synced content post record with updated content
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const synced = await syncPost('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Last synced:', synced.lastSyncedAt);
 * ```
 */
export async function syncPost(id: string): Promise<ContentPostResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/content/posts/${id}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to sync post');
  }

  return (await response.json()) as ContentPostResponse;
}

/**
 * Delete a content post (auth required)
 *
 * Permanently deletes a content post. Only admin/staff can delete posts.
 *
 * @param id - UUID of the content post to delete
 * @returns void
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * await deletePost('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Post deleted successfully');
 * ```
 */
export async function deletePost(id: string): Promise<void> {
  const token = await getSessionToken();

  const response = await fetch(`/api/content/posts/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to delete post');
  }
}

/**
 * Increment the view count of a content post (public)
 *
 * Fire-and-forget call to increment the view counter for analytics.
 * Does not require authentication. Errors are silently ignored.
 *
 * @param id - UUID of the content post
 * @returns void
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * // Call when a user views a post page
 * await incrementView('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function incrementView(id: string): Promise<void> {
  const response = await fetch(`/api/content/posts/${id}/view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to increment view count');
  }
}


// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/**
 * Fetch all content categories (public)
 *
 * Returns the full list of content categories for filtering blog posts
 * and legal updates. No authentication required.
 *
 * @returns Array of category records
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const categories = await getCategories();
 * categories.forEach(cat => console.log(cat.name, cat.slug));
 * ```
 */
export async function getCategories(): Promise<CategoryResponse[]> {
  const response = await fetch('/api/content/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch categories');
  }

  return (await response.json()) as CategoryResponse[];
}

/**
 * Create a new content category (auth required)
 *
 * Creates a new category for organizing content posts. Only admin/staff
 * can create categories.
 *
 * @param data - Category data (name, slug, description)
 * @returns Created category record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const category = await createCategory({
 *   name: 'Corporate Law',
 *   slug: 'corporate-law',
 *   description: 'Articles about corporate legal matters',
 * });
 * console.log('Created category:', category.id);
 * ```
 */
export async function createCategory(
  data: CreateCategoryData,
): Promise<CategoryResponse> {
  const token = await getSessionToken();

  const response = await fetch('/api/content/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to create category');
  }

  return (await response.json()) as CategoryResponse;
}

/**
 * Update an existing content category (auth required)
 *
 * Updates one or more fields of a category. Only admin/staff can update categories.
 *
 * @param id - UUID of the category to update
 * @param data - Partial category data to update
 * @returns Updated category record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const updated = await updateCategory('550e8400-e29b-41d4-a716-446655440000', {
 *   name: 'Updated Category Name',
 *   description: 'Updated description',
 * });
 * console.log('Updated category:', updated.name);
 * ```
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryData,
): Promise<CategoryResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/content/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update category');
  }

  return (await response.json()) as CategoryResponse;
}

/**
 * Delete a content category (auth required)
 *
 * Permanently deletes a content category. Only admin/staff can delete categories.
 * Posts in the deleted category will have their category reference removed.
 *
 * @param id - UUID of the category to delete
 * @returns void
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * await deleteCategory('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Category deleted successfully');
 * ```
 */
export async function deleteCategory(id: string): Promise<void> {
  const token = await getSessionToken();

  const response = await fetch(`/api/content/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to delete category');
  }
}


// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

/**
 * Fetch paginated list of approved testimonials (public)
 *
 * Returns only approved testimonials visible to the public.
 * Used for the website testimonials section.
 *
 * @param params - Pagination parameters (page, limit)
 * @returns Paginated testimonials response
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const testimonials = await getApprovedTestimonials({ page: 1, limit: 5 });
 * testimonials.testimonials.forEach(t => console.log(t.clientName, t.rating));
 * ```
 */
export async function getApprovedTestimonials(
  params?: PaginationParams,
): Promise<PaginatedTestimonials> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `/api/testimonials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch approved testimonials');
  }

  const backendResponse = (await response.json()) as PaginatedTestimonialsResponse;

  return {
    testimonials: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Submit a new testimonial (auth required)
 *
 * Submits a testimonial from an authenticated client. The testimonial
 * will be in pending status until approved by admin/staff.
 *
 * @param data - Testimonial data (content, rating, etc.)
 * @returns Created testimonial record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const testimonial = await submitTestimonial({
 *   content: 'AR&CO provided excellent legal representation.',
 *   rating: 5,
 * });
 * console.log('Submitted testimonial:', testimonial.id);
 * ```
 */
export async function submitTestimonial(
  data: CreateTestimonialData,
): Promise<TestimonialResponse> {
  const token = await getSessionToken();

  const response = await fetch('/api/testimonials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to submit testimonial');
  }

  return (await response.json()) as TestimonialResponse;
}

/**
 * Fetch paginated list of all testimonials for admin management (auth required)
 *
 * Returns testimonials in all statuses (pending, approved, rejected) for
 * admin moderation. Only admin/staff can access this endpoint.
 *
 * @param params - Pagination parameters (page, limit)
 * @returns Paginated testimonials response
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const all = await getAllTestimonials({ page: 1, limit: 20 });
 * console.log('Pending testimonials:', all.testimonials.filter(t => t.status === 'pending').length);
 * ```
 */
export async function getAllTestimonials(
  params?: PaginationParams,
): Promise<PaginatedTestimonials> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `/api/testimonials/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch all testimonials');
  }

  const backendResponse = (await response.json()) as PaginatedTestimonialsResponse;

  return {
    testimonials: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Approve a pending testimonial (auth required)
 *
 * Marks a testimonial as approved so it appears on the public website.
 * Only admin/staff can approve testimonials.
 *
 * @param id - UUID of the testimonial to approve
 * @returns Approved testimonial record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const approved = await approveTestimonial('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Testimonial approved:', approved.status);
 * ```
 */
export async function approveTestimonial(
  id: string,
): Promise<TestimonialResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/testimonials/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to approve testimonial');
  }

  return (await response.json()) as TestimonialResponse;
}

/**
 * Reject a pending testimonial (auth required)
 *
 * Marks a testimonial as rejected. It will not appear on the public website.
 * Only admin/staff can reject testimonials.
 *
 * @param id - UUID of the testimonial to reject
 * @returns void
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * await rejectTestimonial('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Testimonial rejected');
 * ```
 */
export async function rejectTestimonial(id: string): Promise<void> {
  const token = await getSessionToken();

  const response = await fetch(`/api/testimonials/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to reject testimonial');
  }
}


// ---------------------------------------------------------------------------
// Legal News
// ---------------------------------------------------------------------------

/**
 * Fetch latest legal news items (public)
 *
 * Returns the most recent legal news items for the website news section.
 * No authentication required.
 *
 * @param limit - Maximum number of news items to return (defaults to server default)
 * @returns Array of legal news records
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const news = await getLatestNews(5);
 * news.forEach(item => console.log(item.title, item.sourceUrl));
 * ```
 */
export async function getLatestNews(
  limit?: number,
): Promise<LegalNewsResponse[]> {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.set('limit', limit.toString());

  const url = `/api/legal-news${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch latest news');
  }

  return (await response.json()) as LegalNewsResponse[];
}

/**
 * Create a new legal news item (auth required)
 *
 * Creates a legal news entry linking to an external source. Only admin/staff
 * can create news items.
 *
 * @param data - Legal news data (title, sourceUrl, summary, etc.)
 * @returns Created legal news record
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const newsItem = await createNewsItem({
 *   title: 'New Tax Amendment Bill Passed',
 *   sourceUrl: 'https://example.com/tax-amendment-2026',
 *   summary: 'The National Assembly passed the Tax Amendment Bill 2026...',
 *   source: 'Dawn News',
 * });
 * console.log('Created news item:', newsItem.id);
 * ```
 */
export async function createNewsItem(
  data: CreateLegalNewsData,
): Promise<LegalNewsResponse> {
  const token = await getSessionToken();

  const response = await fetch('/api/legal-news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to create news item');
  }

  return (await response.json()) as LegalNewsResponse;
}
