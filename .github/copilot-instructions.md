# AR-CO Copilot Instructions

## Project Overview

AR-CO is a Turborepo monorepo for AR&CO Law Firm featuring a Next.js 16 frontend (`apps/web`) and NestJS 11 backend (`apps/api`). Uses pnpm workspaces.

## Critical Architecture

### API Proxy Pattern

Frontend proxies all `/api/*` requests to the NestJS backend:

- Dev: `localhost:3000` → `localhost:4000`
- Prod: Vercel → Railway (`API_BACKEND_URL` in `apps/web/next.config.js`)
- Backend routes are prefixed with `/api` via `app.setGlobalPrefix('api')` in `apps/api/src/main.ts`

### Component Organization

```
apps/web/components/
├── ui/              # 57 shadcn/ui components (DO NOT modify directly)
├── home/            # Homepage sections (Hero, PracticeAreas, QuoteSection)
├── nav/             # Navigation (Header, MegaMenu, MobileMenu)
├── footer/          # Footer components
└── shared/          # Reusable app components
```

### Styling Pattern

- **Tailwind CSS** for utility classes + **CSS Modules** for component-scoped styles
- Each component has a paired `.module.css` file (e.g., `Hero.tsx` + `Hero.module.css`)
- shadcn/ui components use `class-variance-authority` for variants

## Essential Commands

```bash
# Always run from monorepo root
pnpm install          # Install all dependencies
pnpm dev              # Start web (:3000) + api (:4000) together
pnpm build            # Build all apps
pnpm lint             # Lint all apps

# Filter to specific app
pnpm dev --filter web
pnpm dev --filter api

# Add dependencies (use --filter)
pnpm add <package> --filter web
pnpm add <package> --filter api

# Add shadcn/ui component
cd apps/web && npx shadcn@latest add <component>
```

## Code Conventions

### File/Naming Standards

- Files: `camelCase.ts` or `PascalCase.tsx` for components
- Interfaces: `IName`, Classes: `PascalCase`, Constants: `UPPER_SNAKE_CASE`
- Max 500 lines per file (split at 400)
- All exports require JSDoc with working examples

### Animation Pattern (GSAP)

The project uses GSAP with ScrollTrigger/ScrollSmoother for animations:

```tsx
// Register plugins at module level with SSR guard
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
```

Use `SmoothScroll.tsx` exports (`setSlowScroll`, `setNormalScroll`) to control scroll speed dynamically.

### NestJS Backend Pattern

- Controller-Service-Module architecture
- All routes prefixed with `/api` (global prefix)
- Use DTOs for request/response validation
- Follow dependency injection pattern

## Key Files Reference

| Purpose          | File                                      |
| ---------------- | ----------------------------------------- |
| API proxy config | `apps/web/next.config.js`                 |
| Turbo pipeline   | `turbo.json`                              |
| Root layout      | `apps/web/app/layout.tsx`                 |
| Smooth scroll    | `apps/web/components/SmoothScroll.tsx`    |
| NestJS bootstrap | `apps/api/src/main.ts`                    |
| UI utilities     | `apps/web/lib/utils.ts` (`cn()` function) |

## Before Every Commit

1. Run `pnpm tsc --noEmit` (type check)
2. Run `pnpm lint`
3. Ensure JSDoc on all exports
4. Follow PRP workflow: Plan → Review → Produce

## Current Development Focus

- Active branch: `moiz_branch`
- Focus: UI polish, GSAP animations, hero frame sequence
- Planned features: Client portal, Supabase auth, Safepay payments
