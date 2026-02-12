/**
 * Clients API Client
 *
 * Client-side functions for client management operations.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module ClientsAPI
 *
 * @example
 * ```typescript
 * import { getClients, getClientById, createClient } from '@/lib/api/clients';
 *
 * // Fetch clients list (staff only)
 * const clients = await getClients({ page: 1, limit: 20, companyType: 'pvt_ltd' });
 *
 * // Get single client
 * const client = await getClientById('client-uuid');
 *
 * // Create new client (staff only)
 * const newClient = await createClient({
 *   email: 'client@example.com',
 *   fullName: 'John Doe',
 *   companyName: 'ABC Corp',
 * });
 * ```
 */

import { createBrowserClient } from '@/lib/supabase/client';
import type {
  ClientResponse,
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  PaginatedClientsResponse,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type { ClientResponse, CreateClientData, UpdateClientData, ClientFilters } from '@repo/shared';
export { CompanyType } from '@repo/shared';

/** Pagination parameters for the frontend (only page + limit) */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Paginated clients response shaped for frontend consumption */
export interface PaginatedClients {
  clients: ClientResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Gets the current user's session token from Supabase
 *
 * @returns JWT access token
 * @throws Error if no session exists
 */
async function getSessionToken(): Promise<string> {
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session. Please sign in again.');
  }

  return session.access_token;
}

/**
 * Fetch paginated list of clients with optional filters (staff only)
 *
 * @param params - Pagination and filter parameters (page, limit, companyType, city, search)
 * @returns Paginated clients response
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const clients = await getClients({ page: 1, limit: 20, city: 'Karachi' });
 * ```
 */
export async function getClients(
  params?: PaginationParams & ClientFilters,
): Promise<PaginatedClients> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.companyType) queryParams.set('companyType', params.companyType);
  if (params?.city) queryParams.set('city', params.city);
  if (params?.search) queryParams.set('search', params.search);

  const url = `/api/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch clients');
  }

  const backendResponse = (await response.json()) as PaginatedClientsResponse;

  return {
    clients: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Fetch a single client by ID
 *
 * Staff can view any client. Clients can only view their own profile.
 *
 * @param id - UUID of the client
 * @returns Client profile data
 * @throws Error if request fails or client not found
 *
 * @example
 * ```typescript
 * const client = await getClientById('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getClientById(id: string): Promise<ClientResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/clients/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch client');
  }

  return (await response.json()) as ClientResponse;
}

/**
 * Create a new client (staff only)
 *
 * This endpoint creates a new user account and associated client profile.
 *
 * @param data - Client creation data (email, fullName, phoneNumber, companyName, etc.)
 * @returns Created client profile
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const newClient = await createClient({
 *   email: 'client@example.com',
 *   fullName: 'Jane Smith',
 *   phoneNumber: '+923001234567',
 *   companyName: 'Tech Solutions Ltd',
 *   companyType: 'pvt_ltd',
 *   city: 'Lahore',
 * });
 * ```
 */
export async function createClient(data: CreateClientData): Promise<ClientResponse> {
  const token = await getSessionToken();

  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to create client');
  }

  return (await response.json()) as ClientResponse;
}

/**
 * Update a client profile (staff only)
 *
 * @param id - UUID of the client to update
 * @param data - Fields to update (companyName, companyType, taxId, address, city, country)
 * @returns Updated client profile
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const updated = await updateClient('550e8400-e29b-41d4-a716-446655440000', {
 *   address: '123 Main St',
 *   city: 'Islamabad',
 * });
 * ```
 */
export async function updateClient(
  id: string,
  data: UpdateClientData,
): Promise<ClientResponse> {
  const token = await getSessionToken();

  const response = await fetch(`/api/clients/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update client');
  }

  return (await response.json()) as ClientResponse;
}

/**
 * Delete a client by ID (admin only)
 *
 * Permanently removes the client profile and associated user account.
 *
 * @param id - UUID of the client to delete
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * await deleteClient('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function deleteClient(id: string): Promise<void> {
  const token = await getSessionToken();

  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to delete client');
  }
}

/**
 * Fetch all cases for a specific client
 *
 * Staff can view any client's cases. Clients can only view their own.
 *
 * @param clientId - UUID of the client
 * @returns Array of case records
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const cases = await getClientCases('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getClientCases(clientId: string): Promise<unknown[]> {
  const token = await getSessionToken();

  const response = await fetch(`/api/clients/${clientId}/cases`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch client cases');
  }

  return (await response.json()) as unknown[];
}

/**
 * Fetch all documents for a specific client
 *
 * Staff can view any client's documents. Clients can only view their own.
 *
 * @param clientId - UUID of the client
 * @returns Array of document records
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const documents = await getClientDocuments('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getClientDocuments(clientId: string): Promise<unknown[]> {
  const token = await getSessionToken();

  const response = await fetch(`/api/clients/${clientId}/documents`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch client documents');
  }

  return (await response.json()) as unknown[];
}

/**
 * Fetch all invoices for a specific client
 *
 * Staff can view any client's invoices. Clients can only view their own.
 *
 * @param clientId - UUID of the client
 * @returns Array of invoice records
 * @throws Error if request fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const invoices = await getClientInvoices('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getClientInvoices(clientId: string): Promise<unknown[]> {
  const token = await getSessionToken();

  const response = await fetch(`/api/clients/${clientId}/invoices`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch client invoices');
  }

  return (await response.json()) as unknown[];
}
