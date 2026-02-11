/**
 * UsersService Unit Tests
 *
 * Tests user profile CRUD operations including:
 * - getUserProfile (with client/attorney profile joins)
 * - updateUserProfile
 * - updateClientProfile
 * - updateAttorneyProfile
 * - getAllUsers (with pagination)
 * - deleteUser
 *
 * @module UsersServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseService } from '../database/supabase.service';

/** Mock Supabase admin client */
const mockAdminClient = {
  from: jest.fn(),
  auth: {
    admin: {
      getUserById: jest.fn(),
      deleteUser: jest.fn(),
    },
  },
};

/** Helper to set up chained query builder for select().eq().single() */
function mockSelectEqSingle(data: unknown, error: unknown = null) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data, error }),
      }),
    }),
  };
}

/** Helper for update().eq() */
function mockUpdateEq(error: unknown = null) {
  return {
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error }),
    }),
  };
}

/** Sample user profile data from DB */
const mockUserProfile = {
  id: 'user-uuid-123',
  full_name: 'John Doe',
  phone_number: '+923001234567',
  user_type: 'client',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-20T14:00:00Z',
};

/** Sample client profile data from DB */
const mockClientProfile = {
  id: 'client-uuid-456',
  company_name: 'Test Corp',
  company_type: 'llc',
  tax_id: '1234567',
  address: '123 Main St',
  city: 'Karachi',
  country: 'Pakistan',
};

/** Sample attorney profile data from DB */
const mockAttorneyProfile = {
  id: 'attorney-uuid-789',
  bar_number: 'BAR-12345',
  specializations: ['Corporate Law', 'Tax Law'],
  education: 'LLB from University of Karachi',
  experience_years: 10,
  hourly_rate: 15000,
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    mockAdminClient.from.mockReset();
    mockAdminClient.auth.admin.getUserById.mockReset();
    mockAdminClient.auth.admin.deleteUser.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('getUserProfile', () => {
    it('should return user profile with email passed in', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      // For client_profiles (user_type is 'client')
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.getUserProfile(
        'user-uuid-123',
        'john@example.com',
      );

      expect(result.id).toBe('user-uuid-123');
      expect(result.email).toBe('john@example.com');
      expect(result.fullName).toBe('John Doe');
      expect(result.userType).toBe('client');
      expect(result.clientProfile).toBeDefined();
      expect(result.clientProfile?.companyName).toBe('Test Corp');
    });

    it('should fetch email from auth if not provided', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'fetched@example.com' } },
        error: null,
      });
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.getUserProfile('user-uuid-123');

      expect(result.email).toBe('fetched@example.com');
      expect(mockAdminClient.auth.admin.getUserById).toHaveBeenCalledWith(
        'user-uuid-123',
      );
    });

    it('should include attorney profile for attorney users', async () => {
      const attorneyUser = { ...mockUserProfile, user_type: 'attorney' };
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(attorneyUser),
      );
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockAttorneyProfile),
      );

      const result = await service.getUserProfile(
        'user-uuid-123',
        'attorney@example.com',
      );

      expect(result.attorneyProfile).toBeDefined();
      expect(result.attorneyProfile?.barNumber).toBe('BAR-12345');
      expect(result.attorneyProfile?.specializations).toEqual([
        'Corporate Law',
        'Tax Law',
      ]);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(null, { code: 'PGRST116' }),
      );

      await expect(
        service.getUserProfile('nonexistent-uuid', 'x@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserProfile', () => {
    it('should update full name and return updated profile', async () => {
      // Mock the update call
      mockAdminClient.from.mockReturnValueOnce(mockUpdateEq());
      // Mock the subsequent getUserProfile call (user_profiles query)
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle({ ...mockUserProfile, full_name: 'Jane Doe' }),
      );
      // Mock auth call for getUserProfile (no email provided)
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'john@example.com' } },
        error: null,
      });
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.updateUserProfile('user-uuid-123', {
        fullName: 'Jane Doe',
      });

      expect(result.fullName).toBe('Jane Doe');
    });

    it('should return current profile if no fields to update', async () => {
      // Empty update object - should just call getUserProfile
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      // Mock auth call
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'john@example.com' } },
        error: null,
      });
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.updateUserProfile('user-uuid-123', {});

      expect(result.id).toBe('user-uuid-123');
    });

    it('should throw InternalServerErrorException on update failure', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockUpdateEq({ message: 'DB error', code: 'UNKNOWN' }),
      );

      await expect(
        service.updateUserProfile('user-uuid-123', {
          fullName: 'Fail',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateClientProfile', () => {
    it('should update company name and return updated profile', async () => {
      mockAdminClient.from.mockReturnValueOnce(mockUpdateEq());
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'john@example.com' } },
        error: null,
      });
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle({
          ...mockClientProfile,
          company_name: 'New Corp',
        }),
      );

      const result = await service.updateClientProfile('user-uuid-123', {
        companyName: 'New Corp',
      });

      expect(result.clientProfile?.companyName).toBe('New Corp');
    });

    it('should return current profile if no fields to update', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'john@example.com' } },
        error: null,
      });
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.updateClientProfile('user-uuid-123', {});

      expect(result.clientProfile?.companyName).toBe('Test Corp');
    });
  });

  describe('updateAttorneyProfile', () => {
    it('should update bar number and return updated profile', async () => {
      const attorneyUser = { ...mockUserProfile, user_type: 'attorney' };
      mockAdminClient.from.mockReturnValueOnce(mockUpdateEq());
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(attorneyUser),
      );
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'attorney@example.com' } },
        error: null,
      });
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle({
          ...mockAttorneyProfile,
          bar_number: 'BAR-99999',
        }),
      );

      const result = await service.updateAttorneyProfile('user-uuid-123', {
        barNumber: 'BAR-99999',
      });

      expect(result.attorneyProfile?.barNumber).toBe('BAR-99999');
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      // Mock count query - need to return proper structure with head: true
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ count: 2, error: null }),
      });
      // Mock paginated select with proper chaining
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [mockUserProfile],
              error: null,
            }),
          }),
        }),
      });
      // Mock getUserProfile for the user in the list
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'john@example.com' } },
        error: null,
      });
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.getAllUsers({
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should throw InternalServerErrorException on count failure', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          count: null,
          error: { message: 'Count error' },
        }),
      });

      await expect(
        service.getAllUsers({
          page: 1,
          limit: 20,
          sort: 'created_at',
          order: 'desc',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and auth record successfully', async () => {
      // Mock exists check with proper chaining
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'user-uuid-123' },
              error: null,
            }),
          }),
        }),
      });
      // Mock profile delete with proper chaining
      mockAdminClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });
      // Mock auth delete
      mockAdminClient.auth.admin.deleteUser.mockResolvedValueOnce({
        error: null,
      });

      const result = await service.deleteUser('user-uuid-123');

      expect(result.message).toBe('User deleted successfully');
      expect(mockAdminClient.auth.admin.deleteUser).toHaveBeenCalledWith(
        'user-uuid-123',
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      await expect(service.deleteUser('nonexistent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should succeed even if auth user deletion fails', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'user-uuid-123' },
              error: null,
            }),
          }),
        }),
      });
      mockAdminClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });
      mockAdminClient.auth.admin.deleteUser.mockResolvedValueOnce({
        error: { message: 'Auth delete failed' },
      });

      const result = await service.deleteUser('user-uuid-123');

      // Should still succeed - profile is deleted, auth failure logged
      expect(result.message).toBe('User deleted successfully');
    });
  });
});
