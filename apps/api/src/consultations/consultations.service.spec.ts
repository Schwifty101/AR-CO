import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { SupabaseService } from '../database/supabase.service';
import { LemonSqueezyService } from '../payments/lemonsqueezy.service';
import {
  ConsultationBookingStatus,
  ConsultationPaymentStatus,
  ConsultationUrgency,
} from '@repo/shared';
import { CONSULTATION_FEE_PKR } from './consultations.types';
import type {
  ConsultationRow,
  CalcomWebhookPayload,
} from './consultations.types';

describe('ConsultationsService', () => {
  let service: ConsultationsService;

  const mockAdminClient = {
    from: jest.fn(),
  };

  const mockLemonSqueezyService = {
    createOneTimeCheckout: jest.fn(),
  };

  // ---- Fixtures ----

  const mockBookingRow: ConsultationRow = {
    id: 'booking-uuid-1',
    reference_number: 'CON-2026-0001',
    full_name: 'Jane Doe',
    email: 'jane@example.com',
    phone_number: '+923001234567',
    practice_area: 'Corporate Law',
    urgency: 'high',
    issue_summary: 'Need legal advice on partnership agreement',
    relevant_dates: '2026-04-01',
    opposing_party: 'XYZ Corp',
    additional_notes: 'Urgent matter',
    consultation_fee: CONSULTATION_FEE_PKR,
    payment_status: ConsultationPaymentStatus.PENDING,
    lemonsqueezy_checkout_id: null,
    lemonsqueezy_order_id: null,
    calcom_booking_uid: null,
    calcom_booking_id: null,
    booking_date: null,
    booking_time: null,
    meeting_link: null,
    booking_status: ConsultationBookingStatus.PENDING_PAYMENT,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationsService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
        {
          provide: LemonSqueezyService,
          useValue: mockLemonSqueezyService,
        },
      ],
    }).compile();

    service = module.get<ConsultationsService>(ConsultationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // createBooking
  // =========================================================================
  describe('createBooking', () => {
    const createDto = {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phoneNumber: '+923001234567',
      practiceArea: 'Corporate Law',
      urgency: ConsultationUrgency.HIGH,
      issueSummary: 'Need legal advice on partnership agreement',
      relevantDates: '2026-04-01',
      opposingParty: 'XYZ Corp',
      additionalNotes: 'Urgent matter',
    };

    it('should create booking successfully and return mapped response', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockBookingRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createBooking(createDto);

      expect(mockAdminClient.from).toHaveBeenCalledWith(
        'consultation_bookings',
      );
      expect(result.referenceNumber).toBe('CON-2026-0001');
      expect(result.fullName).toBe('Jane Doe');
      expect(result.email).toBe('jane@example.com');
      expect(result.consultationFee).toBe(CONSULTATION_FEE_PKR);
      expect(result.bookingStatus).toBe(
        ConsultationBookingStatus.PENDING_PAYMENT,
      );
      expect(result.paymentStatus).toBe(ConsultationPaymentStatus.PENDING);
    });

    it('should throw BadRequestException on insert failure', async () => {
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

      await expect(service.createBooking(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // =========================================================================
  // getBookingStatus
  // =========================================================================
  describe('getBookingStatus', () => {
    const statusQuery = {
      referenceNumber: 'CON-2026-0001',
      email: 'jane@example.com',
    };

    it('should return status for valid reference number and email', async () => {
      const statusRow = {
        reference_number: 'CON-2026-0001',
        booking_status: ConsultationBookingStatus.BOOKED,
        payment_status: ConsultationPaymentStatus.PAID,
        booking_date: '2026-03-15',
        booking_time: '10:00',
        meeting_link: 'https://meet.google.com/abc-def',
        created_at: '2026-03-01T10:00:00Z',
      };

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: statusRow,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.getBookingStatus(statusQuery);

      expect(result.referenceNumber).toBe('CON-2026-0001');
      expect(result.bookingStatus).toBe(ConsultationBookingStatus.BOOKED);
      expect(result.paymentStatus).toBe(ConsultationPaymentStatus.PAID);
      expect(result.bookingDate).toBe('2026-03-15');
      expect(result.bookingTime).toBe('10:00');
      expect(result.meetingLink).toBe('https://meet.google.com/abc-def');
    });

    it('should throw NotFoundException for invalid reference or email', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await expect(service.getBookingStatus(statusQuery)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================================================================
  // getMyConsultations
  // =========================================================================
  describe('getMyConsultations', () => {
    it('should return consultations filtered by email, paginated', async () => {
      // First call: count query
      const mockCountChain = {
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockResolvedValue({
            count: 2,
            error: null,
          }),
        }),
      };

      // Second call: data query
      const mockDataChain = {
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [
                  mockBookingRow,
                  {
                    ...mockBookingRow,
                    id: 'booking-uuid-2',
                    reference_number: 'CON-2026-0002',
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      };

      let callCount = 0;
      mockAdminClient.from.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? mockCountChain : mockDataChain;
      });

      const result = await service.getMyConsultations('jane@example.com', {
        page: 1,
        limit: 10,
        sort: 'created_at',
        order: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
      expect(result.data[0].referenceNumber).toBe('CON-2026-0001');
    });
  });

  // =========================================================================
  // getBookings (staff list)
  // =========================================================================
  describe('getBookings', () => {
    it('should return paginated bookings', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [mockBookingRow],
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const result = await service.getBookings({
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc',
      });

      expect(mockAdminClient.from).toHaveBeenCalledWith(
        'consultation_bookings',
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.data[0].referenceNumber).toBe('CON-2026-0001');
    });

    it('should apply filters (bookingStatus, paymentStatus, practiceArea)', async () => {
      const eqMock = jest.fn();
      // Each .eq() returns the query builder, so we chain them
      const queryBuilder = {
        eq: eqMock,
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: [mockBookingRow],
            error: null,
            count: 1,
          }),
        }),
      };
      // Each eq call returns the same builder for chaining
      eqMock.mockReturnValue(queryBuilder);

      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(queryBuilder),
      });

      const result = await service.getBookings(
        { page: 1, limit: 20, sort: 'created_at', order: 'desc' },
        {
          bookingStatus: ConsultationBookingStatus.BOOKED,
          paymentStatus: ConsultationPaymentStatus.PAID,
          practiceArea: 'Corporate Law',
        },
      );

      expect(eqMock).toHaveBeenCalledWith(
        'booking_status',
        ConsultationBookingStatus.BOOKED,
      );
      expect(eqMock).toHaveBeenCalledWith(
        'payment_status',
        ConsultationPaymentStatus.PAID,
      );
      expect(eqMock).toHaveBeenCalledWith('practice_area', 'Corporate Law');
      expect(result.data).toHaveLength(1);
    });
  });

  // =========================================================================
  // getBookingById
  // =========================================================================
  describe('getBookingById', () => {
    it('should return booking by ID', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockBookingRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getBookingById('booking-uuid-1');

      expect(result.id).toBe('booking-uuid-1');
      expect(result.referenceNumber).toBe('CON-2026-0001');
      expect(result.fullName).toBe('Jane Doe');
    });

    it('should throw NotFoundException for missing booking', async () => {
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

      await expect(service.getBookingById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================================================================
  // cancelBooking
  // =========================================================================
  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      const cancelledRow: ConsultationRow = {
        ...mockBookingRow,
        booking_status: ConsultationBookingStatus.CANCELLED,
      };

      let callCount = 0;
      mockAdminClient.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: fetch booking status
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    booking_status: ConsultationBookingStatus.PENDING_PAYMENT,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        // Second call: update booking
        return {
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: cancelledRow,
                  error: null,
                }),
              }),
            }),
          }),
        };
      });

      const result = await service.cancelBooking('booking-uuid-1');

      expect(result.bookingStatus).toBe(ConsultationBookingStatus.CANCELLED);
    });

    it('should throw ConflictException for already completed booking', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { booking_status: ConsultationBookingStatus.COMPLETED },
              error: null,
            }),
          }),
        }),
      });

      await expect(service.cancelBooking('booking-uuid-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException for already cancelled booking', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { booking_status: ConsultationBookingStatus.CANCELLED },
              error: null,
            }),
          }),
        }),
      });

      await expect(service.cancelBooking('booking-uuid-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // =========================================================================
  // handleCalcomWebhook
  // =========================================================================
  describe('handleCalcomWebhook', () => {
    it('should handle BOOKING_CREATED event and link calcom_booking_uid', async () => {
      const paymentConfirmedRow: ConsultationRow = {
        ...mockBookingRow,
        payment_status: ConsultationPaymentStatus.PAID,
        booking_status: ConsultationBookingStatus.PAYMENT_CONFIRMED,
      };

      const updatedRow: ConsultationRow = {
        ...paymentConfirmedRow,
        calcom_booking_uid: 'calcom-uid-123',
        calcom_booking_id: 12345,
        booking_date: '2026-03-15',
        booking_time: '10:00',
        meeting_link: 'https://meet.google.com/abc-def',
        booking_status: ConsultationBookingStatus.BOOKED,
      };

      let callCount = 0;
      mockAdminClient.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: match by reference_number (maybeSingle)
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: paymentConfirmedRow,
                  error: null,
                }),
              }),
            }),
          };
        }
        // Second call: update with calcom data
        return {
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
        };
      });

      const payload: CalcomWebhookPayload = {
        triggerEvent: 'BOOKING_CREATED',
        payload: {
          uid: 'calcom-uid-123',
          id: 12345,
          startTime: '2026-03-15T10:00:00Z',
          metadata: {
            referenceNumber: 'CON-2026-0001',
            videoCallUrl: 'https://meet.google.com/abc-def',
          },
          responses: { email: { value: 'jane@example.com' } },
        },
      };

      const result = await service.handleCalcomWebhook(payload);

      expect(result).not.toBeNull();
      expect(result!.calcomBookingUid).toBe('calcom-uid-123');
      expect(result!.bookingStatus).toBe(ConsultationBookingStatus.BOOKED);
      expect(result!.bookingDate).toBe('2026-03-15');
      expect(result!.meetingLink).toBe('https://meet.google.com/abc-def');
    });

    it('should ignore non-BOOKING_CREATED events and return null', async () => {
      const payload: CalcomWebhookPayload = {
        triggerEvent: 'BOOKING_CANCELLED',
        payload: {
          uid: 'calcom-uid-123',
          id: 12345,
          startTime: '2026-03-15T10:00:00Z',
        },
      };

      const result = await service.handleCalcomWebhook(payload);

      expect(result).toBeNull();
      expect(mockAdminClient.from).not.toHaveBeenCalled();
    });

    it('should return null when no matching booking found', async () => {
      // Strategy 1 returns null (no match by referenceNumber)
      const strategy1Chain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      };

      // Strategy 2 returns null (no match by email + payment_confirmed)
      const strategy2Chain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      data: null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      let callCount = 0;
      mockAdminClient.from.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? strategy1Chain : strategy2Chain;
      });

      const payload: CalcomWebhookPayload = {
        triggerEvent: 'BOOKING_CREATED',
        payload: {
          uid: 'calcom-uid-999',
          id: 99999,
          startTime: '2026-03-15T10:00:00Z',
          metadata: { referenceNumber: 'CON-NONEXISTENT' },
          responses: { email: { value: 'unknown@example.com' } },
        },
      };

      const result = await service.handleCalcomWebhook(payload);

      expect(result).toBeNull();
    });
  });
});
