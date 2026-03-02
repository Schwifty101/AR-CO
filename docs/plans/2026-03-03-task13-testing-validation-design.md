# HEAD TASK 13: Testing & Validation — Design Document

**Date:** 2026-03-03
**Status:** Approved
**Approach:** Comprehensive Mock-Based Testing (unit + e2e)

---

## Scope Decisions

| Subtask | Decision | Reason |
|---------|----------|--------|
| 13.1.1 LemonSqueezyService | **Skip** | Not implemented yet |
| 13.1.2 ConsultationsService | **Partial** | Test non-payment methods only (Safepay code, skip payment) |
| 13.1.3 SubscriptionsService | **Skip** | All methods depend on Safepay |
| 13.1.4 ServiceRegistrationsService | **Already done** | Existing spec file |
| 13.1.5 CasesService | **Full coverage** | No tests exist |
| 13.1.6 InvoicesService | **Skip** | Module doesn't exist |
| 13.2 Integration Tests | **E2E via supertest** | Controller-level with mocked providers |
| 13.3 RLS Policy Tests | **Deferred** | Requires live Supabase; covered by Task 14 |
| 13.4 API Endpoint Tests | **Covered via E2E** | Merged into 13.2 e2e tests |
| Bonus: DashboardService | **Full coverage** | Has no tests |
| Bonus: CaseActivitiesService | **Full coverage** | Has no tests |

---

## Batch & Module Structure

### Batch 1: Cases Module (Unit Tests)

**Module 1A: `cases.service.spec.ts`** (~15 tests)

| Test | Method | Asserts |
|------|--------|---------|
| should create a case successfully | `createCase` | Returns mapped CaseResponse, calls caseActivitiesService.createAutoActivity |
| should throw InternalServerErrorException on create failure | `createCase` | DB insert error → 500 |
| should return paginated cases for staff | `getCases` | Staff user sees all cases, correct meta |
| should return only own cases for client | `getCases` | Client user filtered by clientProfileId |
| should apply status/priority/search filters | `getCases` | Filter chains applied to query |
| should throw BadRequestException for client without profile | `getCases` | Missing clientProfileId → 400 |
| should throw InternalServerErrorException on count failure | `getCases` | Count query error → 500 |
| should return case by ID for staff | `getCaseById` | Returns mapped case |
| should throw NotFoundException when case not found | `getCaseById` | DB returns null → 404 |
| should throw ForbiddenException for other client's case | `getCaseById` | Client accessing another's case → 403 |
| should update case fields | `updateCase` | Returns updated case |
| should throw BadRequestException when no fields provided | `updateCase` | Empty payload → 400 |
| should update status and auto-set closing_date for RESOLVED | `updateCaseStatus` | closing_date set, activity logged |
| should delete case successfully | `deleteCase` | No error thrown |
| should assign user to case with activity logging | `assign` | assigned_to_id updated, activity created |
| should create case from registration successfully | `createCaseFromRegistration` | Links registration, transitions status |
| should throw conflict when registration already has case | `createCaseFromRegistration` | case_id not null → 409 |
| should throw when registration has invalid status | `createCaseFromRegistration` | Status not paid/in_progress → 400 |

**Module 1B: `case-activities.service.spec.ts`** (~6 tests)

| Test | Method | Asserts |
|------|--------|---------|
| should return paginated activities | `getCaseActivities` | Correct data + meta |
| should throw InternalServerErrorException on DB error | `getCaseActivities` | Query error → 500 |
| should add activity entry | `addCaseActivity` | Returns mapped activity |
| should throw InternalServerErrorException on insert error | `addCaseActivity` | Insert fails → 500 |
| should create auto-activity without throwing on DB error | `createAutoActivity` | Logs warning, no throw |
| should create auto-activity without throwing on exception | `createAutoActivity` | Catches exception, no throw |

---

### Batch 2: Dashboard Module (Unit Tests)

**Module 2A: `dashboard.service.spec.ts`** (~8 tests)

| Test | Method | Asserts |
|------|--------|---------|
| should return admin stats with correct counts | `getAdminStats` | totalClients, activeCases, pendingAppointments |
| should return 0 for admin stats on DB errors | `getAdminStats` | Errors logged, returns 0 values |
| should return client stats for given profile | `getClientStats` | myCases, upcomingAppointments, pendingInvoices |
| should return 0 for client stats on DB errors | `getClientStats` | Errors logged, returns 0 values |
| should return analytics stats | `getAnalyticsStats` | activeSubscribers, openComplaints, pendingRegistrations |
| should return recent activities with user names | `getRecentActivities` | Maps snake_case to camelCase, includes userName |
| should return empty array on activity fetch error | `getRecentActivities` | DB error → [] |
| should compute case analytics with resolution rate | `getCaseAnalytics` | byStatus, byPriority, resolutionRate, avgResolutionDays |

---

### Batch 3: Consultations Module (Unit Tests — Non-Payment Only)

**Module 3A: `consultations.service.spec.ts`** (~10 tests)

| Test | Method | Asserts |
|------|--------|---------|
| should create booking successfully | `createBooking` | Returns mapped response with reference_number |
| should throw BadRequestException on create failure | `createBooking` | DB insert error → 400 |
| should return booking status for valid ref + email | `getBookingStatus` | Returns minimal status info |
| should throw NotFoundException for invalid ref/email | `getBookingStatus` | No match → 404 |
| should return my consultations by email | `getMyConsultations` | Filtered by email, paginated |
| should return paginated bookings for staff | `getBookings` | Correct data + meta |
| should apply filters to bookings list | `getBookings` | bookingStatus, paymentStatus, practiceArea filters |
| should return booking by ID | `getBookingById` | Returns full booking detail |
| should throw NotFoundException for missing booking | `getBookingById` | Not found → 404 |
| should cancel booking successfully | `cancelBooking` | Status set to cancelled |
| should throw ConflictException for completed/cancelled booking | `cancelBooking` | Already terminal → 409 |
| should handle Cal.com BOOKING_CREATED webhook | `handleCalcomWebhook` | Links calcom_booking_uid, updates status to booked |
| should ignore non-BOOKING_CREATED events | `handleCalcomWebhook` | Returns null |
| should return null when no matching booking found | `handleCalcomWebhook` | No match → null |

---

### Batch 4: E2E Tests — Cases Endpoints

**Module 4A: `test/cases.e2e-spec.ts`** (~10 tests)

E2E infrastructure: Override `JwtAuthGuard` (always pass with mock user), override `RolesGuard` (always pass), mock `CasesService` and `CaseActivitiesService`.

| Test | Endpoint | Asserts |
|------|----------|---------|
| POST /api/cases → 201 | Create case | Service called, returns case |
| GET /api/cases → 200 | List cases | Service called with pagination |
| GET /api/cases/:id → 200 | Get case | Service called with ID |
| PATCH /api/cases/:id → 200 | Update case | Service called with body |
| PATCH /api/cases/:id/status → 200 | Update status | Service called with status |
| PATCH /api/cases/:id/assign → 200 | Assign user | Service called with assignedToId |
| DELETE /api/cases/:id → 204 | Delete case | Service called, no content |
| POST /api/cases/from-registration/:id → 201 | Create from registration | Service called with registrationId |
| GET /api/cases/:id/activities → 200 | List activities | Both services called |
| POST /api/cases/:id/activities → 201 | Add activity | Activity service called |

---

### Batch 5: E2E Tests — Auth Endpoints

**Module 5A: `test/auth.e2e-spec.ts`** (~6 tests)

Override `JwtAuthGuard` for protected routes, mock `AuthService`.

| Test | Endpoint | Asserts |
|------|----------|---------|
| POST /api/auth/signup → 201 | Signup | Service called with body |
| POST /api/auth/signup → 400 | Signup validation error | Missing required fields |
| POST /api/auth/signin → 200 | Signin | Service called, returns tokens |
| POST /api/auth/oauth/callback → 200 | OAuth callback | Service called |
| POST /api/auth/refresh → 200 | Token refresh | Service called |
| POST /api/auth/password-reset → 200 | Password reset | Returns generic message |

---

### Batch 6: E2E Tests — Consultations Endpoints (Non-Payment)

**Module 6A: `test/consultations.e2e-spec.ts`** (~7 tests)

Override guards, mock `ConsultationsService`. Skip payment endpoints (:id/pay, :id/confirm-payment).

| Test | Endpoint | Asserts |
|------|----------|---------|
| POST /api/consultations → 201 | Guest create booking | Service called, public route |
| GET /api/consultations/status → 200 | Guest check status | Service called with query params |
| POST /api/consultations/webhook/calcom → 200 | Cal.com webhook | Returns { received: true } |
| GET /api/consultations → 200 | Staff list bookings | Service called with pagination |
| GET /api/consultations/my → 200 | Client my consultations | Service called with user email |
| GET /api/consultations/:id → 200 | Staff view booking | Service called with ID |
| PATCH /api/consultations/:id/cancel → 200 | Staff cancel | Service called with ID |

---

## Test Pattern Convention

All unit tests follow the established pattern from `auth.service.spec.ts`:

```typescript
const mockAdminClient = { from: jest.fn(), auth: { ... } };

function mockSelectEqSingle(data, error = null) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data, error }),
      }),
    }),
  };
}

const module = await Test.createTestingModule({
  providers: [
    ServiceUnderTest,
    { provide: SupabaseService, useValue: {
      getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
    }},
    // Mock dependent services
  ],
}).compile();
```

All E2E tests follow this pattern:

```typescript
const app = await Test.createTestingModule({
  imports: [FeatureModule],
})
  .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
  .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
  .overrideProvider(ServiceUnderTest).useValue({ method: jest.fn() })
  .compile();

const server = app.getHttpServer();
await request(server).post('/api/endpoint').send(body).expect(201);
```

---

## Execution Order

1. **Batch 1** → Cases unit tests (highest priority, 13.1.5)
2. **Batch 2** → Dashboard unit tests (bonus coverage)
3. **Batch 3** → Consultations unit tests (non-payment, 13.1.2 partial)
4. **Batch 4** → Cases e2e tests (13.2.5, 13.4)
5. **Batch 5** → Auth e2e tests (13.2.1, 13.4.1)
6. **Batch 6** → Consultations e2e tests (13.4)

**Total: ~62 new tests across 6 files**

---

## Files Created

| File | Type | Batch |
|------|------|-------|
| `apps/api/src/cases/cases.service.spec.ts` | Unit | 1 |
| `apps/api/src/cases/case-activities.service.spec.ts` | Unit | 1 |
| `apps/api/src/dashboard/dashboard.service.spec.ts` | Unit | 2 |
| `apps/api/src/consultations/consultations.service.spec.ts` | Unit | 3 |
| `apps/api/test/cases.e2e-spec.ts` | E2E | 4 |
| `apps/api/test/auth.e2e-spec.ts` | E2E | 5 |
| `apps/api/test/consultations.e2e-spec.ts` | E2E | 6 |
