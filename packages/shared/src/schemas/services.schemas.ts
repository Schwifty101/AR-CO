import { z } from 'zod';

/** Service response (public) */
export const ServiceResponseSchema = z.object({
  id: z.string().uuid(),
  practiceAreaId: z.string().uuid().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  baseFee: z.number().nullable(),
  registrationFee: z.number().nullable(),
  estimatedDuration: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Paginated services response */
export const PaginatedServicesResponseSchema = z.object({
  data: z.array(ServiceResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
