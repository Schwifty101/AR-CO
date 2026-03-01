import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  UploadDocumentSchema,
  UpdateDocumentSchema,
  DocumentFiltersSchema,
  PaginationSchema,
} from '@repo/shared';
import type {
  UploadDocumentData,
  UpdateDocumentData,
  DocumentFilters,
  DocumentResponse,
  PaginatedDocumentsResponse,
  PaginationParams,
} from '@repo/shared';

/** Max file size: 10MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed MIME types */
const ALLOWED_MIME_TYPES =
  /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|image\/jpeg|image\/png)$/;

/**
 * Controller for document management endpoints.
 * All endpoints require authentication (JwtAuthGuard applied globally).
 *
 * @example
 * ```
 * POST   /api/documents/upload     - Upload a document
 * GET    /api/documents             - List documents
 * GET    /api/documents/:id         - Get document details
 * PATCH  /api/documents/:id         - Update document metadata
 * GET    /api/documents/:id/download - Get download URL
 * DELETE /api/documents/:id         - Delete document
 * ```
 */
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Upload a document with file and metadata
   *
   * @param user - Authenticated user from JWT
   * @param file - Uploaded file (multipart/form-data)
   * @param metadataRaw - Document metadata as JSON string in 'metadata' field
   * @returns Created document response
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @CurrentUser() user: AuthUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_MIME_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('metadata') metadataRaw: string,
  ): Promise<DocumentResponse> {
    // Parse metadata JSON from form-data
    let metadata: UploadDocumentData;
    try {
      const parsed = JSON.parse(metadataRaw || '{}') as Record<string, unknown>;
      metadata = UploadDocumentSchema.parse(parsed);
    } catch (err) {
      throw new BadRequestException(
        `Invalid document metadata: ${err instanceof Error ? err.message : 'parse error'}`,
      );
    }

    return this.documentsService.uploadDocument(file, metadata, user);
  }

  /**
   * List documents with pagination and filters
   *
   * @param user - Authenticated user
   * @param pagination - Page, limit, sort, order
   * @param filters - Document type, case, client, registration filters
   * @returns Paginated documents response
   */
  @Get()
  async getDocuments(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
    @Query(new ZodValidationPipe(DocumentFiltersSchema))
    filters: DocumentFilters,
  ): Promise<PaginatedDocumentsResponse> {
    return this.documentsService.getDocuments(filters, pagination, user);
  }

  /**
   * Get a single document by ID
   *
   * @param id - Document UUID
   * @param user - Authenticated user
   * @returns Document response
   */
  @Get(':id')
  async getDocumentById(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<DocumentResponse> {
    return this.documentsService.getDocumentById(id, user);
  }

  /**
   * Update document metadata (name, description, type)
   *
   * @param id - Document UUID
   * @param dto - Fields to update
   * @param user - Authenticated user
   * @returns Updated document response
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateDocument(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateDocumentSchema))
    dto: UpdateDocumentData,
    @CurrentUser() user: AuthUser,
  ): Promise<DocumentResponse> {
    return this.documentsService.updateDocument(id, dto, user);
  }

  /**
   * Get a signed download URL for a document
   *
   * @param id - Document UUID
   * @param user - Authenticated user
   * @returns Object with signedUrl field
   */
  @Get(':id/download')
  async downloadDocument(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ signedUrl: string }> {
    return this.documentsService.downloadDocument(id, user);
  }

  /**
   * Delete a document
   *
   * @param id - Document UUID
   * @param user - Authenticated user
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.documentsService.deleteDocument(id, user);
  }
}
