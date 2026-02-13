import type { z } from 'zod';
import type {
  CreateCaseSchema,
  UpdateCaseSchema,
  UpdateCaseStatusSchema,
  AssignAttorneySchema,
  CaseFiltersSchema,
  CreateCaseActivitySchema,
  CaseResponseSchema,
  CaseActivityResponseSchema,
  PaginatedCasesResponseSchema,
  PaginatedCaseActivitiesResponseSchema,
} from '../schemas/cases.schemas';

export type CreateCaseData = z.infer<typeof CreateCaseSchema>;
export type UpdateCaseData = z.infer<typeof UpdateCaseSchema>;
export type UpdateCaseStatusData = z.infer<typeof UpdateCaseStatusSchema>;
export type AssignAttorneyData = z.infer<typeof AssignAttorneySchema>;
export type CaseFilters = z.infer<typeof CaseFiltersSchema>;
export type CreateCaseActivityData = z.infer<typeof CreateCaseActivitySchema>;
export type CaseResponse = z.infer<typeof CaseResponseSchema>;
export type CaseActivityResponse = z.infer<typeof CaseActivityResponseSchema>;
export type PaginatedCasesResponse = z.infer<typeof PaginatedCasesResponseSchema>;
export type PaginatedCaseActivitiesResponse = z.infer<typeof PaginatedCaseActivitiesResponseSchema>;
