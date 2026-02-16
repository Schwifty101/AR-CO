/**
 * Billing scheduler service for recurring subscription charges.
 *
 * Runs a daily cron job at 2:00 AM PKT (21:00 UTC) to process
 * subscription renewals and retry failed charges.
 *
 * @module SubscriptionsModule
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Daily renewal processing job.
   *
   * Runs at 21:00 UTC (2:00 AM PKT) every day.
   * Finds due subscriptions and retries, charges stored cards.
   */
  @Cron('0 21 * * *')
  async handleRenewals(): Promise<void> {
    this.logger.log('Starting daily subscription renewal processing');

    try {
      const result = await this.subscriptionsService.processRenewals();
      this.logger.log(
        `Renewal processing complete: ${result.processed} processed, ` +
          `${result.succeeded} succeeded, ${result.failed} failed`,
      );
    } catch (error) {
      this.logger.error('Renewal processing failed', error);
    }
  }
}
