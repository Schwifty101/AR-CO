import { z } from 'zod';
import { ContentType, PostStatus } from '../enums';

// ─── Blog Post / Case Study Schemas ───

/** Schema for creating a content post from a Google Doc URL */
export const CreateContentPostSchema = z.object({
  googleDocUrl: z.string().min(1, 'Google Doc URL is required'),
  contentType: z.nativeEnum(ContentType).default(ContentType.BLOG),
  categoryId: z.string().uuid('Valid category ID required').optional(),
  isFeatured: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

/** Schema for updating a content post */
export const UpdateContentPostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z.string().min(1).max(500).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  featuredImage: z.string().url().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  contentType: z.nativeEnum(ContentType).optional(),
  status: z.nativeEnum(PostStatus).optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(170).optional(),
  isFeatured: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Schema for filtering content posts */
export const ContentFiltersSchema = z.object({
  contentType: z.nativeEnum(ContentType).optional(),
  categoryId: z.string().uuid().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  search: z.string().optional(),
  isFeatured: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});

/** Content post response with joined author and category */
export const ContentPostResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  featuredImage: z.string().nullable(),
  authorId: z.string().uuid(),
  authorName: z.string().nullable(),
  categoryId: z.string().uuid().nullable(),
  categoryName: z.string().nullable(),
  categorySlug: z.string().nullable(),
  contentType: z.nativeEnum(ContentType),
  status: z.nativeEnum(PostStatus),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  readTime: z.string().nullable(),
  isFeatured: z.boolean(),
  googleDocId: z.string().nullable(),
  googleDocUrl: z.string().nullable(),
  metadata: z.record(z.unknown()),
  publishedAt: z.string().nullable(),
  viewCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Paginated content posts response */
export const PaginatedContentPostsResponseSchema = z.object({
  data: z.array(ContentPostResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// ─── Category Schemas ───

/** Schema for creating a blog category */
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
});

/** Schema for updating a blog category */
export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

/** Category response */
export const CategoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ─── Testimonial Schemas ───

/** Schema for submitting a testimonial */
export const CreateTestimonialSchema = z.object({
  content: z.string().min(10, 'Testimonial must be at least 10 characters').max(2000),
  rating: z.number().int().min(1).max(5),
});

/** Testimonial response */
export const TestimonialResponseSchema = z.object({
  id: z.string().uuid(),
  clientProfileId: z.string().uuid(),
  clientName: z.string().nullable(),
  content: z.string(),
  rating: z.number(),
  isApproved: z.boolean(),
  approvedBy: z.string().uuid().nullable(),
  approvedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Paginated testimonials response */
export const PaginatedTestimonialsResponseSchema = z.object({
  data: z.array(TestimonialResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// ─── Legal News Schemas ───

/** Schema for creating a legal news item */
export const CreateLegalNewsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  source: z.string().max(255).optional(),
  url: z.string().url().optional(),
  publishedAt: z.string(),
});

/** Legal news response */
export const LegalNewsResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  source: z.string().nullable(),
  url: z.string().nullable(),
  publishedAt: z.string(),
  createdAt: z.string(),
});
