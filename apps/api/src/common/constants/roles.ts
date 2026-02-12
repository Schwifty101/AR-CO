/**
 * Shared Role Constants
 *
 * Common role groupings used across multiple service modules
 * for access control checks.
 *
 * @module RoleConstants
 *
 * @example
 * ```typescript
 * import { STAFF_ROLES } from '../common/constants/roles';
 *
 * if (STAFF_ROLES.includes(user.userType)) {
 *   // User has staff-level access
 * }
 * ```
 */

import { UserType } from '../enums/user-type.enum';

/** Roles that have staff-level access (admin, staff, attorney) */
export const STAFF_ROLES: string[] = [
  UserType.ADMIN,
  UserType.STAFF,
  UserType.ATTORNEY,
];
