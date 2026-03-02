import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { CaseActivitiesService } from './case-activities.service';
import { SupabaseService } from '../database/supabase.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  CaseActivityType,
  type CreateCaseActivityData,
  type PaginationParams,
} from '@repo/shared';

describe('CaseActivitiesService', () => {
  let service: CaseActivitiesService;

  const mockAdminClient = {
    from: jest.fn(),
  };

  // ---- User fixture ----

  const staffUser: AuthUser = {
    id: 'staff-uuid',
    email: 'staff@arco.com',
    userType: UserType.STAFF,
    fullName: 'Staff User',
    phoneNumber: null,
  };

  // ---- Mock DB row matching CaseActivityRow shape ----

  const mockActivityRow = {
    id: 'activity-uuid-1',
    case_id: 'case-uuid-1',
    activity_type: CaseActivityType.NOTE_ADDED,
    title: 'Filed motion for discovery',
    description: 'Motion filed with court clerk',
    created_by: 'staff-uuid',
    attachments: null,
    created_at: '2026-03-01T10:00:00Z',
    creator: { full_name: 'Staff User' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaseActivitiesService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<CaseActivitiesService>(CaseActivitiesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // getCaseActivities
  // =========================================================================
  describe('getCaseActivities', () => {
    const pagination: PaginationParams = {
      page: 1,
      limit: 20,
      sort: 'created_at',
      order: 'desc',
    };

    it('should return paginated activities with mapped camelCase response', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [mockActivityRow],
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      });

      const result = await service.getCaseActivities('case-uuid-1', pagination);

      expect(mockAdminClient.from).toHaveBeenCalledWith('case_activities');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: 'activity-uuid-1',
        caseId: 'case-uuid-1',
        activityType: CaseActivityType.NOTE_ADDED,
        title: 'Filed motion for discovery',
        description: 'Motion filed with court clerk',
        createdBy: 'staff-uuid',
        createdByName: 'Staff User',
        attachments: null,
        createdAt: '2026-03-01T10:00:00Z',
      });
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
                count: null,
              }),
            }),
          }),
        }),
      });

      await expect(
        service.getCaseActivities('case-uuid-1', pagination),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // =========================================================================
  // addCaseActivity
  // =========================================================================
  describe('addCaseActivity', () => {
    const createDto: CreateCaseActivityData = {
      activityType: CaseActivityType.NOTE_ADDED,
      title: 'Filed motion for discovery',
      description: 'Motion filed with court clerk',
    };

    it('should add activity and return mapped response', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockActivityRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.addCaseActivity(
        'case-uuid-1',
        createDto,
        staffUser,
      );

      expect(mockAdminClient.from).toHaveBeenCalledWith('case_activities');
      expect(result).toEqual({
        id: 'activity-uuid-1',
        caseId: 'case-uuid-1',
        activityType: CaseActivityType.NOTE_ADDED,
        title: 'Filed motion for discovery',
        description: 'Motion filed with court clerk',
        createdBy: 'staff-uuid',
        createdByName: 'Staff User',
        attachments: null,
        createdAt: '2026-03-01T10:00:00Z',
      });
    });

    it('should throw InternalServerErrorException on insert failure', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      });

      await expect(
        service.addCaseActivity('case-uuid-1', createDto, staffUser),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // =========================================================================
  // createAutoActivity
  // =========================================================================
  describe('createAutoActivity', () => {
    it('should insert activity without throwing', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      await expect(
        service.createAutoActivity(
          'case-uuid-1',
          CaseActivityType.CASE_CREATED,
          'Case created',
          'New case opened',
          'staff-uuid',
        ),
      ).resolves.toBeUndefined();

      expect(mockAdminClient.from).toHaveBeenCalledWith('case_activities');
    });

    it('should NOT throw on DB error (logs warning instead)', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Insert failed' },
        }),
      });

      await expect(
        service.createAutoActivity(
          'case-uuid-1',
          CaseActivityType.STATUS_CHANGED,
          'Status changed',
          null,
          'staff-uuid',
        ),
      ).resolves.toBeUndefined();
    });

    it('should NOT throw on thrown exception (catches silently)', async () => {
      mockAdminClient.from.mockImplementation(() => {
        throw new Error('Unexpected crash');
      });

      await expect(
        service.createAutoActivity(
          'case-uuid-1',
          CaseActivityType.ATTORNEY_ASSIGNED,
          'Assigned to attorney',
          null,
          'staff-uuid',
        ),
      ).resolves.toBeUndefined();
    });
  });
});
