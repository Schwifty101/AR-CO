/**
 * Users Service
 *
 * Handles user profile management operations including profile retrieval,
 * updates for base user profiles, client profiles, and attorney profiles.
 * Provides paginated user listing and user deletion capabilities.
 *
 * @module UsersService
 *
 * @example
 * ```typescript
 * // Fetch complete user profile with role-specific data
 * const profile = await usersService.getUserProfile('user-uuid-123');
 *
 * // Update base profile information
 * const updated = await usersService.updateUserProfile('user-uuid-123', {
 *   fullName: 'Jane Smith',
 *   phoneNumber: '+92-321-1234567'
 * });
 *
 * // Get paginated user list (admin only)
 * const users = await usersService.getAllUsers({
 *   page: 2,
 *   limit: 50,
 *   sort: 'full_name',
 *   order: 'asc'
 * });
 * ```
 */

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import type {
  InviteUserData,
  UpdateUserProfileData,
  UpdateClientProfileData,
  UpdateAttorneyProfileData,
  PaginationParams,
  UserProfile,
  PaginatedUsersResponse,
} from '@repo/shared';

/**
 * Users service for profile management
 *
 * Manages CRUD operations for user profiles, client profiles, and attorney profiles.
 * Uses Supabase admin client for cross-user queries and RLS bypass where necessary.
 *
 * @class UsersService
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get complete user profile with role-specific data
   *
   * Fetches the base user_profiles record and joins with
   * client_profiles or attorney_profiles based on user_type.
   *
   * @param {string} userId - User's UUID
   * @returns {Promise<UserProfile>} Complete user profile
   * @throws {NotFoundException} If user profile does not exist
   * @throws {InternalServerErrorException} If database query fails
   *
   * @example
   * ```typescript
   * // Fetch client profile (includes client_profiles data)
   * const clientProfile = await usersService.getUserProfile('client-uuid');
   * console.log(clientProfile.clientProfile?.companyName);
   *
   * // Fetch attorney profile (includes attorney_profiles data)
   * const attorneyProfile = await usersService.getUserProfile('attorney-uuid');
   * console.log(attorneyProfile.attorneyProfile?.barNumber);
   * ```
   */
  async getUserProfile(userId: string, email?: string): Promise<UserProfile> {
    const adminClient = this.supabaseService.getAdminClient();

    // Fetch base user profile
    const { data: userProfile, error: userError } = await adminClient
      .from('user_profiles')
      .select('id, full_name, phone_number, user_type, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      this.logger.warn(`User profile not found: ${userId}`);
      throw new NotFoundException(`User profile with ID ${userId} not found`);
    }

    // If email not provided, fetch it from auth.users
    let userEmail = email;
    if (!userEmail) {
      const { data: authUser, error: authError } =
        await adminClient.auth.admin.getUserById(userId);
      if (authError || !authUser?.user?.email) {
        this.logger.warn(`Could not fetch email for user: ${userId}`);
        userEmail = '';
      } else {
        userEmail = authUser.user.email;
      }
    }

    const response: UserProfile = {
      id: userProfile.id,
      email: userEmail,
      fullName: userProfile.full_name,
      phoneNumber: userProfile.phone_number,
      userType: userProfile.user_type,
      createdAt: userProfile.created_at,
      updatedAt: userProfile.updated_at,
    };

    // Fetch client profile if user is a client
    if (userProfile.user_type === 'client') {
      const { data: clientProfile, error: clientError } = await adminClient
        .from('client_profiles')
        .select(
          'id, company_name, company_type, tax_id, address, city, country',
        )
        .eq('user_profile_id', userId)
        .single();

      if (!clientError && clientProfile) {
        response.clientProfile = {
          id: clientProfile.id,
          companyName: clientProfile.company_name,
          companyType: clientProfile.company_type,
          taxId: clientProfile.tax_id,
          address: clientProfile.address,
          city: clientProfile.city,
          country: clientProfile.country,
        };
      }
    }

    // Fetch attorney profile if user is an attorney
    if (userProfile.user_type === 'attorney') {
      const { data: attorneyProfile, error: attorneyError } = await adminClient
        .from('attorney_profiles')
        .select(
          'id, bar_number, specializations, education, experience_years, hourly_rate',
        )
        .eq('user_profile_id', userId)
        .single();

      if (!attorneyError && attorneyProfile) {
        response.attorneyProfile = {
          id: attorneyProfile.id,
          barNumber: attorneyProfile.bar_number,
          specializations: attorneyProfile.specializations,
          education: attorneyProfile.education,
          experienceYears: attorneyProfile.experience_years,
          hourlyRate: attorneyProfile.hourly_rate,
        };
      }
    }

    return response;
  }

  /**
   * Update base user profile information
   *
   * Updates the user_profiles table with new full_name and/or phone_number.
   * Automatically handles camelCase to snake_case field mapping.
   *
   * @param {string} userId - User's UUID
   * @param {UpdateUserProfileData} dto - Profile update data
   * @returns {Promise<UserProfile>} Updated user profile
   * @throws {NotFoundException} If user profile does not exist
   * @throws {InternalServerErrorException} If update fails
   *
   * @example
   * ```typescript
   * // Update only full name
   * const updated = await usersService.updateUserProfile('user-uuid', {
   *   fullName: 'Dr. Ahmed Khan'
   * });
   *
   * // Update both fields
   * const updated2 = await usersService.updateUserProfile('user-uuid', {
   *   fullName: 'Sarah Ali',
   *   phoneNumber: '+92-300-9876543'
   * });
   * ```
   */
  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileData,
  ): Promise<UserProfile> {
    const adminClient = this.supabaseService.getAdminClient();

    // Build update object with snake_case fields, filtering out undefined
    const updateData: Record<string, unknown> = {};
    if (dto.fullName !== undefined) {
      updateData.full_name = dto.fullName;
    }
    if (dto.phoneNumber !== undefined) {
      updateData.phone_number = dto.phoneNumber;
    }

    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      return this.getUserProfile(userId);
    }

    const { error: updateError } = await adminClient
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      this.logger.error(
        `Failed to update user profile for ${userId}: ${updateError.message}`,
      );

      if (updateError.code === 'PGRST116') {
        throw new NotFoundException(`User profile with ID ${userId} not found`);
      }

      throw new InternalServerErrorException(
        'Unable to update user profile. Please try again.',
      );
    }

    return this.getUserProfile(userId);
  }

  /**
   * Update client profile information
   *
   * Updates the client_profiles table with company and business details.
   * Automatically maps camelCase DTO fields to snake_case database columns.
   *
   * @param {string} userId - User's UUID (user_profile_id in client_profiles)
   * @param {UpdateClientProfileData} dto - Client profile update data
   * @returns {Promise<UserProfile>} Updated user profile with client data
   * @throws {NotFoundException} If client profile does not exist
   * @throws {InternalServerErrorException} If update fails
   *
   * @example
   * ```typescript
   * // Update company information
   * const updated = await usersService.updateClientProfile('client-uuid', {
   *   companyName: 'ACME International Ltd.',
   *   companyType: 'Public Limited',
   *   taxId: 'NTN-7654321',
   *   city: 'Lahore'
   * });
   * ```
   */
  async updateClientProfile(
    userId: string,
    dto: UpdateClientProfileData,
  ): Promise<UserProfile> {
    const adminClient = this.supabaseService.getAdminClient();

    // Build update object with snake_case fields
    const updateData: Record<string, unknown> = {};
    if (dto.companyName !== undefined) {
      updateData.company_name = dto.companyName;
    }
    if (dto.companyType !== undefined) {
      updateData.company_type = dto.companyType;
    }
    if (dto.taxId !== undefined) {
      updateData.tax_id = dto.taxId;
    }
    if (dto.address !== undefined) {
      updateData.address = dto.address;
    }
    if (dto.city !== undefined) {
      updateData.city = dto.city;
    }
    if (dto.country !== undefined) {
      updateData.country = dto.country;
    }

    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      return this.getUserProfile(userId);
    }

    const { error: updateError } = await adminClient
      .from('client_profiles')
      .update(updateData)
      .eq('user_profile_id', userId);

    if (updateError) {
      this.logger.error(
        `Failed to update client profile for ${userId}: ${updateError.message}`,
      );

      if (updateError.code === 'PGRST116') {
        throw new NotFoundException(
          `Client profile for user ${userId} not found`,
        );
      }

      throw new InternalServerErrorException(
        'Unable to update client profile. Please try again.',
      );
    }

    return this.getUserProfile(userId);
  }

  /**
   * Update attorney profile information
   *
   * Updates the attorney_profiles table with professional credentials.
   * Automatically maps camelCase DTO fields to snake_case database columns.
   *
   * @param {string} userId - User's UUID (user_profile_id in attorney_profiles)
   * @param {UpdateAttorneyProfileData} dto - Attorney profile update data
   * @returns {Promise<UserProfile>} Updated user profile with attorney data
   * @throws {NotFoundException} If attorney profile does not exist
   * @throws {InternalServerErrorException} If update fails
   *
   * @example
   * ```typescript
   * // Update attorney credentials
   * const updated = await usersService.updateAttorneyProfile('attorney-uuid', {
   *   barNumber: 'BAR-98765',
   *   specializations: ['Corporate Law', 'Tax Law', 'IP Law'],
   *   experienceYears: 15,
   *   hourlyRate: 20000
   * });
   * ```
   */
  async updateAttorneyProfile(
    userId: string,
    dto: UpdateAttorneyProfileData,
  ): Promise<UserProfile> {
    const adminClient = this.supabaseService.getAdminClient();

    // Build update object with snake_case fields
    const updateData: Record<string, unknown> = {};
    if (dto.barNumber !== undefined) {
      updateData.bar_number = dto.barNumber;
    }
    if (dto.specializations !== undefined) {
      updateData.specializations = dto.specializations;
    }
    if (dto.education !== undefined) {
      updateData.education = dto.education;
    }
    if (dto.experienceYears !== undefined) {
      updateData.experience_years = dto.experienceYears;
    }
    if (dto.hourlyRate !== undefined) {
      updateData.hourly_rate = dto.hourlyRate;
    }

    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      return this.getUserProfile(userId);
    }

    const { error: updateError } = await adminClient
      .from('attorney_profiles')
      .update(updateData)
      .eq('user_profile_id', userId);

    if (updateError) {
      this.logger.error(
        `Failed to update attorney profile for ${userId}: ${updateError.message}`,
      );

      if (updateError.code === 'PGRST116') {
        throw new NotFoundException(
          `Attorney profile for user ${userId} not found`,
        );
      }

      throw new InternalServerErrorException(
        'Unable to update attorney profile. Please try again.',
      );
    }

    return this.getUserProfile(userId);
  }

  /**
   * Get paginated list of all users
   *
   * Retrieves user profiles with pagination, sorting, and total count.
   * Includes role-specific profile data for each user.
   * Optionally filter by user types.
   *
   * @param {PaginationParams} paginationDto - Pagination parameters
   * @param {string[]} [userTypes] - Optional array of user types to filter by (e.g., ['admin', 'staff', 'attorney'])
   * @returns {Promise<PaginatedUsersResponse>} Paginated user list with metadata
   * @throws {InternalServerErrorException} If query fails
   *
   * @example
   * ```typescript
   * // Default pagination (page 1, limit 20, sort by created_at desc)
   * const result = await usersService.getAllUsers({
   *   page: 1,
   *   limit: 20,
   *   sort: 'created_at',
   *   order: 'desc'
   * });
   *
   * // Filter by user types (staff and admin only)
   * const result2 = await usersService.getAllUsers({
   *   page: 1,
   *   limit: 20,
   *   sort: 'full_name',
   *   order: 'asc'
   * }, ['admin', 'staff', 'attorney']);
   *
   * console.log(result.meta.totalPages); // Total number of pages
   * console.log(result.data.length); // Number of users in current page
   * ```
   */
  async getAllUsers(
    paginationDto: PaginationParams,
    userTypes?: string[],
  ): Promise<PaginatedUsersResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const offset = (paginationDto.page - 1) * paginationDto.limit;

    // Get total count with optional userTypes filter
    let countQuery = adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (userTypes && userTypes.length > 0) {
      countQuery = countQuery.in('user_type', userTypes);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      this.logger.error(`Failed to count users: ${countError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve user count. Please try again.',
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / paginationDto.limit);

    // Get paginated users with optional userTypes filter
    let dataQuery = adminClient
      .from('user_profiles')
      .select('id, full_name, phone_number, user_type, created_at, updated_at');

    if (userTypes && userTypes.length > 0) {
      dataQuery = dataQuery.in('user_type', userTypes);
    }

    const { data: users, error: usersError } = await dataQuery
      .order(paginationDto.sort, { ascending: paginationDto.order === 'asc' })
      .range(offset, offset + paginationDto.limit - 1);

    if (usersError) {
      this.logger.error(`Failed to fetch users: ${usersError.message}`);
      throw new InternalServerErrorException(
        'Unable to retrieve users. Please try again.',
      );
    }

    // Fetch role-specific profiles for each user
    const userProfiles: UserProfile[] = await Promise.all(
      (users || []).map((user) => this.getUserProfile(user.id)),
    );

    return {
      data: userProfiles,
      meta: {
        page: paginationDto.page,
        limit: paginationDto.limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Invite a new user (admin/staff/attorney) via Supabase email invitation
   *
   * Creates a Supabase auth user via email invite and user_profile in sequence.
   * The invited user receives a magic link email to set their password.
   * Only non-client user types are allowed (admin, staff, attorney).
   *
   * @param {InviteUserData} dto - Invitation data including email, name, and user type
   * @returns {Promise<{ id: string; email: string; fullName: string; userType: string }>} Created user info
   * @throws {InternalServerErrorException} If invitation or profile creation fails
   *
   * @example
   * ```typescript
   * // Invite a new staff member
   * const result = await usersService.inviteUser({
   *   email: 'staff@arcolaw.com',
   *   fullName: 'Jane Smith',
   *   userType: 'staff',
   *   phoneNumber: '+92-300-1234567'
   * });
   * console.log(result.id); // New user's UUID
   * ```
   *
   * @remarks
   * This method does NOT create client users. Use the Clients module
   * createClient() method for client registration. If profile creation fails,
   * the auth user is automatically cleaned up to prevent orphaned accounts.
   */
  async inviteUser(
    dto: InviteUserData,
  ): Promise<{ id: string; email: string; fullName: string; userType: string }> {
    const adminClient = this.supabaseService.getAdminClient();

    // 1. Invite user via Supabase (sends magic link email)
    const { data: authData, error: authError } =
      await adminClient.auth.admin.inviteUserByEmail(dto.email);

    if (authError || !authData?.user) {
      this.logger.error(`Failed to invite user ${dto.email}`, authError);
      throw new InternalServerErrorException(
        'Unable to invite user. The email may already be registered.',
      );
    }

    const userId = authData.user.id;

    // 2. Create user_profile
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .insert({
        id: userId,
        full_name: dto.fullName,
        phone_number: dto.phoneNumber ?? null,
        user_type: dto.userType,
      });

    if (profileError) {
      this.logger.error(
        `Failed to create profile for ${dto.email}`,
        profileError,
      );
      // Cleanup: delete auth user
      await adminClient.auth.admin.deleteUser(userId);
      throw new InternalServerErrorException(
        'Unable to create user profile. Please try again.',
      );
    }

    return {
      id: userId,
      email: dto.email,
      fullName: dto.fullName,
      userType: dto.userType,
    };
  }

  /**
   * Delete a user and all associated data
   *
   * Removes the user from Supabase auth.users first, then deletes the
   * user_profiles record (cascading deletes handle linked profiles).
   * Auth-first order prevents orphaned auth users on partial failure.
   *
   * @param {string} userId - Target user's UUID
   * @param {string} requestingUserId - ID of the admin making the request
   * @returns {Promise<{ message: string }>} Success confirmation
   * @throws {BadRequestException} If admin attempts self-deletion or target is last admin
   * @throws {NotFoundException} If user does not exist
   * @throws {InternalServerErrorException} If deletion fails
   *
   * @example
   * ```typescript
   * // Delete user account (admin only)
   * const result = await usersService.deleteUser('target-uuid', 'admin-uuid');
   * console.log(result.message); // "User deleted successfully"
   * ```
   *
   * @remarks
   * This operation is irreversible. All user data including cases,
   * appointments, and activity logs will be deleted via cascading foreign keys.
   * Admins cannot delete their own account or the last remaining admin.
   */
  async deleteUser(
    userId: string,
    requestingUserId: string,
  ): Promise<{ message: string }> {
    const adminClient = this.supabaseService.getAdminClient();

    // Self-deletion prevention
    if (userId === requestingUserId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    // Verify target user exists and get their type
    const { data: existingUser, error: fetchError } = await adminClient
      .from('user_profiles')
      .select('id, user_type')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      this.logger.warn(`User not found for deletion: ${userId}`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Last-admin protection
    if (existingUser.user_type === 'admin') {
      const { count, error: countError } = await adminClient
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'admin');

      if (countError) {
        this.logger.error(`Failed to count admin users: ${countError.message}`);
        throw new InternalServerErrorException(
          'Unable to verify admin count. Please try again.',
        );
      }

      if ((count ?? 0) <= 1) {
        throw new BadRequestException('Cannot delete the last admin user');
      }
    }

    // Delete auth user FIRST to prevent orphaned auth records
    const { error: authDeleteError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      this.logger.error(
        `Failed to delete auth user for ${userId}: ${authDeleteError.message}`,
      );
      throw new InternalServerErrorException(
        'Unable to delete user authentication record. Please try again.',
      );
    }

    // Delete from user_profiles (cascading deletes handle linked tables)
    const { error: deleteError } = await adminClient
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      this.logger.error(
        `Failed to delete user profile for ${userId}: ${deleteError.message}`,
      );
      // Auth user is deleted but profile remains — log critical error
      this.logger.error(
        `CRITICAL: Auth user deleted but profile deletion failed for ${userId}. Manual cleanup required.`,
      );
      throw new InternalServerErrorException(
        'Unable to delete user profile. Please try again.',
      );
    }

    this.logger.log(`User deleted successfully: ${userId}`);
    return { message: 'User deleted successfully' };
  }
}
