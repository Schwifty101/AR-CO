/**
 * Invoices Controller
 *
 * Exposes REST endpoints for invoice management:
 * - Listing invoices (client: own, staff: all)
 * - Creating invoices (staff only)
 * - Viewing invoice detail
 * - Updating invoices (staff only)
 * - Adding line items (staff only)
 * - Sending invoice emails (staff only)
 *
 * @module PaymentsModule
 *
 * @example
 * ```http
 * GET  /api/invoices
 * POST /api/invoices
 * GET  /api/invoices/:id
 * PATCH /api/invoices/:id
 * POST /api/invoices/:id/items
 * POST /api/invoices/:id/send
 * ```
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  UserType,
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  AddInvoiceItemSchema,
  InvoiceFiltersSchema,
  type CreateInvoiceData,
  type UpdateInvoiceData,
  type AddInvoiceItemData,
  type InvoiceFilters,
  type InvoiceResponse,
  type InvoiceItem,
  type PaginatedInvoicesResponse,
} from '@repo/shared';

/**
 * REST controller for invoice CRUD and email delivery.
 *
 * All routes require JWT authentication (applied globally via JwtAuthGuard).
 * Staff-only routes are protected with @Roles().
 */
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * Lists invoices with optional filters.
   * Clients see only their own; staff see all.
   *
   * @example GET /api/invoices?page=1&limit=20&status=sent
   */
  @Get()
  async getInvoices(
    @Query(new ZodValidationPipe(InvoiceFiltersSchema)) filters: InvoiceFilters,
    @CurrentUser() user: AuthUser,
  ): Promise<PaginatedInvoicesResponse> {
    return this.invoicesService.getInvoices(filters, user);
  }

  /**
   * Creates a new invoice (staff only).
   *
   * @example POST /api/invoices
   */
  @Post()
  @Roles(UserType.STAFF, UserType.ATTORNEY, UserType.ADMIN)
  async createInvoice(
    @Body(new ZodValidationPipe(CreateInvoiceSchema)) dto: CreateInvoiceData,
  ): Promise<InvoiceResponse> {
    return this.invoicesService.createInvoice(dto);
  }

  /**
   * Returns a single invoice with its line items.
   *
   * @example GET /api/invoices/:id
   */
  @Get(':id')
  async getInvoiceById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<InvoiceResponse> {
    return this.invoicesService.getInvoiceById(id, user);
  }

  /**
   * Partially updates an invoice (staff only).
   *
   * @example PATCH /api/invoices/:id
   */
  @Patch(':id')
  @Roles(UserType.STAFF, UserType.ATTORNEY, UserType.ADMIN)
  async updateInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateInvoiceSchema)) dto: UpdateInvoiceData,
  ): Promise<InvoiceResponse> {
    return this.invoicesService.updateInvoice(id, dto);
  }

  /**
   * Adds a line item to an invoice (staff only).
   *
   * @example POST /api/invoices/:id/items
   */
  @Post(':id/items')
  @Roles(UserType.STAFF, UserType.ATTORNEY, UserType.ADMIN)
  async addInvoiceItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(AddInvoiceItemSchema)) dto: AddInvoiceItemData,
  ): Promise<InvoiceItem> {
    return this.invoicesService.addInvoiceItem(id, dto);
  }

  /**
   * Sends the invoice to the client by email and marks it as 'sent' (staff only).
   *
   * @example POST /api/invoices/:id/send
   */
  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @Roles(UserType.STAFF, UserType.ATTORNEY, UserType.ADMIN)
  async sendInvoice(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvoiceResponse> {
    return this.invoicesService.sendInvoice(id);
  }
}
