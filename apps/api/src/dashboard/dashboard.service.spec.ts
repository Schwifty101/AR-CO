import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { SupabaseService } from '../database/supabase.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockAdminClient = {
    from: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // getAdminStats
  // =========================================================================
  describe('getAdminStats', () => {
    /**
     * Helper: builds a chain mock for the count query pattern:
     * client.from(table).select('id', { count: 'exact', head: true }).eq(...) / .in(...).gte(...)
     *
     * For getAdminStats the 3 queries chain differently:
     *   1. user_profiles: .select().eq()  → resolves
     *   2. cases: .select().in()          → resolves
     *   3. appointments: .select().in().gte() → resolves
     */
    function buildCountChain(result: { count: number | null; error: { message: string } | null }) {
      const terminal = jest.fn().mockResolvedValue(result);
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(result),
          in: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue(result),
            // also resolve directly for cases (no gte)
            ...result,
            then: (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve),
          }),
        }),
        _terminal: terminal,
      };
    }

    it('should return admin stats with correct counts', async () => {
      const clientsChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 42, error: null }),
        }),
      };
      const casesChain = {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ count: 15, error: null }),
        }),
      };
      const appointmentsChain = {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({ count: 7, error: null }),
          }),
        }),
      };

      mockAdminClient.from
        .mockReturnValueOnce(clientsChain)
        .mockReturnValueOnce(casesChain)
        .mockReturnValueOnce(appointmentsChain);

      const result = await service.getAdminStats();

      expect(result).toEqual({
        totalClients: 42,
        activeCases: 15,
        pendingAppointments: 7,
      });

      expect(mockAdminClient.from).toHaveBeenCalledWith('user_profiles');
      expect(mockAdminClient.from).toHaveBeenCalledWith('cases');
      expect(mockAdminClient.from).toHaveBeenCalledWith('appointments');
    });

    it('should return 0 on DB errors and log warnings', async () => {
      const clientsChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: null, error: { message: 'clients err' } }),
        }),
      };
      const casesChain = {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ count: null, error: { message: 'cases err' } }),
        }),
      };
      const appointmentsChain = {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({ count: null, error: { message: 'appointments err' } }),
          }),
        }),
      };

      mockAdminClient.from
        .mockReturnValueOnce(clientsChain)
        .mockReturnValueOnce(casesChain)
        .mockReturnValueOnce(appointmentsChain);

      const result = await service.getAdminStats();

      expect(result).toEqual({
        totalClients: 0,
        activeCases: 0,
        pendingAppointments: 0,
      });
    });
  });

  // =========================================================================
  // getClientStats
  // =========================================================================
  describe('getClientStats', () => {
    const clientProfileId = 'client-profile-uuid';

    it('should return client stats for given profile', async () => {
      const casesChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 3, error: null }),
        }),
      };
      const appointmentsChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({ count: 1, error: null }),
            }),
          }),
        }),
      };
      const invoicesChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ count: 2, error: null }),
          }),
        }),
      };

      mockAdminClient.from
        .mockReturnValueOnce(casesChain)
        .mockReturnValueOnce(appointmentsChain)
        .mockReturnValueOnce(invoicesChain);

      const result = await service.getClientStats(clientProfileId);

      expect(result).toEqual({
        myCases: 3,
        upcomingAppointments: 1,
        pendingInvoices: 2,
      });

      expect(mockAdminClient.from).toHaveBeenCalledWith('cases');
      expect(mockAdminClient.from).toHaveBeenCalledWith('appointments');
      expect(mockAdminClient.from).toHaveBeenCalledWith('invoices');
    });
  });

  // =========================================================================
  // getAnalyticsStats
  // =========================================================================
  describe('getAnalyticsStats', () => {
    it('should return analytics counts', async () => {
      const subscribersChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 20, error: null }),
        }),
      };
      const complaintsChain = {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ count: 5, error: null }),
        }),
      };
      const registrationsChain = {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ count: 8, error: null }),
        }),
      };

      mockAdminClient.from
        .mockReturnValueOnce(subscribersChain)
        .mockReturnValueOnce(complaintsChain)
        .mockReturnValueOnce(registrationsChain);

      const result = await service.getAnalyticsStats();

      expect(result).toEqual({
        activeSubscribers: 20,
        openComplaints: 5,
        pendingRegistrations: 8,
      });

      expect(mockAdminClient.from).toHaveBeenCalledWith('subscriptions');
      expect(mockAdminClient.from).toHaveBeenCalledWith('complaints');
      expect(mockAdminClient.from).toHaveBeenCalledWith('service_registrations');
    });
  });

  // =========================================================================
  // getRecentActivities
  // =========================================================================
  describe('getRecentActivities', () => {
    it('should return mapped activities with user names', async () => {
      const mockRows = [
        {
          id: 'log-1',
          user_id: 'user-uuid-1',
          action: 'CREATE',
          entity_type: 'case',
          entity_id: 'case-uuid-1',
          metadata: { title: 'Test Case' },
          ip_address: '127.0.0.1',
          user_agent: 'Jest/1.0',
          created_at: '2026-03-01T10:00:00Z',
          user_profiles: { full_name: 'John Doe' },
        },
        {
          id: 'log-2',
          user_id: 'user-uuid-2',
          action: 'UPDATE',
          entity_type: 'complaint',
          entity_id: 'complaint-uuid-1',
          metadata: null,
          ip_address: '192.168.1.1',
          user_agent: null,
          created_at: '2026-03-01T09:00:00Z',
          user_profiles: null,
        },
      ];

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: mockRows, error: null }),
          }),
        }),
      });

      const result = await service.getRecentActivities(10);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'log-1',
        userId: 'user-uuid-1',
        action: 'CREATE',
        entityType: 'case',
        entityId: 'case-uuid-1',
        metadata: { title: 'Test Case' },
        ipAddress: '127.0.0.1',
        userAgent: 'Jest/1.0',
        createdAt: '2026-03-01T10:00:00Z',
        userName: 'John Doe',
      });
      expect(result[1]).toMatchObject({
        userId: 'user-uuid-2',
        metadata: {},
        userName: null,
      });

      expect(mockAdminClient.from).toHaveBeenCalledWith('activity_logs');
    });

    it('should return empty array on DB error', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'DB connection error' },
            }),
          }),
        }),
      });

      const result = await service.getRecentActivities();

      expect(result).toEqual([]);
    });
  });

  // =========================================================================
  // getCaseAnalytics
  // =========================================================================
  describe('getCaseAnalytics', () => {
    it('should compute analytics with resolution rate', async () => {
      const mockCases = [
        { status: 'active', priority: 'high', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
        { status: 'active', priority: 'medium', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
        { status: 'resolved', priority: 'high', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-11T00:00:00Z' },
        { status: 'closed', priority: 'low', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
      ];

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockCases, error: null }),
      });

      const result = await service.getCaseAnalytics();

      expect(result.totalCases).toBe(4);
      expect(result.byStatus).toEqual({ active: 2, resolved: 1, closed: 1 });
      expect(result.byPriority).toEqual({ high: 2, medium: 1, low: 1 });
      // 2 out of 4 resolved/closed → 50%
      expect(result.resolutionRate).toBe(50);
      // resolved: 10 days, closed: 14 days → avg 12 days
      expect(result.avgResolutionDays).toBe(12);
    });

    it('should return defaults on DB error', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'query failed' },
        }),
      });

      const result = await service.getCaseAnalytics();

      expect(result).toEqual({
        byStatus: {},
        byPriority: {},
        resolutionRate: 0,
        avgResolutionDays: 0,
        totalCases: 0,
      });
    });
  });
});
