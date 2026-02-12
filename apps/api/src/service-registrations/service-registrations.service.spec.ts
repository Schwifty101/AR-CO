import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ServiceRegistrationsService } from './service-registrations.service';
import { SupabaseService } from '../database/supabase.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  ServiceRegistrationStatus,
  ServiceRegistrationPaymentStatus,
  type CreateServiceRegistrationData,
  type GuestStatusCheckData,
  type UpdateRegistrationStatusData,
  type PaginationParams,
} from '@repo/shared';

describe('ServiceRegistrationsService', () => {
  let service: ServiceRegistrationsService;

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

  const mockServiceRow = {
    id: 'service-uuid-123',
    name: 'SECP Company Registration',
    registration_fee: 50000,
    is_active: true,
  };

  const mockRegistrationRow = {
    id: 'registration-uuid-1',
    reference_number: 'REG-2026-0001',
    service_id: 'service-uuid-123',
    full_name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    phone_number: '+923001234567',
    cnic: '42101-1234567-1',
    address: 'Block 5, Gulshan-e-Iqbal, Karachi',
    description_of_need: 'Need SECP company registration',
    payment_status: ServiceRegistrationPaymentStatus.PENDING,
    safepay_tracker_id: null,
    safepay_transaction_id: null,
    status: ServiceRegistrationStatus.PENDING_PAYMENT,
    client_profile_id: null,
    assigned_staff_id: null,
    staff_notes: null,
    created_at: '2026-02-11T10:00:00Z',
    updated_at: '2026-02-11T10:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRegistrationsService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<ServiceRegistrationsService>(
      ServiceRegistrationsService,
    );

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRegistration', () => {
    const createDto: CreateServiceRegistrationData = {
      serviceId: 'service-uuid-123',
      fullName: 'Ahmed Khan',
      email: 'ahmed@example.com',
      phoneNumber: '+923001234567',
      cnic: '42101-1234567-1',
      address: 'Block 5, Gulshan-e-Iqbal, Karachi',
      descriptionOfNeed: 'Need SECP company registration',
    };

    it('should create registration when service is active', async () => {
      // Mock service lookup
      const mockServiceSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockServiceRow,
            error: null,
          }),
        }),
      });

      // Mock registration insert
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockRegistrationRow,
            error: null,
          }),
        }),
      });

      mockAdminClient.from
        .mockReturnValueOnce({
          select: mockServiceSelect,
        })
        .mockReturnValueOnce({
          insert: mockInsert,
        });

      const result = await service.createRegistration(createDto);

      expect(mockAdminClient.from).toHaveBeenCalledWith('services');
      expect(mockAdminClient.from).toHaveBeenCalledWith(
        'service_registrations',
      );
      expect(result.referenceNumber).toBe('REG-2026-0001');
      expect(result.fullName).toBe('Ahmed Khan');
      expect(result.status).toBe(ServiceRegistrationStatus.PENDING_PAYMENT);
    });

    it('should throw NotFoundException when service is inactive', async () => {
      const inactiveService = { ...mockServiceRow, is_active: false };

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: inactiveService,
              error: null,
            }),
          }),
        }),
      });

      await expect(service.createRegistration(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when service does not exist', async () => {
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

      await expect(service.createRegistration(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Mock service lookup succeeds
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockServiceRow,
              error: null,
            }),
          }),
        }),
      });

      // Mock insert fails
      mockAdminClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      await expect(service.createRegistration(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getRegistrationStatus', () => {
    const statusDto: GuestStatusCheckData = {
      referenceNumber: 'REG-2026-0001',
      email: 'ahmed@example.com',
    };

    it('should return status when reference and email match', async () => {
      const mockStatusRow = {
        reference_number: 'REG-2026-0001',
        status: ServiceRegistrationStatus.IN_PROGRESS,
        payment_status: ServiceRegistrationPaymentStatus.PAID,
        created_at: '2026-02-11T10:00:00Z',
      };

      // Need to chain two .eq() calls
      const mockEq2 = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockStatusRow,
          error: null,
        }),
      });

      const mockEq1 = jest.fn().mockReturnValue({
        eq: mockEq2,
      });

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq1,
        }),
      });

      const result = await service.getRegistrationStatus(statusDto);

      expect(result.referenceNumber).toBe('REG-2026-0001');
      expect(result.status).toBe(ServiceRegistrationStatus.IN_PROGRESS);
      expect(result.paymentStatus).toBe(ServiceRegistrationPaymentStatus.PAID);
    });

    it('should throw NotFoundException when email does not match', async () => {
      // Need to chain two .eq() calls
      const mockEq2 = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const mockEq1 = jest.fn().mockReturnValue({
        eq: mockEq2,
      });

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq1,
        }),
      });

      await expect(service.getRegistrationStatus(statusDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRegistrations', () => {
    const pagination: PaginationParams = {
      page: 1,
      limit: 10,
      sort: 'created_at',
      order: 'desc',
    };

    it('should return all registrations for staff', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [mockRegistrationRow],
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const result = await service.getRegistrations(staffUser, pagination);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].referenceNumber).toBe('REG-2026-0001');
      expect(result.meta.total).toBe(1);
    });

    it('should return only own registrations for client', async () => {
      const clientRegistration = {
        ...mockRegistrationRow,
        client_profile_id: 'client-uuid-456',
      };

      const mockEq = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: [clientRegistration],
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

      const result = await service.getRegistrations(clientUser, pagination);

      expect(mockEq).toHaveBeenCalledWith(
        'client_profile_id',
        'client-uuid-456',
      );
      expect(result.data).toHaveLength(1);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
              count: 0,
            }),
          }),
        }),
      });

      await expect(
        service.getRegistrations(staffUser, pagination),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getRegistrationById', () => {
    it('should return registration for staff', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockRegistrationRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getRegistrationById(
        'registration-uuid-1',
        staffUser,
      );

      expect(result.referenceNumber).toBe('REG-2026-0001');
    });

    it('should return own registration for client', async () => {
      const clientRegistration = {
        ...mockRegistrationRow,
        client_profile_id: 'client-uuid-456',
      };

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: clientRegistration,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getRegistrationById(
        'registration-uuid-1',
        clientUser,
      );

      expect(result.clientProfileId).toBe('client-uuid-456');
    });

    it('should throw ForbiddenException for other client registration', async () => {
      const clientRegistration = {
        ...mockRegistrationRow,
        client_profile_id: 'client-uuid-456',
      };

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: clientRegistration,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.getRegistrationById('registration-uuid-1', otherClient),
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
        service.getRegistrationById('non-existent-id', staffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRegistrationStatus', () => {
    it('should update status and staff notes', async () => {
      const updateDto: UpdateRegistrationStatusData = {
        status: ServiceRegistrationStatus.COMPLETED,
        staffNotes: 'Certificate issued and emailed',
      };

      const completedRegistration = {
        ...mockRegistrationRow,
        status: ServiceRegistrationStatus.COMPLETED,
        staff_notes: 'Certificate issued and emailed',
      };

      mockAdminClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: completedRegistration,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateRegistrationStatus(
        'registration-uuid-1',
        updateDto,
      );

      expect(result.status).toBe(ServiceRegistrationStatus.COMPLETED);
      expect(result.staffNotes).toBe('Certificate issued and emailed');
    });

    it('should throw NotFoundException when registration not found', async () => {
      const updateDto: UpdateRegistrationStatusData = {
        status: ServiceRegistrationStatus.IN_PROGRESS,
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
        service.updateRegistrationStatus('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignRegistration', () => {
    it('should assign staff and update status to in_progress from pending_payment', async () => {
      // Mock fetching current registration with 'pending_payment' status
      const mockFetchSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              status: ServiceRegistrationStatus.PENDING_PAYMENT,
            },
            error: null,
          }),
        }),
      });

      const assignedRegistration = {
        ...mockRegistrationRow,
        assigned_staff_id: 'staff-uuid-789',
        status: ServiceRegistrationStatus.IN_PROGRESS,
      };

      const mockUpdateSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: assignedRegistration,
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

      const result = await service.assignRegistration(
        'registration-uuid-1',
        'staff-uuid-789',
      );

      expect(result.assignedStaffId).toBe('staff-uuid-789');
      expect(result.status).toBe(ServiceRegistrationStatus.IN_PROGRESS);
    });

    it('should assign staff and update status to in_progress from paid', async () => {
      // Mock fetching current registration with 'paid' status
      const mockFetchSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              status: ServiceRegistrationStatus.PAID,
            },
            error: null,
          }),
        }),
      });

      const assignedRegistration = {
        ...mockRegistrationRow,
        assigned_staff_id: 'staff-uuid-789',
        status: ServiceRegistrationStatus.IN_PROGRESS,
      };

      const mockUpdateSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: assignedRegistration,
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

      const result = await service.assignRegistration(
        'registration-uuid-1',
        'staff-uuid-789',
      );

      expect(result.assignedStaffId).toBe('staff-uuid-789');
      expect(result.status).toBe(ServiceRegistrationStatus.IN_PROGRESS);
    });

    it('should assign staff without changing status if already in_progress', async () => {
      // Mock fetching current registration with 'in_progress' status
      const mockFetchSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              status: ServiceRegistrationStatus.IN_PROGRESS,
            },
            error: null,
          }),
        }),
      });

      const assignedRegistration = {
        ...mockRegistrationRow,
        assigned_staff_id: 'staff-uuid-789',
        status: ServiceRegistrationStatus.IN_PROGRESS,
      };

      const mockUpdateSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: assignedRegistration,
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

      const result = await service.assignRegistration(
        'registration-uuid-1',
        'staff-uuid-789',
      );

      expect(result.assignedStaffId).toBe('staff-uuid-789');
    });

    it('should throw NotFoundException when registration not found', async () => {
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
        service.assignRegistration('non-existent-id', 'staff-uuid-789'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
