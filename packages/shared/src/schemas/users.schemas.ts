import { z } from 'zod';
import { CompanyType, UserType } from '../enums';

/** DTO for inviting a new user (admin/staff/attorney) */
export const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  userType: z.enum([UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY], {
    errorMap: () => ({
      message: 'User type must be admin, staff, or attorney',
    }),
  }),
  phoneNumber: z.string().optional(),
});

/** DTO for updating base user profile fields */
export const UpdateUserProfileSchema = z.object({
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

/** DTO for creating a client profile */
export const CreateClientProfileSchema = z.object({
  companyName: z.string().optional(),
  companyType: z.nativeEnum(CompanyType).optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

/** DTO for updating client profile (same shape as create, all optional) */
export const UpdateClientProfileSchema = CreateClientProfileSchema;

/** DTO for creating an attorney profile */
export const CreateAttorneyProfileSchema = z.object({
  barNumber: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  education: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
});

/** DTO for updating attorney profile (same shape as create, all optional) */
export const UpdateAttorneyProfileSchema = CreateAttorneyProfileSchema;

/** Client profile shape in API responses */
export const ClientProfileResponseSchema = z.object({
  id: z.string(),
  companyName: z.string().nullable(),
  companyType: z.string().nullable(),
  taxId: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
});

/** Attorney profile shape in API responses */
export const AttorneyProfileResponseSchema = z.object({
  id: z.string(),
  barNumber: z.string().nullable(),
  specializations: z.array(z.string()).nullable(),
  education: z.string().nullable(),
  experienceYears: z.number().nullable(),
  hourlyRate: z.number().nullable(),
});

/** Complete user profile response from API */
export const UserProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  phoneNumber: z.string().nullable(),
  userType: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  clientProfile: ClientProfileResponseSchema.optional(),
  attorneyProfile: AttorneyProfileResponseSchema.optional(),
});

/** Paginated users response from API */
export const PaginatedUsersResponseSchema = z.object({
  data: z.array(UserProfileResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
