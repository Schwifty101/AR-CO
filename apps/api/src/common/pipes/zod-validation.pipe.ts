/**
 * Zod Validation Pipe
 *
 * NestJS pipe that validates request data against a Zod schema.
 * Returns the parsed (transformed) data on success, or throws
 * BadRequestException with field-level error messages on failure.
 *
 * @module ZodValidationPipe
 *
 * @example
 * ```typescript
 * import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
 * import { SignupSchema, type SignupData } from '@repo/shared';
 *
 * @Post('signup')
 * async signup(
 *   @Body(new ZodValidationPipe(SignupSchema)) dto: SignupData,
 * ) { ... }
 * ```
 */

import { type PipeTransform, BadRequestException } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/** Validates and transforms input using a Zod schema */
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`,
      );
      throw new BadRequestException(messages);
    }
    return result.data;
  }
}
