import { z } from 'zod';
import {
  ComplaintStatus,
  ComplaintCategory,
  ComplaintPaymentStatus,
} from '../enums';

/**
 * Schema for submitting a complaint (guest, no auth).
 *
 * The public complaint form is unauthenticated; it collects the complainant's
 * contact details plus the structured intake. `subject` maps to `title`,
 * `institution` maps to `targetOrganization`, and the narrative maps to
 * `description` on the backend — the remaining fields persist to dedicated
 * columns (see the complaints migration).
 */
export const CreateComplaintSchema = z.object({
  // Core complaint
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000),
  targetOrganization: z
    .string()
    .min(1, 'Target organization is required')
    .max(255),
  location: z.string().max(255).optional(),
  category: z.nativeEnum(ComplaintCategory).optional(),
  evidenceUrls: z.array(z.string().url()).max(10).optional(),
  // Guest contact (required for the public flow + admin contact + claim-by-email)
  fullName: z.string().min(1, 'Full name is required').max(255),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(1, 'Phone number is required').max(20),
  // Structured intake → dedicated columns
  cnic: z.string().max(15).optional(),
  city: z.string().max(255).optional(),
  address: z.string().max(500).optional(),
  department: z.string().max(255).optional(),
  institutionReference: z.string().max(255).optional(),
  issueType: z.string().max(255).optional(),
  incidentDate: z.string().max(40).optional(),
  desiredOutcome: z.string().max(2000).optional(),
  priorAttempts: z.boolean().optional(),
  priorAttemptReference: z.string().max(255).optional(),
  declarationTruthful: z
    .boolean()
    .refine((v) => v === true, 'You must confirm the information is accurate'),
  declarationTerms: z
    .boolean()
    .refine((v) => v === true, 'You must agree to the terms of service'),
});

/** Schema for a guest checking complaint status (ref + email must match) */
export const ComplaintStatusCheckSchema = z.object({
  complaintNumber: z.string().min(1, 'Complaint number is required'),
  email: z.string().email('Valid email is required'),
});

/** Schema for staff updating complaint status */
export const UpdateComplaintStatusSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
  staffNotes: z.string().max(2000).optional(),
  resolutionNotes: z.string().max(2000).optional(),
});

/** Schema for filtering complaints */
export const ComplaintFiltersSchema = z.object({
  status: z.nativeEnum(ComplaintStatus).optional(),
  targetOrganization: z.string().optional(),
  category: z.nativeEnum(ComplaintCategory).optional(),
  paymentStatus: z.nativeEnum(ComplaintPaymentStatus).optional(),
});

/** Complaint response */
export const ComplaintResponseSchema = z.object({
  id: z.string().uuid(),
  complaintNumber: z.string(),
  clientProfileId: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string(),
  targetOrganization: z.string(),
  location: z.string().nullable(),
  category: z.string().nullable(),
  evidenceUrls: z.array(z.string()),
  status: z.nativeEnum(ComplaintStatus),
  assignedToId: z.string().uuid().nullable(),
  assignedToName: z.string().nullable(),
  staffNotes: z.string().nullable(),
  resolutionNotes: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  // Guest contact
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  // Structured intake
  cnic: z.string().nullable(),
  city: z.string().nullable(),
  address: z.string().nullable(),
  department: z.string().nullable(),
  institutionReference: z.string().nullable(),
  issueType: z.string().nullable(),
  incidentDate: z.string().nullable(),
  desiredOutcome: z.string().nullable(),
  priorAttempts: z.boolean().nullable(),
  priorAttemptReference: z.string().nullable(),
  // Payment (manual screenshot flow)
  paymentStatus: z.nativeEnum(ComplaintPaymentStatus),
  paymentProofPath: z.string().nullable().optional(),
  paymentReviewNote: z.string().nullable().optional(),
  paymentConfirmedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Guest-safe complaint status response (minimal info) */
export const ComplaintStatusResponseSchema = z.object({
  complaintNumber: z.string(),
  status: z.nativeEnum(ComplaintStatus),
  paymentStatus: z.nativeEnum(ComplaintPaymentStatus),
  createdAt: z.string(),
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
