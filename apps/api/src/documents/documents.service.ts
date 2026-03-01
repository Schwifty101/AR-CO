import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { StorageService } from '../storage/storage.service';
import { UserType, DocumentType } from '@repo/shared';
import type {
  UploadDocumentData,
  UpdateDocumentData,
  DocumentFilters,
  DocumentResponse,
  PaginatedDocumentsResponse,
  PaginationParams,
} from '@repo/shared';
import type { AuthUser } from '../common/interfaces/auth-user.interface';

/** DB row shape for the documents table */
interface DocumentRow {
  id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string;
  case_id: string | null;
  client_profile_id: string | null;
  service_registration_id: string | null;
  document_type: string;
  created_at: string;
  updated_at: string;
  uploader?: { full_name: string } | null;
  case?: { title: string } | null;
  client?: { user: { full_name: string } | null } | null;
}

/** Supabase query result type */
type DbResult<T> = { data: T | null; error: { message: string } | null };

/** Select clause for document queries with joined names */
const DOCUMENT_SELECT = `
  *,
  uploader:user_profiles!documents_uploaded_by_fkey(full_name),
  case:cases!documents_case_id_fkey(title),
  client:client_profiles!documents_client_profile_id_fkey(
    user:user_profiles!client_profiles_user_profile_id_fkey(full_name)
  )
`;

/** Allowed sort columns */
const ALLOWED_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'name',
  'file_size',
  'document_type',
];

/**
 * Service for managing documents — upload, retrieve, update, delete.
 *
 * @example
 * ```typescript
 * const doc = await documentsService.uploadDocument(file, dto, user);
 * const docs = await documentsService.getDocuments({}, { page: 1, limit: 20 }, user);
 * ```
 */
@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Upload a document to storage and create a DB record
   *
   * @param file - Multer file object
   * @param dto - Upload metadata (name, type, associations)
   * @param user - Authenticated user
   * @returns Created document response
   */
  async uploadDocument(
    file: Express.Multer.File,
    dto: UploadDocumentData,
    user: AuthUser,
  ): Promise<DocumentResponse> {
    this.logger.log(`User ${user.id} uploading document: ${dto.name}`);
    const adminClient = this.supabaseService.getAdminClient();

    // Build storage path: {entity}/{entityId}/{timestamp}_{sanitizedFilename}
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = this.buildStoragePath(
      dto,
      user.id,
      timestamp,
      sanitizedName,
    );

    // Upload to Supabase Storage
    const filePath = await this.storageService.upload(
      file.buffer,
      storagePath,
      file.mimetype,
    );

    // Determine client_profile_id
    const clientProfileId = dto.clientProfileId || user.clientProfileId || null;

    // Insert document record
    const { data, error } = (await adminClient
      .from('documents')
      .insert({
        name: dto.name,
        description: dto.description || null,
        file_path: filePath,
        file_size: file.size,
        file_type: file.mimetype,
        uploaded_by: user.id,
        case_id: dto.caseId || null,
        client_profile_id: clientProfileId,
        service_registration_id: dto.serviceRegistrationId || null,
        document_type: dto.documentType || DocumentType.OTHER,
      })
      .select(DOCUMENT_SELECT)
      .single()) as DbResult<DocumentRow>;

    if (error || !data) {
      this.logger.error(`Failed to create document record: ${error?.message}`);
      // Clean up uploaded file on DB failure
      await this.storageService
        .delete(filePath)
        .catch((e: unknown) =>
          this.logger.error(
            `Failed to clean up storage after DB error: ${String(e)}`,
          ),
        );
      throw new InternalServerErrorException('Failed to save document.');
    }

    // Create case activity if document is linked to a case
    if (dto.caseId) {
      await this.createDocumentActivity(adminClient, dto.caseId, user.id, data);
    }

    return this.mapDocumentRow(data);
  }

  /**
   * Get paginated list of documents with filters
   *
   * @param filters - Document filters (type, case, client, registration)
   * @param pagination - Page, limit, sort, order
   * @param user - Authenticated user (for access control)
   * @returns Paginated documents response
   */
  async getDocuments(
    filters: DocumentFilters,
    pagination: PaginationParams,
    user: AuthUser,
  ): Promise<PaginatedDocumentsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const sort = ALLOWED_SORT_COLUMNS.includes(pagination.sort ?? '')
      ? pagination.sort
      : 'created_at';
    const order = pagination.order ?? 'desc';

    // Build base query with access control
    let countQuery = adminClient
      .from('documents')
      .select('id', { count: 'exact', head: true });
    let dataQuery = adminClient.from('documents').select(DOCUMENT_SELECT);

    // Access control: clients see only their own documents
    if (user.userType === UserType.CLIENT && user.clientProfileId) {
      countQuery = countQuery.eq('client_profile_id', user.clientProfileId);
      dataQuery = dataQuery.eq('client_profile_id', user.clientProfileId);
    }

    // Apply filters
    if (filters.documentType) {
      countQuery = countQuery.eq('document_type', filters.documentType);
      dataQuery = dataQuery.eq('document_type', filters.documentType);
    }
    if (filters.caseId) {
      countQuery = countQuery.eq('case_id', filters.caseId);
      dataQuery = dataQuery.eq('case_id', filters.caseId);
    }
    if (filters.clientProfileId) {
      countQuery = countQuery.eq('client_profile_id', filters.clientProfileId);
      dataQuery = dataQuery.eq('client_profile_id', filters.clientProfileId);
    }
    if (filters.serviceRegistrationId) {
      countQuery = countQuery.eq(
        'service_registration_id',
        filters.serviceRegistrationId,
      );
      dataQuery = dataQuery.eq(
        'service_registration_id',
        filters.serviceRegistrationId,
      );
    }
    if (filters.search) {
      countQuery = countQuery.ilike('name', `%${filters.search}%`);
      dataQuery = dataQuery.ilike('name', `%${filters.search}%`);
    }
    if (filters.dateFrom) {
      countQuery = countQuery.gte('created_at', filters.dateFrom);
      dataQuery = dataQuery.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      countQuery = countQuery.lte('created_at', `${filters.dateTo}T23:59:59.999Z`);
      dataQuery = dataQuery.lte('created_at', `${filters.dateTo}T23:59:59.999Z`);
    }

    // Count
    const { count, error: countError } = await countQuery;
    if (countError) {
      this.logger.error(`Failed to count documents: ${countError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve documents count.',
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Fetch data
    const { data: rows, error } = (await dataQuery
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)) as DbResult<DocumentRow[]>;

    if (error) {
      this.logger.error(`Failed to fetch documents: ${error.message}`);
      throw new InternalServerErrorException('Unable to retrieve documents.');
    }

    return {
      data: (rows || []).map((row) => this.mapDocumentRow(row)),
      meta: { page, limit, total, totalPages },
    };
  }

  /**
   * Get a single document by ID
   *
   * @param documentId - Document UUID
   * @param user - Authenticated user (for access control)
   * @returns Document response
   */
  async getDocumentById(
    documentId: string,
    user: AuthUser,
  ): Promise<DocumentResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('documents')
      .select(DOCUMENT_SELECT)
      .eq('id', documentId)
      .single()) as DbResult<DocumentRow>;

    if (error || !data) {
      throw new NotFoundException('Document not found.');
    }

    this.assertDocumentAccess(data, user);
    return this.mapDocumentRow(data);
  }

  /**
   * Update document metadata
   *
   * @param documentId - Document UUID
   * @param dto - Fields to update
   * @param user - Authenticated user
   * @returns Updated document response
   */
  async updateDocument(
    documentId: string,
    dto: UpdateDocumentData,
    user: AuthUser,
  ): Promise<DocumentResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    // Fetch existing document
    const { data: existing, error: fetchError } = (await adminClient
      .from('documents')
      .select(DOCUMENT_SELECT)
      .eq('id', documentId)
      .single()) as DbResult<DocumentRow>;

    if (fetchError || !existing) {
      throw new NotFoundException('Document not found.');
    }

    this.assertCanModify(existing, user);

    // Build update object (only non-undefined fields)
    const updateFields: Record<string, unknown> = {};
    if (dto.name !== undefined) updateFields.name = dto.name;
    if (dto.description !== undefined)
      updateFields.description = dto.description;
    if (dto.documentType !== undefined)
      updateFields.document_type = dto.documentType;

    if (Object.keys(updateFields).length === 0) {
      return this.mapDocumentRow(existing);
    }

    const { data, error } = (await adminClient
      .from('documents')
      .update(updateFields)
      .eq('id', documentId)
      .select(DOCUMENT_SELECT)
      .single()) as DbResult<DocumentRow>;

    if (error || !data) {
      this.logger.error(
        `Failed to update document ${documentId}: ${error?.message}`,
      );
      throw new InternalServerErrorException('Failed to update document.');
    }

    return this.mapDocumentRow(data);
  }

  /**
   * Delete a document from storage and database
   *
   * @param documentId - Document UUID
   * @param user - Authenticated user
   */
  async deleteDocument(documentId: string, user: AuthUser): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: existing, error: fetchError } = (await adminClient
      .from('documents')
      .select('id, file_path, uploaded_by, client_profile_id')
      .eq('id', documentId)
      .single()) as DbResult<{
      id: string;
      file_path: string;
      uploaded_by: string;
      client_profile_id: string | null;
    }>;

    if (fetchError || !existing) {
      throw new NotFoundException('Document not found.');
    }

    this.assertCanModify(existing, user);

    // Delete from storage
    await this.storageService.delete(existing.file_path);

    // Delete from database
    const { error } = await adminClient
      .from('documents')
      .delete()
      .eq('id', documentId);
    if (error) {
      this.logger.error(
        `Failed to delete document record ${documentId}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to delete document.');
    }

    this.logger.log(`Document ${documentId} deleted by user ${user.id}`);
  }

  /**
   * Get a signed download URL for a document
   *
   * @param documentId - Document UUID
   * @param user - Authenticated user
   * @returns Object with signedUrl
   */
  async downloadDocument(
    documentId: string,
    user: AuthUser,
  ): Promise<{ signedUrl: string }> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('documents')
      .select('id, file_path, uploaded_by, client_profile_id, case_id')
      .eq('id', documentId)
      .single()) as DbResult<{
      id: string;
      file_path: string;
      uploaded_by: string;
      client_profile_id: string | null;
      case_id: string | null;
    }>;

    if (error || !data) {
      throw new NotFoundException('Document not found.');
    }

    this.assertDocumentAccess(data, user);

    const signedUrl = await this.storageService.getSignedUrl(data.file_path);
    return { signedUrl };
  }

  // --- Private helpers ---

  /**
   * Build storage path based on entity associations
   */
  private buildStoragePath(
    dto: UploadDocumentData,
    userId: string,
    timestamp: number,
    filename: string,
  ): string {
    if (dto.caseId) {
      return `cases/${dto.caseId}/${timestamp}_${filename}`;
    }
    if (dto.clientProfileId) {
      return `clients/${dto.clientProfileId}/${timestamp}_${filename}`;
    }
    if (dto.serviceRegistrationId) {
      return `registrations/${dto.serviceRegistrationId}/${timestamp}_${filename}`;
    }
    return `general/${userId}/${timestamp}_${filename}`;
  }

  /**
   * Assert user can view the document
   */
  private assertDocumentAccess(
    doc: { uploaded_by: string; client_profile_id: string | null },
    user: AuthUser,
  ): void {
    // Staff/Admin/Attorney can view all
    if (
      [UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY].includes(
        user.userType,
      )
    ) {
      return;
    }
    // Uploader can view
    if (doc.uploaded_by === user.id) {
      return;
    }
    // Client can view their own documents
    if (
      user.clientProfileId &&
      doc.client_profile_id === user.clientProfileId
    ) {
      return;
    }
    throw new ForbiddenException('You do not have access to this document.');
  }

  /**
   * Assert user can modify/delete the document
   */
  private assertCanModify(
    doc: { uploaded_by: string; client_profile_id?: string | null },
    user: AuthUser,
  ): void {
    if ([UserType.ADMIN, UserType.STAFF].includes(user.userType)) {
      return;
    }
    if (doc.uploaded_by === user.id) {
      return;
    }
    throw new ForbiddenException(
      'You do not have permission to modify this document.',
    );
  }

  /**
   * Map a DB row to a DocumentResponse
   */
  private mapDocumentRow(row: DocumentRow): DocumentResponse {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      filePath: row.file_path,
      fileSize: row.file_size,
      fileType: row.file_type,
      uploadedBy: row.uploaded_by,
      uploadedByName: row.uploader?.full_name ?? null,
      caseId: row.case_id,
      caseTitle: row.case?.title ?? null,
      clientProfileId: row.client_profile_id,
      clientName: row.client?.user?.full_name ?? null,
      serviceRegistrationId: row.service_registration_id,
      documentType: row.document_type as DocumentType,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Create a DOCUMENT_UPLOADED case activity
   */
  private async createDocumentActivity(
    adminClient: ReturnType<SupabaseService['getAdminClient']>,
    caseId: string,
    userId: string,
    doc: DocumentRow,
  ): Promise<void> {
    try {
      await adminClient.from('case_activities').insert({
        case_id: caseId,
        activity_type: 'document_uploaded',
        title: `Document uploaded: ${doc.name}`,
        description: `File: ${doc.name} (${doc.file_type || 'unknown type'})`,
        created_by: userId,
        attachments: [
          {
            documentId: doc.id,
            name: doc.name,
            fileType: doc.file_type,
          },
        ],
      });
    } catch (err) {
      this.logger.warn(
        `Failed to create case activity for document upload: ${err}`,
      );
      // Don't fail the upload if activity creation fails
    }
  }
}
