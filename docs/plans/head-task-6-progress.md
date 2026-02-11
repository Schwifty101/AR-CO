# HEAD TASK 6 - Progress Tracker

## Status: IN PROGRESS (Phase 3 started)

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

### Phase 3: Payments Stub (PARTIALLY DONE)
**Created:**
- `apps/api/src/payments/safepay.service.ts` — full stub with 5 methods
- `apps/api/src/payments/payments.module.ts` — exports SafepayService
- `apps/api/src/payments/safepay.service.spec.ts` — 5 unit tests

**NOT YET RUN:** tests for payments module

## NOT STARTED

### Phase 4: Clients Module (Tasks 9-12)
Files to create:
- `apps/api/src/clients/clients.service.ts`
- `apps/api/src/clients/clients.service.spec.ts`
- `apps/api/src/clients/clients.controller.ts`
- `apps/api/src/clients/clients.module.ts`

### Phase 5: Subscriptions Module (Tasks 13-16)
Files to create:
- `apps/api/src/subscriptions/subscriptions.service.ts`
- `apps/api/src/subscriptions/subscriptions.service.spec.ts`
- `apps/api/src/subscriptions/subscriptions.controller.ts`
- `apps/api/src/subscriptions/subscriptions.module.ts`

### Phase 6: Complaints Module (Tasks 17-20)
Files to create:
- `apps/api/src/complaints/complaints.service.ts`
- `apps/api/src/complaints/complaints.service.spec.ts`
- `apps/api/src/complaints/complaints.controller.ts`
- `apps/api/src/complaints/complaints.module.ts`

### Phase 7: Service Registrations Module (Tasks 21-24)
Files to create:
- `apps/api/src/service-registrations/service-registrations.service.ts`
- `apps/api/src/service-registrations/service-registrations.service.spec.ts`
- `apps/api/src/service-registrations/service-registrations.controller.ts`
- `apps/api/src/service-registrations/service-registrations.module.ts`

### Phase 8: App Module Registration (Task 25)
- Add all 5 new modules to `apps/api/src/app.module.ts`
- Run tests, type check, lint

### Phase 9: Frontend API Helpers (Tasks 26-30)
- `apps/web/lib/api/clients.ts`
- `apps/web/lib/api/subscriptions.ts`
- `apps/web/lib/api/complaints.ts`
- `apps/web/lib/api/service-registrations.ts`
- `apps/web/lib/api/services.ts`

### Phase 10-12: Frontend Pages (Tasks 31-45)
- Client pages: subscription, complaints (list/new/detail), services
- Admin pages: clients, complaints (list/detail), subscriptions, service-registrations
- Sidebar nav updates, dashboard stats updates, public services page

### Phase 13: Final Verification (Task 46)

## KEY PATTERNS (for next context)
- **Trigger function**: `private.update_updated_at_column()` (in private schema)
- **Service pattern**: Logger, constructor(SupabaseService), getAdminClient(), manual snake_case mapping
- **Controller pattern**: Thin, @CurrentUser(), @Roles(), `new ZodValidationPipe(Schema)`
- **Module pattern**: No DatabaseModule import needed (@Global)
- **Frontend API**: getSessionToken() + fetch('/api/...') + Bearer header
- **Avoid `as any`**: use `as unknown as T`
- **Path quoting**: always quote paths with `&` in bash

## NO COMMITS MADE YET
All changes are uncommitted. First commit should bundle Phase 1-3 work.
