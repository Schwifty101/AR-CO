import { Module } from '@nestjs/common';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';

/**
 * Module responsible for managing citizen complaints
 *
 * @remarks
 * This module provides complaint submission, tracking, assignment, and resolution
 * functionality. It integrates with the SubscriptionsModule to enforce subscription-based
 * access control for complaint submissions.
 *
 * Features:
 * - Complaint submission with subscription validation
 * - Complaint tracking and filtering
 * - Staff assignment and status management
 * - Auto-generated complaint numbers (CMP-YYYY-NNNN)
 * - Evidence URL attachment support
 *
 * @example
 * ```typescript
 * // Import in AppModule
 * @Module({
 *   imports: [ComplaintsModule],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
  imports: [SubscriptionsModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
