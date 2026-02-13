/**
 * Services Service
 *
 * Handles retrieval of facilitation services from the database.
 * These are the services offered by the law firm (NTN registration,
 * SECP registration, compliance certificates, etc.).
 *
 * All service listings are public-facing and do not require authentication.
 *
 * @module ServicesService
 *
 * @example
 * ```typescript
 * // Fetch paginated services
 * const result = await servicesService.getServices({ page: 1, limit: 20, sort: 'created_at', order: 'desc' });
 * console.log(result.data); // ServiceResponse[]
 * console.log(result.meta.total); // total count
 * ```
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { validateSortColumn } from '../common/utils/query-helpers';
import type {
  ServiceResponse,
  PaginatedServicesResponse,
  PaginationParams,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for the services table */
interface ServiceRow {
  id: string;
  practice_area_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  base_fee: number | null;
  registration_fee: number | null;
  estimated_duration: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Allowed sort columns for services queries */
const ALLOWED_SERVICE_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'name',
] as const;

/**
 * Service for retrieving facilitation service listings.
 * All queries use the admin client since these are public endpoints
 * and do not require RLS filtering by user.
 *
 * @class ServicesService
 */
@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Fetches a paginated list of active services.
   *
   * Only returns services where `is_active = true` so that
   * deactivated services are hidden from the public listing.
   *
   * @param pagination - Pagination and sorting parameters
   * @returns Paginated services response with metadata
   * @throws {InternalServerErrorException} If the database query fails
   *
   * @example
   * ```typescript
   * const result = await servicesService.getServices({
   *   page: 1,
   *   limit: 20,
   *   sort: 'name',
   *   order: 'asc',
   * });
   * // result.data => ServiceResponse[]
   * // result.meta => { page, limit, total, totalPages }
   * ```
   */
  async getServices(
    pagination: PaginationParams,
  ): Promise<PaginatedServicesResponse> {
    this.logger.log(
      `Fetching services: page=${pagination.page}, limit=${pagination.limit}`,
    );

    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit, sort, order } = pagination;
    const offset = (page - 1) * limit;

    const validSort = validateSortColumn(sort, ALLOWED_SERVICE_SORT_COLUMNS);

    const { data, error, count } = (await adminClient
      .from('services')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order(validSort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)) as DbListResult<ServiceRow>;

    if (error) {
      this.logger.error('Failed to fetch services', error);
      throw new InternalServerErrorException('Failed to fetch services');
    }

    const services = (data ?? []).map((row) => this.mapServiceRow(row));

    return {
      data: services,
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Fetches a single service by its ID.
   *
   * Only returns the service if it is active. Inactive services
   * return a 404 to prevent exposing deactivated content.
   *
   * @param serviceId - UUID of the service to retrieve
   * @returns The service response
   * @throws {NotFoundException} If the service does not exist or is inactive
   *
   * @example
   * ```typescript
   * const service = await servicesService.getServiceById('service-uuid-123');
   * console.log(service.name); // "NTN Registration"
   * ```
   */
  async getServiceById(serviceId: string): Promise<ServiceResponse> {
    this.logger.log(`Fetching service ${serviceId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single()) as DbResult<ServiceRow>;

    if (error || !data) {
      this.logger.warn(`Service ${serviceId} not found or inactive`, error);
      throw new NotFoundException('Service not found');
    }

    return this.mapServiceRow(data);
  }

  /**
   * Maps a database row (snake_case) to ServiceResponse (camelCase).
   *
   * @param row - The raw database row from the services table
   * @returns The mapped service response object
   */
  private mapServiceRow(row: ServiceRow): ServiceResponse {
    return {
      id: row.id,
      practiceAreaId: row.practice_area_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      baseFee: row.base_fee,
      registrationFee: row.registration_fee,
      estimatedDuration: row.estimated_duration,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
