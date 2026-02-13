import type { z } from 'zod';
import type {
  CreateServiceRegistrationSchema,
  GuestStatusCheckSchema,
  UpdateRegistrationStatusSchema,
  ServiceRegistrationResponseSchema,
  GuestStatusResponseSchema,
  PaginatedServiceRegistrationsResponseSchema,
} from '../schemas/service-registrations.schemas';

export type CreateServiceRegistrationData = z.infer<typeof CreateServiceRegistrationSchema>;
export type GuestStatusCheckData = z.infer<typeof GuestStatusCheckSchema>;
export type UpdateRegistrationStatusData = z.infer<typeof UpdateRegistrationStatusSchema>;
export type ServiceRegistrationResponse = z.infer<typeof ServiceRegistrationResponseSchema>;
export type GuestStatusResponse = z.infer<typeof GuestStatusResponseSchema>;
export type PaginatedServiceRegistrationsResponse = z.infer<typeof PaginatedServiceRegistrationsResponseSchema>;
