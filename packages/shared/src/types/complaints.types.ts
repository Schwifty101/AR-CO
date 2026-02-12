import type { z } from 'zod';
import type {
  CreateComplaintSchema,
  UpdateComplaintStatusSchema,
  AssignComplaintSchema,
  ComplaintFiltersSchema,
  ComplaintResponseSchema,
  PaginatedComplaintsResponseSchema,
} from '../schemas/complaints.schemas';

export type CreateComplaintData = z.infer<typeof CreateComplaintSchema>;
export type UpdateComplaintStatusData = z.infer<typeof UpdateComplaintStatusSchema>;
export type AssignComplaintData = z.infer<typeof AssignComplaintSchema>;
export type ComplaintFilters = z.infer<typeof ComplaintFiltersSchema>;
export type ComplaintResponse = z.infer<typeof ComplaintResponseSchema>;
export type PaginatedComplaintsResponse = z.infer<typeof PaginatedComplaintsResponseSchema>;
