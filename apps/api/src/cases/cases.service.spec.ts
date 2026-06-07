import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CaseActivitiesService } from './case-activities.service';
import { SupabaseService } from '../database/supabase.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  CaseStatus,
  CasePriority,
  CaseActivityType,
  ServiceRegistrationStatus,
  type CreateCaseData,
  type UpdateCaseData,
  type UpdateCaseStatusData,
  type AssignToData,
  type CaseFilters,
  type PaginationParams,
  type CreateCaseFromRegistrationData,
} from '@repo/shared';

describe('CasesService', () => {
  let service: CasesService;

  const mockAdminClient = {
    from: jest.fn(),
  };

  const mockCaseActivitiesService = {
    createAutoActivity: jest.fn().mockResolvedValue(undefined),
  };

  // ---- User fixtures ----

  const staffUser: AuthUser = {
    id: 'staff-uuid',
    email: 'staff@arco.com',
    userType: UserType.STAFF,
    fullName: 'Staff User',
    phoneNumber: null,
  };

  const clientUser: AuthUser = {
    id: 'client-auth-uuid',
    email: 'client@example.com',
    userType: UserType.CLIENT,
    fullName: 'Test Client',
    phoneNumber: null,
    clientProfileId: 'client-profile-uuid',
  };

  const otherClient: AuthUser = {
    id: 'other-auth-uuid',
    email: 'other@example.com',
    userType: UserType.CLIENT,
    fullName: 'Other Client',
    phoneNumber: null,
    clientProfileId: 'other-profile-uuid',
  };

  const clientWithoutProfile: AuthUser = {
    id: 'no-profile-uuid',
    email: 'noprofile@example.com',
    userType: UserType.CLIENT,
    fullName: 'No Profile',
    phoneNumber: null,
  };

  // ---- Mock DB row ----

  const mockCaseRow = {
    id: 'case-uuid-1',
    case_number: 'CASE-2026-0001',
    client_profile_id: 'client-profile-uuid',
    assigned_to_id: 'attorney-profile-uuid',
    practice_area_id: 'pa-uuid',
    service_id: 'svc-uuid',
    title: 'Contract Dispute',
    description: 'Client has a contract dispute',
    status: CaseStatus.ACTIVE,
    priority: CasePriority.MEDIUM,
    case_type: 'civil',
    filing_date: '2026-03-01',
    closing_date: null,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
    client_profile: { user_profile: { full_name: 'Test Client' } },
    assigned_to: { full_name: 'Attorney Name' },
    practice_area: { name: 'Corporate Law' },
    service: { name: 'NTN Registration' },
    service_registration_id: null,
    service_registration: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasesService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
        {
          provide: CaseActivitiesService,
          useValue: mockCaseActivitiesService,
        },
      ],
    }).compile();

    service = module.get<CasesService>(CasesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // createCase
  // =========================================================================
  describe('createCase', () => {
    const createDto: CreateCaseData = {
      clientProfileId: 'client-profile-uuid',
      practiceAreaId: 'pa-uuid',
      title: 'Contract Dispute',
      description: 'Client has a contract dispute',
      priority: CasePriority.MEDIUM,
      serviceId: 'svc-uuid',
      caseType: 'civil',
      filingDate: '2026-03-01',
    };

    it('should create case successfully and log activity', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCaseRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createCase(createDto, staffUser);

      expect(mockAdminClient.from).toHaveBeenCalledWith('cases');
      expect(result.caseNumber).toBe('CASE-2026-0001');
      expect(result.title).toBe('Contract Dispute');
      expect(result.clientProfileId).toBe('client-profile-uuid');
      expect(result.status).toBe(CaseStatus.ACTIVE);

      expect(mockCaseActivitiesService.createAutoActivity).toHaveBeenCalledWith(
        'case-uuid-1',
        CaseActivityType.CASE_CREATED,
        'Case created',
        `Case "${createDto.title}" was created`,
        staffUser.id,
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      await expect(service.createCase(createDto, staffUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================================
  // getCases
  // =========================================================================
  describe('getCases', () => {
    const pagination: PaginationParams = {
      page: 1,
      limit: 20,
      sort: 'created_at',
      order: 'desc',
    };
    const filters: CaseFilters = {};

    it('should return paginated cases for staff', async () => {
      // First call: count query
      const mockCountEq = jest.fn();
      const mockCountSelect = jest.fn().mockReturnValue({
        eq: mockCountEq,
        or: jest.fn(),
      });
      // Count query resolves directly (head: true)
      mockCountSelect.mockResolvedValue({
        count: 1,
        error: null,
      });

      // Second call: data query
      const mockDataSelect = jest.fn().mockReturnValue({
        eq: jest.fn(),
        or: jest.fn(),
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: [mockCaseRow],
            error: null,
          }),
        }),
      });

      mockAdminClient.from
        .mockReturnValueOnce({ select: mockCountSelect })
        .mockReturnValueOnce({ select: mockDataSelect });

      const result = await service.getCases(pagination, filters, staffUser);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].caseNumber).toBe('CASE-2026-0001');
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should throw BadRequestException for client without profile', async () => {
      // getCases calls from('cases').select(...) twice before the role check,
      // so we need to mock both from() calls to return chainable objects
      const mockChainable = {
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      const mockCountSelect = jest.fn().mockReturnValue(mockChainable);
      const mockDataSelect = jest.fn().mockReturnValue(mockChainable);

      mockAdminClient.from
        .mockReturnValueOnce({ select: mockCountSelect })
        .mockReturnValueOnce({ select: mockDataSelect });

      await expect(
        service.getCases(pagination, filters, clientWithoutProfile),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on count query error', async () => {
      // Both from() calls happen before await, so we need to mock both
      const mockCountSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
      });
      // The count query is awaited; make the chainable resolve to error
      mockCountSelect.mockResolvedValue({
        count: null,
        error: { message: 'Count failed' },
      });

      const mockDataChainable = {
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      const mockDataSelect = jest.fn().mockReturnValue(mockDataChainable);

      mockAdminClient.from
        .mockReturnValueOnce({ select: mockCountSelect })
        .mockReturnValueOnce({ select: mockDataSelect });

      await expect(
        service.getCases(pagination, filters, staffUser),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should filter by client_profile_id for client users', async () => {
      const mockCountEq = jest.fn().mockResolvedValue({
        count: 1,
        error: null,
      });
      const mockCountSelect = jest.fn().mockReturnValue({
        eq: mockCountEq,
      });

      const mockDataEq = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: [mockCaseRow],
            error: null,
          }),
        }),
      });
      const mockDataSelect = jest.fn().mockReturnValue({
        eq: mockDataEq,
      });

      mockAdminClient.from
        .mockReturnValueOnce({ select: mockCountSelect })
        .mockReturnValueOnce({ select: mockDataSelect });

      const result = await service.getCases(pagination, filters, clientUser);

      expect(mockCountEq).toHaveBeenCalledWith(
        'client_profile_id',
        'client-profile-uuid',
      );
      expect(mockDataEq).toHaveBeenCalledWith(
        'client_profile_id',
        'client-profile-uuid',
      );
      expect(result.data).toHaveLength(1);
    });

    it('should throw InternalServerErrorException on data query error', async () => {
      // Count query succeeds
      const mockCountSelect = jest.fn().mockResolvedValue({
        count: 1,
        error: null,
      });

      // Data query fails
      const mockDataSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Data fetch failed' },
          }),
        }),
      });

      mockAdminClient.from
        .mockReturnValueOnce({ select: mockCountSelect })
        .mockReturnValueOnce({ select: mockDataSelect });

      await expect(
        service.getCases(pagination, filters, staffUser),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // =========================================================================
  // getCaseById
  // =========================================================================
  describe('getCaseById', () => {
    it('should return case for staff user', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCaseRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getCaseById('case-uuid-1', staffUser);

      expect(result.id).toBe('case-uuid-1');
      expect(result.caseNumber).toBe('CASE-2026-0001');
      expect(result.clientName).toBe('Test Client');
    });

    it('should return case for the owning client', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCaseRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getCaseById('case-uuid-1', clientUser);

      expect(result.clientProfileId).toBe('client-profile-uuid');
    });

    it('should throw ForbiddenException for another client', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCaseRow,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.getCaseById('case-uuid-1', otherClient),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when case not found', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(
        service.getCaseById('non-existent', staffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // updateCase
  // =========================================================================
  describe('updateCase', () => {
    it('should update case fields successfully', async () => {
      const updateDto: UpdateCaseData = {
        title: 'Updated Title',
        priority: CasePriority.HIGH,
      };

      const updatedRow = {
        ...mockCaseRow,
        title: 'Updated Title',
        priority: CasePriority.HIGH,
      };

      mockAdminClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedRow,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateCase(
        'case-uuid-1',
        updateDto,
        staffUser,
      );

      expect(result.title).toBe('Updated Title');
      expect(result.priority).toBe(CasePriority.HIGH);
    });

    it('should throw BadRequestException for empty payload', async () => {
      const emptyDto: UpdateCaseData = {};

      await expect(
        service.updateCase('case-uuid-1', emptyDto, staffUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when case not found', async () => {
      const updateDto: UpdateCaseData = {
        title: 'Updated Title',
      };

      mockAdminClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.updateCase('non-existent', updateDto, staffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // updateCaseStatus
  // =========================================================================
  describe('updateCaseStatus', () => {
    it('should update status and create activity', async () => {
      const statusDto: UpdateCaseStatusData = {
        status: CaseStatus.ACTIVE,
      };

      // First query: fetch current status
      // Second query: update case
      mockAdminClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { status: CaseStatus.PENDING },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockCaseRow, status: CaseStatus.ACTIVE },
                  error: null,
                }),
              }),
            }),
          }),
        });

      const result = await service.updateCaseStatus(
        'case-uuid-1',
        statusDto,
        staffUser,
      );

      expect(result.status).toBe(CaseStatus.ACTIVE);
      expect(mockCaseActivitiesService.createAutoActivity).toHaveBeenCalledWith(
        'case-uuid-1',
        CaseActivityType.STATUS_CHANGED,
        `Status changed to ${CaseStatus.ACTIVE}`,
        `Status changed from "${CaseStatus.PENDING}" to "${CaseStatus.ACTIVE}"`,
        staffUser.id,
      );
    });

    it('should auto-set closing_date when status is RESOLVED', async () => {
      const statusDto: UpdateCaseStatusData = {
        status: CaseStatus.RESOLVED,
      };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                ...mockCaseRow,
                status: CaseStatus.RESOLVED,
                closing_date: '2026-03-03',
              },
              error: null,
            }),
          }),
        }),
      });

      mockAdminClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { status: CaseStatus.ACTIVE },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: mockUpdate,
        });

      const result = await service.updateCaseStatus(
        'case-uuid-1',
        statusDto,
        staffUser,
      );

      expect(result.status).toBe(CaseStatus.RESOLVED);
      // Verify the update payload includes closing_date
      const updatePayload = (
        mockUpdate.mock.calls[0] as Record<string, unknown>[]
      )[0];
      expect(updatePayload.status).toBe(CaseStatus.RESOLVED);
      expect(updatePayload.closing_date).toBeDefined();
    });

    it('should throw NotFoundException when case not found (fetch step)', async () => {
      const statusDto: UpdateCaseStatusData = {
        status: CaseStatus.ACTIVE,
      };

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(
        service.updateCaseStatus('non-existent', statusDto, staffUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when update fails', async () => {
      const statusDto: UpdateCaseStatusData = {
        status: CaseStatus.ACTIVE,
      };

      mockAdminClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { status: CaseStatus.PENDING },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Update failed' },
                }),
              }),
            }),
          }),
        });

      await expect(
        service.updateCaseStatus('case-uuid-1', statusDto, staffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // deleteCase
  // =========================================================================
  describe('deleteCase', () => {
    it('should delete case successfully', async () => {
      mockAdminClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      await expect(service.deleteCase('case-uuid-1')).resolves.toBeUndefined();
      expect(mockAdminClient.from).toHaveBeenCalledWith('cases');
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockAdminClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      });

      await expect(service.deleteCase('case-uuid-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================================
  // assign
  // =========================================================================
  describe('assign', () => {
    it('should assign user to case and log activity', async () => {
      const assignDto: AssignToData = {
        assignedToId: 'attorney-profile-uuid',
      };

      const assignedRow = {
        ...mockCaseRow,
        assigned_to_id: 'attorney-profile-uuid',
        assigned_to: { full_name: 'Attorney Name' },
      };

      // Call 1: user_profiles — verify assignee exists and has allowed role
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_type: 'attorney' },
              error: null,
            }),
          }),
        }),
      });

      // Call 2: cases — update and return updated row
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: assignedRow,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.assign('case-uuid-1', assignDto, staffUser);

      expect(result.assignedToId).toBe('attorney-profile-uuid');
      expect(result.assignedToName).toBe('Attorney Name');
      expect(mockCaseActivitiesService.createAutoActivity).toHaveBeenCalledWith(
        'case-uuid-1',
        CaseActivityType.ATTORNEY_ASSIGNED,
        'Assigned to: Attorney Name',
        null,
        staffUser.id,
      );
    });

    it('should throw NotFoundException when case not found', async () => {
      const assignDto: AssignToData = {
        assignedToId: 'attorney-profile-uuid',
      };

      // Call 1: user_profiles — succeeds (assignee found)
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_type: 'attorney' },
              error: null,
            }),
          }),
        }),
      });

      // Call 2: cases — fails (case not found)
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.assign('non-existent', assignDto, staffUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when assignee not found', async () => {
      const assignDto: AssignToData = { assignedToId: 'non-existent-uuid' };

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(
        service.assign('case-uuid-1', assignDto, staffUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when assignee is not admin or attorney', async () => {
      const assignDto: AssignToData = { assignedToId: 'client-profile-uuid' };

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_type: 'client' },
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.assign('case-uuid-1', assignDto, staffUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================================================================
  // createCaseFromRegistration
  // =========================================================================
  describe('createCaseFromRegistration', () => {
    const overrides: CreateCaseFromRegistrationData = {};

    const mockRegistration = {
      id: 'reg-uuid',
      case_id: null,
      client_profile_id: 'client-profile-uuid',
      service_id: 'svc-uuid',
      assigned_to_id: 'attorney-profile-uuid',
      status: ServiceRegistrationStatus.PAID,
      full_name: 'John Doe',
      description_of_need: 'Need NTN registration',
      reference_number: 'SRV-2026-0001',
      service: { name: 'NTN Registration', practice_area_id: 'pa-uuid' },
    };

    it('should create case from registration successfully', async () => {
      const newCaseRow = {
        ...mockCaseRow,
        id: 'new-case-uuid',
        service_registration_id: 'reg-uuid',
        service_registration: { reference_number: 'SRV-2026-0001' },
      };

      // 1. Fetch registration
      // 2. Insert case
      // 3. Link registration (update case_id)
      // 4. Update registration status
      mockAdminClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockRegistration,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: newCaseRow,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        });

      const result = await service.createCaseFromRegistration(
        'reg-uuid',
        overrides,
        staffUser,
      );

      expect(result.id).toBe('new-case-uuid');
      expect(mockCaseActivitiesService.createAutoActivity).toHaveBeenCalledWith(
        'new-case-uuid',
        CaseActivityType.CASE_CREATED,
        'Case created from service registration',
        'Created from service registration SRV-2026-0001',
        staffUser.id,
      );
    });

    it('should throw NotFoundException when registration not found', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(
        service.createCaseFromRegistration(
          'non-existent',
          overrides,
          staffUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw CONFLICT when registration already has a case', async () => {
      const regWithCase = { ...mockRegistration, case_id: 'existing-case' };

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: regWithCase,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.createCaseFromRegistration('reg-uuid', overrides, staffUser),
      ).rejects.toThrow(HttpException);

      try {
        mockAdminClient.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: regWithCase,
                error: null,
              }),
            }),
          }),
        });
        await service.createCaseFromRegistration(
          'reg-uuid',
          overrides,
          staffUser,
        );
      } catch (e) {
        expect((e as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should throw BAD_REQUEST for invalid registration status', async () => {
      const pendingReg = {
        ...mockRegistration,
        status: ServiceRegistrationStatus.PENDING_PAYMENT,
      };

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: pendingReg,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.createCaseFromRegistration('reg-uuid', overrides, staffUser),
      ).rejects.toThrow(HttpException);

      try {
        mockAdminClient.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: pendingReg,
                error: null,
              }),
            }),
          }),
        });
        await service.createCaseFromRegistration(
          'reg-uuid',
          overrides,
          staffUser,
        );
      } catch (e) {
        expect((e as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw BAD_REQUEST when registration has no client profile', async () => {
      const regNoClient = {
        ...mockRegistration,
        client_profile_id: null,
      };

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: regNoClient,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.createCaseFromRegistration('reg-uuid', overrides, staffUser),
      ).rejects.toThrow(HttpException);

      try {
        mockAdminClient.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: regNoClient,
                error: null,
              }),
            }),
          }),
        });
        await service.createCaseFromRegistration(
          'reg-uuid',
          overrides,
          staffUser,
        );
      } catch (e) {
        expect((e as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw BAD_REQUEST when service has no practice area', async () => {
      const regNoPa = {
        ...mockRegistration,
        service: { name: 'NTN Registration', practice_area_id: null },
      };

      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: regNoPa,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.createCaseFromRegistration('reg-uuid', overrides, staffUser),
      ).rejects.toThrow(HttpException);

      try {
        mockAdminClient.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: regNoPa,
                error: null,
              }),
            }),
          }),
        });
        await service.createCaseFromRegistration(
          'reg-uuid',
          overrides,
          staffUser,
        );
      } catch (e) {
        expect((e as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should not update registration status when already IN_PROGRESS', async () => {
      const inProgressReg = {
        ...mockRegistration,
        status: ServiceRegistrationStatus.IN_PROGRESS,
      };

      const newCaseRow = {
        ...mockCaseRow,
        id: 'new-case-uuid',
        service_registration_id: 'reg-uuid',
        service_registration: { reference_number: 'SRV-2026-0001' },
      };

      // 1. Fetch registration (in_progress)
      // 2. Insert case
      // 3. Link registration (update case_id)
      // NO 4th call because status is already in_progress
      mockAdminClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: inProgressReg,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: newCaseRow,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        });

      const result = await service.createCaseFromRegistration(
        'reg-uuid',
        overrides,
        staffUser,
      );

      expect(result.id).toBe('new-case-uuid');
      // from() should have been called 3 times (not 4)
      expect(mockAdminClient.from).toHaveBeenCalledTimes(3);
    });

    it('should apply overrides when provided', async () => {
      const customOverrides: CreateCaseFromRegistrationData = {
        title: 'Custom Title',
        description: 'Custom description',
        priority: CasePriority.HIGH,
        caseType: 'corporate',
        filingDate: '2026-04-01',
      };

      const newCaseRow = {
        ...mockCaseRow,
        id: 'new-case-uuid',
        title: 'Custom Title',
        description: 'Custom description',
        priority: CasePriority.HIGH,
        case_type: 'corporate',
        filing_date: '2026-04-01',
        service_registration_id: 'reg-uuid',
        service_registration: { reference_number: 'SRV-2026-0001' },
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: newCaseRow,
            error: null,
          }),
        }),
      });

      mockAdminClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockRegistration,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({ insert: mockInsert })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        });

      const result = await service.createCaseFromRegistration(
        'reg-uuid',
        customOverrides,
        staffUser,
      );

      expect(result.title).toBe('Custom Title');
      expect(result.priority).toBe(CasePriority.HIGH);

      // Verify the insert was called with correct payload
      const insertPayload = (
        mockInsert.mock.calls[0] as Record<string, unknown>[]
      )[0];
      expect(insertPayload.title).toBe('Custom Title');
      expect(insertPayload.description).toBe('Custom description');
      expect(insertPayload.priority).toBe(CasePriority.HIGH);
      expect(insertPayload.case_type).toBe('corporate');
      expect(insertPayload.filing_date).toBe('2026-04-01');
    });
  });
});
