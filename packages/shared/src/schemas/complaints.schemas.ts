import { z } from 'zod';
import { ComplaintStatus, ComplaintCategory } from '../enums';

/** Schema for submitting a complaint */
export const CreateComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  targetOrganization: z.string().min(1, 'Target organization is required').max(255),
  location: z.string().max(255).optional(),
  category: z.nativeEnum(ComplaintCategory).optional(),
  evidenceUrls: z.array(z.string().url()).max(10).optional(),
});

/** Schema for staff updating complaint status */
export const UpdateComplaintStatusSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
  staffNotes: z.string().max(2000).optional(),
  resolutionNotes: z.string().max(2000).optional(),
});

/** Schema for assigning complaint to staff */
export const AssignComplaintSchema = z.object({
  staffId: z.string().uuid('Valid staff ID is required'),
});

/** Schema for filtering complaints */
export const ComplaintFiltersSchema = z.object({
  status: z.nativeEnum(ComplaintStatus).optional(),
  targetOrganization: z.string().optional(),
  category: z.nativeEnum(ComplaintCategory).optional(),
});

/** Complaint response */
export const ComplaintResponseSchema = z.object({
  id: z.string().uuid(),
  complaintNumber: z.string(),
  clientProfileId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  targetOrganization: z.string(),
  location: z.string().nullable(),
  category: z.string().nullable(),
  evidenceUrls: z.array(z.string()),
  status: z.nativeEnum(ComplaintStatus),
  assignedStaffId: z.string().uuid().nullable(),
  assignedStaffName: z.string().nullable(),
  staffNotes: z.string().nullable(),
  resolutionNotes: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Paginated complaints response */
export const PaginatedComplaintsResponseSchema = z.object({
  data: z.array(ComplaintResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
