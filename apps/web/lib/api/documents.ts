/**
 * Documents API Client
 *
 * Client-side functions for document management operations.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module DocumentsAPI
 *
 * @example
 * ```typescript
 * import { uploadDocument, getDocuments, downloadDocument } from '@/lib/api/documents';
 *
 * const doc = await uploadDocument(file, { name: 'Contract', documentType: 'contract' });
 * const docs = await getDocuments({ page: 1, limit: 20, documentType: 'contract' });
 * const { signedUrl } = await downloadDocument('doc-uuid');
 * ```
 */

import { getSessionToken, type PaginationParams } from './auth-helpers';
import type {
  UploadDocumentData,
  UpdateDocumentData,
  DocumentFilters,
  DocumentResponse,
  PaginatedDocumentsResponse,
} from '@repo/shared';
export { DocumentType } from '@repo/shared';
export type {
  UploadDocumentData,
  UpdateDocumentData,
  DocumentFilters,
  DocumentResponse,
  PaginatedDocumentsResponse,
} from '@repo/shared';
export type { PaginationParams } from './auth-helpers';

/** Paginated documents response shaped for frontend consumption */
export interface PaginatedDocuments {
  documents: DocumentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Upload a document with file and metadata
 *
 * @param file - File to upload
 * @param metadata - Document metadata (name, type, associations)
 * @returns Created document response
 * @throws Error if upload fails or user is not authenticated
 *
 * @example
 * ```typescript
 * const doc = await uploadDocument(file, {
 *   name: 'Contract v1',
 *   documentType: 'contract',
 *   caseId: 'uuid',
 * });
 * ```
 */
export async function uploadDocument(
  file: File,
  metadata: UploadDocumentData,
): Promise<DocumentResponse> {
  const token = await getSessionToken();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to upload document');
  }

  return (await response.json()) as DocumentResponse;
}

/**
 * Get paginated list of documents with optional filters
 *
 * @param params - Pagination and filter parameters
 * @returns Paginated documents
 * @throws Error if fetch fails
 *
 * @example
 * ```typescript
 * const result = await getDocuments({ page: 1, limit: 20, documentType: 'contract' });
 * ```
 */
export async function getDocuments(
  params?: PaginationParams & Partial<DocumentFilters>,
): Promise<PaginatedDocuments> {
  const token = await getSessionToken();

  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.documentType) queryParams.set('documentType', params.documentType);
  if (params?.caseId) queryParams.set('caseId', params.caseId);
  if (params?.clientProfileId) queryParams.set('clientProfileId', params.clientProfileId);
  if (params?.serviceRegistrationId) queryParams.set('serviceRegistrationId', params.serviceRegistrationId);

  const url = `/api/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch documents');
  }

  const backendResponse = (await response.json()) as PaginatedDocumentsResponse;
  return {
    documents: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Get a single document by ID
 *
 * @param documentId - Document UUID
 * @returns Document response
 * @throws Error if not found or unauthorized
 *
 * @example
 * ```typescript
 * const doc = await getDocumentById('uuid');
 * ```
 */
export async function getDocumentById(documentId: string): Promise<DocumentResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch document');
  }

  return (await response.json()) as DocumentResponse;
}

/**
 * Update document metadata
 *
 * @param documentId - Document UUID
 * @param data - Fields to update
 * @returns Updated document response
 * @throws Error if not found, unauthorized, or update fails
 *
 * @example
 * ```typescript
 * const updated = await updateDocument('uuid', { name: 'New name' });
 * ```
 */
export async function updateDocument(
  documentId: string,
  data: UpdateDocumentData,
): Promise<DocumentResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update document');
  }

  return (await response.json()) as DocumentResponse;
}

/**
 * Get a signed download URL for a document
 *
 * @param documentId - Document UUID
 * @returns Object with signedUrl field
 * @throws Error if not found or unauthorized
 *
 * @example
 * ```typescript
 * const { signedUrl } = await downloadDocument('uuid');
 * window.open(signedUrl, '_blank');
 * ```
 */
export async function downloadDocument(
  documentId: string,
): Promise<{ signedUrl: string }> {
  const token = await getSessionToken();

  const response = await fetch(`/api/documents/${documentId}/download`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to get download URL');
  }

  return (await response.json()) as { signedUrl: string };
}

/**
 * Delete a document
 *
 * @param documentId - Document UUID
 * @throws Error if not found, unauthorized, or deletion fails
 *
 * @example
 * ```typescript
 * await deleteDocument('uuid');
 * ```
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const token = await getSessionToken();

  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to delete document');
  }
}
