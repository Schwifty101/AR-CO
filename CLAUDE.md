# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AR-CO is a law firm website platform for AR&CO Law Firm, built as a **Turborepo monorepo** with Next.js frontend and NestJS backend. Includes public website, client portal, admin CRM, complaint system, service registrations, and subscription management.

**Repository:** https://github.com/Schwifty101/AR-CO

## Monorepo Structure

```
AR-CO/
├── apps/
│   ├── web/            # Next.js 16 frontend (port 3000)
│   └── api/            # NestJS backend (port 4000)
├── packages/
│   ├── shared/         # @repo/shared - Zod schemas, TypeScript types, enums
│   └── ui/             # @repo/ui - Shared React component library
├── turbo.json
└── pnpm-workspace.yaml
```

## Essential Commands

```bash
# Root - all apps
pnpm install              # Install dependencies
pnpm dev                  # Start web (:3000) + api (:4000)
pnpm build                # Build all apps
pnpm lint                 # Lint all apps

# Backend (apps/api)
pnpm --filter api start:dev    # Dev with auto-reload
pnpm --filter api test         # Unit tests
pnpm --filter api test:e2e     # E2E tests
pnpm --filter api test:cov     # Coverage
pnpm --filter api build        # Production build

# Type check backend
cd apps/api && pnpm tsc --noEmit

# Frontend (apps/web)
pnpm --filter web dev          # Dev server
pnpm --filter web build        # Production build

# Add dependencies
pnpm add <pkg> --filter web    # Frontend
pnpm add <pkg> --filter api    # Backend
pnpm add <pkg> --filter shared # Shared package

# shadcn/ui component
cd apps/web && npx shadcn@latest add <component-name>
```

**Always use pnpm** (not npm or yarn). Install from root to maintain workspace integrity.

## Architecture

### Shared Package (`@repo/shared`)

Shared validation schemas, types, and enums used by both frontend and backend:

```
packages/shared/src/
├── enums.ts                          # UserType, CompanyType, status enums
├── schemas/
│   ├── common.schemas.ts             # Pagination, shared validations, AssignToSchema
│   ├── auth.schemas.ts               # Auth request/response schemas
│   ├── cases.schemas.ts              # Case CRUD, filters, activities schemas
│   ├── clients.schemas.ts
│   ├── complaints.schemas.ts
│   ├── service-registrations.schemas.ts
│   ├── services.schemas.ts
│   ├── subscriptions.schemas.ts
│   └── users.schemas.ts
└── types/
    ├── [feature].types.ts            # TypeScript interfaces from Zod schemas
    └── index.ts                      # Barrel export
```

Import pattern: `import { SignupSchema, UserType, CreateClientSchema } from '@repo/shared'`

### Backend Modules (apps/api/src/)

All modules follow **Controller-Service-Module** pattern in feature folders:

| Module | Purpose |
|--------|---------|
| `auth/` | Signup, signin, OAuth, token refresh, password reset, signout |
| `users/` | User profile CRUD, client-specific & attorney-specific data |
| `clients/` | Client profile management + aggregated data (cases, docs, invoices) |
| `complaints/` | Complaint submission, tracking, staff assignment, status updates |
| `service-registrations/` | Guest facilitation service registration + payment handling |
| `services/` | Available services catalog (NTN, SECP, business registration) |
| `subscriptions/` | Subscription plans and status tracking |
| `dashboard/` | Admin and client dashboard statistics |
| `cases/` | Case management, case activities timeline, assignment |
| `practice-areas/` | Practice areas catalog (read-only listing) |
| `payments/` | LemonSqueezyService for payment integration (Merchant of Record) |

**Module structure:**
```
feature/
├── feature.module.ts
├── feature.controller.ts
├── feature.service.ts
└── [auxiliary].service.ts    # Optional (e.g., ClientsAggregationService)
```

**Common utilities** in `apps/api/src/common/`:
- **Decorators:** `@Public()`, `@Roles(UserType.ADMIN)`, `@CurrentUser()`
- **Guards:** `JwtAuthGuard`, `RolesGuard` (registered globally in main.ts)
- **Filters:** `HttpExceptionFilter`, `SupabaseExceptionFilter`
- **Pipes:** `ZodValidationPipe`
- **Interfaces:** `AuthUser`, `RequestWithUser`
- **Enums:** `UserType` (CLIENT, ATTORNEY, STAFF, ADMIN)
- **Utilities:** `query-helpers.ts` (pagination, query building)

**DatabaseModule is `@Global()`** - SupabaseService available everywhere without importing.

### Backend Authentication Flow

```
Request → JwtAuthGuard → RolesGuard → Route Handler
  1. Extract & validate JWT via Supabase
  2. Skip if @Public() decorated
  3. Populate request.user = AuthUser
  4. Check @Roles() against user.userType
  5. Admin whitelist emails bypass all @Roles() checks
```

**SupabaseService methods:**
- `getClient(token)` - User-scoped client (RLS enforced)
- `getAdminClient()` - Admin client (bypasses RLS, use with caution, document why)
- `getUserFromToken(token)` - Validates JWT and fetches user profile

**Admin whitelist:** Configured via `ADMIN_EMAILS` env var (comma-separated). Whitelisted emails bypass all role restrictions.

### Backend Configuration System

Typed configuration via factory pattern in `apps/api/src/config/`:
- `AppConfig`, `SupabaseConfig`, `JwtConfig`, `LemonSqueezyConfig`, `EmailConfig`, `FileUploadConfig`, `AdminConfig`
- Access via NestJS `ConfigService` with typed interfaces

### Frontend API Client Pattern (apps/web/lib/api/)

Typed API client functions for each backend module:

```
lib/api/
├── auth-helpers.ts              # getSessionToken(), PaginationParams
├── cases.ts                     # Case CRUD, assignment, activities
├── clients.ts                   # Client CRUD + aggregation
├── complaints.ts                # Complaint submission/tracking
├── dashboard.ts                 # Dashboard statistics
├── practice-areas.ts            # Practice areas listing
├── service-registrations.ts     # Service registration CRUD
├── services.ts                  # Services catalog
├── subscriptions.ts             # Subscription management
└── users.ts                     # User profile operations
```

**Pattern:** Each function gets session token from Supabase, makes authenticated `fetch('/api/...')` call through Next.js proxy, returns typed response.

### Frontend Route Structure

```
app/
├── (public)/                    # Public routes (practice-areas, subscribe, team)
├── auth/                        # signin, signup, forgot-password, callback
├── admin/                       # Admin dashboard, clients, complaints, users, etc.
│   └── layout.tsx               # DashboardHeader + DashboardSidebar (userType="admin")
└── client/                      # Client dashboard, complaints, services, profile
    └── layout.tsx               # DashboardHeader + DashboardSidebar (userType="client")
```

### API Proxy Pattern

Frontend proxies `/api/*` to backend via `next.config.js` rewrites:
- Dev: `localhost:3000/api/*` → `localhost:4000/api/*`
- Prod: Vercel → Railway (`API_BACKEND_URL` env var)
- Backend sets `app.setGlobalPrefix('api')` in `main.ts`

### State Management

- **Auth:** AuthProvider context with Supabase `onAuthStateChange` (`lib/auth/auth-context.tsx`)
- **Forms:** React Hook Form + Zod + shadcn/ui
- **Theme:** next-themes for dark/light mode
- **Toasts:** `import { toast } from 'sonner'`

## Development Patterns

### Backend Service Pattern

```typescript
@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);
  constructor(private readonly supabaseService: SupabaseService) {}

  async getData(user: AuthUser) {
    const client = this.supabaseService.getAdminClient(); // or getClient(token) for RLS
    const { data, error } = await client.from('table').select('*');
    if (error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    return data;
  }
}
```

**camelCase → snake_case:** DTO props are camelCase, DB columns are snake_case. Map manually in service layer.

### Frontend API Call Pattern

```typescript
const token = await getSessionToken();
const response = await fetch('/api/feature', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Adding a New Backend Module

1. Create feature folder in `apps/api/src/`
2. Add Zod schemas in `packages/shared/src/schemas/`
3. Add types in `packages/shared/src/types/`
4. Create controller, service, module files
5. Register module in `app.module.ts`
6. Add frontend API client in `apps/web/lib/api/`

## Development Rules

**Full rules:** `/Users/sobanahmad/Work/AR&CO/Global_Development_Rules.md`

- **KISS / YAGNI / DRY / SOLID** principles
- Max **500 lines per file** (split at 400)
- Feature folder organization
- Every exported entity needs **JSDoc** with example
- `pnpm tsc --noEmit` before every commit

**Naming:** Files `camelCase.ts`, Classes `PascalCase`, Interfaces `IName`, Enums `PascalCase`, Constants `UPPER_SNAKE_CASE`

## Key Files

### Backend
- `apps/api/src/main.ts` - Bootstrap: global guards, filters, prefix, CORS
- `apps/api/src/app.module.ts` - Root module imports
- `apps/api/src/database/supabase.service.ts` - Supabase client management
- `apps/api/src/common/guards/jwt-auth.guard.ts` - JWT authentication
- `apps/api/src/common/guards/roles.guard.ts` - Role-based authorization
- `apps/api/src/config/configuration.ts` - Typed configuration factory
- `apps/api/AUTH_QUICK_REFERENCE.md` - Auth patterns reference

### Frontend
- `apps/web/app/layout.tsx` - Root layout with AuthProvider
- `apps/web/middleware.ts` - Auth session refresh, route protection
- `apps/web/lib/supabase/client.ts` - Browser Supabase client
- `apps/web/lib/supabase/server.ts` - Server component Supabase client
- `apps/web/lib/auth/auth-context.tsx` - AuthProvider with `useAuth()` hook
- `apps/web/lib/api/auth-helpers.ts` - Session token helper for API calls
- `apps/web/next.config.js` - API proxy rewrites

### Configuration
- `turbo.json` - Turborepo pipeline (dev, build, lint tasks)
- `railway.toml` - Backend deployment config
- `.node-version` - Node.js 20.18.1

## Environment Variables

**Frontend:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `API_BACKEND_URL`

**Backend:** `PORT`, `CORS_ORIGINS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `ADMIN_EMAILS`

See `.env.example` files in each app for full list.

## Deployment

- **Frontend:** Vercel (auto-deploys from GitHub, `vercel.json` for API proxy)
- **Backend:** Railway (`railway.toml`, build: `pnpm --filter api build`, start: `node dist/main`)

## Business Domain

- **Practice Areas:** Corporate Law, Tax Law, Immigration, Labour Law, IP, Real Estate, Litigation, Contracts
- **Facilitation Services:** NTN, SECP registration, compliance certificates, real estate docs, Women's Legal Desk
- **User Roles:** CLIENT, ATTORNEY, STAFF, ADMIN

## Planned Integrations

- **Payments:** [Lemon Squeezy](https://lemonsqueezy.com) ([API docs](https://docs.lemonsqueezy.com/api), [JS SDK](https://github.com/lmsqueezy/lemonsqueezy.js)) — see `docs/lemonsqueezy/`
- **Appointments:** [Cal.com API v2](https://cal.com/docs/api-reference/v2/introduction) with Google Calendar sync
- **Communication:** WhatsApp Business API, SendGrid email

## Scope Documents

- `/Users/sobanahmad/Work/AR&CO/Docs/Scope/AR_CO_Package2_Premium_updated.md`
- `/Users/sobanahmad/Work/AR&CO/Docs/Scope/AR_CO_Premium_Final_Proposal_updated.md`
- `/Users/sobanahmad/Work/AR&CO/Docs/Scope/AR_CO_feature_breakdown_updated.md`
