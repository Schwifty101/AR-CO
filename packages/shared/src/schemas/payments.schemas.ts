/**
 * Payments / Invoices Zod schemas
 *
 * Shared validation schemas used by both the NestJS backend and Next.js frontend
 * for invoice creation, updates, filtering, and response shapes.
 *
 * @module PaymentsSchemas
 *
 * @example
 * ```typescript
 * import { CreateInvoiceSchema } from '@repo/shared';
 *
 * const dto = CreateInvoiceSchema.parse(req.body);
 * ```
 */

import { z } from 'zod';
import { InvoiceStatus } from '../enums';
import { PaginationSchema } from './common.schemas';

/**
 * Schema for a single invoice line-item row (response shape).
 *
 * @example
 * ```typescript
 * const item = InvoiceItemSchema.parse(row);
 * ```
 */
export const InvoiceItemSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  description: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  amount: z.number(),
  createdAt: z.string(),
});

/**
 * Full invoice response schema including optional nested items array.
 *
 * @example
 * ```typescript
 * const invoice = InvoiceResponseSchema.parse(apiResponse);
 * ```
 */
export const InvoiceResponseSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().nullable(),
  clientProfileId: z.string().uuid().nullable(),
  email: z.string().email().nullable(),
  caseId: z.string().uuid().nullable(),
  issueDate: z.string(),
  dueDate: z.string(),
  subtotal: z.number(),
  taxAmount: z.number(),
  discountAmount: z.number(),
  totalAmount: z.number(),
  status: z.nativeEnum(InvoiceStatus),
  paymentTerms: z.string().nullable(),
  notes: z.string().nullable(),
  items: z.array(InvoiceItemSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Schema for creating a new invoice.
 * Items array must contain at least one entry.
 *
 * @example
 * ```typescript
 * const dto = CreateInvoiceSchema.parse({
 *   clientProfileId: 'uuid',
 *   dueDate: '2026-04-01',
 *   items: [{ description: 'Legal consultation', quantity: 1, unitPrice: 50000 }],
 * });
 * ```
 */
export const CreateInvoiceSchema = z
  .object({
    clientProfileId: z.string().uuid().optional(),
    email: z.string().email().optional(),
    caseId: z.string().uuid().optional(),
    dueDate: z.string(),
    taxAmount: z.number().min(0).optional().default(0),
    discountAmount: z.number().min(0).optional().default(0),
    paymentTerms: z.string().optional(),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          description: z.string().min(1),
          quantity: z.number().int().positive(),
          unitPrice: z.number().positive(),
        }),
      )
      .min(1),
  })
  .refine((d) => d.clientProfileId || d.email, {
    message: 'Either clientProfileId or email must be provided',
  });

/**
 * Schema for partially updating an existing invoice.
 * All fields are optional; only provided fields are updated.
 *
 * @example
 * ```typescript
 * const dto = UpdateInvoiceSchema.parse({ status: InvoiceStatus.SENT });
 * ```
 */
export const UpdateInvoiceSchema = z.object({
  dueDate: z.string().optional(),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

/**
 * Schema for adding a single line item to an existing invoice.
 *
 * @example
 * ```typescript
 * const dto = AddInvoiceItemSchema.parse({
 *   description: 'Document review',
 *   quantity: 2,
 *   unitPrice: 15000,
 * });
 * ```
 */
export const AddInvoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

/**
 * Schema for filtering the invoices list.
 * Extends PaginationSchema with optional status and client filters.
 *
 * @example
 * ```typescript
 * const filters = InvoiceFiltersSchema.parse({
 *   page: '1', limit: '20', status: 'sent',
 * });
 * ```
 */
export const InvoiceFiltersSchema = PaginationSchema.extend({
  status: z.nativeEnum(InvoiceStatus).optional(),
  clientProfileId: z.string().uuid().optional(),
});

/**
 * Paginated invoices response schema.
 *
 * @example
 * ```typescript
 * const result = PaginatedInvoicesResponseSchema.parse(apiResponse);
 * ```
 */
export const PaginatedInvoicesResponseSchema = z.object({
  data: z.array(InvoiceResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
