import type { z } from 'zod';
import type {
  CreateComplaintSchema,
  ComplaintStatusCheckSchema,
  UpdateComplaintStatusSchema,
  ComplaintFiltersSchema,
  ComplaintResponseSchema,
  ComplaintStatusResponseSchema,
  PaginatedComplaintsResponseSchema,
} from '../schemas/complaints.schemas';

/** Data for creating a new complaint (guest) */
export type CreateComplaintData = z.infer<typeof CreateComplaintSchema>;

/** Data for a guest checking complaint status (complaint number + email) */
export type ComplaintStatusCheckData = z.infer<typeof ComplaintStatusCheckSchema>;

/** Data for updating complaint status */
export type UpdateComplaintStatusData = z.infer<typeof UpdateComplaintStatusSchema>;

/** Complaint list filter parameters */
export type ComplaintFilters = z.infer<typeof ComplaintFiltersSchema>;

/** Full complaint response from the API */
export type ComplaintResponse = z.infer<typeof ComplaintResponseSchema>;

/** Guest-safe complaint status response (minimal info) */
export type ComplaintStatusResponse = z.infer<typeof ComplaintStatusResponseSchema>;

/** Paginated complaints API response */
export type PaginatedComplaintsResponse = z.infer<typeof PaginatedComplaintsResponseSchema>;
