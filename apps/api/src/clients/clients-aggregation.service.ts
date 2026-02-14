/**
 * Clients Aggregation Service
 *
 * Handles retrieval of client-related data from other tables
 * (cases, documents, invoices) with pagination and access control.
 *
 * @module ClientsAggregationService
 *
 * @example
 * ```typescript
 * const cases = await clientsAggregationService.getClientCases(
 *   'client-uuid',
 *   user,
 *   { page: 1, limit: 20, sort: 'created_at', order: 'desc' },
 * );
 * ```
 */

import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { STAFF_ROLES } from '../common/constants/roles';
import { validateSortColumn } from '../common/utils/query-helpers';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import type { PaginationParams } from '@repo/shared';
import type { DbListResult, DbCountResult } from '../database/db-result.types';

/** Allowed sort columns for cases aggregation */
const ALLOWED_CASE_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'case_number',
] as const;

/** Allowed sort columns for documents aggregation */
const ALLOWED_DOCUMENT_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'document_name',
] as const;

/** Allowed sort columns for invoices aggregation */
const ALLOWED_INVOICE_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'invoice_number',
] as const;

/**
 * Service for retrieving aggregated client data (cases, documents, invoices)
 *
 * @class ClientsAggregationService
 */
@Injectable()
export class ClientsAggregationService {
  private readonly logger = new Logger(ClientsAggregationService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Assert that the requesting user has access to the given client
   *
   * @throws {ForbiddenException} If client tries to access another client's data
   */
  private assertClientAccess(clientProfileId: string, user: AuthUser): void {
    if (STAFF_ROLES.includes(user.userType)) return;
    if (user.clientProfileId === clientProfileId) return;
    throw new ForbiddenException('You can only access your own data');
  }

  /**
   * Get cases for a specific client
   *
   * @param {string} clientId - client_profiles UUID
   * @param {AuthUser} user - Requesting user (for access check)
   * @param {PaginationParams} pagination - Pagination parameters
   * @returns {Promise<{ data: unknown[]; meta: object }>} Paginated cases
   */
  async getClientCases(
    clientId: string,
    user: AuthUser,
    pagination: PaginationParams,
  ): Promise<{ data: unknown[]; meta: object }> {
    this.assertClientAccess(clientId, user);

    const adminClient = this.supabaseService.getAdminClient();
    const offset = (pagination.page - 1) * pagination.limit;

    const { count, error: countError } = (await adminClient
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('client_profile_id', clientId)) as DbCountResult;

    if (countError) {
      this.logger.error(`Failed to count cases: ${countError.message}`);
      throw new InternalServerErrorException('Unable to retrieve cases count.');
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pagination.limit);

    const validSort = validateSortColumn(
      pagination.sort,
      ALLOWED_CASE_SORT_COLUMNS,
    );

    const { data: cases, error } = (await adminClient
      .from('cases')
      .select('*')
      .eq('client_profile_id', clientId)
      .order(validSort, { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1)) as DbListResult<
      Record<string, unknown>
    >;

    if (error) {
      this.logger.error(`Failed to fetch cases: ${error.message}`);
      throw new InternalServerErrorException('Unable to retrieve cases.');
    }

    return {
      data: cases || [],
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get documents for a specific client
   *
   * @param {string} clientId - client_profiles UUID
   * @param {AuthUser} user - Requesting user (for access check)
   * @param {PaginationParams} pagination - Pagination parameters
   * @returns {Promise<{ data: unknown[]; meta: object }>} Paginated documents
   */
  async getClientDocuments(
    clientId: string,
    user: AuthUser,
    pagination: PaginationParams,
  ): Promise<{ data: unknown[]; meta: object }> {
    this.assertClientAccess(clientId, user);

    const adminClient = this.supabaseService.getAdminClient();
    const offset = (pagination.page - 1) * pagination.limit;

    const { count, error: countError } = (await adminClient
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('client_profile_id', clientId)) as DbCountResult;

    if (countError) {
      this.logger.error(`Failed to count documents: ${countError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve documents count.',
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pagination.limit);

    const validSort = validateSortColumn(
      pagination.sort,
      ALLOWED_DOCUMENT_SORT_COLUMNS,
    );

    const { data: documents, error } = (await adminClient
      .from('documents')
      .select('*')
      .eq('client_profile_id', clientId)
      .order(validSort, { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1)) as DbListResult<
      Record<string, unknown>
    >;

    if (error) {
      this.logger.error(`Failed to fetch documents: ${error.message}`);
      throw new InternalServerErrorException('Unable to retrieve documents.');
    }

    return {
      data: documents || [],
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get invoices for a specific client
   *
   * @param {string} clientId - client_profiles UUID
   * @param {AuthUser} user - Requesting user (for access check)
   * @param {PaginationParams} pagination - Pagination parameters
   * @returns {Promise<{ data: unknown[]; meta: object }>} Paginated invoices
   */
  async getClientInvoices(
    clientId: string,
    user: AuthUser,
    pagination: PaginationParams,
  ): Promise<{ data: unknown[]; meta: object }> {
    this.assertClientAccess(clientId, user);

    const adminClient = this.supabaseService.getAdminClient();
    const offset = (pagination.page - 1) * pagination.limit;

    const { count, error: countError } = (await adminClient
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('client_profile_id', clientId)) as DbCountResult;

    if (countError) {
      this.logger.error(`Failed to count invoices: ${countError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve invoices count.',
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pagination.limit);

    const validSort = validateSortColumn(
      pagination.sort,
      ALLOWED_INVOICE_SORT_COLUMNS,
    );

    const { data: invoices, error } = (await adminClient
      .from('invoices')
      .select('*')
      .eq('client_profile_id', clientId)
      .order(validSort, { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1)) as DbListResult<
      Record<string, unknown>
    >;

    if (error) {
      this.logger.error(`Failed to fetch invoices: ${error.message}`);
      throw new InternalServerErrorException('Unable to retrieve invoices.');
    }

    return {
      data: invoices || [],
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }
}
