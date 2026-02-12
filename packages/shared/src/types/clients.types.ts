import type { z } from 'zod';
import type {
  CreateClientSchema,
  UpdateClientSchema,
  ClientFiltersSchema,
  ClientResponseSchema,
  PaginatedClientsResponseSchema,
} from '../schemas/clients.schemas';

export type CreateClientData = z.infer<typeof CreateClientSchema>;
export type UpdateClientData = z.infer<typeof UpdateClientSchema>;
export type ClientFilters = z.infer<typeof ClientFiltersSchema>;
export type ClientResponse = z.infer<typeof ClientResponseSchema>;
export type PaginatedClientsResponse = z.infer<typeof PaginatedClientsResponseSchema>;
