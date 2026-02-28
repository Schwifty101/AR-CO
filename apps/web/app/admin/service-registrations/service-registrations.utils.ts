/**
 * Admin Service Registrations Shared Utilities
 *
 * Shared constants and helper functions used across admin service registration
 * pages (list, detail). Extracted to comply with the 500-line file limit
 * and to reduce duplication (DRY).
 *
 * @module AdminServiceRegistrationsUtils
 *
 * @example
 * ```typescript
 * import {
 *   STATUS_COLORS,
 *   PAYMENT_STATUS_COLORS,
 *   formatDate,
 *   formatDateTime,
 *   formatEnumLabel,
 * } from '../service-registrations.utils';
 * ```
 */

import {
  ServiceRegistrationStatus,
  ServiceRegistrationPaymentStatus,
} from '@repo/shared';

/** Registration status badge color mapping */
export const STATUS_COLORS: Record<ServiceRegistrationStatus, string> = {
  [ServiceRegistrationStatus.PENDING_PAYMENT]: 'bg-yellow-500 text-white',
  [ServiceRegistrationStatus.PAID]: 'bg-blue-500 text-white',
  [ServiceRegistrationStatus.IN_PROGRESS]: 'bg-purple-500 text-white',
  [ServiceRegistrationStatus.COMPLETED]: 'bg-green-500 text-white',
  [ServiceRegistrationStatus.CANCELLED]: 'bg-gray-500 text-white',
};

/** Payment status badge color mapping */
export const PAYMENT_STATUS_COLORS: Record<ServiceRegistrationPaymentStatus, string> = {
  [ServiceRegistrationPaymentStatus.PENDING]: 'bg-yellow-500 text-white',
  [ServiceRegistrationPaymentStatus.PAID]: 'bg-green-500 text-white',
  [ServiceRegistrationPaymentStatus.FAILED]: 'bg-red-500 text-white',
  [ServiceRegistrationPaymentStatus.REFUNDED]: 'bg-gray-500 text-white',
};

/** Items per page for paginated lists */
export const PAGE_SIZE = 20;

/**
 * Format a date string for display (short format)
 *
 * @param dateString - ISO date string
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate('2024-01-15') // 'Jan 15, 2024'
 * ```
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date string with time for display
 *
 * @param dateString - ISO date string
 * @returns Formatted date-time string
 *
 * @example
 * ```typescript
 * formatDateTime('2024-01-15T10:30:00Z') // 'Jan 15, 2024, 10:30 AM'
 * ```
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format an enum value for display by replacing underscores with spaces
 *
 * @param value - Enum string value (e.g., 'pending_payment')
 * @returns Display string (e.g., 'pending payment')
 *
 * @example
 * ```typescript
 * formatEnumLabel('pending_payment') // 'pending payment'
 * ```
 */
export const formatEnumLabel = (value: string): string => {
  return value.replace(/_/g, ' ');
};

/**
 * Get today's date in YYYY-MM-DD format for default filing date
 *
 * @returns ISO date string for today
 *
 * @example
 * ```typescript
 * getTodayDateString() // '2026-02-28'
 * ```
 */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};
