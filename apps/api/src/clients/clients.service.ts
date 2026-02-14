/**
 * Clients Service - CRUD operations for client profiles
 * Supports "own data" access pattern where clients can view their own records.
 *
 * @module ClientsService
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { STAFF_ROLES } from '../common/constants/roles';
import {
  validateSortColumn,
  sanitizePostgrestFilter,
} from '../common/utils/query-helpers';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import type {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  ClientResponse,
  PaginatedClientsResponse,
  PaginationParams,
} from '@repo/shared';
import type {
  DbResult,
  DbListResult,
  DbCountResult,
  DbMutationResult,
} from '../database/db-result.types';

/** Database row shape for client_profiles with joined user_profiles */
interface ClientProfileRow {
  id: string;
  user_profile_id: string;
  company_name: string | null;
  company_type: string | null;
  tax_id: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
  user_profiles: {
    id: string;
    full_name: string;
    phone_number: string | null;
  };
}

/** Supabase Auth admin.getUserById result shape */
interface AuthUserResult {
  data: { user: { email?: string; id: string } | null } | null;
  error: { message: string } | null;
}

/** Supabase Auth admin.createUser result shape */
interface AuthCreateResult {
  data: { user: { id: string } | null } | null;
  error: { message: string } | null;
}

/** Allowed sort columns for client profiles */
const ALLOWED_CLIENT_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'company_name',
] as const;

/** Clients service for client profile management */
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
  private assertClientAccess(clientProfileId: string, user: AuthUser): void {
    if (STAFF_ROLES.includes(user.userType)) return;
    if (user.clientProfileId === clientProfileId) return;
    throw new ForbiddenException('You can only access your own data');
  }

  /** Get paginated list of clients with optional filters */
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
      const sanitizedCity = sanitizePostgrestFilter(filters.city);
      countQuery = countQuery.ilike('city', `%${sanitizedCity}%`);
    }

    const { count, error: countError } = (await countQuery) as DbCountResult;

    if (countError) {
      this.logger.error(`Failed to count clients: ${countError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve client count. Please try again.',
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pagination.limit);

    // Build data query with join to user_profiles
    let dataQuery = adminClient.from('client_profiles').select(
      `id, user_profile_id, company_name, company_type, tax_id, address, city, country, created_at, updated_at,
        user_profiles!inner(id, full_name, phone_number)`,
    );

    if (filters.companyType) {
      dataQuery = dataQuery.eq('company_type', filters.companyType);
    }
    if (filters.city) {
      const sanitizedCity = sanitizePostgrestFilter(filters.city);
      dataQuery = dataQuery.ilike('city', `%${sanitizedCity}%`);
    }
    if (filters.search) {
      const sanitizedSearch = sanitizePostgrestFilter(filters.search);
      dataQuery = dataQuery.or(
        `company_name.ilike.%${sanitizedSearch}%,user_profiles.full_name.ilike.%${sanitizedSearch}%`,
      );
    }

    // Validate and handle sort column
    const validatedSort = validateSortColumn(
      pagination.sort,
      ALLOWED_CLIENT_SORT_COLUMNS,
    );
    const sortColumn =
      validatedSort === 'full_name' ? 'user_profiles.full_name' : validatedSort;

    const { data: clients, error: dataError } = (await dataQuery
      .order(sortColumn, { ascending: pagination.order === 'asc' })
      .range(
        offset,
        offset + pagination.limit - 1,
      )) as DbListResult<ClientProfileRow>;

    if (dataError) {
      this.logger.error(`Failed to fetch clients: ${dataError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve clients. Please try again.',
      );
    }

    // Fetch emails for each client
    // TODO: N+1 query pattern - Supabase Auth API lacks batch getUserByIds endpoint.
    // Current mitigation: Promise.all parallelizes requests, and pagination limits page size.
    // Future optimization: Denormalize email to user_profiles table and sync via trigger.
    const data: ClientResponse[] = await Promise.all(
      (clients || []).map(async (client) => {
        const userProfile = client.user_profiles;

        const authResult = (await adminClient.auth.admin.getUserById(
          userProfile.id,
        )) as AuthUserResult;
        const email = authResult.data?.user?.email ?? '';

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
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }

  /** Get a single client profile by client_profiles ID */
  async getClientById(
    clientId: string,
    user: AuthUser,
  ): Promise<ClientResponse> {
    this.assertClientAccess(clientId, user);

    const adminClient = this.supabaseService.getAdminClient();

    const { data: client, error } = (await adminClient
      .from('client_profiles')
      .select(
        `id, user_profile_id, company_name, company_type, tax_id, address, city, country, created_at, updated_at,
        user_profiles!inner(id, full_name, phone_number)`,
      )
      .eq('id', clientId)
      .single()) as DbResult<ClientProfileRow>;

    if (error || !client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    const userProfile = client.user_profiles;

    const authResult = (await adminClient.auth.admin.getUserById(
      userProfile.id,
    )) as AuthUserResult;
    const email = authResult.data?.user?.email ?? '';

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
   * Creates auth user via email invite, user_profile, and client_profile in sequence.
   */
  async createClient(dto: CreateClientData): Promise<ClientResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    // Invite user via email (sends magic link for password setup)
    const { data: authData, error: authError } =
      (await adminClient.auth.admin.inviteUserByEmail(
        dto.email,
      )) as AuthCreateResult;

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
    const { error: profileError } = (await adminClient
      .from('user_profiles')
      .insert({
        id: userId,
        full_name: dto.fullName,
        phone_number: dto.phoneNumber ?? null,
        user_type: 'client',
      })) as DbMutationResult;

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
    const { data: clientProfile, error: clientError } = (await adminClient
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
      .single()) as DbResult<{
      id: string;
      created_at: string;
      updated_at: string;
    }>;

    if (clientError || !clientProfile) {
      this.logger.error(
        `Failed to create client profile for ${userId}: ${clientError?.message}`,
      );
      // Cleanup: delete user_profile and auth user
      await adminClient.from('user_profiles').delete().eq('id', userId);
      await adminClient.auth.admin.deleteUser(userId);
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

  /** Update a client profile */
  async updateClient(
    clientId: string,
    dto: UpdateClientData,
    user: AuthUser,
  ): Promise<ClientResponse> {
    this.assertClientAccess(clientId, user);

    const updateData: Record<string, unknown> = {};
    if (dto.companyName !== undefined)
      updateData.company_name = dto.companyName;
    if (dto.companyType !== undefined)
      updateData.company_type = dto.companyType;
    if (dto.taxId !== undefined) updateData.tax_id = dto.taxId;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.country !== undefined) updateData.country = dto.country;

    if (Object.keys(updateData).length === 0) {
      return this.getClientById(clientId, user);
    }

    const adminClient = this.supabaseService.getAdminClient();

    const { error } = (await adminClient
      .from('client_profiles')
      .update(updateData)
      .eq('id', clientId)) as DbMutationResult;

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

  /** Delete a client and associated user account (cascading) */
  async deleteClient(clientId: string): Promise<{ message: string }> {
    const adminClient = this.supabaseService.getAdminClient();

    // Fetch user_profile_id from client_profiles
    const { data: client, error: fetchError } = (await adminClient
      .from('client_profiles')
      .select('user_profile_id')
      .eq('id', clientId)
      .single()) as DbResult<{ user_profile_id: string }>;

    if (fetchError || !client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Delete auth user (cascades to user_profiles -> client_profiles)
    const { error: authError } = (await adminClient.auth.admin.deleteUser(
      client.user_profile_id,
    )) as { error: { message: string } | null };

    if (authError) {
      this.logger.error(
        `Failed to delete auth user for client ${clientId}: ${authError.message}`,
      );
      throw new InternalServerErrorException(
        'Unable to delete client. Please try again.',
      );
    }

    // Delete user_profile (cascade handles client_profile)
    const { error: profileError } = (await adminClient
      .from('user_profiles')
      .delete()
      .eq('id', client.user_profile_id)) as DbMutationResult;

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
}
