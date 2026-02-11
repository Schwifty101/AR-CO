/**
 * Clients Service
 *
 * Handles staff-facing CRUD operations for client profiles and
 * aggregation endpoints for client-related data (cases, documents, invoices).
 * Supports "own data" access pattern where clients can view their own records.
 *
 * @module ClientsService
 *
 * @example
 * ```typescript
 * // Get paginated client list (staff only)
 * const clients = await clientsService.getClients(
 *   { page: 1, limit: 20, sort: 'created_at', order: 'desc' },
 *   { city: 'Karachi' },
 *   user,
 * );
 *
 * // Get single client (staff sees any, client sees own)
 * const client = await clientsService.getClientById('client-uuid', user);
 * ```
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import type {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  ClientResponse,
  PaginatedClientsResponse,
  PaginationParams,
} from '@repo/shared';

/** Staff-level roles that can view all clients */
const STAFF_ROLES: string[] = [
  UserType.ADMIN,
  UserType.STAFF,
  UserType.ATTORNEY,
];

/**
 * Clients service for client profile management
 *
 * Provides CRUD for client_profiles with user_profiles join,
 * plus aggregation queries for cases, documents, and invoices.
 *
 * @class ClientsService
 */
@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Assert that the requesting user has access to the given client
   *
   * Staff/admin/attorney can access any client. Clients can only
   * access their own profile (matched via clientProfileId).
   *
   * @throws {ForbiddenException} If client tries to access another client's data
   */
  private assertClientAccess(
    clientProfileId: string,
    user: AuthUser,
  ): void {
    if (STAFF_ROLES.includes(user.userType)) return;
    if (user.clientProfileId === clientProfileId) return;
    throw new ForbiddenException('You can only access your own data');
  }

  /**
   * Get paginated list of clients with optional filters
   *
   * @param {PaginationParams} pagination - Pagination parameters
   * @param {ClientFilters} filters - Optional filters (companyType, city, search)
   * @returns {Promise<PaginatedClientsResponse>} Paginated client list
   * @throws {InternalServerErrorException} If database query fails
   *
   * @example
   * ```typescript
   * const result = await clientsService.getClients(
   *   { page: 1, limit: 20, sort: 'created_at', order: 'desc' },
   *   { companyType: 'llc', city: 'Lahore' },
   * );
   * ```
   */
  async getClients(
    pagination: PaginationParams,
    filters: ClientFilters,
  ): Promise<PaginatedClientsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const offset = (pagination.page - 1) * pagination.limit;

    // Build count query
    let countQuery = adminClient
      .from('client_profiles')
      .select('*', { count: 'exact', head: true });

    if (filters.companyType) {
      countQuery = countQuery.eq('company_type', filters.companyType);
    }
    if (filters.city) {
      countQuery = countQuery.ilike('city', `%${filters.city}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      this.logger.error(`Failed to count clients: ${countError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve client count. Please try again.',
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pagination.limit);

    // Build data query with join to user_profiles
    let dataQuery = adminClient
      .from('client_profiles')
      .select(
        `id, user_profile_id, company_name, company_type, tax_id, address, city, country, created_at, updated_at,
        user_profiles!inner(id, full_name, phone_number)`,
      );

    if (filters.companyType) {
      dataQuery = dataQuery.eq('company_type', filters.companyType);
    }
    if (filters.city) {
      dataQuery = dataQuery.ilike('city', `%${filters.city}%`);
    }
    if (filters.search) {
      dataQuery = dataQuery.or(
        `company_name.ilike.%${filters.search}%,user_profiles.full_name.ilike.%${filters.search}%`,
      );
    }

    const sortColumn =
      pagination.sort === 'full_name'
        ? 'user_profiles.full_name'
        : pagination.sort;

    const { data: clients, error: dataError } = await dataQuery
      .order(sortColumn, { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1);

    if (dataError) {
      this.logger.error(`Failed to fetch clients: ${dataError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve clients. Please try again.',
      );
    }

    // Fetch emails for each client
    const data: ClientResponse[] = await Promise.all(
      (clients || []).map(async (client) => {
        const userProfile = client.user_profiles as unknown as {
          id: string;
          full_name: string;
          phone_number: string | null;
        };

        let email = '';
        const { data: authUser } =
          await adminClient.auth.admin.getUserById(userProfile.id);
        if (authUser?.user?.email) {
          email = authUser.user.email;
        }

        return {
          id: client.id,
          userProfileId: client.user_profile_id,
          fullName: userProfile.full_name,
          email,
          phoneNumber: userProfile.phone_number,
          companyName: client.company_name,
          companyType: client.company_type,
          taxId: client.tax_id,
          address: client.address,
          city: client.city,
          country: client.country,
          createdAt: client.created_at,
          updatedAt: client.updated_at,
        };
      }),
    );

    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages },
    };
  }

  /**
   * Get a single client profile by client_profiles ID
   *
   * @param {string} clientId - client_profiles UUID
   * @param {AuthUser} user - Requesting user (for access check)
   * @returns {Promise<ClientResponse>} Client profile
   * @throws {NotFoundException} If client not found
   * @throws {ForbiddenException} If client tries to access another client
   *
   * @example
   * ```typescript
   * const client = await clientsService.getClientById('client-uuid', user);
   * ```
   */
  async getClientById(
    clientId: string,
    user: AuthUser,
  ): Promise<ClientResponse> {
    this.assertClientAccess(clientId, user);

    const adminClient = this.supabaseService.getAdminClient();

    const { data: client, error } = await adminClient
      .from('client_profiles')
      .select(
        `id, user_profile_id, company_name, company_type, tax_id, address, city, country, created_at, updated_at,
        user_profiles!inner(id, full_name, phone_number)`,
      )
      .eq('id', clientId)
      .single();

    if (error || !client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    const userProfile = client.user_profiles as unknown as {
      id: string;
      full_name: string;
      phone_number: string | null;
    };

    let email = '';
    const { data: authUser } =
      await adminClient.auth.admin.getUserById(userProfile.id);
    if (authUser?.user?.email) {
      email = authUser.user.email;
    }

    return {
      id: client.id,
      userProfileId: client.user_profile_id,
      fullName: userProfile.full_name,
      email,
      phoneNumber: userProfile.phone_number,
      companyName: client.company_name,
      companyType: client.company_type,
      taxId: client.tax_id,
      address: client.address,
      city: client.city,
      country: client.country,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
    };
  }

  /**
   * Create a new client (staff-initiated)
   *
   * Creates a Supabase auth user, user_profile (type: client), and client_profile
   * in sequence. Uses a generated temporary password.
   *
   * @param {CreateClientData} dto - Client creation data
   * @returns {Promise<ClientResponse>} Newly created client profile
   * @throws {InternalServerErrorException} If creation fails
   *
   * @example
   * ```typescript
   * const client = await clientsService.createClient({
   *   email: 'new@example.com',
   *   fullName: 'New Client',
   *   companyName: 'ACME Ltd',
   * });
   * ```
   */
  async createClient(dto: CreateClientData): Promise<ClientResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    // Create auth user with temporary password
    const tempPassword = `Temp${Date.now()}!`;
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: dto.email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError || !authData?.user) {
      this.logger.error(
        `Failed to create auth user for ${dto.email}: ${authError?.message}`,
      );
      throw new InternalServerErrorException(
        'Unable to create user account. The email may already be registered.',
      );
    }

    const userId = authData.user.id;

    // Create user_profile
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .insert({
        id: userId,
        full_name: dto.fullName,
        phone_number: dto.phoneNumber ?? null,
        user_type: 'client',
      });

    if (profileError) {
      this.logger.error(
        `Failed to create user profile for ${userId}: ${profileError.message}`,
      );
      // Cleanup: delete auth user
      await adminClient.auth.admin.deleteUser(userId);
      throw new InternalServerErrorException(
        'Unable to create user profile. Please try again.',
      );
    }

    // Create client_profile
    const { data: clientProfile, error: clientError } = await adminClient
      .from('client_profiles')
      .insert({
        user_profile_id: userId,
        company_name: dto.companyName ?? null,
        company_type: dto.companyType ?? null,
        tax_id: dto.taxId ?? null,
        address: dto.address ?? null,
        city: dto.city ?? null,
        country: dto.country ?? null,
      })
      .select('id, created_at, updated_at')
      .single();

    if (clientError || !clientProfile) {
      this.logger.error(
        `Failed to create client profile for ${userId}: ${clientError?.message}`,
      );
      throw new InternalServerErrorException(
        'Unable to create client profile. Please try again.',
      );
    }

    return {
      id: clientProfile.id,
      userProfileId: userId,
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber ?? null,
      companyName: dto.companyName ?? null,
      companyType: dto.companyType ?? null,
      taxId: dto.taxId ?? null,
      address: dto.address ?? null,
      city: dto.city ?? null,
      country: dto.country ?? null,
      createdAt: clientProfile.created_at,
      updatedAt: clientProfile.updated_at,
    };
  }

  /**
   * Update a client profile
   *
   * @param {string} clientId - client_profiles UUID
   * @param {UpdateClientData} dto - Fields to update
   * @param {AuthUser} user - Requesting user
   * @returns {Promise<ClientResponse>} Updated client profile
   * @throws {NotFoundException} If client not found
   * @throws {InternalServerErrorException} If update fails
   */
  async updateClient(
    clientId: string,
    dto: UpdateClientData,
    user: AuthUser,
  ): Promise<ClientResponse> {
    const updateData: Record<string, unknown> = {};
    if (dto.companyName !== undefined) updateData.company_name = dto.companyName;
    if (dto.companyType !== undefined) updateData.company_type = dto.companyType;
    if (dto.taxId !== undefined) updateData.tax_id = dto.taxId;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.country !== undefined) updateData.country = dto.country;

    if (Object.keys(updateData).length === 0) {
      return this.getClientById(clientId, user);
    }

    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient
      .from('client_profiles')
      .update(updateData)
      .eq('id', clientId);

    if (error) {
      this.logger.error(
        `Failed to update client ${clientId}: ${error.message}`,
      );
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }
      throw new InternalServerErrorException(
        'Unable to update client profile. Please try again.',
      );
    }

    return this.getClientById(clientId, user);
  }

  /**
   * Delete a client and associated user account
   *
   * Deletes auth user first, then cascading deletes handle profiles.
   *
   * @param {string} clientId - client_profiles UUID
   * @returns {Promise<{ message: string }>} Success message
   * @throws {NotFoundException} If client not found
   * @throws {InternalServerErrorException} If deletion fails
   */
  async deleteClient(clientId: string): Promise<{ message: string }> {
    const adminClient = this.supabaseService.getAdminClient();

    // Fetch user_profile_id from client_profiles
    const { data: client, error: fetchError } = await adminClient
      .from('client_profiles')
      .select('user_profile_id')
      .eq('id', clientId)
      .single();

    if (fetchError || !client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Delete auth user (cascades to user_profiles -> client_profiles)
    const { error: authError } = await adminClient.auth.admin.deleteUser(
      client.user_profile_id,
    );

    if (authError) {
      this.logger.error(
        `Failed to delete auth user for client ${clientId}: ${authError.message}`,
      );
      throw new InternalServerErrorException(
        'Unable to delete client. Please try again.',
      );
    }

    // Delete user_profile (cascade handles client_profile)
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .delete()
      .eq('id', client.user_profile_id);

    if (profileError) {
      this.logger.error(
        `CRITICAL: Auth deleted but profile deletion failed for client ${clientId}`,
      );
      throw new InternalServerErrorException(
        'Unable to delete client profile. Manual cleanup may be required.',
      );
    }

    this.logger.log(`Client deleted: ${clientId}`);
    return { message: 'Client deleted successfully' };
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

    const { count, error: countError } = await adminClient
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('client_profile_id', clientId);

    if (countError) {
      this.logger.error(`Failed to count cases: ${countError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve cases count.',
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pagination.limit);

    const { data: cases, error } = await adminClient
      .from('cases')
      .select('*')
      .eq('client_profile_id', clientId)
      .order(pagination.sort, { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1);

    if (error) {
      this.logger.error(`Failed to fetch cases: ${error.message}`);
      throw new InternalServerErrorException('Unable to retrieve cases.');
    }

    return {
      data: cases || [],
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages },
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

    const { count, error: countError } = await adminClient
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('client_profile_id', clientId);

    if (countError) {
      this.logger.error(`Failed to count documents: ${countError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve documents count.',
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pagination.limit);

    const { data: documents, error } = await adminClient
      .from('documents')
      .select('*')
      .eq('client_profile_id', clientId)
      .order(pagination.sort, { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1);

    if (error) {
      this.logger.error(`Failed to fetch documents: ${error.message}`);
      throw new InternalServerErrorException('Unable to retrieve documents.');
    }

    return {
      data: documents || [],
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages },
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

    const { count, error: countError } = await adminClient
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('client_profile_id', clientId);

    if (countError) {
      this.logger.error(`Failed to count invoices: ${countError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve invoices count.',
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pagination.limit);

    const { data: invoices, error } = await adminClient
      .from('invoices')
      .select('*')
      .eq('client_profile_id', clientId)
      .order(pagination.sort, { ascending: pagination.order === 'asc' })
      .range(offset, offset + pagination.limit - 1);

    if (error) {
      this.logger.error(`Failed to fetch invoices: ${error.message}`);
      throw new InternalServerErrorException('Unable to retrieve invoices.');
    }

    return {
      data: invoices || [],
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages },
    };
  }
}
