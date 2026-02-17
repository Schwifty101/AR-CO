import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { SupabaseService } from '../database/supabase.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  ComplaintStatus,
  ComplaintCategory,
  type CreateComplaintData,
  type UpdateComplaintStatusData,
  type AssignToData,
  type ComplaintFilters,
  type PaginationParams,
} from '@repo/shared';

describe('ComplaintsService', () => {
  let service: ComplaintsService;

  const mockAdminClient = {
    from: jest.fn(),
  };

  const staffUser: AuthUser = {
    id: 'staff-uuid',
    email: 'staff@arco.com',
    userType: UserType.STAFF,
    fullName: 'Staff User',
    phoneNumber: null,
  };

  const clientUser: AuthUser = {
    id: 'user-uuid-123',
    email: 'client@example.com',
    userType: UserType.CLIENT,
    fullName: 'Test Client',
    phoneNumber: null,
    clientProfileId: 'client-uuid-456',
  };

  const otherClient: AuthUser = {
    id: 'other-uuid',
    email: 'other@example.com',
    userType: UserType.CLIENT,
    fullName: 'Other Client',
    phoneNumber: null,
    clientProfileId: 'other-client-uuid',
  };

  const mockComplaintRow = {
    id: 'complaint-uuid-1',
    complaint_number: 'CMP-2026-0001',
    client_profile_id: 'client-uuid-456',
    title: 'Road Damage',
    description:
      'The road near my office has severe potholes causing accidents',
    target_organization: 'Karachi Municipal Corporation',
    location: 'Clifton, Karachi',
    category: 'infrastructure',
    evidence_urls: ['https://example.com/photo1.jpg'],
    status: 'submitted',
    assigned_to_id: null,
    staff_notes: null,
    resolution_notes: null,
    resolved_at: null,
    created_at: '2026-02-11T10:00:00Z',
    updated_at: '2026-02-11T10:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<ComplaintsService>(ComplaintsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitComplaint', () => {
    const createDto: CreateComplaintData = {
      title: 'Road Damage',
      description:
        'The road near my office has severe potholes causing accidents',
      targetOrganization: 'Karachi Municipal Corporation',
      location: 'Clifton, Karachi',
      category: ComplaintCategory.INFRASTRUCTURE,
      evidenceUrls: ['https://example.com/photo1.jpg'],
    };

    it('should create complaint successfully', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockComplaintRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.submitComplaint(clientUser, createDto);

      expect(mockAdminClient.from).toHaveBeenCalledWith('complaints');
      expect(result.complaintNumber).toBe('CMP-2026-0001');
      expect(result.title).toBe('Road Damage');
      expect(result.status).toBe('submitted');
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

      await expect(
        service.submitComplaint(clientUser, createDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw BadRequestException when client profile not found', async () => {
      const userWithoutProfile: AuthUser = {
        id: 'user-uuid-123',
        email: 'client@example.com',
        userType: UserType.CLIENT,
        fullName: 'Test Client',
        phoneNumber: null,
      };

      await expect(
        service.submitComplaint(userWithoutProfile, createDto),
      ).rejects.toThrow();
    });
  });

  describe('getComplaints', () => {
    const pagination: PaginationParams = {
      page: 1,
      limit: 10,
      sort: 'created_at',
      order: 'desc',
    };

    const filters: ComplaintFilters = {};

    it('should return all complaints for staff', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [mockComplaintRow],
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const result = await service.getComplaints(
        staffUser,
        pagination,
        filters,
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].complaintNumber).toBe('CMP-2026-0001');
      expect(result.meta.total).toBe(1);
    });

    it('should return only own complaints for client', async () => {
      const mockEq = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: [mockComplaintRow],
            error: null,
            count: 1,
          }),
        }),
      });

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      const result = await service.getComplaints(
        clientUser,
        pagination,
        filters,
      );

      expect(mockEq).toHaveBeenCalledWith(
        'client_profile_id',
        'client-uuid-456',
      );
      expect(result.data).toHaveLength(1);
    });

    it('should apply status filter', async () => {
      const filtersWithStatus: ComplaintFilters = {
        status: ComplaintStatus.UNDER_REVIEW,
      };

      const mockOrder = jest.fn().mockReturnValue({
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      });

      const mockStatusEq = jest.fn().mockReturnValue({
        order: mockOrder,
      });

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockStatusEq,
        }),
      });

      await service.getComplaints(staffUser, pagination, filtersWithStatus);

      expect(mockStatusEq).toHaveBeenCalledWith(
        'status',
        ComplaintStatus.UNDER_REVIEW,
      );
    });

    it('should apply targetOrganization filter with ilike', async () => {
      const filtersWithOrg: ComplaintFilters = {
        targetOrganization: 'Municipal',
      };

      const mockOrder = jest.fn().mockReturnValue({
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      });

      const mockIlike = jest.fn().mockReturnValue({
        order: mockOrder,
      });

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: mockIlike,
        }),
      });

      await service.getComplaints(staffUser, pagination, filtersWithOrg);

      expect(mockIlike).toHaveBeenCalledWith(
        'target_organization',
        '%Municipal%',
      );
    });
  });

  describe('getComplaintById', () => {
    it('should return complaint for staff', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockComplaintRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getComplaintById(
        'complaint-uuid-1',
        staffUser,
      );

      expect(result.complaintNumber).toBe('CMP-2026-0001');
    });

    it('should return own complaint for client', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockComplaintRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getComplaintById(
        'complaint-uuid-1',
        clientUser,
      );

      expect(result.clientProfileId).toBe('client-uuid-456');
    });

    it('should throw ForbiddenException for other client complaint', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockComplaintRow,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.getComplaintById('complaint-uuid-1', otherClient),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when not found', async () => {
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
        service.getComplaintById('non-existent-id', staffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateComplaintStatus', () => {
    it('should update status and set resolved_at for RESOLVED', async () => {
      const updateDto: UpdateComplaintStatusData = {
        status: ComplaintStatus.RESOLVED,
        staffNotes: 'Issue verified and escalated',
        resolutionNotes: 'Road repair scheduled for next week',
      };

      const resolvedComplaint = {
        ...mockComplaintRow,
        status: 'resolved',
        staff_notes: 'Issue verified and escalated',
        resolution_notes: 'Road repair scheduled for next week',
        resolved_at: '2026-02-11T12:00:00Z',
      };

      mockAdminClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: resolvedComplaint,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateComplaintStatus(
        'complaint-uuid-1',
        updateDto,
      );

      expect(result.status).toBe('resolved');
      expect(result.staffNotes).toBe('Issue verified and escalated');
      expect(result.resolutionNotes).toBe(
        'Road repair scheduled for next week',
      );
      expect(result.resolvedAt).toBe('2026-02-11T12:00:00Z');
    });

    it('should throw NotFoundException when complaint not found', async () => {
      const updateDto: UpdateComplaintStatusData = {
        status: ComplaintStatus.UNDER_REVIEW,
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
        service.updateComplaintStatus('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignComplaint', () => {
    it('should assign staff and update status to under_review', async () => {
      const assignDto: AssignToData = {
        assignedToId: 'staff-uuid-789',
      };

      // Mock fetching current complaint with 'submitted' status
      const mockFetchSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { status: ComplaintStatus.SUBMITTED },
            error: null,
          }),
        }),
      });

      const assignedComplaint = {
        ...mockComplaintRow,
        assigned_to_id: 'staff-uuid-789',
        status: 'under_review',
      };

      const mockUpdateSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: assignedComplaint,
          error: null,
        }),
      });

      mockAdminClient.from
        .mockReturnValueOnce({
          select: mockFetchSelect,
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: mockUpdateSelect,
            }),
          }),
        });

      const result = await service.assignComplaint(
        'complaint-uuid-1',
        assignDto,
      );

      expect(result.assignedToId).toBe('staff-uuid-789');
      expect(result.status).toBe('under_review');
    });

    it('should assign staff without changing status if not submitted', async () => {
      const assignDto: AssignToData = {
        assignedToId: 'staff-uuid-789',
      };

      // Mock fetching current complaint with 'under_review' status
      const mockFetchSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { status: ComplaintStatus.UNDER_REVIEW },
            error: null,
          }),
        }),
      });

      const assignedComplaint = {
        ...mockComplaintRow,
        assigned_to_id: 'staff-uuid-789',
        status: 'under_review',
      };

      const mockUpdateSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: assignedComplaint,
          error: null,
        }),
      });

      mockAdminClient.from
        .mockReturnValueOnce({
          select: mockFetchSelect,
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: mockUpdateSelect,
            }),
          }),
        });

      const result = await service.assignComplaint(
        'complaint-uuid-1',
        assignDto,
      );

      expect(result.assignedToId).toBe('staff-uuid-789');
    });

    it('should throw NotFoundException when complaint not found', async () => {
      const assignDto: AssignToData = {
        assignedToId: 'staff-uuid-789',
      };

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
        service.assignComplaint('non-existent-id', assignDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
