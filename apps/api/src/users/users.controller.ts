/**
 * Users Controller
 *
 * Handles HTTP requests for user profile management, including:
 * - Retrieving and updating user profiles
 * - Managing client-specific profile data
 * - Managing attorney-specific profile data
 * - Admin operations for user management
 *
 * @remarks
 * This controller follows the thin controller pattern - all business logic
 * is delegated to UsersService. Authentication is enforced by default via
 * JwtAuthGuard. Role-based access control is applied using @Roles() decorator
 * for admin/staff-only endpoints.
 *
 * @example
 * ```typescript
 * // Get current user's profile
 * GET /api/users/profile
 * Headers: Authorization: Bearer <jwt_token>
 *
 * // Update user profile
 * PATCH /api/users/profile
 * Headers: Authorization: Bearer <jwt_token>
 * Body: {
 *   "phoneNumber": "+92-300-1234567",
 *   "address": "123 Main St, Karachi"
 * }
 *
 * // Admin: Get all users with pagination
 * GET /api/users?page=1&limit=10
 * Headers: Authorization: Bearer <admin_jwt_token>
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
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  UpdateUserProfileSchema,
  UpdateClientProfileSchema,
  UpdateAttorneyProfileSchema,
  PaginationSchema,
} from '@repo/shared';
import type {
  UpdateUserProfileData,
  UpdateClientProfileData,
  UpdateAttorneyProfileData,
  PaginationParams,
  UserProfile,
  PaginatedUsersResponse,
} from '@repo/shared';

/**
 * Controller for user profile and management endpoints
 *
 * @remarks
 * All endpoints require JWT authentication by default (enforced by global JwtAuthGuard).
 * Admin/staff-only endpoints are protected with @Roles() decorator.
 *
 * Route Prefix: /api/users
 *
 * @example
 * ```typescript
 * // Inject controller in module
 * @Module({
 *   imports: [DatabaseModule],
 *   controllers: [UsersController],
 *   providers: [UsersService],
 * })
 * export class UsersModule {}
 * ```
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user's complete profile
   *
   * Retrieves the authenticated user's profile data, including:
   * - Basic user information (email, name, user type)
   * - Client profile data (if user is a client)
   * - Attorney profile data (if user is an attorney)
   *
   * @param user - Authenticated user extracted from JWT token
   * @returns Complete user profile with type-specific data
   *
   * @throws {NotFoundException} If user profile is not found
   * @throws {InternalServerErrorException} If database query fails
   *
   * @example
   * ```typescript
   * // Request
   * GET /api/users/profile
   * Headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
   *
   * // Response (200 OK)
   * {
   *   "id": "uuid-123",
   *   "email": "john.doe@example.com",
   *   "fullName": "John Doe",
   *   "userType": "CLIENT",
   *   "phoneNumber": "+92-300-1234567",
   *   "address": "123 Main St, Karachi",
   *   "createdAt": "2024-01-15T10:30:00Z",
   *   "updatedAt": "2024-01-20T14:45:00Z",
   *   "clientProfile": {
   *     "id": "client-uuid-456",
   *     "cnic": "12345-1234567-1",
   *     "dateOfBirth": "1990-05-15",
   *     "occupation": "Software Engineer",
   *     "emergencyContactName": "Jane Doe",
   *     "emergencyContactPhone": "+92-300-7654321"
   *   }
   * }
   * ```
   */
  @Get('profile')
  async getUserProfile(@CurrentUser() user: AuthUser): Promise<UserProfile> {
    return this.usersService.getUserProfile(user.id, user.email);
  }

  /**
   * Update current user's basic profile information
   *
   * Allows users to update their own basic profile data such as:
   * - Full name
   * - Phone number
   * - Address
   * - Profile picture URL
   *
   * @param user - Authenticated user extracted from JWT token
   * @param dto - Profile update data (all fields optional)
   * @returns Updated user profile
   *
   * @throws {NotFoundException} If user profile is not found
   * @throws {BadRequestException} If validation fails (e.g., invalid phone format)
   * @throws {InternalServerErrorException} If database update fails
   *
   * @example
   * ```typescript
   * // Request
   * PATCH /api/users/profile
   * Headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
   * Body: {
   *   "fullName": "John Michael Doe",
   *   "phoneNumber": "+92-321-9876543",
   *   "address": "456 Park Avenue, Lahore"
   * }
   *
   * // Response (200 OK)
   * {
   *   "id": "uuid-123",
   *   "email": "john.doe@example.com",
   *   "fullName": "John Michael Doe",
   *   "phoneNumber": "+92-321-9876543",
   *   "address": "456 Park Avenue, Lahore",
   *   "updatedAt": "2024-01-21T09:15:00Z"
   * }
   * ```
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateUserProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateUserProfileSchema))
    dto: UpdateUserProfileData,
  ): Promise<UserProfile> {
    return this.usersService.updateUserProfile(user.id, dto);
  }

  /**
   * Update current user's client-specific profile data
   *
   * Allows clients to update their client profile information such as:
   * - CNIC (National ID)
   * - Date of birth
   * - Occupation
   * - Emergency contact details
   * - Preferred communication method
   *
   * @param user - Authenticated user extracted from JWT token
   * @param dto - Client profile update data (all fields optional)
   * @returns Updated user profile with client data
   *
   * @throws {NotFoundException} If user or client profile is not found
   * @throws {BadRequestException} If user is not a client or validation fails
   * @throws {InternalServerErrorException} If database update fails
   *
   * @example
   * ```typescript
   * // Request
   * PATCH /api/users/client-profile
   * Headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
   * Body: {
   *   "cnic": "12345-1234567-1",
   *   "occupation": "Business Owner",
   *   "emergencyContactName": "Jane Doe",
   *   "emergencyContactPhone": "+92-300-7654321",
   *   "preferredCommunication": "EMAIL"
   * }
   *
   * // Response (200 OK)
   * {
   *   "id": "uuid-123",
   *   "email": "john.doe@example.com",
   *   "fullName": "John Doe",
   *   "userType": "CLIENT",
   *   "clientProfile": {
   *     "id": "client-uuid-456",
   *     "cnic": "12345-1234567-1",
   *     "occupation": "Business Owner",
   *     "emergencyContactName": "Jane Doe",
   *     "emergencyContactPhone": "+92-300-7654321",
   *     "preferredCommunication": "EMAIL",
   *     "updatedAt": "2024-01-21T09:20:00Z"
   *   }
   * }
   * ```
   */
  @Patch('client-profile')
  @HttpCode(HttpStatus.OK)
  async updateClientProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateClientProfileSchema))
    dto: UpdateClientProfileData,
  ): Promise<UserProfile> {
    return this.usersService.updateClientProfile(user.id, dto);
  }

  /**
   * Update current user's attorney-specific profile data
   *
   * Allows attorneys to update their professional profile information such as:
   * - Bar council number
   * - License number
   * - Specializations
   * - Years of experience
   * - Education credentials
   * - Professional bio
   *
   * @param user - Authenticated user extracted from JWT token
   * @param dto - Attorney profile update data (all fields optional)
   * @returns Updated user profile with attorney data
   *
   * @throws {NotFoundException} If user or attorney profile is not found
   * @throws {BadRequestException} If user is not an attorney or validation fails
   * @throws {InternalServerErrorException} If database update fails
   *
   * @example
   * ```typescript
   * // Request
   * PATCH /api/users/attorney-profile
   * Headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
   * Body: {
   *   "barCouncilNumber": "BAR-2020-12345",
   *   "specializations": ["Corporate Law", "Tax Law"],
   *   "yearsOfExperience": 8,
   *   "education": "LLB from University of Karachi",
   *   "bio": "Experienced corporate attorney specializing in taxation"
   * }
   *
   * // Response (200 OK)
   * {
   *   "id": "uuid-789",
   *   "email": "attorney@arcolaw.com",
   *   "fullName": "Sarah Khan",
   *   "userType": "ATTORNEY",
   *   "attorneyProfile": {
   *     "id": "attorney-uuid-101",
   *     "barCouncilNumber": "BAR-2020-12345",
   *     "specializations": ["Corporate Law", "Tax Law"],
   *     "yearsOfExperience": 8,
   *     "education": "LLB from University of Karachi",
   *     "bio": "Experienced corporate attorney specializing in taxation",
   *     "updatedAt": "2024-01-21T09:25:00Z"
   *   }
   * }
   * ```
   */
  @Patch('attorney-profile')
  @HttpCode(HttpStatus.OK)
  async updateAttorneyProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateAttorneyProfileSchema))
    dto: UpdateAttorneyProfileData,
  ): Promise<UserProfile> {
    return this.usersService.updateAttorneyProfile(user.id, dto);
  }

  /**
   * Get paginated list of all users (staff/admin only)
   *
   * Retrieves a paginated list of all users in the system with:
   * - Configurable page size (default: 10, max: 100)
   * - Page-based navigation
   * - Total count for pagination UI
   * - Basic profile information for each user
   *
   * @param pagination - Pagination parameters (page, limit)
   * @returns Paginated user list with metadata
   *
   * @throws {ForbiddenException} If user is not staff or admin
   * @throws {BadRequestException} If pagination parameters are invalid
   * @throws {InternalServerErrorException} If database query fails
   *
   * @example
   * ```typescript
   * // Request
   * GET /api/users?page=2&limit=20
   * Headers: { Authorization: 'Bearer <admin_jwt_token>' }
   *
   * // Response (200 OK)
   * {
   *   "data": [
   *     {
   *       "id": "uuid-1",
   *       "email": "client1@example.com",
   *       "fullName": "Client One",
   *       "userType": "CLIENT",
   *       "phoneNumber": "+92-300-1111111",
   *       "createdAt": "2024-01-10T08:00:00Z"
   *     },
   *     {
   *       "id": "uuid-2",
   *       "email": "attorney1@arcolaw.com",
   *       "fullName": "Attorney One",
   *       "userType": "ATTORNEY",
   *       "phoneNumber": "+92-300-2222222",
   *       "createdAt": "2024-01-12T10:30:00Z"
   *     }
   *   ],
   *   "meta": {
   *     "page": 2,
   *     "limit": 20,
   *     "total": 150,
   *     "totalPages": 8
   *   }
   * }
   * ```
   */
  @Get()
  @Roles(UserType.ADMIN, UserType.STAFF)
  async getAllUsers(
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<PaginatedUsersResponse> {
    return this.usersService.getAllUsers(pagination);
  }

  /**
   * Delete a user by ID (admin only)
   *
   * Permanently deletes a user and all associated data from the system.
   * This is a destructive operation that cannot be undone.
   *
   * @param id - UUID of the user to delete
   * @returns Success message confirmation
   *
   * @throws {ForbiddenException} If user is not an admin
   * @throws {NotFoundException} If user with given ID does not exist
   * @throws {BadRequestException} If attempting to delete own account or last admin
   * @throws {InternalServerErrorException} If database deletion fails
   *
   * @remarks
   * **IMPORTANT:** This operation cascades to related records:
   * - Client/Attorney profiles
   * - Associated cases
   * - Appointments
   * - Documents
   * - Audit logs (preserved for compliance)
   *
   * Admins cannot delete:
   * - Their own account (self-deletion prevention)
   * - The last remaining admin account (system integrity)
   *
   * @example
   * ```typescript
   * // Request
   * DELETE /api/users/uuid-123
   * Headers: { Authorization: 'Bearer <admin_jwt_token>' }
   *
   * // Response (200 OK)
   * {
   *   "message": "User uuid-123 deleted successfully"
   * }
   *
   * // Error: Self-deletion attempt (400 Bad Request)
   * {
   *   "statusCode": 400,
   *   "message": "Cannot delete your own account",
   *   "error": "Bad Request"
   * }
   *
   * // Error: Last admin (400 Bad Request)
   * {
   *   "statusCode": 400,
   *   "message": "Cannot delete the last admin user",
   *   "error": "Bad Request"
   * }
   * ```
   */
  @Delete(':id')
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ message: string }> {
    return this.usersService.deleteUser(id, user.id);
  }
}
