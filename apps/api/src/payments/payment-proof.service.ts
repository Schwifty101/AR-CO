/**
 * Payment Proof Service
 *
 * Handles upload and retrieval of manual-payment screenshots (bank-transfer
 * proofs) for consultation bookings and service registrations.
 *
 * Files live in the private `payment-proofs` Supabase storage bucket. Uploads
 * use the admin (service-role) client; admin viewing is done via short-lived
 * signed URLs. No public bucket policies are required.
 *
 * @module PaymentsModule
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

/** Private bucket that stores all manual-payment screenshots */
const PROOF_BUCKET = 'payment-proofs';

/** MIME types accepted as a payment screenshot */
const ALLOWED_PROOF_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

@Injectable()
export class PaymentProofService {
  private readonly logger = new Logger(PaymentProofService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Uploads a single payment-proof file and returns its storage path.
   *
   * @param pathPrefix - Folder prefix, e.g. `consultations/{bookingId}`
   * @param file - The uploaded screenshot (jpg/png/webp/pdf, validated)
   * @returns The storage path persisted on the booking/registration row
   * @throws {BadRequestException} If the MIME type is not an image/pdf
   * @throws {InternalServerErrorException} If the storage upload fails
   *
   * @example
   * ```typescript
   * const { storagePath } = await paymentProofService.uploadProof(
   *   `consultations/${bookingId}`,
   *   file,
   * );
   * ```
   */
  async uploadProof(
    pathPrefix: string,
    file: Express.Multer.File,
  ): Promise<{ storagePath: string }> {
    if (!file) {
      throw new BadRequestException('Payment screenshot file is required');
    }
    if (!ALLOWED_PROOF_MIME.includes(file.mimetype as never)) {
      throw new BadRequestException(
        'Only JPG, PNG, WEBP, and PDF payment screenshots are allowed',
      );
    }

    const adminClient = this.supabaseService.getAdminClient();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${pathPrefix}/${Date.now()}-${safeName}`;

    const { error } = await adminClient.storage
      .from(PROOF_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(
        `Failed to upload payment proof to ${storagePath}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to upload payment screenshot',
      );
    }

    this.logger.log(`Payment proof uploaded: ${storagePath}`);
    return { storagePath };
  }

  /**
   * Generates a short-lived signed URL (1 hour) for an admin to view a proof.
   *
   * @param storagePath - The stored proof path
   * @returns A signed URL valid for 1 hour
   * @throws {InternalServerErrorException} If URL generation fails
   *
   * @example
   * ```typescript
   * const url = await paymentProofService.getSignedProofUrl(booking.payment_proof_path);
   * ```
   */
  async getSignedProofUrl(storagePath: string): Promise<string> {
    const adminClient = this.supabaseService.getAdminClient();
    const { data, error } = await adminClient.storage
      .from(PROOF_BUCKET)
      .createSignedUrl(storagePath, 3600);

    if (error || !data?.signedUrl) {
      this.logger.error(`Failed to sign proof URL for ${storagePath}`, error);
      throw new InternalServerErrorException('Failed to generate proof URL');
    }
    return data.signedUrl;
  }
}
