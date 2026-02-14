import { z } from 'zod';
import { CaseStatus, CasePriority, CaseActivityType } from '../enums';

/** Schema for creating a new case (staff only) */
export const CreateCaseSchema = z.object({
  clientProfileId: z.string().uuid('Valid client profile ID is required'),
  practiceAreaId: z.string().uuid('Valid practice area ID is required'),
  serviceId: z.string().uuid().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().max(5000).optional(),
  priority: z.nativeEnum(CasePriority).default(CasePriority.LOW),
  caseType: z.string().max(100).optional(),
  filingDate: z.string().optional(),
});

/** Schema for updating an existing case (staff only) */
export const UpdateCaseSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(5000).optional(),
  priority: z.nativeEnum(CasePriority).optional(),
  caseType: z.string().max(100).optional(),
  filingDate: z.string().optional(),
  closingDate: z.string().optional(),
});

/** Schema for updating case status (staff only) */
export const UpdateCaseStatusSchema = z.object({
  status: z.nativeEnum(CaseStatus),
});

/** Schema for filtering cases list */
export const CaseFiltersSchema = z.object({
  status: z.nativeEnum(CaseStatus).optional(),
  priority: z.nativeEnum(CasePriority).optional(),
  clientProfileId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  practiceAreaId: z.string().uuid().optional(),
  search: z.string().optional(),
});

/** Schema for creating a case activity (staff only) */
export const CreateCaseActivitySchema = z.object({
  activityType: z.nativeEnum(CaseActivityType),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional(),
});

/** Case response schema (full detail) */
export const CaseResponseSchema = z.object({
  id: z.string().uuid(),
  caseNumber: z.string(),
  clientProfileId: z.string().uuid(),
  clientName: z.string(),
  assignedToId: z.string().uuid().nullable(),
  assignedToName: z.string().nullable(),
  practiceAreaId: z.string().uuid(),
  practiceAreaName: z.string(),
  serviceId: z.string().uuid().nullable(),
  serviceName: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(CaseStatus),
  priority: z.nativeEnum(CasePriority),
  caseType: z.string().nullable(),
  filingDate: z.string().nullable(),
  closingDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Case activity response schema */
export const CaseActivityResponseSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  activityType: z.nativeEnum(CaseActivityType),
  title: z.string(),
  description: z.string().nullable(),
  createdBy: z.string().uuid(),
  createdByName: z.string(),
  attachments: z.unknown().nullable(),
  createdAt: z.string(),
});

/** Paginated cases response */
export const PaginatedCasesResponseSchema = z.object({
  data: z.array(CaseResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

/** Paginated case activities response */
export const PaginatedCaseActivitiesResponseSchema = z.object({
  data: z.array(CaseActivityResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
