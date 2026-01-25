# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AR-CO is a comprehensive law firm website platform for AR&CO Law Firm, built as a **Turborepo monorepo** with separate Next.js frontend and NestJS backend applications. The platform includes:

- Public-facing law firm website with practice areas, attorney profiles, and facilitation services
- Client authentication portal (planned)
- Appointment booking system (planned)
- Integrated Safepay payment processing (planned)
- Admin CRM and content management (planned)

**Repository:** https://github.com/Schwifty101/AR-CO
**Current Branch:** `git status` (see for urself)

## Monorepo Structure

This is a **pnpm workspace** managed by **Turborepo**:

```
AR-CO/
├── apps/
│   ├── web/          # Next.js 16 frontend (port 3000)
│   └── api/          # NestJS backend (port 4000)
├── packages/
│   └── ui/           # Shared React component library (@repo/ui)
├── turbo.json        # Turborepo task configuration
└── pnpm-workspace.yaml
```

## Essential Commands

### Development

```bash
# Install dependencies (run from root)
pnpm install

# Start all apps in dev mode (web on :3000, api on :4000)
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint
```

### Frontend-Specific (apps/web)

```bash
cd apps/web

# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

### Backend-Specific (apps/api)

```bash
cd apps/api

# Development with auto-reload
pnpm start:dev

# Production build
pnpm build

# Start production
pnpm start:prod

# Run tests
pnpm test
pnpm test:e2e
pnpm test:cov

# Type check
pnpm tsc --noEmit
```

## Core Technologies & Documentation

### Frontend Stack (apps/web)

- **Framework:** [Next.js 16.0.10](https://nextjs.org/docs) with App Router
- **React:** [19.2.0](https://react.dev/)
- **Language:** [TypeScript 5.x](https://www.typescriptlang.org/docs/)
- **Styling:** [Tailwind CSS 4.1.9](https://tailwindcss.com/docs) + CSS Modules
- **UI Components:**
  - [Radix UI](https://www.radix-ui.com/) - Headless component primitives
  - [shadcn/ui](https://ui.shadcn.com/) - Pre-built component patterns (59 components in `components/ui/`)
  - [Lucide React](https://lucide.dev/) - Icon library
- **Forms & Validation:**
  - [React Hook Form 7.60.0](https://react-hook-form.com/)
  - [Zod 3.25.76](https://zod.dev/) - Schema validation
  - [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
- **UI Libraries:**
  - [Sonner](https://sonner.emilkowal.ski/) - Toast notifications
  - [Embla Carousel](https://www.embla-carousel.com/) - Carousel component
  - [React Day Picker](https://react-day-picker.js.org/) - Date picker
  - [Recharts](https://recharts.org/) - Chart library
  - [next-themes](https://github.com/pacocoursey/next-themes) - Dark mode support
- **Animation (Planned):**
  - [GSAP](https://greensock.com/gsap/) or [Framer Motion](https://www.framer.com/motion/) - Kinetic animations
- **Analytics:** [Vercel Analytics](https://vercel.com/docs/analytics)

### Backend Stack (apps/api)

- **Framework:** [NestJS 11.0.1](https://docs.nestjs.com/)
- **Runtime:** [Node.js &gt;= 20.9.0](https://nodejs.org/docs/)
- **Language:** [TypeScript 5.7.3](https://www.typescriptlang.org/docs/)
- **Database:** [Supabase](https://supabase.com/docs) (PostgreSQL + Auth + Storage)
  - Row-Level Security (RLS) with 50+ policies implemented
  - 19 tables with comprehensive data model
  - 5 utility functions in private schema
  - See [Supabase Community Discussions](https://github.com/orgs/supabase/discussions/29260) for best practices
- **Authentication:** JWT-based with Supabase Auth
  - Global guards for authentication and authorization
  - Role-based access control (CLIENT, ATTORNEY, STAFF, ADMIN)
  - Admin email whitelist for personal accounts
- **Testing:**
  - [Jest 30.0.0](https://jestjs.io/docs/getting-started)
  - [Supertest 7.0.0](https://github.com/visionmedia/supertest)

### Planned Integrations (per project scope)

- **Payment Gateway:** [Safepay](https://getsafepay.pk/)
  - [Implementation Guide](https://safepay-docs.netlify.app/)
  - [API Documentation](https://apidocs.getsafepay.com/)
- **Pakistan Legal News API** - Real-time news ticker
- **WhatsApp Business API** - Client communication
- **Email Service:** SendGrid or AWS SES
- **Calendar Integration:** Google Calendar / Outlook

### Development Tools

- **Monorepo:** [Turborepo 2.3.3](https://turbo.build/repo/docs)
- **Package Manager:** [pnpm 10.28.1](https://pnpm.io/)
- **Linting:** [ESLint 9.x](https://eslint.org/docs/latest/)
- **Formatting:** [Prettier 3.4.2](https://prettier.io/docs/en/)
  - Config: Single quotes, trailing commas

### Deployment & Infrastructure

- **Frontend Hosting:** [Vercel](https://vercel.com/docs)
- **Backend Hosting:** [Railway](https://docs.railway.app/)
- **CDN:** Global CDN for content delivery
- **SSL:** Premium SSL certificates

## Development Rules & Standards

**IMPORTANT:** This codebase follows strict TypeScript development standards documented in `/Users/sobanahmad/Work/AR&CO/Global_Development_Rules.md`. All code contributions must adhere to these rules.

### Key Principles (Summary)

**Core Principles:**

- **KISS** - Keep TypeScript types, functions, and modules minimal
- **YAGNI** - Implement only what's necessary for current feature scope
- **DRY** - Shared logic exists in ONE utility or module only
- **SOLID** - Follow Single-responsibility, Open-closed, Liskov substitution, Interface segregation, and Dependency inversion

**Code Structure:**

- Max **500 lines per file** (split at 400)
- Organized by **feature folder** (e.g., `/auth`, `/api`, `/db`, `/utils`)
- Use **relative imports** (`import { foo } from "../utils/foo"`)

**Naming Conventions:**

- Files: `camelCase.ts`
- Classes: `PascalCase`
- Interfaces: `IName`
- Enums: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Functions: `camelCase`

**Documentation Requirements:**

- Every exported entity must have **JSDoc-style block** (`/** ... */`)
- Include **working TypeScript example**
- Document **edge cases and gotchas**
- Full error handling with async and type-level validation

**Prohibited Practices:**

- Skipping research phase
- Creating generic, non-specialized solutions
- Advancing without validation
- Assuming implicit context or types
- Omitting examples
- Ignoring edge cases
- Missing error handling

**Before Every Commit:**

- Run static type checks: `pnpm tsc --noEmit`
- Validate code follows SOLID principles
- Ensure all exports have JSDoc documentation

For complete details, see: `/Users/sobanahmad/Work/AR&CO/Global_Development_Rules.md`

## Architecture Patterns

### Backend Authentication Architecture

The backend implements a comprehensive JWT-based authentication and authorization system:

**Guard Execution Flow:**

```
1. Request arrives with Authorization: Bearer <token>
   ↓
2. JwtAuthGuard runs (unless @Public())
   ├─ Extract JWT from Authorization header
   ├─ Validate with Supabase (getUserFromToken)
   └─ Populate request.user = AuthUser
   ↓
3. RolesGuard runs (if @Roles() present)
   ├─ Check admin whitelist → Allow if email whitelisted
   ├─ Check user.userType against required roles
   └─ Allow or throw ForbiddenException
   ↓
4. Route handler executes
   └─ Access user via @CurrentUser() decorator
```

**Key Components:**

- **SupabaseService**: Manages Supabase clients and JWT validation
  - `getClient(token)` - User-scoped client (RLS enforced)
  - `getAdminClient()` - Admin client (bypasses RLS, use with caution)
  - `getUserFromToken(token)` - Validates JWT and fetches user profile
- **JwtAuthGuard**: Authenticates requests, populates request.user
- **RolesGuard**: Authorizes based on user type (CLIENT, ATTORNEY, STAFF, ADMIN)
- **AdminWhitelistService**: Email-based admin access (e.g., personal Gmail accounts)

**Decorators:**

- `@Public()` - Skip authentication
- `@Roles(UserType.ADMIN)` - Require specific user types
- `@CurrentUser()` - Extract authenticated user from request

**Example Usage:**

```typescript
@Controller("cases")
export class CasesController {
  @Get("public")
  @Public()
  getPublicInfo() {} // No auth required

  @Get()
  getMyCases(@CurrentUser() user: AuthUser) {} // JWT required

  @Delete(":id")
  @Roles(UserType.ADMIN, UserType.STAFF)
  deleteCase(@Param("id") id: string) {} // Admin/staff only
}
```

**Admin Whitelist:**

- Configured via `ADMIN_EMAILS` in .env (comma-separated)
- Whitelisted emails bypass all @Roles() restrictions
- Used for personal email OAuth signups (e.g., Gmail, Outlook)
- Current whitelist: `sobanahmad2003@gmail.com`

**Documentation:**

- Quick Reference: `apps/api/AUTH_QUICK_REFERENCE.md`
- Testing Guide: `apps/api/TESTING_GUIDE.md`
- Implementation Details: `apps/api/IMPLEMENTATION_SUMMARY.md`

### API Proxy Pattern

The Next.js frontend proxies all `/api/*` requests to the NestJS backend to avoid CORS issues:

**Development:**

- Frontend (`localhost:3000`) → Backend (`localhost:4000`)

**Production:**

- Configured in `apps/web/next.config.js` via `rewrites()`
- Uses `API_BACKEND_URL` environment variable
- Vercel deployment proxies to Railway backend: `https://api-production-c05e.up.railway.app/api/*`

**Backend API Configuration:**

- All NestJS routes prefixed with `/api` via `app.setGlobalPrefix('api')` in `apps/api/src/main.ts`
- Example: `GET /api/hello` endpoint in `app.controller.ts`

### Component Organization

- **App-specific components:** `apps/web/components/` (Header, Footer, Hero, PracticeCard, etc.)
- **Shared UI library:** `packages/ui/` (currently exports Button component)
- **shadcn/ui components:** `apps/web/components/ui/` (59 pre-built components)
- **Styling:** Mix of Tailwind CSS utility classes and CSS Modules for component-scoped styles

### State Management

- **Forms:** React Hook Form with Zod validation
- **UI State:** React state and Context API
- **Theme:** next-themes for dark/light mode
- **Toasts:** Sonner for notifications

### NestJS Patterns (Backend)

- **Controller-Service-Module** pattern
- **Dependency Injection** for all services
- **DTOs** for request/response validation with class-validator
- **Guards** for authentication/authorization (implemented)
  - JwtAuthGuard: Validates JWT tokens and populates request.user
  - RolesGuard: Enforces role-based access control
- **Decorators** for route metadata
  - @Public(): Skip authentication
  - @Roles(...types): Require specific user types
  - @CurrentUser(): Extract authenticated user
- **Exception filters** for standardized error handling
  - HttpExceptionFilter: HTTP error formatting
  - SupabaseExceptionFilter: Database error mapping
- **Interceptors** for logging and transformation (planned)

## Key Files to Know

### Configuration Files

- `turbo.json` - Turborepo task pipeline and caching
- `pnpm-workspace.yaml` - Workspace package definitions
- `apps/web/next.config.js` - Next.js config with API proxy rewrites
- `apps/api/nest-cli.json` - NestJS CLI configuration
- `railway.toml` - Railway deployment config for backend

### Frontend Entry Points

- `apps/web/app/layout.tsx` - Root layout with analytics and theme provider
- `apps/web/app/page.tsx` - Homepage with practice areas
- `apps/web/app/globals.css` - Global Tailwind styles
- `apps/web/components/Header.tsx` - Navigation with mega-menu
- `apps/web/components/theme-provider.tsx` - Dark mode setup

### Backend Entry Points

- `apps/api/src/main.ts` - NestJS bootstrap with global guards, filters, and CORS
- `apps/api/src/app.module.ts` - Root module (imports ConfigModule, DatabaseModule)
- `apps/api/src/app.controller.ts` - Main controller with example authenticated endpoints
- `apps/api/src/app.service.ts` - Business logic
- `apps/api/src/database/supabase.service.ts` - Supabase client management
- `apps/api/src/common/guards/jwt-auth.guard.ts` - JWT authentication
- `apps/api/src/common/guards/roles.guard.ts` - Role-based authorization

### Environment Variables

**Frontend (.env.example):**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
API_BACKEND_URL=http://localhost:4000
```

**Backend (.env.example):**

```bash
# Application
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:4000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Admin Configuration
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Safepay, SendGrid, etc. (see .env.example)
```

## Development Workflow

### PRP Workflow (Plan → Review → Produce)

All feature implementation must follow this strict workflow:

1. **Plan:** Research official docs, define interfaces, plan module structure
2. **Review:** Validate approach against SOLID principles and project patterns
3. **Produce:** Implement with full error handling and type safety

### Running in Development

1. **Start both apps:** `pnpm dev` from root (uses Turborepo to start web + api)
2. **Frontend:** Accessible at http://localhost:3000
3. **Backend:** Runs on http://localhost:4000
4. **API calls:** Frontend makes requests to `/api/*` which proxy to backend

### Making Changes

- **Frontend changes:** Edit files in `apps/web/`, hot reload is enabled
- **Backend changes:** Edit files in `apps/api/`, ts-node-dev auto-restarts
- **Shared components:** Edit `packages/ui/`, rebuild required for apps to pick up changes
- **Turborepo caching:** Speeds up repeated builds by caching task outputs

### Adding New Features

When adding features (e.g., client portal, appointments, payments):

1. **Research:** Study official docs (Supabase, Safepay, NestJS patterns)
2. **Plan:** Define interfaces, DTOs, service structure
3. **Frontend:** Create components in `apps/web/components/`
4. **Backend:** Add controllers/services/modules following NestJS patterns
5. **Shared logic:** Extract to `packages/ui/` if reusable across apps
6. **shadcn/ui:** Use existing components from `components/ui/` or add new ones via shadcn CLI
7. **Validate:** Run `pnpm tsc --noEmit` before commit

## Important Notes

### API Integration

**Current Implementation:**

- ✅ Complete database schema with 19 tables and RLS policies
- ✅ JWT authentication system with guards and decorators
- ✅ Role-based access control (CLIENT, ATTORNEY, STAFF, ADMIN)
- ✅ Admin email whitelist for personal accounts
- ✅ Standardized error handling
- ✅ Example endpoints: `/api/hello` (public), `/api/profile` (protected), `/api/admin-dashboard` (admin-only)

**In Progress:**

- Authentication module (signup, login, OAuth, password reset)

**Planned:**

- User management endpoints (profile CRUD)
- Case management endpoints
- Appointment booking endpoints
- Payment processing (Safepay integration)
- Document management endpoints

**All routes prefixed with `/api`** per NestJS global prefix in `main.ts`

### Supabase Integration (Implemented)

**Completed:**

- ✅ Database schema with 19 tables (user_profiles, cases, appointments, invoices, etc.)
- ✅ Row-level security (RLS) with 50+ policies
- ✅ Private schema utility functions (is_admin, is_staff, get_client_profile_id)
- ✅ Database triggers (auto-generate case numbers, invoice numbers, updated_at timestamps)
- ✅ SupabaseService for client management (getClient, getAdminClient, getUserFromToken)
- ✅ JWT authentication via JwtAuthGuard

**Planned:**

- Real-time subscriptions for live updates
- File upload to Supabase Storage

**Important:**

- Always use `getClient(token)` for user operations (RLS enforced)
- Only use `getAdminClient()` when RLS bypass is necessary (document why)
- See `apps/api/AUTH_QUICK_REFERENCE.md` for authentication patterns

**Resources:**

- [Supabase Community Best Practices](https://github.com/orgs/supabase/discussions/29260)
- [Schema Validation Report](SCHEMA_VALIDATION_REPORT.md) - Database design review

### Payment Processing (Planned)

- Safepay integration for card and mobile wallet payments
- Webhook-based reconciliation
- Automated invoice generation
- Financial analytics dashboard
- **Follow Safepay implementation guide:** https://safepay-docs.netlify.app/
- **API reference:** https://apidocs.getsafepay.com/

### Appointment Booking Integration (Cal.com)

- Cal.com as primary booking interface and calendar orchestrator
- Google Calendar / Outlook synchronization via Cal.com
- Webhook-based appointment sync to backend database
- Pre-consultation payment capture via Safepay
- Automated email confirmations and reminders
- Client self-service rescheduling
- No-show tracking and analytics
- **Cal.com API Reference:** https://cal.com/docs/api-reference/v2/introduction
- **Google Calendar Integration:** https://developers.google.com/workspace/calendar/api/quickstart/js

### Security Considerations

- HTTPS enforced in production
- Input validation and sanitization (prevent XSS, SQL injection)
- CSRF protection
- Secure file uploads with validation
- Data encryption at rest and in transit
- CI/CD pipeline with security audits (planned)

### Business Domain (AR&CO Law Firm)

- **Practice Areas:** Corporate Law, Tax Law, Immigration, Labour Law, IP, Real Estate, Litigation, Contracts
- **Facilitation Services:** Business registration (NTN, SECP), compliance certificates (AML/CFT, Food Authority), real estate docs, personal certificates, Women's Legal Desk
- **Target Routes:** `/practice/*`, `/portal/login`, `/admin/login`

## Scope Documents

Detailed project requirements and feature specifications are available in:

- `/Users/sobanahmad/Work/AR&CO/Docs/Scope/AR_CO_Package2_Premium_updated.md` - Complete Premium package proposal
- `/Users/sobanahmad/Work/AR&CO/Docs/Scope/AR_CO_Premium_Final_Proposal_updated.md` - Final proposal with investment breakdown
- `/Users/sobanahmad/Work/AR&CO/Docs/Scope/AR_CO_feature_breakdown_updated.md` - Comprehensive feature matrix

## Testing

### Backend Tests

```bash
cd apps/api

# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov

# Type checking
pnpm tsc --noEmit
```

### Code Quality

```bash
# Lint all apps (from root)
pnpm lint

# Type check (from root)
turbo run type-check

# Format code with Prettier (run from individual apps if needed)
pnpm format
```

## Deployment

### Frontend (Vercel)

- Auto-deploys from GitHub on push
- Environment variables configured in Vercel dashboard
- `apps/web/vercel.json` configures production API proxy

### Backend (Railway)

- Configured via `railway.toml`
- Build command: `pnpm install --frozen-lockfile && pnpm --filter api build`
- Start command: `cd apps/api && node dist/main`
- Watches `/apps/api/**` for changes

## Package Manager Notes

- **Always use pnpm** (not npm or yarn)
- **Install from root:** `pnpm install` to maintain workspace integrity
- **Add dependencies:**
  - Frontend: `pnpm add <package> --filter web`
  - Backend: `pnpm add <package> --filter api`
  - Shared UI: `pnpm add <package> --filter ui`

## Node Version

- **Required:** Node.js >= 20.9.0
- **Pinned version:** 20.18.1 (see `.node-version`)

## Common Tasks

### Adding a new shadcn/ui component

```bash
cd apps/web
npx shadcn@latest add <component-name>
```

### Creating a new package

1. Add directory in `packages/`
2. Create `package.json` with `@repo/` scoped name
3. Update `pnpm-workspace.yaml` if needed
4. Run `pnpm install` from root

### Creating a new API endpoint (NestJS)

1. **Research:** Study NestJS controller/service patterns
2. **Plan:** Define DTOs, interfaces, service methods
3. **Create Controller:** Add route handler with appropriate decorators

   ```typescript
   import { Controller, Get } from "@nestjs/common";
   import { CurrentUser } from "./common/decorators/current-user.decorator";
   import { Roles } from "./common/decorators/roles.decorator";
   import { UserType } from "./common/enums/user-type.enum";
   import type { AuthUser } from "./common/interfaces/auth-user.interface";

   @Controller("cases")
   export class CasesController {
     @Get()
     getMyCases(@CurrentUser() user: AuthUser) {
       // JWT required by default
     }

     @Get("admin")
     @Roles(UserType.ADMIN, UserType.STAFF)
     getAdminCases(@CurrentUser() user: AuthUser) {
       // Only admin and staff can access
     }
   }
   ```

4. **Create Service:** Implement business logic with Supabase RLS
   ```typescript
   async getUserCases(user: AuthUser) {
     const client = this.supabase.getClient();
     const { data } = await client
       .from('cases')
       .select('*')
       .eq('client_profile_id', user.clientProfileId);
     return data;
   }
   ```
5. **Add Module:** Register in appropriate module
6. **Validate:** Test with Supertest, check types with `tsc --noEmit`

**Authentication Reference:** See `apps/api/AUTH_QUICK_REFERENCE.md` for complete patterns

### Debugging

- **Frontend:** Use browser DevTools, React DevTools extension
- **Backend:** Use NestJS debugging or attach Node debugger to port 4000
- **Logs:** Check terminal output for both dev servers

## Git Workflow

- **Main branch:** Production-ready code
- **Current branch:** `git status` (see for urself)
- **Commit conventions:** Use clear, descriptive commit messages
- Recent focus: UI improvements, animations, header fixes, client logo carousel

## Additional Resources

### Official Documentation

- **Next.js App Router:** https://nextjs.org/docs/app
- **NestJS Documentation:** https://docs.nestjs.com/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Turborepo Handbook:** https://turbo.build/repo/docs/handbook
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI Components:** https://www.radix-ui.com/primitives/docs/overview/introduction
- **shadcn/ui:** https://ui.shadcn.com/docs

### Integration Guides

- **Supabase Guides:** https://supabase.com/docs/guides
- **Supabase Community:** https://github.com/orgs/supabase/discussions/29260
- **Safepay Implementation:** https://safepay-docs.netlify.app/
- **Safepay API Reference:** https://apidocs.getsafepay.com/
- **Safepay Webhooks:** https://apidocs.getsafepay.com/#170e6887-a78e-492f-beea-0c5479129e85
- **Cal.com API v2 Documentation:** https://cal.com/docs/api-reference/v2/introduction
- **Cal.com Webhooks:** https://cal.com/docs/api-reference/v2/webhooks
- **Google Calendar API:** https://developers.google.com/workspace/calendar/api/quickstart/js
- **Google Calendar Events Guide:** https://developers.google.com/workspace/calendar/create-events

### Project-Specific Rules

- **Global Development Rules:** `/Users/sobanahmad/Work/AR&CO/Global_Development_Rules.md` (mandatory reading)
