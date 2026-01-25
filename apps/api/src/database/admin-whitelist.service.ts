/**
 * Admin Whitelist Service
 *
 * Manages the list of email addresses that have administrative privileges.
 * Used for granting admin access to personal email accounts (e.g., Gmail)
 * when signing up with Google OAuth.
 *
 * @module AdminWhitelistService
 *
 * @example
 * ```typescript
 * import { AdminWhitelistService } from './database/admin-whitelist.service';
 *
 * @Injectable()
 * export class AuthService {
 *   constructor(private readonly adminWhitelist: AdminWhitelistService) {}
 *
 *   async handleGoogleSignup(email: string) {
 *     const userType = this.adminWhitelist.isAdminEmail(email)
 *       ? UserType.ADMIN
 *       : UserType.CLIENT;
 *
 *     // Create user profile with appropriate type
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Check if user should get admin access
 * if (this.adminWhitelist.isAdminEmail('john@gmail.com')) {
 *   // Grant admin role
 * }
 * ```
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Admin whitelist service
 *
 * Checks if an email address is in the admin whitelist.
 * Emails are loaded from ADMIN_EMAILS environment variable.
 *
 * @class AdminWhitelistService
 */
@Injectable()
export class AdminWhitelistService {
  private readonly adminEmails: Set<string>;

  /**
   * Initialize admin whitelist from configuration
   *
   * Loads comma-separated email list from ADMIN_EMAILS env var
   * and normalizes them (lowercase, trimmed) for matching.
   *
   * @param {ConfigService} configService - NestJS config service
   */
  constructor(private readonly configService: ConfigService) {
    const emails = this.configService.get<string[]>('admin.emails') || [];

    // Normalize emails: lowercase and trim
    this.adminEmails = new Set(
      emails
        .map((email) => email.toLowerCase().trim())
        .filter((email) => email.length > 0),
    );
  }

  /**
   * Check if email is in admin whitelist
   *
   * Performs case-insensitive comparison against the whitelist.
   * Returns true if the email is whitelisted for admin access.
   *
   * @param {string} email - Email address to check
   * @returns {boolean} True if email is whitelisted, false otherwise
   *
   * @example
   * ```typescript
   * // ADMIN_EMAILS="admin@example.com,john@gmail.com"
   *
   * this.isAdminEmail('admin@example.com');  // true
   * this.isAdminEmail('ADMIN@EXAMPLE.COM');  // true (case-insensitive)
   * this.isAdminEmail('user@example.com');   // false
   * this.isAdminEmail('');                   // false
   * ```
   *
   * @example
   * ```typescript
   * // Usage in RolesGuard
   * if (this.adminWhitelist.isAdminEmail(user.email)) {
   *   return true; // Bypass role restrictions for whitelisted admins
   * }
   * ```
   */
  isAdminEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();
    return this.adminEmails.has(normalizedEmail);
  }
}
