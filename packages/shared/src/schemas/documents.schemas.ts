import { z } from 'zod';
import { DocumentType } from '../enums';

/**
 * Schema for document upload metadata (sent alongside the file)
 *
 * @example
 * ```typescript
 * const data = UploadDocumentSchema.parse({
 *   name: 'Contract v1',
 *   documentType: 'contract',
 *   caseId: '123e4567-e89b-12d3-a456-426614174000',
 * });
 * ```
 */
export const UploadDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255),
  description: z.string().max(1000).optional(),
  documentType: z.nativeEnum(DocumentType).default(DocumentType.OTHER),
  caseId: z.string().uuid().optional(),
  clientProfileId: z.string().uuid().optional(),
  serviceRegistrationId: z.string().uuid().optional(),
});

/**
 * Schema for updating document metadata
 *
 * @example
 * ```typescript
 * const data = UpdateDocumentSchema.parse({ name: 'Updated name' });
 * ```
 */
export const UpdateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  documentType: z.nativeEnum(DocumentType).optional(),
});

/**
 * Schema for filtering documents list
 *
 * @example
 * ```typescript
 * const filters = DocumentFiltersSchema.parse({ documentType: 'contract' });
 * ```
 */
export const DocumentFiltersSchema = z.object({
  documentType: z.nativeEnum(DocumentType).optional(),
  caseId: z.string().uuid().optional(),
  clientProfileId: z.string().uuid().optional(),
  serviceRegistrationId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

/**
 * Schema for a document response from the API
 *
 * @example
 * ```typescript
 * const doc: DocumentResponse = DocumentResponseSchema.parse(apiResponse);
 * ```
 */
export const DocumentResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  filePath: z.string(),
  fileSize: z.number().nullable(),
  fileType: z.string().nullable(),
  uploadedBy: z.string().uuid(),
  uploadedByName: z.string().nullable(),
  caseId: z.string().uuid().nullable(),
  caseTitle: z.string().nullable(),
  clientProfileId: z.string().uuid().nullable(),
  clientName: z.string().nullable(),
  serviceRegistrationId: z.string().uuid().nullable(),
  documentType: z.nativeEnum(DocumentType),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Schema for paginated documents response
 *
 * @example
 * ```typescript
 * const result = PaginatedDocumentsResponseSchema.parse(apiResponse);
 * console.log(result.data.length, result.meta.total);
 * ```
 */
export const PaginatedDocumentsResponseSchema = z.object({
  data: z.array(DocumentResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
