/**
 * In-memory store for pending document uploads.
 * Files are stored here on the documents page and read by the form page
 * after registration creation. Module-level state persists across Next.js
 * client-side navigation within a single browser session.
 *
 * @module serviceDocumentStore
 */

/** A pending document upload with its type metadata */
export interface PendingDocument {
  /** The actual file to upload */
  file: File;
  /** Document type identifier from categoryDataMapper (e.g., "cnic") */
  documentTypeId: string;
  /** Human-readable document type name (e.g., "CNIC Copy") */
  documentTypeName: string;
}

let pendingDocuments: PendingDocument[] = [];

/**
 * Store documents to be uploaded after registration creation.
 *
 * @param docs - Array of pending documents to store
 *
 * @example
 * ```typescript
 * storePendingDocuments([
 *   { file: cnicFile, documentTypeId: 'cnic', documentTypeName: 'CNIC Copy' },
 * ]);
 * ```
 */
export function storePendingDocuments(docs: PendingDocument[]): void {
  pendingDocuments = [...docs];
}

/**
 * Retrieve all pending documents from the store.
 *
 * @returns Array of pending documents (may be empty)
 *
 * @example
 * ```typescript
 * const docs = getPendingDocuments();
 * // docs.length === 0 if no documents staged
 * ```
 */
export function getPendingDocuments(): PendingDocument[] {
  return pendingDocuments;
}

/**
 * Clear the store after upload is complete or on error.
 * Should always be called after attempting uploads to prevent stale files
 * from being uploaded on a subsequent registration submission.
 *
 * @example
 * ```typescript
 * clearPendingDocuments();
 * ```
 */
export function clearPendingDocuments(): void {
  pendingDocuments = [];
}
