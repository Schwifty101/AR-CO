/**
 * Payments / Invoices TypeScript types
 *
 * Inferred from Zod schemas in payments.schemas.ts.
 * Import these types in both the NestJS backend and Next.js frontend.
 *
 * @module PaymentsTypes
 *
 * @example
 * ```typescript
 * import type { CreateInvoiceData, InvoiceResponse } from '@repo/shared';
 * ```
 */

import { z } from 'zod';
import {
  InvoiceItemSchema,
  InvoiceResponseSchema,
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  AddInvoiceItemSchema,
  InvoiceFiltersSchema,
  PaginatedInvoicesResponseSchema,
} from '../schemas/payments.schemas';

/** A single invoice line item */
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

/** Full invoice response with optional items */
export type InvoiceResponse = z.infer<typeof InvoiceResponseSchema>;

/** Data required to create a new invoice */
export type CreateInvoiceData = z.infer<typeof CreateInvoiceSchema>;

/** Data for partially updating an invoice */
export type UpdateInvoiceData = z.infer<typeof UpdateInvoiceSchema>;

/** Data for adding a line item to an invoice */
export type AddInvoiceItemData = z.infer<typeof AddInvoiceItemSchema>;

/** Filter parameters for the invoices list endpoint */
export type InvoiceFilters = z.infer<typeof InvoiceFiltersSchema>;

/** Paginated invoices response */
export type PaginatedInvoicesResponse = z.infer<
  typeof PaginatedInvoicesResponseSchema
>;
