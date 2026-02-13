/**
 * Shared Query Helper Utilities
 *
 * Common utility functions for Supabase/PostgREST query operations,
 * used across multiple service modules.
 *
 * @module QueryHelpers
 *
 * @example
 * ```typescript
 * import { validateSortColumn, sanitizePostgrestFilter } from '../common/utils/query-helpers';
 *
 * const sortCol = validateSortColumn(pagination.sort, ALLOWED_COLUMNS);
 * const safeSearch = sanitizePostgrestFilter(userInput);
 * ```
 */

/**
 * Validates that a sort column is in the allowed list, defaulting to 'created_at'.
 *
 * Prevents SQL injection by ensuring only whitelisted column names are used in ORDER BY.
 *
 * @param sort - The requested sort column
 * @param allowed - Array of allowed column names
 * @returns The validated sort column or 'created_at' as default
 *
 * @example
 * ```typescript
 * const sortCol = validateSortColumn('full_name', ['created_at', 'full_name']);
 * // Returns: 'full_name'
 *
 * const defaultCol = validateSortColumn('malicious_col', ['created_at', 'full_name']);
 * // Returns: 'created_at'
 * ```
 */
export function validateSortColumn(
  sort: string,
  allowed: readonly string[],
): string {
  return allowed.includes(sort) ? sort : 'created_at';
}

/**
 * Sanitizes a string for safe use in PostgREST `.ilike()` filter expressions.
 *
 * Removes characters that could manipulate filter logic:
 * `%` and `_` (SQL wildcards), `,` (OR separator), `()` (grouping).
 *
 * @param value - The raw filter string from user input
 * @returns Sanitized string safe for PostgREST filters
 *
 * @example
 * ```typescript
 * const safe = sanitizePostgrestFilter('test%value_(special)');
 * // Returns: 'testvaluespecial'
 * ```
 */
export function sanitizePostgrestFilter(value: string): string {
  return value.replace(/[%_,()]/g, '');
}
