/**
 * Services API Client
 *
 * Client-side functions for fetching available facilitation services.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * NOTE: Services list is PUBLIC and does not require authentication.
 *
 * @module ServicesAPI
 *
 * @example
 * ```typescript
 * import { getServices } from '@/lib/api/services';
 *
 * // Fetch all services (public)
 * const services = await getServices({ page: 1, limit: 20 });
 *
 * // Filter by category
 * const ntnServices = services.services.filter(s => s.category === 'tax');
 * ```
 */

import type {
  ServiceResponse,
  PaginatedServicesResponse,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type { ServiceResponse } from '@repo/shared';

/** Pagination parameters for the frontend (only page + limit) */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Paginated services response shaped for frontend consumption */
export interface PaginatedServices {
  services: ServiceResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch paginated list of available services (PUBLIC - no auth required)
 *
 * Returns all facilitation services offered by the firm. This endpoint is public
 * so guest users can browse services before registering.
 *
 * @param params - Pagination parameters (page, limit)
 * @returns Paginated services response
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const services = await getServices({ page: 1, limit: 50 });
 * console.log(`Found ${services.total} services`);
 *
 * services.services.forEach(service => {
 *   console.log(`${service.title}: ${service.basePrice} PKR`);
 * });
 * ```
 */
export async function getServices(
  params?: PaginationParams,
): Promise<PaginatedServices> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `/api/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch services');
  }

  const backendResponse = (await response.json()) as PaginatedServicesResponse;

  return {
    services: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}
