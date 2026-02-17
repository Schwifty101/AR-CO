import { Module } from '@nestjs/common';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';

/**
 * Module responsible for managing citizen complaints
 *
 * @remarks
 * This module provides complaint submission, tracking, assignment, and resolution
 * functionality.
 *
 * Features:
 * - Complaint submission
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
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
