import type { z } from 'zod';
import type {
  CreateContentPostSchema,
  UpdateContentPostSchema,
  ContentFiltersSchema,
  ContentPostResponseSchema,
  PaginatedContentPostsResponseSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryResponseSchema,
  CreateTestimonialSchema,
  TestimonialResponseSchema,
  PaginatedTestimonialsResponseSchema,
  CreateLegalNewsSchema,
  LegalNewsResponseSchema,
} from '../schemas/content.schemas';

/** Data for creating a content post from Google Doc */
export type CreateContentPostData = z.infer<typeof CreateContentPostSchema>;

/** Data for updating a content post */
export type UpdateContentPostData = z.infer<typeof UpdateContentPostSchema>;

/** Content post list filter parameters */
export type ContentFilters = z.infer<typeof ContentFiltersSchema>;

/** Full content post response from the API */
export type ContentPostResponse = z.infer<typeof ContentPostResponseSchema>;

/** Paginated content posts API response */
export type PaginatedContentPostsResponse = z.infer<typeof PaginatedContentPostsResponseSchema>;

/** Data for creating a blog category */
export type CreateCategoryData = z.infer<typeof CreateCategorySchema>;

/** Data for updating a blog category */
export type UpdateCategoryData = z.infer<typeof UpdateCategorySchema>;

/** Category response from the API */
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

/** Data for submitting a testimonial */
export type CreateTestimonialData = z.infer<typeof CreateTestimonialSchema>;

/** Testimonial response from the API */
export type TestimonialResponse = z.infer<typeof TestimonialResponseSchema>;

/** Paginated testimonials API response */
export type PaginatedTestimonialsResponse = z.infer<typeof PaginatedTestimonialsResponseSchema>;

/** Data for creating a legal news item */
export type CreateLegalNewsData = z.infer<typeof CreateLegalNewsSchema>;

/** Legal news response from the API */
export type LegalNewsResponse = z.infer<typeof LegalNewsResponseSchema>;
