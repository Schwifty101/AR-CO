/**
 * Admin Cases Shared Utilities
 *
 * Shared constants and helper functions used across admin case pages
 * (list, detail, create). Extracted to comply with the 500-line file limit
 * and to reduce duplication (DRY).
 *
 * @module AdminCasesUtils
 *
 * @example
 * ```typescript
 * import { STATUS_COLORS, PRIORITY_COLORS, formatDate, formatDateTime } from './cases.utils';
 * ```
 */

import { CaseStatus, CasePriority, CaseActivityType } from '@/lib/api/cases';

/** Case status badge color mapping */
export const STATUS_COLORS: Record<CaseStatus, string> = {
  [CaseStatus.PENDING]: 'bg-yellow-500 text-white',
  [CaseStatus.ACTIVE]: 'bg-blue-500 text-white',
  [CaseStatus.ON_HOLD]: 'bg-orange-500 text-white',
  [CaseStatus.RESOLVED]: 'bg-green-500 text-white',
  [CaseStatus.CLOSED]: 'bg-gray-500 text-white',
};

/** Case priority badge color mapping */
export const PRIORITY_COLORS: Record<CasePriority, string> = {
  [CasePriority.LOW]: 'bg-gray-100 text-gray-800',
  [CasePriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [CasePriority.HIGH]: 'bg-orange-100 text-orange-800',
  [CasePriority.URGENT]: 'bg-red-500 text-white',
};

/** Case activity type badge color mapping */
export const ACTIVITY_TYPE_COLORS: Record<CaseActivityType, string> = {
  [CaseActivityType.CASE_CREATED]: 'bg-indigo-100 text-indigo-800',
  [CaseActivityType.STATUS_CHANGED]: 'bg-blue-100 text-blue-800',
  [CaseActivityType.NOTE_ADDED]: 'bg-gray-100 text-gray-800',
  [CaseActivityType.ATTORNEY_ASSIGNED]: 'bg-purple-100 text-purple-800',
  [CaseActivityType.DOCUMENT_UPLOADED]: 'bg-green-100 text-green-800',
  [CaseActivityType.HEARING_SCHEDULED]: 'bg-orange-100 text-orange-800',
  [CaseActivityType.PAYMENT_RECEIVED]: 'bg-emerald-100 text-emerald-800',
  [CaseActivityType.OTHER]: 'bg-slate-100 text-slate-800',
};

/** Items per page for paginated lists */
export const PAGE_SIZE = 20;

/**
 * Format a date string for display (short format)
 *
 * @param dateString - ISO date string or null
 * @returns Formatted date string or 'N/A'
 *
 * @example
 * ```typescript
 * formatDate('2024-01-15') // 'Jan 15, 2024'
 * formatDate(null)         // 'N/A'
 * ```
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
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
 * @param value - Enum string value (e.g., 'on_hold')
 * @returns Display string (e.g., 'on hold')
 *
 * @example
 * ```typescript
 * formatEnumLabel('on_hold')  // 'on hold'
 * formatEnumLabel('pending')  // 'pending'
 * ```
 */
export const formatEnumLabel = (value: string): string => {
  return value.replace(/_/g, ' ');
};

/**
 * Calculate relative time from now for activity timestamps
 *
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., '5m ago', '2h ago', '3d ago')
 *
 * @example
 * ```typescript
 * getRelativeTime('2024-01-15T10:30:00Z') // '3d ago'
 * ```
 */
export const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};
