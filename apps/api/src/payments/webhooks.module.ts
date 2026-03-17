/**
 * Webhooks Module
 *
 * Hosts the LemonSqueezy webhook controller and injects all three service
 * modules that handle payment events. Kept separate from PaymentsModule to
 * avoid circular dependencies (SubscriptionsModule → PaymentsModule would
 * become circular if PaymentsModule imported SubscriptionsModule).
 *
 * @module WebhooksModule
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * @Module({ imports: [WebhooksModule] })
 * export class AppModule {}
 * ```
 */

import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentsModule } from './payments.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ConsultationsModule } from '../consultations/consultations.module';
import { ServiceRegistrationsModule } from '../service-registrations/service-registrations.module';

@Module({
  imports: [
    PaymentsModule,
    SubscriptionsModule,
    ConsultationsModule,
    ServiceRegistrationsModule,
  ],
  controllers: [WebhookController],
})
export class WebhooksModule {}
