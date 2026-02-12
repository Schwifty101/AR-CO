# HEAD TASK 6 - Progress Tracker

## Status: IN PROGRESS — Batch 4 complete, ready for commit

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

### Phase 7: Service Registrations Module ✅
- `apps/api/src/service-registrations/service-registrations.service.ts` — 7 methods: createRegistration, initiatePayment, getRegistrationStatus, getRegistrations, getRegistrationById, updateRegistrationStatus, assignRegistration
- `apps/api/src/service-registrations/service-registrations.controller.ts` — 7 endpoints: POST (public), POST/:id/pay (public), GET/status (public), GET (auth), GET/:id (auth), PATCH/:id/status (staff), PATCH/:id/assign (staff)
- `apps/api/src/service-registrations/service-registrations.module.ts` — imports PaymentsModule, exports ServiceRegistrationsService
- `apps/api/src/service-registrations/service-registrations.service.spec.ts` — **24 tests passing**

**Key patterns in Service Registrations module:**
- Guest endpoints use @Public() decorator (no auth required)
- Guest status check requires BOTH reference_number AND email match
- `initiatePayment()` validates payment_status !== 'paid' (BadRequestException)
- `assignRegistration()` auto-transitions PENDING_PAYMENT/PAID → IN_PROGRESS
- `ServiceRegistrationRow` interface for type-safe DB result casting
- SafepayService integration for checkout URL generation

### Phase 8: App Module Registration ✅
- Added ServiceRegistrationsModule to `app.module.ts` (all 5 new modules now registered)
- **105 tests passing** across 8 suites (service-registrations: 24, clients: 12, subscriptions: 13, complaints: 13, safepay: 6, auth: 7, users: 28, app: 2)
- Type check passes (`pnpm tsc --noEmit`) for both api and web
- 0 new lint errors from batch 3 code (pre-existing errors in safepay stub and users service unchanged)

### Phase 9: Frontend API Helpers ✅
- `apps/web/lib/api/clients.ts` — 8 functions (getClients, getClientById, createClient, updateClient, deleteClient, getClientCases, getClientDocuments, getClientInvoices)
- `apps/web/lib/api/subscriptions.ts` — 4 functions (createSubscription, getMySubscription, cancelSubscription, getAllSubscriptions)
- `apps/web/lib/api/complaints.ts` — 5 functions (submitComplaint, getComplaints, getComplaintById, updateComplaintStatus, assignComplaint)
- `apps/web/lib/api/service-registrations.ts` — 7 functions (3 public: createRegistration, initiatePayment, checkRegistrationStatus + 4 auth: getMyRegistrations, getRegistrationById, updateRegistrationStatus, assignRegistration)
- `apps/web/lib/api/services.ts` — 1 function (getServices, public/no auth)

**Key patterns in Frontend API helpers:**
- Public endpoints (guest registrations, services list) skip getSessionToken()
- Pagination response unwrapping: backend `{ data, meta }` → frontend `{ items, total, page, limit, totalPages }`
- Re-exported types from @repo/shared for consumer convenience
- JSDoc on all exported functions with @param, @returns, @throws, @example

### Phase 10: Sidebar + Public Pages + Dashboard Updates ✅
- Updated `components/dashboard/sidebar.tsx` — added 4 admin nav items + 3 client nav items
- Created `app/(public)/subscribe/page.tsx` — civic retainer landing (PKR 700/month), smart CTA (auth-aware)
- Created `app/(public)/subscribe/success/page.tsx` — subscription activated confirmation
- Created `app/(public)/subscribe/cancel/page.tsx` — subscription cancelled with retry option
- Updated `app/admin/dashboard/page.tsx` — added 3 new stat cards (Active Subscribers, Open Complaints, Pending Registrations)
- Updated `app/client/dashboard/page.tsx` — added 3 new stat cards (Subscription, Open Complaints, Service Registrations)

### Phase 11: Client Portal Pages ✅
- `app/client/subscription/page.tsx` — subscription status, cancel with AlertDialog, resubscribe CTA
- `app/client/complaints/page.tsx` — paginated complaints table with status badges
- `app/client/complaints/new/page.tsx` — React Hook Form + Zod, category Select, subscription gate
- `app/client/complaints/[id]/page.tsx` — full complaint detail view
- `app/client/services/page.tsx` — paginated service registrations table
- `app/client/services/[id]/page.tsx` — full registration detail view

### Phase 12: Admin Management Pages ✅
- `app/admin/complaints/page.tsx` — all complaints with filters (status, category, target org)
- `app/admin/complaints/[id]/page.tsx` — detail + update status form + assign staff form
- `app/admin/subscriptions/page.tsx` — read-only subscription list with status badges
- `app/admin/service-registrations/page.tsx` — all registrations with status + payment badges
- `app/admin/service-registrations/[id]/page.tsx` — detail + update status form + assign staff form

### Phase 13: Verification ✅
- **105 backend tests passing** (8 suites, 0 failures)
- **Frontend type check passes** (`pnpm tsc --noEmit` — 0 errors)
- **Backend type check passes** (`pnpm tsc --noEmit` — 0 errors)
- 0 new lint errors from batch 3+4 code

## NEXT: BATCH 5

### Commit + Final cleanup
- Commit all batch 3+4 changes
- Update init.md checkboxes

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
- Batch 1: 51dafbe 
- Batch 2: 49411c0
