/**
 * Service Registrations Payment Service
 *
 * Handles payment initiation and Safepay integration for service registrations.
 * Extracted from ServiceRegistrationsService to keep files under 500 lines.
 *
 * @module ServiceRegistrationsPaymentService
 *
 * @example
 * ```typescript
 * const { checkoutUrl } = await paymentService.initiatePayment(
 *   'registration-uuid-123',
 *   'https://arco.pk/payment/success',
 *   'https://arco.pk/payment/cancel',
 * );
 * ```
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { SafepayService } from '../payments/safepay.service';
import { ServiceRegistrationPaymentStatus } from '@repo/shared';
import type { DbResult } from '../database/db-result.types';

/** Database row shape for registration with joined service fee */
interface RegistrationWithFeeRow {
  id: string;
  payment_status: ServiceRegistrationPaymentStatus;
  services: { registration_fee: number };
}

/**
 * Service for handling payment operations on service registrations
 *
 * @class ServiceRegistrationsPaymentService
 */
@Injectable()
export class ServiceRegistrationsPaymentService {
  private readonly logger = new Logger(ServiceRegistrationsPaymentService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly safepayService: SafepayService,
  ) {}

  /**
   * Initiates payment for a service registration
   * Creates a Safepay checkout session and updates registration with tracker ID
   *
   * @param registrationId - The registration ID
   * @param returnUrl - URL to redirect after successful payment
   * @param cancelUrl - URL to redirect after cancelled payment
   * @returns Checkout URL and registration ID
   * @throws {NotFoundException} If registration does not exist
   * @throws {BadRequestException} If payment already completed
   * @throws {InternalServerErrorException} If payment creation fails
   *
   * @example
   * ```typescript
   * try {
   *   const result = await paymentService.initiatePayment(
   *     'registration-uuid-123',
   *     'https://arco.pk/payment/success',
   *     'https://arco.pk/payment/cancel'
   *   );
   *   // Redirect user to result.checkoutUrl
   * } catch (error) {
   *   if (error instanceof BadRequestException) {
   *     // Payment already completed
   *   }
   * }
   * ```
   */
  async initiatePayment(
    registrationId: string,
    returnUrl: string,
    cancelUrl: string,
  ): Promise<{ checkoutUrl: string; registrationId: string }> {
    this.logger.log(`Initiating payment for registration ${registrationId}`);

    const adminClient = this.supabaseService.getAdminClient();

    // Fetch registration with service details
    const { data: registration, error: fetchError } = (await adminClient
      .from('service_registrations')
      .select('*, services(registration_fee)')
      .eq('id', registrationId)
      .single()) as DbResult<RegistrationWithFeeRow>;

    if (fetchError || !registration) {
      this.logger.warn(`Registration ${registrationId} not found`, fetchError);
      throw new NotFoundException('Registration not found');
    }

    // Check if already paid
    if (registration.payment_status === ServiceRegistrationPaymentStatus.PAID) {
      this.logger.warn(
        `Registration ${registrationId} already paid, cannot initiate payment`,
      );
      throw new BadRequestException('Payment already completed');
    }

    // Get service fee
    const serviceFee = registration.services.registration_fee;

    // Create Safepay checkout session
    let checkoutUrl: string;
    let trackerToken: string;

    try {
      const result = await this.safepayService.createCheckoutSession({
        amount: serviceFee,
        currency: 'PKR',
        orderId: registrationId,
        metadata: {
          type: 'service',
          referenceId: registrationId,
        },
        returnUrl,
        cancelUrl,
      });

      checkoutUrl = result.checkoutUrl;
      trackerToken = result.token;
    } catch (error) {
      this.logger.error(
        `Failed to create Safepay checkout for registration ${registrationId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to initiate payment');
    }

    // Update registration with tracker ID
    const { error: updateError } = await adminClient
      .from('service_registrations')
      .update({ safepay_tracker_id: trackerToken })
      .eq('id', registrationId);

    if (updateError) {
      this.logger.error(
        `Failed to update registration ${registrationId} with tracker ID`,
        updateError,
      );
      throw new InternalServerErrorException('Failed to update registration');
    }

    this.logger.log(
      `Payment initiated for registration ${registrationId}, tracker: ${trackerToken}`,
    );

    return {
      checkoutUrl,
      registrationId,
    };
  }
}
