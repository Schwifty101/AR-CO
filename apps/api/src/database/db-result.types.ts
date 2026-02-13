/**
 * Typed wrappers for Supabase query results.
 *
 * The Supabase admin client returns `any`-typed data from queries.
 * These interfaces allow casting query results to eliminate
 * `@typescript-eslint/no-unsafe-assignment` lint errors.
 *
 * @module DbResultTypes
 *
 * @example
 * ```typescript
 * import type { DbResult, DbListResult } from '../database/db-result.types';
 *
 * const { data, error } = (await adminClient
 *   .from('subscriptions')
 *   .select('*')
 *   .eq('id', id)
 *   .single()) as DbResult<SubscriptionRow>;
 * ```
 */

/** Typed result from a Supabase single-row query (.single()) */
export interface DbResult<T> {
  data: T | null;
  error: { code?: string; message: string } | null;
}

/** Typed result from a Supabase list query */
export interface DbListResult<T> {
  data: T[] | null;
  error: { code?: string; message: string } | null;
  count?: number | null;
}

/** Typed result from a Supabase count-only query (.select('*', { count: 'exact', head: true })) */
export interface DbCountResult {
  count: number | null;
  error: { code?: string; message: string } | null;
}

/** Typed result from a Supabase void mutation (insert/update/delete without .select()) */
export interface DbMutationResult {
  error: { code?: string; message: string } | null;
}
