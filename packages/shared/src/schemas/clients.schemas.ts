import { z } from 'zod';
import { CompanyType } from '../enums';

/** Schema for creating a client (staff-initiated) */
export const CreateClientSchema = z.object({
  email: z.string().email('Valid email is required'),
  fullName: z.string().min(1, 'Full name is required').max(255),
  phoneNumber: z.string().optional(),
  companyName: z.string().optional(),
  companyType: z.nativeEnum(CompanyType).optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

/** Schema for updating a client profile */
export const UpdateClientSchema = z.object({
  companyName: z.string().optional(),
  companyType: z.nativeEnum(CompanyType).optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

/** Schema for filtering clients list */
export const ClientFiltersSchema = z.object({
  companyType: z.nativeEnum(CompanyType).optional(),
  city: z.string().optional(),
  search: z.string().optional(),
});

/** Client profile response */
export const ClientResponseSchema = z.object({
  id: z.string().uuid(),
  userProfileId: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable(),
  companyName: z.string().nullable(),
  companyType: z.string().nullable(),
  taxId: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Paginated clients response */
export const PaginatedClientsResponseSchema = z.object({
  data: z.array(ClientResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
