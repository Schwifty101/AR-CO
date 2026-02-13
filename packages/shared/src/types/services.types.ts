import type { z } from 'zod';
import type {
  ServiceResponseSchema,
  PaginatedServicesResponseSchema,
} from '../schemas/services.schemas';

export type ServiceResponse = z.infer<typeof ServiceResponseSchema>;
export type PaginatedServicesResponse = z.infer<typeof PaginatedServicesResponseSchema>;
