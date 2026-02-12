/**
 * Users API Client
 *
 * Client-side functions for user and profile management operations.
 * All requests go through the Next.js API proxy (/api/*).
 *
 * @module UsersAPI
 *
 * @example
 * ```typescript
 * import { getUserProfile, updateUserProfile, getUsers } from '@/lib/api/users';
 *
 * // Fetch current user's profile
 * const profile = await getUserProfile();
 *
 * // Update user info
 * await updateUserProfile({ fullName: 'John Doe', phoneNumber: '+92300...' });
 *
 * // Get users list (admin only)
 * const users = await getUsers({ page: 1, limit: 20 });
 * ```
 */

import { createBrowserClient } from '@/lib/supabase/client';
import type {
  UserProfile,
  UpdateUserProfileData,
  UpdateClientProfileData,
  UpdateAttorneyProfileData,
  PaginatedUsersResponse,
} from '@repo/shared';

// Re-export types for consumers that import from this module
export type { UserProfile, UpdateUserProfileData, UpdateClientProfileData, UpdateAttorneyProfileData } from '@repo/shared';
export { UserType, CompanyType } from '@repo/shared';

/** Pagination parameters for the frontend (only page + limit) */
export interface PaginationParams {
  page?: number;
  limit?: number;
  userTypes?: string[];
}

/** Paginated users response shaped for frontend consumption */
export interface PaginatedUsers {
  users: UserProfile[];
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
 * Fetch the current user's complete profile
 *
 * Retrieves user data along with client or attorney profile if applicable.
 *
 * @returns Complete user profile with nested client/attorney data
 * @throws Error if request fails or user is not authenticated
 */
export async function getUserProfile(): Promise<UserProfile> {
  const token = await getSessionToken();

  const response = await fetch('/api/users/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch user profile');
  }

  return (await response.json()) as UserProfile;
}

/**
 * Update the current user's basic profile information
 *
 * @param data - Updated profile fields (fullName, phoneNumber)
 * @returns Updated user profile
 * @throws Error if request fails
 */
export async function updateUserProfile(
  data: UpdateUserProfileData,
): Promise<UserProfile> {
  const token = await getSessionToken();
  const response = await fetch('/api/users/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update profile');
  }

  return (await response.json()) as UserProfile;
}

/**
 * Update the current user's client profile information
 *
 * Only works if the user's userType is 'client'.
 *
 * @param data - Updated client profile fields
 * @returns Updated user profile with client data
 * @throws Error if request fails or user is not a client
 */
export async function updateClientProfile(
  data: UpdateClientProfileData,
): Promise<UserProfile> {
  const token = await getSessionToken();
  const response = await fetch('/api/users/client-profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update client profile');
  }

  return (await response.json()) as UserProfile;
}

/**
 * Update the current user's attorney profile information
 *
 * Only works if the user's userType is 'attorney'.
 *
 * @param data - Updated attorney profile fields
 * @returns Updated user profile with attorney data
 * @throws Error if request fails or user is not an attorney
 */
export async function updateAttorneyProfile(
  data: UpdateAttorneyProfileData,
): Promise<UserProfile> {
  const token = await getSessionToken();
  const response = await fetch('/api/users/attorney-profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to update attorney profile');
  }

  return (await response.json()) as UserProfile;
}

/**
 * Fetch paginated list of all users (admin/staff only)
 *
 * @param params - Pagination parameters (page, limit, userTypes)
 * @returns Paginated users response
 * @throws Error if request fails or user lacks permissions
 */
export async function getUsers(
  params?: PaginationParams,
): Promise<PaginatedUsers> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.userTypes && params.userTypes.length > 0) {
    queryParams.set('userTypes', params.userTypes.join(','));
  }

  const url = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch users');
  }

  const backendResponse = (await response.json()) as PaginatedUsersResponse;

  return {
    users: backendResponse.data,
    total: backendResponse.meta.total,
    page: backendResponse.meta.page,
    limit: backendResponse.meta.limit,
    totalPages: backendResponse.meta.totalPages,
  };
}

/**
 * Delete a user by ID (admin only)
 *
 * Permanently removes the user and all associated data.
 *
 * @param userId - UUID of the user to delete
 * @throws Error if request fails or user lacks permissions
 */
export async function deleteUser(userId: string): Promise<void> {
  const token = await getSessionToken();
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to delete user');
  }
}

/** Data required to invite a new user */
export interface InviteUserData {
  /** Email address for the invitation */
  email: string;
  /** Full name of the user */
  fullName: string;
  /** User type — admin, staff, or attorney */
  userType: 'admin' | 'staff' | 'attorney';
  /** Optional phone number */
  phoneNumber?: string;
}

/** Response from invite user endpoint */
export interface InviteUserResponse {
  id: string;
  email: string;
  fullName: string;
  userType: string;
}

/**
 * Invite a new user (admin/staff/attorney) via email.
 * The invited user receives a magic link to set their password.
 *
 * @param data - Invitation data
 * @returns Created user info
 * @throws Error if invitation fails
 *
 * @example
 * ```typescript
 * const user = await inviteUser({
 *   email: 'john@example.com',
 *   fullName: 'John Doe',
 *   userType: 'staff',
 * });
 * ```
 */
export async function inviteUser(data: InviteUserData): Promise<InviteUserResponse> {
  const token = await getSessionToken();
  const response = await fetch('/api/users/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to invite user');
  }

  return (await response.json()) as InviteUserResponse;
}
