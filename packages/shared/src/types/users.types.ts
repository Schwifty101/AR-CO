import type { z } from 'zod';
import type {
  UpdateUserProfileSchema,
  CreateClientProfileSchema,
  UpdateClientProfileSchema,
  CreateAttorneyProfileSchema,
  UpdateAttorneyProfileSchema,
  ClientProfileResponseSchema,
  AttorneyProfileResponseSchema,
  UserProfileResponseSchema,
  PaginatedUsersResponseSchema,
} from '../schemas/users.schemas';
import type { PaginationSchema } from '../schemas/common.schemas';

/** Data for updating base user profile */
export type UpdateUserProfileData = z.infer<typeof UpdateUserProfileSchema>;

/** Data for creating a client profile */
export type CreateClientProfileData = z.infer<typeof CreateClientProfileSchema>;

/** Data for updating a client profile */
export type UpdateClientProfileData = z.infer<typeof UpdateClientProfileSchema>;

/** Data for creating an attorney profile */
export type CreateAttorneyProfileData = z.infer<typeof CreateAttorneyProfileSchema>;

/** Data for updating an attorney profile */
export type UpdateAttorneyProfileData = z.infer<typeof UpdateAttorneyProfileSchema>;

/** Client profile API response shape */
export type ClientProfile = z.infer<typeof ClientProfileResponseSchema>;

/** Attorney profile API response shape */
export type AttorneyProfile = z.infer<typeof AttorneyProfileResponseSchema>;

/** Complete user profile API response */
export type UserProfile = z.infer<typeof UserProfileResponseSchema>;

/** Paginated users API response */
export type PaginatedUsersResponse = z.infer<typeof PaginatedUsersResponseSchema>;

/** Pagination query parameters */
export type PaginationParams = z.infer<typeof PaginationSchema>;
