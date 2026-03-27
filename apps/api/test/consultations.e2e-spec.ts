import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConsultationsModule } from '../src/consultations/consultations.module';
import { ConsultationsService } from '../src/consultations/consultations.service';
import { LemonSqueezyService } from '../src/payments/lemonsqueezy.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { SupabaseService } from '../src/database/supabase.service';
import { UserType } from '../src/common/enums/user-type.enum';
import type { AuthUser } from '../src/common/interfaces/auth-user.interface';

/**
 * Mock AuthUser used across all E2E tests.
 * Represents an admin user so all role-restricted endpoints are accessible.
 */
const mockUser: AuthUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@arco.com',
  userType: UserType.ADMIN,
  fullName: 'Test Admin',
  phoneNumber: null,
};

/** Valid UUID for test booking */
const BOOKING_ID = '660e8400-e29b-41d4-a716-446655440001';

/** Reusable mock consultation response returned by the mocked ConsultationsService */
const mockConsultationResponse = {
  id: BOOKING_ID,
  referenceNumber: 'CON-2026-0001',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phoneNumber: '+923001234567',
  practiceArea: 'Corporate Law',
  urgency: 'high',
  issueSummary: 'Need legal advice on partnership agreement',
  relevantDates: null,
  opposingParty: null,
  additionalNotes: null,
  consultationFee: 50000,
  paymentStatus: 'pending',
  lemonsqueezyCheckoutId: null,
  lemonsqueezyOrderId: null,
  calcomBookingUid: null,
  calcomBookingId: null,
  bookingDate: null,
  bookingTime: null,
  meetingLink: null,
  bookingStatus: 'pending_payment',
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
};

/** Reusable mock paginated consultations response */
const mockPaginatedConsultations = {
  data: [mockConsultationResponse],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

/** Reusable mock status response */
const mockStatusResponse = {
  referenceNumber: 'CON-2026-0001',
  bookingStatus: 'pending_payment',
  paymentStatus: 'pending',
  bookingDate: null,
  bookingTime: null,
  meetingLink: null,
  createdAt: '2026-03-01T00:00:00Z',
};

describe('ConsultationsController (e2e)', () => {
  let app: INestApplication<App>;

  const mockConsultationsService = {
    createBooking: jest.fn().mockResolvedValue(mockConsultationResponse),
    getBookingStatus: jest.fn().mockResolvedValue(mockStatusResponse),
    handleCalcomWebhook: jest.fn().mockResolvedValue(null),
    getBookings: jest.fn().mockResolvedValue(mockPaginatedConsultations),
    getMyConsultations: jest.fn().mockResolvedValue(mockPaginatedConsultations),
    getBookingById: jest.fn().mockResolvedValue(mockConsultationResponse),
    cancelBooking: jest.fn().mockResolvedValue({
      ...mockConsultationResponse,
      bookingStatus: 'cancelled',
    }),
    initiatePayment: jest.fn().mockResolvedValue({ checkoutUrl: 'https://checkout.lemonsqueezy.com/test' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConsultationsModule,
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
      ],
    })
      .overrideProvider(ConsultationsService)
      .useValue(mockConsultationsService)
      .overrideProvider(LemonSqueezyService)
      .useValue({})
      .overrideProvider(SupabaseService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    // Register mock guards globally (mimics main.ts global guard registration).
    // The JwtAuthGuard mock sets request.user so @CurrentUser() works.
    app.useGlobalGuards(
      {
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> };
        }) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      } as unknown as JwtAuthGuard,
      { canActivate: () => true } as unknown as RolesGuard,
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // POST /api/consultations — create booking (public)
  // ──────────────────────────────────────────────
  it('POST /api/consultations -> 201 (guest create booking)', async () => {
    const body = {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phoneNumber: '+923001234567',
      practiceArea: 'Corporate Law',
      urgency: 'high',
      issueSummary: 'Need legal advice on partnership agreement',
    };

    const res = await request(app.getHttpServer())
      .post('/api/consultations')
      .send(body)
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(mockConsultationResponse);
    expect(mockConsultationsService.createBooking).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // GET /api/consultations/status — check status (public)
  // ──────────────────────────────────────────────
  it('GET /api/consultations/status -> 200 (guest check status)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/consultations/status')
      .query({
        referenceNumber: 'CON-2026-0001',
        email: 'jane@example.com',
      })
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockStatusResponse);
    expect(mockConsultationsService.getBookingStatus).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // POST /api/consultations/webhook/calcom — Cal.com webhook (public)
  // ──────────────────────────────────────────────
  it('POST /api/consultations/webhook/calcom -> 200 (Cal.com webhook)', async () => {
    const payload = {
      triggerEvent: 'BOOKING_CREATED',
      payload: {
        uid: 'calcom-uid-123',
        id: 12345,
        startTime: '2026-03-15T10:00:00Z',
        metadata: { referenceNumber: 'CON-2026-0001' },
        responses: { email: { value: 'jane@example.com' } },
      },
    };

    const res = await request(app.getHttpServer())
      .post('/api/consultations/webhook/calcom')
      .send(payload)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({ received: true });
    expect(mockConsultationsService.handleCalcomWebhook).toHaveBeenCalledTimes(
      1,
    );
  });

  // ──────────────────────────────────────────────
  // GET /api/consultations — list bookings (staff, protected)
  // ──────────────────────────────────────────────
  it('GET /api/consultations -> 200 (staff list bookings)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/consultations')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockPaginatedConsultations);
    expect(mockConsultationsService.getBookings).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // GET /api/consultations/my — client consultations (protected)
  // ──────────────────────────────────────────────
  it('GET /api/consultations/my -> 200 (client my consultations)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/consultations/my')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockPaginatedConsultations);
    expect(mockConsultationsService.getMyConsultations).toHaveBeenCalledTimes(
      1,
    );
    expect(mockConsultationsService.getMyConsultations).toHaveBeenCalledWith(
      mockUser.email,
      expect.any(Object),
    );
  });

  // ──────────────────────────────────────────────
  // GET /api/consultations/:id — get booking by ID (staff, protected)
  // ──────────────────────────────────────────────
  it('GET /api/consultations/:id -> 200 (staff view booking)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/consultations/${BOOKING_ID}`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockConsultationResponse);
    expect(mockConsultationsService.getBookingById).toHaveBeenCalledWith(
      BOOKING_ID,
    );
  });

  // ──────────────────────────────────────────────
  // PATCH /api/consultations/:id/cancel — cancel booking (staff, protected)
  // ──────────────────────────────────────────────
  it('PATCH /api/consultations/:id/cancel -> 200 (staff cancel booking)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/consultations/${BOOKING_ID}/cancel`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      expect.objectContaining({ bookingStatus: 'cancelled' }),
    );
    expect(mockConsultationsService.cancelBooking).toHaveBeenCalledWith(
      BOOKING_ID,
    );
  });
});
