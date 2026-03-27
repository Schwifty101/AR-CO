/**
 * Payments API Client
 *
 * Client-side functions for payment history and invoice management.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module PaymentsAPI
 *
 * @example
 * ```typescript
 * import { getPaymentHistory, getInvoices, getInvoiceById } from '@/lib/api/payments';
 *
 * // Fetch payment history
 * const history = await getPaymentHistory({ page: 1, limit: 20 });
 * history.data.forEach(entry => console.log(entry.description, entry.amount));
 *
 * // Fetch invoices
 * const invoices = await getInvoices({ status: 'paid' });
 * ```
 */

import { getSessionToken } from './auth-helpers';
import type { InvoiceResponse, PaginatedInvoicesResponse } from '@repo/shared';

// Re-export for consumers of this module
export type { InvoiceResponse, PaginatedInvoicesResponse } from '@repo/shared';

/**
 * A single entry in the payment history list.
 * Covers consultations, service registrations, and subscriptions.
 */
export interface PaymentHistoryEntry {
  /** Payment type category */
  type: 'consultation' | 'service' | 'subscription';
  /** Unique reference number for the payment */
  referenceNumber: string;
  /** Human-readable description of the payment */
  description: string;
  /** Amount in the smallest currency unit (paisa for PKR) */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Payment status (e.g. 'paid', 'pending', 'failed') */
  status: string;
  /** ISO timestamp when payment was completed, or null if pending */
  paidAt: string | null;
}

/**
 * Paginated payment history response shape
 */
export interface PaginatedPaymentHistory {
  data: PaymentHistoryEntry[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Fetch paginated payment history for the authenticated user.
 *
 * Returns a combined history of consultation, service registration,
 * and subscription payments sorted by date descending.
 *
 * @param params - Optional pagination parameters
 * @param params.page - Page number (1-indexed, default 1)
 * @param params.limit - Items per page (default 20)
 * @returns Paginated list of payment history entries
 * @throws Error if the user is not authenticated or the request fails
 *
 * @example
 * ```typescript
 * const history = await getPaymentHistory({ page: 1, limit: 20 });
 * console.log('Total payments:', history.total);
 * history.data.forEach(entry => {
 *   console.log(entry.description, entry.amount, entry.status);
 * });
 * ```
 *
 * Edge cases:
 * - Returns empty data array if user has no payment history
 * - Throws on network failure or 401 Unauthorized
 */
export async function getPaymentHistory(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedPaymentHistory> {
  const token = await getSessionToken();
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const response = await fetch(
    `/api/payments/history?${searchParams.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch payment history');
  }

  return (await response.json()) as PaginatedPaymentHistory;
}

/**
 * Fetch paginated invoices for the authenticated user.
 *
 * Returns invoices associated with the user's client profile.
 * Supports filtering by status and pagination.
 *
 * @param params - Optional filter and pagination parameters
 * @param params.page - Page number (1-indexed, default 1)
 * @param params.limit - Items per page (default 20)
 * @param params.status - Filter by invoice status (e.g. 'paid', 'sent', 'draft')
 * @returns Paginated list of invoice responses
 * @throws Error if the user is not authenticated or the request fails
 *
 * @example
 * ```typescript
 * const result = await getInvoices({ status: 'paid', page: 1 });
 * result.data.forEach(inv => console.log(inv.invoiceNumber, inv.totalAmount));
 * ```
 *
 * Edge cases:
 * - Returns empty data array if no invoices match filters
 * - Throws on 401 if session has expired
 */
export async function getInvoices(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedInvoicesResponse> {
  const token = await getSessionToken();
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);

  const response = await fetch(
    `/api/invoices?${searchParams.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch invoices');
  }

  return (await response.json()) as PaginatedInvoicesResponse;
}

/**
 * Fetch a single invoice by ID.
 *
 * Returns full invoice details including line items.
 *
 * @param id - UUID of the invoice to fetch
 * @returns Full invoice response with optional items array
 * @throws Error if the invoice is not found or the user lacks permission
 *
 * @example
 * ```typescript
 * const invoice = await getInvoiceById('550e8400-e29b-41d4-a716-446655440000');
 * console.log('Total:', invoice.totalAmount);
 * invoice.items?.forEach(item => console.log(item.description, item.amount));
 * ```
 *
 * Edge cases:
 * - Throws with 404 message if invoice does not exist
 * - Throws with 403 message if user does not own the invoice
 */
export async function getInvoiceById(id: string): Promise<InvoiceResponse> {
  const token = await getSessionToken();
  const response = await fetch(`/api/invoices/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to fetch invoice');
  }

  return (await response.json()) as InvoiceResponse;
}

/**
 * Send an invoice to the client via email.
 *
 * Marks the invoice as SENT and dispatches it via SendGrid.
 * Requires STAFF, ATTORNEY, or ADMIN role.
 *
 * @param id - UUID of the invoice to send
 * @throws Error if the invoice cannot be sent or the user lacks permission
 *
 * @example
 * ```typescript
 * await sendInvoice('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function sendInvoice(id: string): Promise<InvoiceResponse> {
  const token = await getSessionToken();
  const response = await fetch(`/api/invoices/${id}/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message || 'Failed to send invoice');
  }

  return (await response.json()) as InvoiceResponse;
}
