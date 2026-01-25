/**
 * User Type Enum
 *
 * Defines all possible user types in the AR-CO system.
 * Maps to the `user_type` ENUM in the database schema (user_profiles table).
 *
 * @module UserTypeEnum
 *
 * @example
 * ```typescript
 * import { UserType } from './common/enums/user-type.enum';
 *
 * const adminUser = {
 *   userType: UserType.ADMIN,
 *   email: 'admin@arco.com'
 * };
 *
 * if (user.userType === UserType.ATTORNEY) {
 *   // Attorney-specific logic
 * }
 * ```
 */

/**
 * User type enum matching database schema
 *
 * - CLIENT: Client users who book appointments and access client portal
 * - ATTORNEY: Attorney users who manage cases and appointments
 * - STAFF: Staff users with administrative access
 * - ADMIN: Administrator users with full system access
 *
 * @enum {string}
 */
export enum UserType {
  CLIENT = 'client',
  ATTORNEY = 'attorney',
  STAFF = 'staff',
  ADMIN = 'admin',
}
