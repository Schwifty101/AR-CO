import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for skipping audit logging
 * @constant
 */
export const SKIP_AUDIT_KEY = 'skipAudit';

/**
 * SkipAudit decorator
 *
 * Marks a route handler to skip automatic audit logging via AuditInterceptor.
 * Use for routes that handle their own logging or should not be audited.
 *
 * @decorator
 * @returns {MethodDecorator} NestJS method decorator
 *
 * @example
 * ```typescript
 * @Patch(':id/status')
 * @SkipAudit() // This route logs manually with custom metadata
 * async updateStatus(@Param('id') id: string) { ... }
 * ```
 */
export const SkipAudit = () => SetMetadata(SKIP_AUDIT_KEY, true);
