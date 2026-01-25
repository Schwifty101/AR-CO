/**
 * Extended Express Request Interface
 *
 * Extends the Express Request type to include our authenticated user.
 * Used throughout guards and decorators for type safety.
 *
 * @module RequestWithUserInterface
 *
 * @example
 * ```typescript
 * import type { RequestWithUser } from './common/interfaces/request-with-user.interface';
 *
 * function extractUser(request: RequestWithUser): AuthUser {
 *   return request.user;
 * }
 * ```
 */

import type { Request } from 'express';
import type { AuthUser } from './auth-user.interface';

/**
 * Express Request with authenticated user
 *
 * Extends Express Request to include the user property
 * populated by JwtAuthGuard after successful authentication.
 *
 * @interface RequestWithUser
 * @extends {Request}
 */
export interface RequestWithUser extends Request {
  /**
   * Authenticated user attached by JwtAuthGuard
   * Available after JWT validation
   */
  user: AuthUser;
}
