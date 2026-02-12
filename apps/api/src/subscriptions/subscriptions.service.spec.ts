import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionsService } from './subscriptions.service';
import { SupabaseService } from '../database/supabase.service';
import { SafepayService } from '../payments/safepay.service';
import { UserType } from '../common/enums/user-type.enum';
import { SubscriptionStatus } from '@repo/shared';
import type { AuthUser } from '../common/interfaces/auth-user.interface';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let mockAdminClient: {
    from: jest.Mock;
  };
  let mockSafepayService: {
    createSubscriptionCheckout: jest.Mock;
    cancelSubscription: jest.Mock;
  };

  const mockStaffUser: AuthUser = {
    id: 'staff-user-id',
    email: 'staff@arco.com',
    userType: UserType.STAFF,
    fullName: 'Staff User',
    phoneNumber: null,
  };

  const mockClientUser: AuthUser = {
    id: 'client-user-id',
    email: 'client@example.com',
    userType: UserType.CLIENT,
    fullName: 'Test Client',
    phoneNumber: null,
    clientProfileId: 'client-profile-id',
  };

  const mockSubscriptionRow = {
    id: 'subscription-id',
    client_profile_id: 'client-profile-id',
    plan_name: 'civic_retainer',
    monthly_amount: 700.0,
    currency: 'PKR',
    status: SubscriptionStatus.ACTIVE,
    safepay_subscription_id: 'safepay-sub-id',
    safepay_customer_id: 'safepay-cust-id',
    current_period_start: '2024-01-01T00:00:00Z',
    current_period_end: '2024-02-01T00:00:00Z',
    cancelled_at: null,
    cancellation_reason: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    mockAdminClient = {
      from: jest.fn(),
    };

    mockSafepayService = {
      createSubscriptionCheckout: jest.fn(),
      cancelSubscription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
        {
          provide: SafepayService,
          useValue: mockSafepayService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'FRONTEND_URL') {
                return 'http://localhost:3000';
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('should create new subscription and return checkout URL', async () => {
      const checkoutUrl = 'https://sandbox.api.getsafepay.pk/checkout/xyz';

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }, // No rows
            }),
          }),
        }),
      });

      mockAdminClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSubscriptionRow,
              error: null,
            }),
          }),
        }),
      });

      mockSafepayService.createSubscriptionCheckout.mockResolvedValue({
        checkoutUrl,
      });

      const result = await service.createSubscription(mockClientUser);

      expect(result.subscription.id).toBe('subscription-id');
      expect(result.checkoutUrl).toBe(checkoutUrl);
      expect(
        mockSafepayService.createSubscriptionCheckout,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: 'civic_retainer',
          reference: 'client-profile-id',
          customerEmail: 'client@example.com',
        }),
      );
    });

    it('should throw ForbiddenException if subscription is already active', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                ...mockSubscriptionRow,
                status: SubscriptionStatus.ACTIVE,
              },
              error: null,
            }),
          }),
        }),
      });

      await expect(service.createSubscription(mockClientUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should reactivate cancelled subscription', async () => {
      const cancelledSubscription = {
        ...mockSubscriptionRow,
        status: SubscriptionStatus.CANCELLED,
      };

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: cancelledSubscription,
              error: null,
            }),
          }),
        }),
      });

      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  ...mockSubscriptionRow,
                  status: SubscriptionStatus.PENDING,
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      mockSafepayService.createSubscriptionCheckout.mockResolvedValue(
        'https://checkout.url',
      );

      const result = await service.createSubscription(mockClientUser);

      expect(result.subscription.status).toBe(SubscriptionStatus.PENDING);
    });

    it('should throw BadRequestException if user is not a client', async () => {
      await expect(service.createSubscription(mockStaffUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMySubscription', () => {
    it('should return subscription for client', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSubscriptionRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getMySubscription(mockClientUser);

      expect(result.id).toBe('subscription-id');
      expect(result.clientProfileId).toBe('client-profile-id');
      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should throw NotFoundException when no subscription exists', async () => {
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

      await expect(service.getMySubscription(mockClientUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user is not a client', async () => {
      await expect(service.getMySubscription(mockStaffUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel active subscription', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSubscriptionRow,
              error: null,
            }),
          }),
        }),
      });

      mockSafepayService.cancelSubscription.mockResolvedValue(undefined);

      const cancelledSubscription = {
        ...mockSubscriptionRow,
        status: SubscriptionStatus.CANCELLED,
        cancelled_at: '2024-01-15T12:00:00Z',
        cancellation_reason: 'No longer needed',
      };

      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: cancelledSubscription,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.cancelSubscription(mockClientUser, {
        reason: 'No longer needed',
      });

      expect(result.status).toBe(SubscriptionStatus.CANCELLED);
      expect(result.cancellationReason).toBe('No longer needed');
      expect(mockSafepayService.cancelSubscription).toHaveBeenCalledWith(
        'safepay-sub-id',
      );
    });

    it('should throw ForbiddenException if subscription is not active', async () => {
      const inactiveSubscription = {
        ...mockSubscriptionRow,
        status: SubscriptionStatus.CANCELLED,
      };

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: inactiveSubscription,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.cancelSubscription(mockClientUser, {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when no subscription exists', async () => {
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
        service.cancelSubscription(mockClientUser, {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is not a client', async () => {
      await expect(
        service.cancelSubscription(mockStaffUser, {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllSubscriptions', () => {
    it('should return paginated list of subscriptions', async () => {
      const subscriptions = [mockSubscriptionRow];

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          count: 25,
          error: null,
        }),
      });

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: subscriptions,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getAllSubscriptions({
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(25);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should handle empty results', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          count: 0,
          error: null,
        }),
      });

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getAllSubscriptions({
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc',
      });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  describe('isSubscriptionActive', () => {
    it('should return true when subscription is active', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'subscription-id' },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.isSubscriptionActive('client-profile-id');

      expect(result).toBe(true);
    });

    it('should return false when no subscription exists', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      });

      const result = await service.isSubscriptionActive('client-profile-id');

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'SOME_ERROR', message: 'DB error' },
              }),
            }),
          }),
        }),
      });

      const result = await service.isSubscriptionActive('client-profile-id');

      expect(result).toBe(false);
    });
  });
});
