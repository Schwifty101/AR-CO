/**
 * Authenticated User Interface
 *
 * Defines the structure of an authenticated user in the AR-CO system.
 * This interface is attached to `request.user` after JWT authentication.
 *
 * @module AuthUserInterface
 *
 * @example
 * ```typescript
 * import { AuthUser } from './common/interfaces/auth-user.interface';
 * import { CurrentUser } from './common/decorators/current-user.decorator';
 *
 * @Controller('cases')
 * export class CasesController {
 *   @Get('my-cases')
 *   getMyCases(@CurrentUser() user: AuthUser) {
 *     console.log(user.id);        // UUID from auth.users
 *     console.log(user.email);     // User's email
 *     console.log(user.userType);  // 'client', 'attorney', etc.
 *     console.log(user.fullName);  // Display name
 *
 *     // Optional profile IDs based on user type
 *     if (user.clientProfileId) {
 *       // Query client-specific data
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Attorney user example
 * const attorneyUser: AuthUser = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'john.doe@arco.com',
 *   userType: UserType.ATTORNEY,
 *   fullName: 'John Doe',
 *   phoneNumber: '+92-300-1234567',
 *   attorneyProfileId: '456e7890-e89b-12d3-a456-426614174111'
 * };
 * ```
 */

import { UserType } from '../enums/user-type.enum';

/**
 * Authenticated user interface
 *
 * Represents a user after successful JWT authentication.
 * Populated by JwtAuthGuard and accessible via @CurrentUser() decorator.
 *
 * @interface AuthUser
 */
export interface AuthUser {
  /**
   * Supabase auth.users UUID
   * Primary identifier across all tables
   */
  id: string;

  /**
   * User's email address
   * Used for login and communication
   */
  email: string;

  /**
   * User's role/type in the system
   * Determines access permissions and available features
   */
  userType: UserType;

  /**
   * User's full display name
   * Retrieved from user_profiles table
   */
  fullName: string;

  /**
   * User's phone number
   * Optional, used for WhatsApp notifications
   */
  phoneNumber: string | null;

  /**
   * Client profile UUID
   * Present only if userType is CLIENT
   */
  clientProfileId?: string;

  /**
   * Attorney profile UUID
   * Present only if userType is ATTORNEY
   */
  attorneyProfileId?: string;
}
