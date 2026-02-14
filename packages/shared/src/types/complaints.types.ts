import type { z } from 'zod';
import type {
  CreateComplaintSchema,
  UpdateComplaintStatusSchema,
  ComplaintFiltersSchema,
  ComplaintResponseSchema,
  PaginatedComplaintsResponseSchema,
} from '../schemas/complaints.schemas';

/** Data for creating a new complaint */
export type CreateComplaintData = z.infer<typeof CreateComplaintSchema>;

/** Data for updating complaint status */
export type UpdateComplaintStatusData = z.infer<typeof UpdateComplaintStatusSchema>;

/** Complaint list filter parameters */
export type ComplaintFilters = z.infer<typeof ComplaintFiltersSchema>;

/** Full complaint response from the API */
export type ComplaintResponse = z.infer<typeof ComplaintResponseSchema>;

/** Paginated complaints API response */
export type PaginatedComplaintsResponse = z.infer<typeof PaginatedComplaintsResponseSchema>;
