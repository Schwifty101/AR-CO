/**
 * ClientsAggregationService Unit Tests
 *
 * Tests aggregation endpoints for client-related data:
 * - getClientCases (paginated)
 * - getClientDocuments (paginated)
 * - getClientInvoices (paginated)
 *
 * @module ClientsAggregationServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ClientsAggregationService } from './clients-aggregation.service';
import { SupabaseService } from '../database/supabase.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';

/** Mock Supabase admin client */
const mockAdminClient = {
  from: jest.fn(),
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

describe('ClientsAggregationService', () => {
  let service: ClientsAggregationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAdminClient.from.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsAggregationService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<ClientsAggregationService>(ClientsAggregationService);
  });

  describe('getClientCases', () => {
    it('should return paginated cases for staff', async () => {
      // Count query
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 5, error: null }),
        }),
      });
      // Data query
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [{ id: 'case-1', title: 'Test Case' }],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.getClientCases(
        'client-uuid-456',
        staffUser,
        { page: 1, limit: 20, sort: 'created_at', order: 'desc' },
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 5,
        totalPages: 1,
      });
    });

    it('should throw ForbiddenException for other client', async () => {
      await expect(
        service.getClientCases('client-uuid-456', otherClient, {
          page: 1,
          limit: 20,
          sort: 'created_at',
          order: 'desc',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow client to view own cases', async () => {
      // Count query
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 1, error: null }),
        }),
      });
      // Data query
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [{ id: 'case-1' }],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.getClientCases(
        'client-uuid-456',
        clientUser,
        { page: 1, limit: 20, sort: 'created_at', order: 'desc' },
      );

      expect(result.data).toHaveLength(1);
    });
  });
});
