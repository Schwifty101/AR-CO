import type { z } from 'zod';
import type {
  CreateCaseSchema,
  UpdateCaseSchema,
  UpdateCaseStatusSchema,
  CaseFiltersSchema,
  CreateCaseActivitySchema,
  CaseResponseSchema,
  CaseActivityResponseSchema,
  PaginatedCasesResponseSchema,
  PaginatedCaseActivitiesResponseSchema,
} from '../schemas/cases.schemas';

/** Data for creating a new case */
export type CreateCaseData = z.infer<typeof CreateCaseSchema>;

/** Data for updating an existing case */
export type UpdateCaseData = z.infer<typeof UpdateCaseSchema>;

/** Data for updating case status */
export type UpdateCaseStatusData = z.infer<typeof UpdateCaseStatusSchema>;

/** Case list filter parameters */
export type CaseFilters = z.infer<typeof CaseFiltersSchema>;

/** Data for creating a case activity entry */
export type CreateCaseActivityData = z.infer<typeof CreateCaseActivitySchema>;

/** Full case response from the API */
export type CaseResponse = z.infer<typeof CaseResponseSchema>;

/** Case activity response from the API */
export type CaseActivityResponse = z.infer<typeof CaseActivityResponseSchema>;

/** Paginated cases API response */
export type PaginatedCasesResponse = z.infer<typeof PaginatedCasesResponseSchema>;

/** Paginated case activities API response */
export type PaginatedCaseActivitiesResponse = z.infer<typeof PaginatedCaseActivitiesResponseSchema>;
