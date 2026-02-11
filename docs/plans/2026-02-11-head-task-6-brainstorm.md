# HEAD TASK 6: Clients, Subscriptions, Complaints & Service Registrations - Brainstorm

> **For Claude:** Use `superpowers:writing-plans` to turn this brainstorm into a final implementation plan.

**Date:** 2026-02-11
**Branch:** `head_task6`
**Scope:** 4 backend modules, 3 new DB tables, 2 DB alterations, Safepay stub, ~15 frontend pages, shared schemas

---

## 1. What We're Building

HEAD TASK 6 adds four interconnected features to the AR-CO law firm platform:

1. **Clients Module** - Staff-facing CRUD for client profiles + aggregation endpoints (cases, documents, invoices)
2. **Subscriptions Module** - PKR 700/month civic retainer via Safepay recurring payments
3. **Complaints Module** - Civic complaints against government organizations (requires active subscription)
4. **Service Registrations Module** - Guest facilitation service registration with payment + auto account creation

### Dependencies & Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Safepay integration | **Stub service** with real interface shapes from [Safepay Node SDK](https://github.com/getsafepay/safepay-node) | Real integration deferred to HEAD TASK 10. Stubs return mock URLs/IDs. |
| Client aggregation endpoints | **Build now** | Tables exist with data. Simple read-only queries. |
| Plan scope | **Single plan, full stack** | Shared schemas -> backend -> frontend in one cohesive plan. |

---

## 2. Current State Analysis

### What Exists

**Database (19 tables, all with RLS):**
- `user_profiles`, `client_profiles`, `attorney_profiles` - User system
- `cases`, `case_activities` - Case management (data exists, no API module yet)
- `appointments`, `availability_slots` - Scheduling (data exists)
- `invoices`, `invoice_items`, `payments` - Financial (data exists)
- `documents` - Document storage
- `practice_areas`, `services` - Service catalog (3 practice areas, 0 services)
- `blog_categories`, `blog_posts`, `testimonials`, `legal_news` - Content
- `client_interactions`, `activity_logs` - CRM/audit

**Backend Modules:**
- `DatabaseModule` (@Global) - SupabaseService, AdminWhitelistService
- `AuthModule` - signup, signin, OAuth, password reset, signout
- `UsersModule` - profile CRUD (6 endpoints)
- `DashboardModule` - admin/client stats

**Frontend:**
- Auth pages (signin, signup, OAuth callback, password reset)
- Admin dashboard (stats, profile, users list)
- Client dashboard (stats, profile)
- API client helpers (`lib/api/dashboard.ts`, `lib/api/users.ts`)
- Sidebar with admin/client navigation variants

**Shared Package (`@repo/shared`):**
- Enums: `UserType`, `CompanyType`
- Schemas: auth, users, dashboard, common (pagination)
- Types: inferred from Zod schemas

### What's Missing (This Task Creates)

**3 New Database Tables:**
- `subscriptions` - Monthly retainer tracking
- `complaints` - Civic complaint records
- `service_registrations` - Facilitation service applications

**2 Table Alterations:**
- `services` - Add `registration_fee` column
- `documents` - Add `service_registration_id` FK

**4 New Backend Modules:**
- `ClientsModule` - 9 endpoints
- `SubscriptionsModule` - 4 endpoints
- `ComplaintsModule` - 5 endpoints
- `ServiceRegistrationsModule` - 8 endpoints

**1 Stub Module:**
- `PaymentsModule` - SafepayService stub (exported for other modules)

**~15 Frontend Pages** (detailed in section 7)

---

## 3. Database Design

### 3.1 `subscriptions` Table

```sql
CREATE TYPE subscription_status AS ENUM (
  'pending', 'active', 'past_due', 'cancelled', 'expired'
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL UNIQUE REFERENCES client_profiles(id),
  plan_name TEXT NOT NULL DEFAULT 'civic_retainer',
  monthly_amount DECIMAL(10,2) NOT NULL DEFAULT 700.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
  status subscription_status NOT NULL DEFAULT 'pending',
  safepay_subscription_id TEXT,
  safepay_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS Policies:**
- Clients: SELECT own subscription (`client_profile_id` matches via `private.get_client_profile_id(auth.uid())`)
- Staff: SELECT all, UPDATE status

### 3.2 `complaints` Table

```sql
CREATE TYPE complaint_status AS ENUM (
  'submitted', 'under_review', 'escalated', 'resolved', 'closed'
);

CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number TEXT UNIQUE,
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_organization TEXT NOT NULL,
  location TEXT,
  category TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  status complaint_status NOT NULL DEFAULT 'submitted',
  assigned_staff_id UUID REFERENCES user_profiles(id),
  staff_notes TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Auto-generation trigger:** `CMP-YYYY-NNNN` format (same pattern as `generate_case_number()`)

**RLS Policies:**
- Clients: SELECT/INSERT own complaints
- Staff: SELECT all, UPDATE status/assignment

### 3.3 `service_registrations` Table

```sql
CREATE TYPE service_registration_payment_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded'
);
CREATE TYPE service_registration_status AS ENUM (
  'pending_payment', 'paid', 'in_progress', 'completed', 'cancelled'
);

CREATE TABLE service_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE,
  service_id UUID NOT NULL REFERENCES services(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  cnic TEXT,
  address TEXT,
  description_of_need TEXT,
  payment_status service_registration_payment_status NOT NULL DEFAULT 'pending',
  safepay_tracker_id TEXT,
  safepay_transaction_id TEXT,
  status service_registration_status NOT NULL DEFAULT 'pending_payment',
  client_profile_id UUID REFERENCES client_profiles(id),
  assigned_staff_id UUID REFERENCES user_profiles(id),
  staff_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Auto-generation trigger:** `SRV-YYYY-NNNN` format

**RLS Policies:**
- Public: INSERT (guest submissions)
- Public: SELECT by `reference_number + email` match (guest status check)
- Clients: SELECT own registrations (after account creation)
- Staff: SELECT all, UPDATE status/assignment

### 3.4 Table Alterations

```sql
-- Add registration_fee to services
ALTER TABLE services ADD COLUMN registration_fee DECIMAL(10,2);

-- Add service_registration_id FK to documents
ALTER TABLE documents ADD COLUMN service_registration_id UUID REFERENCES service_registrations(id);
```

---

## 4. Shared Package Design (`@repo/shared`)

### 4.1 New Enums (`src/enums.ts` additions)

```typescript
export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum ComplaintStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ComplaintCategory {
  INFRASTRUCTURE = 'infrastructure',
  PUBLIC_SERVICES = 'public_services',
  ENVIRONMENT = 'environment',
  GOVERNANCE = 'governance',
  HEALTH = 'health',
  EDUCATION = 'education',
  UTILITIES = 'utilities',
  OTHER = 'other',
}

export enum ServiceRegistrationStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ServiceRegistrationPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}
```

### 4.2 New Schema Files

**`schemas/clients.schemas.ts`** - Client list filters, client response with nested profiles
**`schemas/subscriptions.schemas.ts`** - Create subscription, subscription response, cancel
**`schemas/complaints.schemas.ts`** - Create complaint, update status, complaint response, list filters
**`schemas/service-registrations.schemas.ts`** - Create registration, response, update status, guest status check
**`schemas/services.schemas.ts`** - Service response with registration_fee

### 4.3 New Type Files (inferred from schemas)

**`types/clients.types.ts`**
**`types/subscriptions.types.ts`**
**`types/complaints.types.ts`**
**`types/service-registrations.types.ts`**
**`types/services.types.ts`**

---

## 5. Backend Module Design

### 5.1 Safepay Stub (`apps/api/src/payments/`)

Built from [Safepay Node SDK](https://github.com/getsafepay/safepay-node) interface:

```typescript
// payments/safepay.service.ts
@Injectable()
export class SafepayService {
  /** Creates a one-time checkout session. Returns checkout URL. */
  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    orderId: string;
    metadata: { type: 'consultation' | 'subscription' | 'service' | 'invoice'; referenceId: string };
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{ checkoutUrl: string; token: string }> {
    // STUB: Returns mock URL
    return {
      checkoutUrl: `https://sandbox.api.getsafepay.com/checkout/stub-${params.orderId}`,
      token: `tracker_stub_${Date.now()}`,
    };
  }

  /** Creates a recurring subscription checkout. Returns checkout URL. */
  async createSubscriptionCheckout(params: {
    planId: string;
    reference: string;
    customerEmail: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{ checkoutUrl: string }> {
    // STUB: Returns mock URL
    return {
      checkoutUrl: `https://sandbox.api.getsafepay.com/subscribe/stub-${params.reference}`,
    };
  }

  /** Verifies webhook signature. */
  verifyWebhookSignature(payload: unknown, signature: string): boolean {
    // STUB: Always returns true in dev
    return true;
  }

  /** Gets payment status by tracker ID. */
  async getPaymentStatus(trackerId: string): Promise<{ status: string; amount: number }> {
    // STUB: Returns completed
    return { status: 'completed', amount: 0 };
  }

  /** Cancels a subscription. */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
    // STUB
    return { success: true };
  }
}
```

```typescript
// payments/payments.module.ts
@Module({
  providers: [SafepayService],
  exports: [SafepayService],
})
export class PaymentsModule {}
```

**Key:** The interface is designed to match the real Safepay SDK so HEAD TASK 10 only replaces stub implementations, not signatures.

### 5.2 Clients Module (`apps/api/src/clients/`)

**Service methods:**

| Method | Access | Description |
|--------|--------|-------------|
| `createClient(dto)` | Staff | Creates user_profile + client_profile in sequence (admin client) |
| `getClients(pagination, filters)` | Staff | List with filtering by company_type, city, status |
| `getClientById(clientId)` | Staff + Client (own) | Single client with nested profiles |
| `updateClient(clientId, dto)` | Staff | Update client_profile fields |
| `deleteClient(clientId)` | Admin | Delete client + user profile + auth user |
| `getClientCases(clientId)` | Staff + Client (own) | Query cases table by client_profile_id |
| `getClientDocuments(clientId)` | Staff + Client (own) | Query documents table by client_profile_id |
| `getClientInvoices(clientId)` | Staff + Client (own) | Query invoices table by client_profile_id |

**Controller endpoints:**
- `GET /api/clients` - Staff only, paginated with filters
- `POST /api/clients` - Staff only
- `GET /api/clients/:id` - Staff + client (own)
- `PATCH /api/clients/:id` - Staff only
- `DELETE /api/clients/:id` - Admin only
- `GET /api/clients/:id/cases` - Staff + client (own)
- `GET /api/clients/:id/documents` - Staff + client (own)
- `GET /api/clients/:id/invoices` - Staff + client (own)

**Authorization pattern for "own data" access:**
```typescript
@Get(':id')
async getClient(
  @Param('id') id: string,
  @CurrentUser() user: AuthUser,
) {
  // Service checks: if user is client, verify clientProfileId matches
  return this.clientsService.getClientById(id, user);
}
```

### 5.3 Subscriptions Module (`apps/api/src/subscriptions/`)

**Service methods:**

| Method | Access | Description |
|--------|--------|-------------|
| `createSubscription(userId)` | Client | Creates pending subscription + Safepay checkout URL |
| `getMySubscription(userId)` | Client | Fetch own subscription |
| `cancelSubscription(userId)` | Client | Cancel via Safepay + update status |
| `getAllSubscriptions(pagination)` | Staff | List all subscriptions |
| `isSubscriptionActive(userId)` | Internal | Check if user has active subscription (used by ComplaintsService) |
| `handleSubscriptionActivated(data)` | Webhook | Set status=active, set billing dates |
| `handleSubscriptionRenewal(data)` | Webhook | Extend current_period_end by 1 month |
| `handleSubscriptionCancelled(data)` | Webhook | Set status=cancelled |

**Controller endpoints:**
- `POST /api/subscriptions` - Client, create + get Safepay URL
- `GET /api/subscriptions/me` - Client, own subscription
- `POST /api/subscriptions/cancel` - Client, cancel
- `GET /api/subscriptions` - Staff only, list all

**Module:**
```typescript
@Module({
  imports: [PaymentsModule],  // For SafepayService
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],  // For ComplaintsModule
})
export class SubscriptionsModule {}
```

### 5.4 Complaints Module (`apps/api/src/complaints/`)

**Service methods:**

| Method | Access | Description |
|--------|--------|-------------|
| `submitComplaint(userId, dto)` | Client (subscriber) | Check active subscription -> create complaint -> auto-gen CMP-YYYY-NNNN |
| `getMyComplaints(userId, pagination)` | Client | Own complaints list |
| `getComplaintById(complaintId, user)` | Client (own) + Staff | Single complaint detail |
| `getAllComplaints(pagination, filters)` | Staff | All complaints with filters (status, org, date range) |
| `updateComplaintStatus(complaintId, status, staffNotes)` | Staff | Update status + staff notes |
| `assignComplaint(complaintId, staffId)` | Staff | Assign staff member |

**Controller endpoints:**
- `POST /api/complaints` - Client (requires active subscription)
- `GET /api/complaints` - Client: own, Staff: all
- `GET /api/complaints/:id` - Client (own) + Staff
- `PATCH /api/complaints/:id/status` - Staff only
- `PATCH /api/complaints/:id/assign` - Staff only

**Subscription guard pattern:**
```typescript
async submitComplaint(userId: string, dto: CreateComplaintData) {
  const isActive = await this.subscriptionsService.isSubscriptionActive(userId);
  if (!isActive) {
    throw new ForbiddenException('Active subscription required to submit complaints');
  }
  // ... create complaint
}
```

### 5.5 Service Registrations Module (`apps/api/src/service-registrations/`)

**Service methods:**

| Method | Access | Description |
|--------|--------|-------------|
| `createRegistration(dto)` | Public (guest) | Validate service exists -> create registration -> return reference |
| `initiatePayment(registrationId)` | Public | Fetch service fee -> Safepay checkout -> return URL |
| `getRegistrationStatus(ref, email)` | Public | Guest status check (verified by email match) |
| `handlePaymentConfirmed(registrationId)` | Webhook | Update payment_status -> createUserAccount() |
| `createUserAccount(registration)` | Internal | Check existing user -> create auth + profiles -> link -> send credentials |
| `uploadDocuments(registrationId, files)` | Public | Upload to Supabase Storage -> link via service_registration_id |
| `getMyRegistrations(userId, pagination)` | Client | Own registrations (after account creation) |
| `getAllRegistrations(pagination, filters)` | Staff | All registrations with filters |
| `updateRegistrationStatus(id, status, notes)` | Staff | Update status + staff notes |

**Controller endpoints:**
- `POST /api/service-registrations` - @Public, guest submission
- `POST /api/service-registrations/:id/pay` - @Public, initiate payment
- `POST /api/service-registrations/:id/documents` - @Public, upload docs
- `GET /api/service-registrations/status` - @Public, guest status (query: ref + email)
- `GET /api/service-registrations` - Client: own, Staff: all
- `GET /api/service-registrations/:id` - Client (own) + Staff
- `PATCH /api/service-registrations/:id/status` - Staff only
- `GET /api/services` - @Public, list available services with fees

**Auto account creation flow:**
```
Payment webhook fires
  -> handlePaymentConfirmed(registrationId)
    -> createUserAccount(registration)
      -> Check if user exists by email
        -> YES: Link existing user's client_profile_id to registration
        -> NO: Create auth user (auto-password) + user_profile (client) + client_profile
      -> Link service_registration.client_profile_id
      -> (Future: Send credentials email via SendGrid)
```

---

## 6. Implementation Order

This order ensures each layer builds on the previous one:

### Phase 1: Database Migrations (3 migrations)
1. Create `subscriptions` table + RLS + triggers
2. Create `complaints` table + trigger + RLS
3. Create `service_registrations` table + trigger + RLS + alter `services` + alter `documents`

### Phase 2: Shared Package Schemas & Types
4. Add new enums to `packages/shared/src/enums.ts`
5. Create `schemas/clients.schemas.ts` + `types/clients.types.ts`
6. Create `schemas/subscriptions.schemas.ts` + `types/subscriptions.types.ts`
7. Create `schemas/complaints.schemas.ts` + `types/complaints.types.ts`
8. Create `schemas/service-registrations.schemas.ts` + `types/service-registrations.types.ts`
9. Create `schemas/services.schemas.ts` + `types/services.types.ts`
10. Update barrel exports (`index.ts` files)

### Phase 3: Backend Modules (dependency order)
11. Create `PaymentsModule` with SafepayService stub
12. Create `ClientsModule` (service + controller + module)
13. Create `SubscriptionsModule` (imports PaymentsModule, exports SubscriptionsService)
14. Create `ComplaintsModule` (imports SubscriptionsModule)
15. Create `ServiceRegistrationsModule` (imports PaymentsModule)
16. Register all modules in `app.module.ts`

### Phase 4: Backend Tests
17. Write `clients.service.spec.ts`
18. Write `subscriptions.service.spec.ts`
19. Write `complaints.service.spec.ts`
20. Write `service-registrations.service.spec.ts`

### Phase 5: Frontend API Helpers
21. Create `lib/api/clients.ts`
22. Create `lib/api/subscriptions.ts`
23. Create `lib/api/complaints.ts`
24. Create `lib/api/service-registrations.ts`
25. Create `lib/api/services.ts`

### Phase 6: Frontend Pages
26. Update sidebar navigation (admin + client)
27. Create `/subscribe` landing page
28. Create subscription success/cancel return pages
29. Create `/client/subscription` page
30. Create `/client/complaints` page (list)
31. Create `/client/complaints/new` page (form)
32. Create `/client/complaints/:id` page (detail)
33. Create `/services` page (public service list)
34. Create `/services/:slug/register` multi-step form
35. Create registration success page
36. Create `/client/services` page (my registrations)
37. Create `/client/services/:id` page (detail)
38. Update client dashboard stats
39. Update admin dashboard stats

### Phase 7: Admin Pages
40. Create `/admin/complaints` page (list + filters)
41. Create `/admin/complaints/:id` page (detail + status update)
42. Create `/admin/subscriptions` page (list)
43. Create `/admin/service-registrations` page (list + filters)
44. Create `/admin/service-registrations/:id` page (detail + status update)

### Phase 8: Verification
45. Run type checks (`pnpm tsc --noEmit` in api and web)
46. Run all backend tests
47. Run lint
48. Update `init.md` checkboxes

---

## 7. Frontend Page Design

### 7.1 Navigation Updates

**Admin Sidebar (add after "Users"):**
- Complaints -> `/admin/complaints`
- Subscriptions -> `/admin/subscriptions`
- Service Registrations -> `/admin/service-registrations`

**Client Sidebar (add after "Profile"):**
- Subscription -> `/client/subscription`
- Complaints -> `/client/complaints`
- My Services -> `/client/services`
- Payment History -> `/client/payments` (placeholder)

### 7.2 Page Details

**`/subscribe` (Public landing page):**
- Hero section explaining civic retainer (PKR 700/month)
- Benefits list (submit complaints, government accountability)
- "Subscribe Now" button
- If not logged in -> redirect to signup with `?redirect=/subscribe`
- If logged in -> call POST /api/subscriptions -> redirect to Safepay

**`/client/complaints/new` (Complaint form):**
- React Hook Form + Zod validation
- Fields: title, description, target_organization, location, category (dropdown), evidence upload
- Gated: shows "Active subscription required" if no active subscription
- On success: redirect to complaint detail with success toast

**`/services/:slug/register` (Multi-step registration form):**
- Step 1: Client details (full name, email, phone, CNIC, address) - no auth required
- Step 2: Service auto-selected from URL, description of need textarea
- Step 3: Document upload (drag & drop)
- Step 4: Review + Pay (shows fee, "Pay" -> Safepay redirect)
- All steps use React Hook Form with per-step Zod schemas

### 7.3 Dashboard Stats Updates

**Admin dashboard adds:**
- Active Subscribers count
- Open Complaints count
- Pending Service Registrations count

**Client dashboard adds:**
- Subscription status badge (active/inactive)
- Open Complaints count
- Service Registrations in-progress count

---

## 8. Safepay Stub Design (from SDK Analysis)

Based on the [Safepay Node SDK](https://github.com/getsafepay/safepay-node):

### Real SDK Interface (what we're matching)

```typescript
// Real SDK initialization
const safepay = new Safepay({
  environment: 'sandbox',
  apiKey: 'sec_xxx',
  v1Secret: 'bar',
  webhookSecret: 'foo',
});

// One-time payment
const { token } = await safepay.payments.create({ amount: 10000, currency: 'PKR' });
const url = safepay.checkout.create({
  token, orderId: 'T800',
  cancelUrl: 'http://example.com/cancel',
  redirectUrl: 'http://example.com/success',
  source: 'custom', webhooks: true,
});

// Subscription
const url = safepay.checkout.createSubscription({
  planId: 'plan_xxx', reference: 'uuid',
  cancelUrl: '...', redirectUrl: '...',
});

// Verification
const valid = safepay.verify.signature(request);
const valid = await safepay.verify.webhook(request);

// Cancel subscription
await safepay.subscription.cancel('sub_xxx');
```

### Our Stub Design

Our `SafepayService` wraps the SDK with domain-specific methods. The stub returns mock data but has the exact same method signatures the real implementation will use. When HEAD TASK 10 comes, we:
1. Install `@sfpy/node-sdk`
2. Replace stub bodies with real SDK calls
3. No signature changes needed

### Webhook Payload Shape (inferred from SDK + docs)

```typescript
interface SafepayWebhookPayload {
  tracker: string;           // Payment tracker token
  reference: string;         // Our orderId/reference
  type: string;              // 'payment' | 'subscription'
  status: string;            // 'completed' | 'failed' | 'cancelled'
  amount: number;
  currency: string;
  signature: string;         // HMAC-SHA256 of tracker with webhook secret
  metadata?: Record<string, string>;  // Our custom metadata
}
```

---

## 9. Key Patterns to Follow

### From Existing Codebase

| Pattern | Convention | Example |
|---------|-----------|---------|
| Module structure | Controller + Service + Module in feature folder | `apps/api/src/users/` |
| Validation | Zod schemas in `@repo/shared`, `ZodValidationPipe` in controller | `users.controller.ts` |
| DB access | `supabaseService.getAdminClient()` for cross-user, manual camelCase<->snake_case | `users.service.ts` |
| Auth decorators | `@Public()`, `@Roles(UserType.X)`, `@CurrentUser()` | `auth.controller.ts` |
| Error handling | `NotFoundException`, `ForbiddenException`, `InternalServerErrorException` | `users.service.ts` |
| Logging | `private readonly logger = new Logger(ServiceName.name)` | All services |
| Frontend API | `getSessionToken()` + `fetch('/api/...')` + `Authorization: Bearer` | `lib/api/users.ts` |
| Forms | React Hook Form + `zodResolver` + shadcn/ui | `admin/profile/page.tsx` |
| Toast | `import { toast } from 'sonner'` | All form pages |
| Loading | `Skeleton` components during data fetch | Dashboard pages |

### New Patterns Introduced

| Pattern | Where | Description |
|---------|-------|-------------|
| Module cross-imports | SubscriptionsModule -> PaymentsModule | Feature modules importing other feature modules via exports |
| @Public guest endpoints | ServiceRegistrationsController | Endpoints accessible without auth (validated by email match instead) |
| Auto account creation | ServiceRegistrationsService | Creating Supabase auth users programmatically from service layer |
| Subscription guard (app-level) | ComplaintsService | Checking subscription status before allowing actions |
| Multi-step form state | `/services/:slug/register` | Form state persisted across steps via React state |
| Dynamic route access | ClientsController | Staff sees all, client sees own - checked in service layer |

---

## 10. Risk Areas & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Guest endpoints leaking data | High | Service registration status requires email match. Never return full records to unauthenticated users. |
| Subscription check bypass | High | Check in service layer (not guard) - every complaint submission verifies active status. |
| Auto account creation race condition | Medium | Check existing user by email before creating. Use admin client for user creation. |
| Large task scope | Medium | Implementation order designed so each phase is independently testable. |
| camelCase/snake_case mapping errors | Low | Follow existing pattern. All mappings explicit in service layer. |
| Module circular dependencies | Low | PaymentsModule has no imports. Subscription exports service for Complaints. Clean dependency tree. |

---

## 11. File Count Estimate

| Category | Files | Notes |
|----------|-------|-------|
| DB migrations | 3 | Via Supabase MCP apply_migration |
| Shared schemas | 5 | + 5 type files + enums update + barrel exports |
| Backend services | 5 | clients, subscriptions, complaints, service-registrations, safepay |
| Backend controllers | 4 | clients, subscriptions, complaints, service-registrations |
| Backend modules | 5 | clients, subscriptions, complaints, service-registrations, payments |
| Backend tests | 4 | One per service |
| Frontend API helpers | 5 | clients, subscriptions, complaints, service-registrations, services |
| Frontend pages | ~15 | Subscribe, complaints, services, dashboard updates |
| Frontend components | 2-3 | Sidebar updates, shared status badge component |
| **Total** | **~55 files** | ~20 new backend, ~15 shared, ~20 frontend |

---

## 12. Sources & References

- [Safepay Node SDK](https://github.com/getsafepay/safepay-node) - API interface reference
- [Safepay Documentation](https://safepay-docs.netlify.app/build-your-integration/advanced-checkout/introduction/) - Integration patterns
- [Safepay API Reference](https://apidocs.getsafepay.com/) - Endpoint documentation
- [NestJS Documentation](https://docs.nestjs.com/) - Module/controller patterns
- Existing codebase patterns: `apps/api/src/users/`, `apps/api/src/auth/`, `packages/shared/`
