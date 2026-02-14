/**
 * Clients Controller
 *
 * Staff-facing CRUD endpoints for client profiles plus aggregation
 * endpoints for client-related data. Clients can access their own data
 * via the same endpoints (authorization checked in service layer).
 *
 * @module ClientsController
 *
 * @example
 * ```typescript
 * // Staff: list clients with filters
 * GET /api/clients?page=1&limit=20&city=Karachi
 *
 * // Staff or client (own): get single client
 * GET /api/clients/:id
 *
 * // Staff: create new client
 * POST /api/clients
 * ```
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsAggregationService } from './clients-aggregation.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateClientSchema,
  UpdateClientSchema,
  ClientFiltersSchema,
  PaginationSchema,
} from '@repo/shared';
import type {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  ClientResponse,
  PaginatedClientsResponse,
  PaginationParams,
} from '@repo/shared';

/**
 * Controller for client management endpoints
 *
 * Route Prefix: /api/clients
 */
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly clientsAggregationService: ClientsAggregationService,
  ) {}

  /**
   * Get paginated client list (staff/admin only)
   *
   * @example
   * ```
   * GET /api/clients?page=1&limit=20&companyType=llc&city=Karachi
   * ```
   */
  @Get()
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY)
  async getClients(
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
    @Query(new ZodValidationPipe(ClientFiltersSchema))
    filters: ClientFilters,
  ): Promise<PaginatedClientsResponse> {
    return this.clientsService.getClients(pagination, filters);
  }

  /**
   * Create a new client (staff/admin only)
   *
   * @example
   * ```
   * POST /api/clients
   * Body: { email: "new@example.com", fullName: "New Client" }
   * ```
   */
  @Post()
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.CREATED)
  async createClient(
    @Body(new ZodValidationPipe(CreateClientSchema))
    dto: CreateClientData,
  ): Promise<ClientResponse> {
    return this.clientsService.createClient(dto);
  }

  /**
   * Get single client profile (staff or client's own)
   *
   * @example
   * ```
   * GET /api/clients/:id
   * ```
   */
  @Get(':id')
  async getClient(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ClientResponse> {
    return this.clientsService.getClientById(id, user);
  }

  /**
   * Update client profile (staff/admin only)
   *
   * @example
   * ```
   * PATCH /api/clients/:id
   * Body: { companyName: "Updated Corp" }
   * ```
   */
  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.OK)
  async updateClient(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateClientSchema))
    dto: UpdateClientData,
    @CurrentUser() user: AuthUser,
  ): Promise<ClientResponse> {
    return this.clientsService.updateClient(id, dto, user);
  }

  /**
   * Delete client and associated user (admin only)
   *
   * @example
   * ```
   * DELETE /api/clients/:id
   * ```
   */
  @Delete(':id')
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteClient(@Param('id') id: string): Promise<{ message: string }> {
    return this.clientsService.deleteClient(id);
  }

  /**
   * Get cases for a client (staff or client's own)
   *
   * @example
   * ```
   * GET /api/clients/:id/cases?page=1&limit=20
   * ```
   */
  @Get(':id/cases')
  async getClientCases(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<{ data: unknown[]; meta: object }> {
    return this.clientsAggregationService.getClientCases(id, user, pagination);
  }

  /**
   * Get documents for a client (staff or client's own)
   *
   * @example
   * ```
   * GET /api/clients/:id/documents?page=1&limit=20
   * ```
   */
  @Get(':id/documents')
  async getClientDocuments(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<{ data: unknown[]; meta: object }> {
    return this.clientsAggregationService.getClientDocuments(
      id,
      user,
      pagination,
    );
  }

  /**
   * Get invoices for a client (staff or client's own)
   *
   * @example
   * ```
   * GET /api/clients/:id/invoices?page=1&limit=20
   * ```
   */
  @Get(':id/invoices')
  async getClientInvoices(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<{ data: unknown[]; meta: object }> {
    return this.clientsAggregationService.getClientInvoices(
      id,
      user,
      pagination,
    );
  }
}
