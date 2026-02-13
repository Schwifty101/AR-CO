/**
 * ClientsService Unit Tests
 *
 * Tests client CRUD operations including:
 * - getClients (paginated list with filters)
 * - getClientById (with access control)
 * - createClient (auth + profile creation)
 * - updateClient
 * - deleteClient
 * (Aggregation tests in clients-aggregation.service.spec.ts)
 *
 * @module ClientsServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { SupabaseService } from '../database/supabase.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';

/** Mock Supabase admin client */
const mockAdminClient = {
  from: jest.fn(),
  auth: {
    admin: {
      getUserById: jest.fn(),
      inviteUserByEmail: jest.fn(),
      deleteUser: jest.fn(),
    },
  },
};

/** Staff user fixture */
const staffUser: AuthUser = {
  id: 'staff-uuid',
  email: 'staff@arco.com',
  userType: UserType.STAFF,
  fullName: 'Staff User',
  phoneNumber: null,
};

/** Client user fixture */
const clientUser: AuthUser = {
  id: 'user-uuid-123',
  email: 'client@example.com',
  userType: UserType.CLIENT,
  fullName: 'Test Client',
  phoneNumber: null,
  clientProfileId: 'client-uuid-456',
};

/** Another client (for forbidden access tests) */
const otherClient: AuthUser = {
  id: 'other-uuid',
  email: 'other@example.com',
  userType: UserType.CLIENT,
  fullName: 'Other Client',
  phoneNumber: null,
  clientProfileId: 'other-client-uuid',
};

/** Mock client_profiles row with joined user_profiles */
const mockClientRow = {
  id: 'client-uuid-456',
  user_profile_id: 'user-uuid-123',
  company_name: 'Test Corp',
  company_type: 'llc',
  tax_id: '1234567',
  address: '123 Main St',
  city: 'Karachi',
  country: 'Pakistan',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-20T14:00:00Z',
  user_profiles: {
    id: 'user-uuid-123',
    full_name: 'Test Client',
    phone_number: '+923001234567',
  },
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAdminClient.from.mockReset();
    mockAdminClient.auth.admin.getUserById.mockReset();
    mockAdminClient.auth.admin.inviteUserByEmail.mockReset();
    mockAdminClient.auth.admin.deleteUser.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  describe('getClientById', () => {
    it('should return client for staff user', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockClientRow,
              error: null,
            }),
          }),
        }),
      });
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'client@example.com' } },
        error: null,
      });

      const result = await service.getClientById('client-uuid-456', staffUser);

      expect(result.id).toBe('client-uuid-456');
      expect(result.fullName).toBe('Test Client');
      expect(result.email).toBe('client@example.com');
      expect(result.companyName).toBe('Test Corp');
    });

    it('should return client for own client user', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockClientRow,
              error: null,
            }),
          }),
        }),
      });
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'client@example.com' } },
        error: null,
      });

      const result = await service.getClientById('client-uuid-456', clientUser);

      expect(result.id).toBe('client-uuid-456');
    });

    it('should throw ForbiddenException for other client', async () => {
      await expect(
        service.getClientById('client-uuid-456', otherClient),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when client not found', async () => {
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

      await expect(
        service.getClientById('nonexistent', staffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createClient', () => {
    it('should invite user via email and create user profile and client profile', async () => {
      mockAdminClient.auth.admin.inviteUserByEmail.mockResolvedValueOnce({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });
      // user_profiles insert
      mockAdminClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });
      // client_profiles insert with select
      mockAdminClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'new-client-id',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createClient({
        email: 'new@example.com',
        fullName: 'New Client',
        companyName: 'New Corp',
      });

      expect(result.id).toBe('new-client-id');
      expect(result.fullName).toBe('New Client');
      expect(result.email).toBe('new@example.com');
      expect(result.companyName).toBe('New Corp');
    });

    it('should throw InternalServerErrorException if invite fails', async () => {
      mockAdminClient.auth.admin.inviteUserByEmail.mockResolvedValueOnce({
        data: null,
        error: { message: 'Email already exists' },
      });

      await expect(
        service.createClient({
          email: 'exists@example.com',
          fullName: 'Dupe',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should cleanup auth user if user_profile creation fails', async () => {
      mockAdminClient.auth.admin.inviteUserByEmail.mockResolvedValueOnce({
        data: { user: { id: 'cleanup-user-id' } },
        error: null,
      });
      // user_profiles insert fails
      mockAdminClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Insert failed' },
        }),
      });
      // Cleanup deleteUser
      mockAdminClient.auth.admin.deleteUser.mockResolvedValueOnce({
        error: null,
      });

      await expect(
        service.createClient({
          email: 'fail@example.com',
          fullName: 'Fail',
        }),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockAdminClient.auth.admin.deleteUser).toHaveBeenCalledWith(
        'cleanup-user-id',
      );
    });

    it('should cleanup auth user and user_profile if client_profile creation fails', async () => {
      mockAdminClient.auth.admin.inviteUserByEmail.mockResolvedValueOnce({
        data: { user: { id: 'cleanup-user-id-2' } },
        error: null,
      });
      // user_profiles insert succeeds
      mockAdminClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });
      // client_profiles insert fails
      mockAdminClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Client profile insert failed' },
            }),
          }),
        }),
      });
      // Cleanup: delete user_profile
      mockAdminClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });
      // Cleanup: deleteUser
      mockAdminClient.auth.admin.deleteUser.mockResolvedValueOnce({
        error: null,
      });

      await expect(
        service.createClient({
          email: 'fail2@example.com',
          fullName: 'Fail Two',
        }),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockAdminClient.auth.admin.deleteUser).toHaveBeenCalledWith(
        'cleanup-user-id-2',
      );
    });
  });

  describe('deleteClient', () => {
    it('should delete auth user and profile', async () => {
      // Fetch client to get user_profile_id
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_profile_id: 'user-to-delete' },
              error: null,
            }),
          }),
        }),
      });
      mockAdminClient.auth.admin.deleteUser.mockResolvedValueOnce({
        error: null,
      });
      // delete user_profiles
      mockAdminClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await service.deleteClient('client-uuid-456');

      expect(result.message).toBe('Client deleted successfully');
    });

    it('should throw NotFoundException if client not found', async () => {
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

      await expect(service.deleteClient('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateClient', () => {
    it('should update and return updated client', async () => {
      // update query
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });
      // getClientById query (after update)
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockClientRow, company_name: 'Updated Corp' },
              error: null,
            }),
          }),
        }),
      });
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'client@example.com' } },
        error: null,
      });

      const result = await service.updateClient(
        'client-uuid-456',
        { companyName: 'Updated Corp' },
        staffUser,
      );

      expect(result.companyName).toBe('Updated Corp');
    });
  });
});
