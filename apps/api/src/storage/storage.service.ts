import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../database/supabase.service';

/**
 * Service for interacting with Supabase Storage.
 * Handles file upload, download, signed URL generation, and deletion.
 *
 * @example
 * ```typescript
 * const path = await storageService.upload(file, 'documents', 'cases/uuid/file.pdf');
 * const url = await storageService.getSignedUrl('documents', path);
 * ```
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly defaultBucket: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.defaultBucket = this.configService.get<string>('supabase.storageBucket') || 'documents';
  }

  /**
   * Upload a file to Supabase Storage
   *
   * @param fileBuffer - The file buffer to upload
   * @param path - Storage path (e.g., 'cases/uuid/file.pdf')
   * @param contentType - MIME type of the file
   * @param bucket - Storage bucket name (defaults to configured bucket)
   * @returns The storage path of the uploaded file
   */
  async upload(
    fileBuffer: Buffer,
    path: string,
    contentType: string,
    bucket?: string,
  ): Promise<string> {
    const targetBucket = bucket || this.defaultBucket;
    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient.storage
      .from(targetBucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Failed to upload file to ${targetBucket}/${path}: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file.');
    }

    this.logger.log(`File uploaded to ${targetBucket}/${path}`);
    return path;
  }

  /**
   * Generate a signed URL for downloading a file
   *
   * @param path - Storage path of the file
   * @param expiresIn - URL expiration in seconds (default: 86400 = 24 hours)
   * @param bucket - Storage bucket name (defaults to configured bucket)
   * @returns Signed download URL
   */
  async getSignedUrl(
    path: string,
    expiresIn: number = 86400,
    bucket?: string,
  ): Promise<string> {
    const targetBucket = bucket || this.defaultBucket;
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient.storage
      .from(targetBucket)
      .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      this.logger.error(
        `Failed to create signed URL for ${targetBucket}/${path}: ${error?.message}`,
      );
      throw new InternalServerErrorException('Failed to generate download URL.');
    }

    return data.signedUrl;
  }

  /**
   * Delete a file from Supabase Storage
   *
   * @param path - Storage path of the file to delete
   * @param bucket - Storage bucket name (defaults to configured bucket)
   */
  async delete(path: string, bucket?: string): Promise<void> {
    const targetBucket = bucket || this.defaultBucket;
    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient.storage
      .from(targetBucket)
      .remove([path]);

    if (error) {
      this.logger.error(`Failed to delete file ${targetBucket}/${path}: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete file.');
    }

    this.logger.log(`File deleted from ${targetBucket}/${path}`);
  }
}
