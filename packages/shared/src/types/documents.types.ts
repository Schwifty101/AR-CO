import type { z } from 'zod';
import type {
  UploadDocumentSchema,
  UpdateDocumentSchema,
  DocumentFiltersSchema,
  DocumentResponseSchema,
  PaginatedDocumentsResponseSchema,
} from '../schemas/documents.schemas';

/** Data for uploading a document */
export type UploadDocumentData = z.infer<typeof UploadDocumentSchema>;

/** Data for updating document metadata */
export type UpdateDocumentData = z.infer<typeof UpdateDocumentSchema>;

/** Filters for listing documents */
export type DocumentFilters = z.infer<typeof DocumentFiltersSchema>;

/** Single document response */
export type DocumentResponse = z.infer<typeof DocumentResponseSchema>;

/** Paginated documents response */
export type PaginatedDocumentsResponse = z.infer<typeof PaginatedDocumentsResponseSchema>;
