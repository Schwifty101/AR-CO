/**
 * Payments module providing LemonSqueezyService, InvoicesService, and payment controllers.
 *
 * Exports LemonSqueezyService and InvoicesService for use by other modules.
 *
 * @module PaymentsModule
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [PaymentsModule],
 * })
 * export class SubscriptionsModule {}
 * ```
 */
import { Module } from '@nestjs/common';
import { LemonSqueezyService } from './lemonsqueezy.service';
import { InvoicesService } from './invoices.service';
import { PaymentProofService } from './payment-proof.service';
import { PaymentEmailService } from './payment-email.service';
import { InvoicesController } from './invoices.controller';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [InvoicesController, PaymentsController],
  providers: [
    LemonSqueezyService,
    InvoicesService,
    PaymentProofService,
    PaymentEmailService,
  ],
  exports: [
    LemonSqueezyService,
    InvoicesService,
    PaymentProofService,
    PaymentEmailService,
  ],
})
export class PaymentsModule {}
