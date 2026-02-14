/**
 * Services Controller
 *
 * Handles HTTP requests for browsing available facilitation services.
 * All endpoints are public (no authentication required) so that
 * guest users can browse the service catalog before registering.
 *
 * Routes are prefixed with /api/services via NestJS global prefix + controller decorator.
 *
 * @module ServicesController
 *
 * @example
 * ```typescript
 * // List all active services (public)
 * GET /api/services?page=1&limit=20
 *
 * // Get a single service by ID (public)
 * GET /api/services/service-uuid-123
 * ```
 */

import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ServicesService } from './services.service';
import {
  PaginationSchema,
  type PaginationParams,
  type ServiceResponse,
  type PaginatedServicesResponse,
} from '@repo/shared';

/**
 * Controller for public-facing service catalog endpoints.
 *
 * Provides read-only access to the list of facilitation services
 * offered by the firm. These endpoints are consumed by the frontend
 * service browsing pages and the service registration form.
 *
 * @remarks
 * All routes use @Public() decorator to bypass JWT authentication,
 * since service listings should be accessible to everyone.
 *
 * @example
 * ```typescript
 * // Paginated listing
 * GET /api/services?page=1&limit=10&sort=name&order=asc
 *
 * // Single service detail
 * GET /api/services/550e8400-e29b-41d4-a716-446655440000
 * ```
 */
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Get paginated list of active services (PUBLIC - no auth required)
   *
   * Returns all active facilitation services. Inactive services are excluded.
   * Supports pagination and sorting via query parameters.
   *
   * @param pagination - Pagination parameters (page, limit, sort, order)
   * @returns Paginated services response with metadata
   *
   * @example
   * ```typescript
   * GET /api/services?page=1&limit=20&sort=name&order=asc
   *
   * Response:
   * {
   *   "data": [
   *     {
   *       "id": "uuid",
   *       "name": "NTN Registration",
   *       "slug": "ntn-registration",
   *       "baseFee": 15000,
   *       "registrationFee": 5000,
   *       "isActive": true,
   *       ...
   *     }
   *   ],
   *   "meta": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
   * }
   * ```
   */
  @Get()
  @Public()
  async getServices(
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<PaginatedServicesResponse> {
    return this.servicesService.getServices(pagination);
  }

  /**
   * Get a single service by ID (PUBLIC - no auth required)
   *
   * Returns the details of an active service. Returns 404 if the service
   * does not exist or has been deactivated.
   *
   * @param id - The service UUID
   * @returns The service response
   * @throws {NotFoundException} If service does not exist or is inactive
   *
   * @example
   * ```typescript
   * GET /api/services/550e8400-e29b-41d4-a716-446655440000
   *
   * Response:
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "name": "NTN Registration",
   *   "slug": "ntn-registration",
   *   "description": "National Tax Number registration service",
   *   "baseFee": 15000,
   *   "registrationFee": 5000,
   *   "estimatedDuration": "5-7 business days",
   *   "isActive": true,
   *   "practiceAreaId": "practice-area-uuid",
   *   "createdAt": "2026-01-01T00:00:00Z",
   *   "updatedAt": "2026-01-01T00:00:00Z"
   * }
   * ```
   */
  @Get(':id')
  @Public()
  async getServiceById(@Param('id') id: string): Promise<ServiceResponse> {
    return this.servicesService.getServiceById(id);
  }
}
