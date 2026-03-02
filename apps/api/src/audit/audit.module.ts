import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

/**
 * Audit Module
 *
 * Provides centralized audit logging. Marked @Global() so AuditService
 * is injectable everywhere (needed by AuthService for auth event migration).
 *
 * @example
 * ```typescript
 * // In app.module.ts:
 * imports: [AuditModule]
 * ```
 */
@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
