# HEAD TASK 6 - Progress Tracker

## Status: IN PROGRESS — Batch 2 complete, Batch 3 next (Service Registrations module)

## COMPLETED

### Phase 1: Database Migrations ✅
- `subscriptions` table created with RLS (trigger uses `private.update_updated_at_column()`)
- `complaints` table created with RLS + auto-numbering (CMP-YYYY-NNNN)
- `service_registrations` table created with RLS + auto-numbering (SRV-YYYY-NNNN)
- `services.registration_fee` column added
- `documents.service_registration_id` FK added
- Security advisors checked — only pre-existing `search_path` warnings

### Phase 2: Shared Package ✅
All files created and type-checked (`pnpm tsc --noEmit` passes):

**Enums added to `packages/shared/src/enums.ts`:**
- SubscriptionStatus, ComplaintStatus, ComplaintCategory, ServiceRegistrationStatus, ServiceRegistrationPaymentStatus

**Schemas created:**
- `packages/shared/src/schemas/clients.schemas.ts`
- `packages/shared/src/schemas/subscriptions.schemas.ts`
- `packages/shared/src/schemas/complaints.schemas.ts`
- `packages/shared/src/schemas/service-registrations.schemas.ts`
- `packages/shared/src/schemas/services.schemas.ts`

**Types created:**
- `packages/shared/src/types/clients.types.ts`
- `packages/shared/src/types/subscriptions.types.ts`
- `packages/shared/src/types/complaints.types.ts`
- `packages/shared/src/types/service-registrations.types.ts`
- `packages/shared/src/types/services.types.ts`

**Barrel exports updated:**
- `packages/shared/src/schemas/index.ts` — all new schemas exported
- `packages/shared/src/types/index.ts` — all new types exported
- `packages/shared/src/index.ts` — all new enums exported

### Phase 3: Payments Stub ✅
- `apps/api/src/payments/safepay.service.ts` — full stub with 5 methods
- `apps/api/src/payments/payments.module.ts` — exports SafepayService
- `apps/api/src/payments/safepay.service.spec.ts` — **6 tests passing**

### Phase 4: Clients Module ✅
- `apps/api/src/clients/clients.service.ts` — 8 methods: getClients, getClientById, createClient, updateClient, deleteClient, getClientCases, getClientDocuments, getClientInvoices
- `apps/api/src/clients/clients.controller.ts` — 8 endpoints: GET/POST/PATCH/DELETE /clients, GET /clients/:id/cases|documents|invoices
- `apps/api/src/clients/clients.module.ts` — exports ClientsService
- `apps/api/src/clients/clients.service.spec.ts` — **12 tests passing**

**Key patterns in Clients module:**
- `assertClientAccess()` private method: staff sees all, client sees own (via `clientProfileId` match)
- `STAFF_ROLES` array: `[ADMIN, STAFF, ATTORNEY]` for access checks
- `createClient()` flow: createUser → insert user_profiles → insert client_profiles (with cleanup on failure)
- `deleteClient()` flow: fetch user_profile_id → deleteUser auth → delete user_profiles (cascade handles client_profiles)
- Supabase join pattern: `client_profiles` with `user_profiles!inner(id, full_name, phone_number)`, cast via `as unknown as T`
- Email fetched via `adminClient.auth.admin.getUserById()` for each client

### Phase 5: Subscriptions Module ✅
- `apps/api/src/subscriptions/subscriptions.service.ts` — 5 methods: createSubscription, getMySubscription, cancelSubscription, getAllSubscriptions, isSubscriptionActive
- `apps/api/src/subscriptions/subscriptions.controller.ts` — 4 endpoints: POST/GET/POST-cancel /subscriptions, GET /subscriptions/me
- `apps/api/src/subscriptions/subscriptions.module.ts` — imports PaymentsModule, exports SubscriptionsService
- `apps/api/src/subscriptions/subscriptions.service.spec.ts` — **13 tests passing**

**Key patterns in Subscriptions module:**
- `createSubscription()` checks existing → reactivate if cancelled/expired, reject if active, create if new
- `isSubscriptionActive(clientProfileId)` exported for ComplaintsModule use
- SafepayService integration for checkout URL generation and subscription cancellation
- Destructures `{ checkoutUrl }` from SafepayService response

### Phase 6: Complaints Module ✅
- `apps/api/src/complaints/complaints.service.ts` — 5 methods: submitComplaint, getComplaints, getComplaintById, updateComplaintStatus, assignComplaint
- `apps/api/src/complaints/complaints.controller.ts` — 5 endpoints: POST/GET /complaints, GET/:id, PATCH/:id/status, PATCH/:id/assign
- `apps/api/src/complaints/complaints.module.ts` — imports SubscriptionsModule
- `apps/api/src/complaints/complaints.service.spec.ts` — **13 tests passing**

**Key patterns in Complaints module:**
- `submitComplaint()` gates on `subscriptionsService.isSubscriptionActive()` — throws ForbiddenException if inactive
- `getComplaints()` dual behavior: client sees own, staff sees all with filters
- `assignComplaint()` auto-transitions status from SUBMITTED → UNDER_REVIEW
- `updateComplaintStatus()` sets `resolved_at` timestamp when status is RESOLVED
- STAFF_ROLES + access control pattern same as ClientsModule

### Phase 7.5: App Module Registration ✅
- Added PaymentsModule, ClientsModule, SubscriptionsModule, ComplaintsModule to `app.module.ts`
- **51 tests passing** across 4 suites (clients: 12, subscriptions: 13, complaints: 13, safepay: 6, + auth: 7 pre-existing)
- Type check passes (`pnpm tsc --noEmit`)
- ~~Remaining lint warnings are Supabase `unsafe any`~~ — ALL RESOLVED (see Phase 7.6)

### Phase 7.6: Unsafe Any Lint Fixes ✅
- Created `apps/api/src/database/db-result.types.ts` with `DbResult<T>`, `DbListResult<T>`, `DbCountResult`, `DbMutationResult`
- Added `SubscriptionRow` interface in subscriptions.service.ts, cast all queries
- Added `ComplaintRow` interface in complaints.service.ts, cast all queries
- Added `ClientProfileRow`, `AuthUserResult`, `AuthCreateResult` interfaces in clients.service.ts, cast all queries
- Changed `status: string` → `status: SubscriptionStatus` / `status: ComplaintStatus` in row interfaces
- Removed unnecessary `as Type` casts in mapper functions
- **0 lint errors** across clients, subscriptions, complaints, and database modules
- **51 tests passing**, type check passes

## NEXT: BATCH 3

### Phase 7: Service Registrations Module
Files to create:
- `apps/api/src/service-registrations/service-registrations.service.ts`
- `apps/api/src/service-registrations/service-registrations.service.spec.ts`
- `apps/api/src/service-registrations/service-registrations.controller.ts`
- `apps/api/src/service-registrations/service-registrations.module.ts`

### Phase 8: App Module Registration
- Add all 5 new modules to `apps/api/src/app.module.ts`
- Run tests, type check, lint

### Phase 9: Frontend API Helpers
- `apps/web/lib/api/clients.ts`
- `apps/web/lib/api/subscriptions.ts`
- `apps/web/lib/api/complaints.ts`
- `apps/web/lib/api/service-registrations.ts`
- `apps/web/lib/api/services.ts`

### Phase 10-12: Frontend Pages
- Client pages: subscription, complaints (list/new/detail), services
- Admin pages: clients, complaints (list/detail), subscriptions, service-registrations
- Sidebar nav updates, dashboard stats updates, public services page

### Phase 13: Final Verification

## KEY PATTERNS (for next context)

### Running tests
- **DO NOT** use `pnpm test -- --testPathPattern=X` (broken with Jest 30 `--` separator)
- **USE:** `npx jest <pattern>` (e.g., `npx jest clients`, `npx jest safepay`)

### Backend patterns
- **Trigger function**: `private.update_updated_at_column()` (in private schema)
- **Service pattern**: Logger, constructor(SupabaseService), getAdminClient(), manual snake_case mapping
- **Controller pattern**: Thin, @CurrentUser(), @Roles(), `new ZodValidationPipe(Schema)`
- **Module pattern**: No DatabaseModule import needed (@Global)
- **Access control**: `assertClientAccess()` pattern — staff roles bypass, client matches `clientProfileId`
- **Supabase joins**: `table.select('...fields..., related_table!inner(fields)')` then cast `as unknown as T`
- **Email lookup**: `adminClient.auth.admin.getUserById(userId)` → `.data.user.email`
- **Avoid `as any`**: use `as unknown as T`

### Test patterns
- Mock `mockAdminClient` with `from: jest.fn()`, `auth.admin.*: jest.fn()`
- Chain mocks: `mockReturnValueOnce({ select: jest.fn().mockReturnValue({ eq: ... }) })`
- AuthUser fixtures for staff/client/otherClient with appropriate `clientProfileId`

### Frontend patterns
- **Frontend API**: getSessionToken() + fetch('/api/...') + Bearer header
- **Avoid `as any`**: use `as unknown as T`
- **Path quoting**: always quote paths with `&` in bash

## COMMITS MADE YET:
- Commit 1: 51dafbe 
- Commit 2: 
