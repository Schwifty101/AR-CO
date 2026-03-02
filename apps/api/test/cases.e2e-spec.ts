import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { CasesModule } from '../src/cases/cases.module';
import { CasesService } from '../src/cases/cases.service';
import { CaseActivitiesService } from '../src/cases/case-activities.service';
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

/** Valid UUIDs for test data */
const CASE_ID = '660e8400-e29b-41d4-a716-446655440001';
const CLIENT_PROFILE_ID = '770e8400-e29b-41d4-a716-446655440002';
const PRACTICE_AREA_ID = '880e8400-e29b-41d4-a716-446655440003';
const ATTORNEY_ID = '990e8400-e29b-41d4-a716-446655440004';
const REGISTRATION_ID = 'aa0e8400-e29b-41d4-a716-446655440005';

/** Reusable mock case response returned by the mocked CasesService */
const mockCaseResponse = {
  id: CASE_ID,
  caseNumber: 'CASE-2026-0001',
  clientProfileId: CLIENT_PROFILE_ID,
  clientName: 'John Client',
  assignedToId: null,
  assignedToName: null,
  practiceAreaId: PRACTICE_AREA_ID,
  practiceAreaName: 'Corporate Law',
  serviceId: null,
  serviceName: null,
  title: 'Contract Dispute',
  description: 'A contract dispute case',
  status: 'open',
  priority: 'medium',
  caseType: null,
  filingDate: '2026-03-01',
  closingDate: null,
  serviceRegistrationId: null,
  serviceRegistrationNumber: null,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
};

/** Reusable mock paginated cases response */
const mockPaginatedCases = {
  data: [mockCaseResponse],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

/** Reusable mock activity response */
const mockActivityResponse = {
  id: 'bb0e8400-e29b-41d4-a716-446655440006',
  caseId: CASE_ID,
  activityType: 'note_added',
  title: 'Added a note',
  description: 'Some note description',
  createdBy: mockUser.id,
  createdByName: 'Test Admin',
  attachments: null,
  createdAt: '2026-03-01T00:00:00Z',
};

/** Reusable mock paginated activities response */
const mockPaginatedActivities = {
  data: [mockActivityResponse],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

describe('CasesController (e2e)', () => {
  let app: INestApplication<App>;

  const mockCasesService = {
    createCase: jest.fn().mockResolvedValue(mockCaseResponse),
    getCases: jest.fn().mockResolvedValue(mockPaginatedCases),
    getCaseById: jest.fn().mockResolvedValue(mockCaseResponse),
    updateCase: jest.fn().mockResolvedValue(mockCaseResponse),
    updateCaseStatus: jest.fn().mockResolvedValue(mockCaseResponse),
    deleteCase: jest.fn().mockResolvedValue(undefined),
    assign: jest.fn().mockResolvedValue(mockCaseResponse),
    createCaseFromRegistration: jest.fn().mockResolvedValue(mockCaseResponse),
  };

  const mockCaseActivitiesService = {
    getCaseActivities: jest.fn().mockResolvedValue(mockPaginatedActivities),
    addCaseActivity: jest.fn().mockResolvedValue(mockActivityResponse),
    createAutoActivity: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CasesModule],
    })
      .overrideProvider(CasesService)
      .useValue(mockCasesService)
      .overrideProvider(CaseActivitiesService)
      .useValue(mockCaseActivitiesService)
      .overrideProvider(SupabaseService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    // Register mock guards globally (mimics main.ts global guard registration).
    // The JwtAuthGuard mock sets request.user so @CurrentUser() works.
    app.useGlobalGuards(
      {
        canActivate: (context) => {
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
  // POST /api/cases — create a case
  // ──────────────────────────────────────────────
  it('POST /api/cases → 201 (create case)', async () => {
    const body = {
      clientProfileId: CLIENT_PROFILE_ID,
      practiceAreaId: PRACTICE_AREA_ID,
      title: 'Contract Dispute',
    };

    const res = await request(app.getHttpServer())
      .post('/api/cases')
      .send(body)
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(mockCaseResponse);
    expect(mockCasesService.createCase).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // GET /api/cases — list cases
  // ──────────────────────────────────────────────
  it('GET /api/cases → 200 (list cases)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/cases')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockPaginatedCases);
    expect(mockCasesService.getCases).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // GET /api/cases/:id — get case by ID
  // ──────────────────────────────────────────────
  it('GET /api/cases/:id → 200 (get case by ID)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/cases/${CASE_ID}`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockCaseResponse);
    expect(mockCasesService.getCaseById).toHaveBeenCalledWith(
      CASE_ID,
      mockUser,
    );
  });

  // ──────────────────────────────────────────────
  // PATCH /api/cases/:id — update case
  // ──────────────────────────────────────────────
  it('PATCH /api/cases/:id → 200 (update case)', async () => {
    const body = { title: 'Updated Title' };

    const res = await request(app.getHttpServer())
      .patch(`/api/cases/${CASE_ID}`)
      .send(body)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockCaseResponse);
    expect(mockCasesService.updateCase).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // PATCH /api/cases/:id/status — update case status
  // ──────────────────────────────────────────────
  it('PATCH /api/cases/:id/status → 200 (update status)', async () => {
    const body = { status: 'active' };

    const res = await request(app.getHttpServer())
      .patch(`/api/cases/${CASE_ID}/status`)
      .send(body)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockCaseResponse);
    expect(mockCasesService.updateCaseStatus).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // PATCH /api/cases/:id/assign — assign user to case
  // ──────────────────────────────────────────────
  it('PATCH /api/cases/:id/assign → 200 (assign user)', async () => {
    const body = { assignedToId: ATTORNEY_ID };

    const res = await request(app.getHttpServer())
      .patch(`/api/cases/${CASE_ID}/assign`)
      .send(body)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockCaseResponse);
    expect(mockCasesService.assign).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // DELETE /api/cases/:id — delete case
  // ──────────────────────────────────────────────
  it('DELETE /api/cases/:id → 204 (delete case)', async () => {
    await request(app.getHttpServer())
      .delete(`/api/cases/${CASE_ID}`)
      .expect(HttpStatus.NO_CONTENT);

    expect(mockCasesService.deleteCase).toHaveBeenCalledWith(CASE_ID);
  });

  // ──────────────────────────────────────────────
  // POST /api/cases/from-registration/:id — create from registration
  // ──────────────────────────────────────────────
  it('POST /api/cases/from-registration/:id → 201 (create from registration)', async () => {
    const body = { title: 'Custom Override Title', priority: 'high' };

    const res = await request(app.getHttpServer())
      .post(`/api/cases/from-registration/${REGISTRATION_ID}`)
      .send(body)
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(mockCaseResponse);
    expect(mockCasesService.createCaseFromRegistration).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // GET /api/cases/:id/activities — list activities
  // ──────────────────────────────────────────────
  it('GET /api/cases/:id/activities → 200 (list activities)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/cases/${CASE_ID}/activities`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockPaginatedActivities);
    // getCaseById is called first to verify access, then getCaseActivities
    expect(mockCasesService.getCaseById).toHaveBeenCalledTimes(1);
    expect(mockCaseActivitiesService.getCaseActivities).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // POST /api/cases/:id/activities — add activity
  // ──────────────────────────────────────────────
  it('POST /api/cases/:id/activities → 201 (add activity)', async () => {
    const body = {
      activityType: 'note_added',
      title: 'Client meeting notes',
      description: 'Discussed the contract terms',
    };

    const res = await request(app.getHttpServer())
      .post(`/api/cases/${CASE_ID}/activities`)
      .send(body)
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(mockActivityResponse);
    expect(mockCaseActivitiesService.addCaseActivity).toHaveBeenCalledTimes(1);
  });
});
