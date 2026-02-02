# AR-CO Copilot Instructions

## Project Overview

**AR-CO** is a **Turborepo monorepo** for AR&CO Law Firm featuring:

- **Next.js 16** frontend (`apps/web`) on port 3000
- **NestJS 11** backend (`apps/api`) on port 4000
- **Supabase** PostgreSQL database with Row-Level Security (50+ policies, 19 tables)
- **pnpm workspaces** for dependency management

**GitHub:** Schwifty101/AR-CO | **Current branch:** main

## Critical Architecture

### Monorepo Structure & Turbo Configuration

```
AR-CO/
├── apps/
│   ├── web/        # Next.js 16 with App Router, Tailwind + CSS Modules
│   └── api/        # NestJS with global JWT + roles auth
├── packages/
│   └── ui/         # Shared React components (@repo/ui)
├── turbo.json      # Tasks: dev (persistent, no cache), build, lint
└── pnpm-workspace.yaml
```

**Key principle:** Both dev servers run independently. Frontend proxies `/api/*` requests to backend.

### API Proxy & Deployment Pattern

Frontend uses Next.js rewrites to proxy API calls:

- **Dev:** `localhost:3000/api/*` → `localhost:4000/api/*`
- **Prod:** Vercel frontend → Railway backend via `API_BACKEND_URL` env var
- Backend applies global prefix: `app.setGlobalPrefix('api')` in `apps/api/src/main.ts`
- All routes automatically prefixed: `/auth/signup` becomes `/api/auth/signup`

**Config file:** `apps/web/next.config.js`

### Frontend Architecture

**Component organization** (`apps/web/components/`):

- `ui/` — 57 shadcn/ui components (DO NOT modify directly; regenerate via `npx shadcn@latest add <name>`)
- `nav/` — Header with three states: non-scrolled (dropdowns), scrolled (side panel), mobile (full-screen)
- `home/` — Page sections with GSAP animations
- `dashboard/` — Admin/client portals
- `shared/` — Animation utilities (SlotMachineText, etc.)
- `auth/` — Login/signup forms

**Styling pattern:** Tailwind CSS + CSS Modules (one `.module.css` per component for scoped styles)

### Backend Architecture

**NestJS structure** (`apps/api/src/`):

```
├── auth/           # Signup, signin, OAuth, token refresh, password reset
├── common/
│   ├── guards/     # JwtAuthGuard (validates tokens), RolesGuard (RBAC)
│   ├── decorators/ # @Public(), @CurrentUser(), @Roles()
│   ├── filters/    # HTTP & Supabase exception handlers
│   └── interfaces/ # AuthUser interface
├── database/       # Supabase client + admin whitelist service
├── config/         # Environment & admin email config
└── main.ts         # Bootstrap: global guards, validation, CORS
```

**Authentication flow:**

1. Client signs up/in via Supabase (email/password or Google OAuth)
2. Frontend calls `/api/auth/signup` or `/api/auth/signin` with Supabase token
3. Backend validates token via Supabase, returns user profile + `accessToken` in response
4. Frontend stores tokens in httpOnly cookies (Supabase SSR lib handles this)
5. JwtAuthGuard on protected routes validates `Authorization: Bearer <token>` header

**Authorization:**

- 4 user types: `CLIENT`, `ATTORNEY`, `STAFF`, `ADMIN`
- Admin emails from `ADMIN_EMAILS` env var bypass role checks
- Use `@Roles(UserType.ADMIN)` to protect routes

## Essential Commands

```bash
# From monorepo root
pnpm install               # Install all dependencies
pnpm dev                   # Start web + api simultaneously
pnpm build                 # Build all apps
pnpm lint                  # Lint all apps
pnpm tsc --noEmit          # Type-check all apps

# Frontend only
cd apps/web && pnpm dev    # Or: pnpm dev --filter web
pnpm add <pkg> --filter web

# Backend only
cd apps/api && pnpm start:dev  # Or: pnpm dev --filter api
pnpm add <pkg> --filter api
pnpm test                  # Unit tests (Jest)
pnpm test:e2e              # End-to-end tests (Supertest)

# Add shadcn/ui component
cd apps/web && npx shadcn@latest add <component-name>
```

## Project-Specific Patterns

### GSAP Animation Conventions

The project uses GSAP (GreenSock) with ScrollTrigger for scroll-based animations:

```tsx
// Always register plugins with SSR guard at module level
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

// Import scroll speed presets from SmoothScroll.tsx
import {
  setSlowScroll,
  setMediumScroll,
  setOverlapScroll,
} from "@/components/SmoothScroll";

// In component
useEffect(() => {
  setSlowScroll(); // 30% speed for hero frame sequences
}, []);
```

**Key exports from SmoothScroll.tsx:**

- `setSlowScroll()` — 30% speed for frame animation playback
- `setMediumScroll()` — 50% speed for transitions
- `setOverlapScroll()` — For parallax Hero → QuoteSection
- `getSmoother()` — Access global ScrollSmoother instance
- `setScrollSpeed(n)`, `setSmoothness(n)` — Fine-grained control

**Example:** Header hides on scroll within Hero section (data-hero-section="true"), then reappears. See Header.tsx for scroll detection pattern.

### Authentication & Authorization Patterns

**Backend decorators for route protection:**

```typescript
// Public route (no auth needed)
@Post('signin')
@Public()
signin(@Body() dto: SigninDto) { }

// Protected route (JWT required)
@Get('profile')
getProfile(@CurrentUser() user: AuthUser) { }

// Role-protected route
@Get('admin-dashboard')
@Roles(UserType.ADMIN, UserType.STAFF)
adminDashboard(@CurrentUser() user: AuthUser) { }
```

**Frontend auth context:**

```tsx
// In layout.tsx
import { AuthProvider } from "@/lib/auth/auth-context";

export default function RootLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// In components
import { useAuth } from "@/lib/auth/use-auth";

export function MyComponent() {
  const { user, isLoading } = useAuth();
  return user ? <p>{user.email}</p> : <p>Not logged in</p>;
}
```

See auth-context.tsx for implementation.

### NestJS Services & DTOs

**Always use DTOs** for request validation:

```typescript
// Create src/my-feature/dto/my-request.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class MyRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;
}

// Controller automatically validates via global ValidationPipe
@Post('endpoint')
@Public()
myEndpoint(@Body() dto: MyRequestDto) {
  return dto; // DTO is validated
}
```

Supabase service is injected globally; use in any service:

```typescript
constructor(private readonly supabase: SupabaseService) {}

async getUser(id: string) {
  const { data, error } = await this.supabase.client
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
```

## Key Files Reference

| Layer         | Purpose                  | File                                           |
| ------------- | ------------------------ | ---------------------------------------------- |
| **Infra**     | API proxy                | `apps/web/next.config.js`                      |
|               | Turbo config             | `turbo.json`                                   |
| **FE Auth**   | Auth state management    | `apps/web/lib/auth/auth-context.tsx`           |
|               | useAuth hook             | `apps/web/lib/auth/use-auth.ts`                |
| **FE Layout** | Root HTML + metadata     | `apps/web/app/layout.tsx`                      |
|               | Animations preset        | `apps/web/components/SmoothScroll.tsx`         |
| **BE Auth**   | Login/signup/OAuth/reset | `apps/api/src/auth/auth.controller.ts`         |
|               | JWT validation           | `apps/api/src/common/guards/jwt-auth.guard.ts` |
|               | Role-based access        | `apps/api/src/common/guards/roles.guard.ts`    |
| **BE Boot**   | Global config & guards   | `apps/api/src/main.ts`                         |
|               | Supabase client          | `apps/api/src/database/supabase.service.ts`    |
| **Utils**     | Tailwind + radix helpers | `apps/web/lib/utils.ts`                        |

## Development Workflow

1. **Type check & lint** before pushing:

   ```bash
   pnpm tsc --noEmit && pnpm lint
   ```

2. **Add JSDoc to all exports:**

   ```typescript
   /**
    * Validates user email via Supabase.
    * @param email - User email address
    * @returns True if email is verified
    * @example
    * const verified = await isEmailVerified('user@example.com');
    */
   export async function isEmailVerified(email: string): Promise<boolean> {}
   ```

3. **File size limits:**
   - Components: Max 400 lines, split into smaller pieces at 500 lines
   - Services: Max 300 lines per method
   - Keep files focused on single responsibility

4. **Use correct naming conventions:**
   - Components, classes, interfaces: `PascalCase`
   - Functions, variables, files: `camelCase` (or `PascalCase.tsx` for React)
   - Constants: `UPPER_SNAKE_CASE`

## Common Tasks

### Adding a new API endpoint

1. Create DTO in `apps/api/src/my-feature/dto/`
2. Add method to controller in `apps/api/src/my-feature/my-feature.controller.ts`
3. Implement logic in service in `apps/api/src/my-feature/my-feature.service.ts`
4. Use `@Public()`, `@CurrentUser()`, `@Roles()` decorators as needed
5. Frontend calls via `fetch('/api/my-feature/endpoint')`

### Adding a new page with animations

1. Create page component in `apps/web/app/my-page/page.tsx`
2. Import animation utilities from `SmoothScroll.tsx`
3. Pair with CSS Module: `my-page/page.module.css`
4. Use Tailwind + CSS Modules for styling
5. Test scroll performance with GSAP ScrollTrigger

### Protecting a backend route

```typescript
// For authenticated users only
@Get('my-route')
@CurrentUser() user: AuthUser { }

// For specific roles
@Get('admin-only')
@Roles(UserType.ADMIN)
adminRoute(@CurrentUser() user: AuthUser) { }

// Public route
@Post('public-endpoint')
@Public()
publicRoute(@Body() dto: MyDto) { }
```
