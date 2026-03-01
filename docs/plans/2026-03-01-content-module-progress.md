# Content Module Implementation Progress

> **Plan:** `docs/plans/2026-03-01-content-module-plan.md`
> **Design:** `docs/plans/2026-03-01-content-module-design.md`
> **Branch:** `feat/content-module`
> **Worktree:** `/Users/sobanahmad/Work/AR&CO/AR-CO/.worktrees/content-module`
> **Skill:** Use `superpowers:executing-plans` to continue implementation

---

## Resume Instructions

1. Open a new Claude Code window in the worktree: `/Users/sobanahmad/Work/AR&CO/AR-CO/.worktrees/content-module`
2. Tell Claude: "Continue executing the content module plan. Read `docs/plans/2026-03-01-content-module-progress.md` for current status, `docs/plans/2026-03-01-content-module-plan.md` for the full plan."
3. Next batch to execute: **Tasks 7–9**

---

## Completed Tasks

### Task 1: Database Migration — Add Content Columns ✅
- Applied via Supabase MCP `apply_migration` tool
- Migration name: `add_content_columns_to_blog_posts`
- Added columns: `content_type`, `metadata`, `meta_title`, `meta_description`, `read_time`, `is_featured`, `google_doc_id`, `google_doc_url`
- Added indexes: `idx_blog_posts_content_type`, `idx_blog_posts_is_featured`
- Verified: SQL query confirmed all 8 columns exist
- **No local commit** (remote migration only)

### Task 2: Shared Package — Enums ✅
- Added `ContentType` (BLOG, CASE_STUDY) and `PostStatus` (DRAFT, PUBLISHED, ARCHIVED) to `packages/shared/src/enums.ts`
- Exported from `packages/shared/src/index.ts`
- Verified: `pnpm tsc --noEmit` passes
- Commit: `5ca7135`

### Task 3: Shared Package — Content Schemas ✅
- Created `packages/shared/src/schemas/content.schemas.ts` with all Zod schemas:
  - Content: `CreateContentPostSchema`, `UpdateContentPostSchema`, `ContentFiltersSchema`, `ContentPostResponseSchema`, `PaginatedContentPostsResponseSchema`
  - Categories: `CreateCategorySchema`, `UpdateCategorySchema`, `CategoryResponseSchema`
  - Testimonials: `CreateTestimonialSchema`, `TestimonialResponseSchema`, `PaginatedTestimonialsResponseSchema`
  - Legal News: `CreateLegalNewsSchema`, `LegalNewsResponseSchema`
- Exported from `packages/shared/src/schemas/index.ts`
- Verified: `pnpm tsc --noEmit` passes
- Commit: `585555b`

### Task 4: Shared Package — Content Types ✅
- Created `packages/shared/src/types/content.types.ts` with all type inferences from Zod schemas
- Exported 14 types from `packages/shared/src/types/index.ts`
- Verified: `pnpm tsc --noEmit` passes (shared + api)
- Commit: `0946435`

### Task 5: Backend — Install googleapis & Google Config ✅
- Installed `googleapis@^171.4.0` via `pnpm add googleapis --filter api`
- Added `GoogleConfig` interface to `apps/api/src/config/configuration.ts`
- Added `GOOGLE_SERVICE_ACCOUNT_KEY` Joi validation to `validation.schema.ts`
- Verified: `pnpm tsc --noEmit` passes
- Commit: `ac5cd3b`

### Task 6: Backend — SEO Service ✅
- Created `apps/api/src/content/seo.service.ts` (155 lines)
- Methods: `generateSeoFields()`, `generateUniqueSlug()`, `generateMetaTitle()`, `generateMetaDescription()`, `generateReadTime()`
- Verified: `pnpm tsc --noEmit` passes
- Commit: `50f7cb0`

---

## Remaining Tasks

### Task 7: Backend — Google Docs Service ⬜
- Create `apps/api/src/content/google-docs.service.ts`
- Methods: `extractDocId()`, `fetchAndParse()`, `convertToHtml()`, `extractCaseStudyMetadata()`
- Verify: `cd apps/api && pnpm tsc --noEmit`
- **Depends on:** Task 5 (googleapis + GoogleConfig)

### Task 8: Backend — Blog Service ⬜
- Create `apps/api/src/content/blog.service.ts`
- Methods: `createPost()`, `updatePost()`, `syncFromGoogleDoc()`, `deletePost()`, `getPublishedPosts()`, `getPostBySlug()`, `getAllPosts()`, `incrementViewCount()`, category CRUD
- **NOTE:** Fix broken `incrementViewCount` fallback from plan — use simple read-then-write approach
- Verify: `cd apps/api && pnpm tsc --noEmit`
- **Depends on:** Tasks 4, 6, 7

### Task 9: Backend — Testimonials & Legal News Services ⬜
- Create `apps/api/src/content/testimonials.service.ts`
- Create `apps/api/src/content/legal-news.service.ts`
- Follow `complaints.service.ts` patterns
- Verify: `cd apps/api && pnpm tsc --noEmit`
- **Depends on:** Task 4 (shared types)

### Task 10: Backend — Content Controllers ⬜
- Create `apps/api/src/content/blog.controller.ts`
- Create `apps/api/src/content/testimonials.controller.ts`
- Create `apps/api/src/content/legal-news.controller.ts`
- **IMPORTANT:** Place `@Get('posts/admin')` BEFORE `@Get('posts/:slug')` in blog controller
- Follow `complaints.controller.ts` patterns
- Verify: `cd apps/api && pnpm tsc --noEmit`
- **Depends on:** Tasks 8, 9

### Task 11: Backend — Content Module & Registration ⬜
- Create `apps/api/src/content/content.module.ts`
- Register `ContentModule` in `apps/api/src/app.module.ts`
- Verify: `cd apps/api && pnpm tsc --noEmit`
- **Depends on:** Task 10

### Task 12: Frontend — Content API Client ⬜
- Create `apps/web/lib/api/content.ts`
- Functions: `getPublishedPosts()`, `getPostBySlug()`, `getAdminPosts()`, `createPost()`, `updatePost()`, `syncPost()`, `deletePost()`, `incrementView()`, `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()`
- Follow `apps/web/lib/api/complaints.ts` patterns
- Verify: `cd apps/web && pnpm tsc --noEmit`
- **Depends on:** Task 4 (shared types)

### Task 13: Frontend — Admin Content List Page ⬜
- Create `apps/web/app/admin/content/page.tsx`
- Add "Content" link with `FileText` icon to `ADMIN_NAV` in `apps/web/components/dashboard/sidebar.tsx`
- Tabs: Blogs / Case Studies, DataTable, status badges, search, filters
- Verify: `cd apps/web && pnpm tsc --noEmit`
- **Depends on:** Task 12

### Task 14: Frontend — Admin Content Create/Edit Pages ⬜
- Create `apps/web/app/admin/content/new/page.tsx` (Google Doc URL form)
- Create `apps/web/app/admin/content/[id]/page.tsx` (Edit with SEO fields, re-sync, publish)
- Verify: `cd apps/web && pnpm tsc --noEmit`
- **Depends on:** Task 12

### Task 15: Frontend — Update Public Blog Pages ⬜
- Modify `apps/web/app/(public)/blogs/page.tsx` to use API
- Convert `apps/web/app/(public)/blogs/[slug]/page.tsx` to server component with `generateMetadata()` + JSON-LD
- Verify: `cd apps/web && pnpm tsc --noEmit`
- **Depends on:** Task 12

### Task 16: Final Verification & Cleanup ⬜
- Full type check: shared + api + web
- Lint: `pnpm lint`
- Remove static data files if unused
- Verify no broken imports
- **Depends on:** All previous tasks

---

## Dependency Graph

```
Task 1 (DB Migration) ──────────────────────────────────────┐
Task 2 (Enums) ─── Task 3 (Schemas) ─── Task 4 (Types) ───┤
                                                             │
Task 5 (googleapis) ─── Task 7 (Google Docs Service) ──────┤
                                                             │
Task 6 (SEO Service) ──────────────────────────────────────┤
                                                             │
                    ┌── Task 8 (Blog Service) ◄─ 4,6,7      │
                    │                                        │
                    ├── Task 9 (Testimonials+News) ◄─ 4     │
                    │                                        │
                    └──► Task 10 (Controllers) ◄─ 8,9       │
                              │                              │
                              ▼                              │
                         Task 11 (Module) ◄─ 10             │
                                                             │
Task 4 ──► Task 12 (API Client) ──┬── Task 13 (List Page)  │
                                   ├── Task 14 (Create/Edit) │
                                   └── Task 15 (Public Blog) │
                                                             │
                         Task 16 (Final Verify) ◄─ ALL ─────┘
```

## Suggested Batches for Remaining Work

- **Batch 2:** Tasks 4, 5, 6 (Types + googleapis install + SEO service — all independent)
- **Batch 3:** Tasks 7, 8, 9 (Google Docs + Blog + Testimonials services)
- **Batch 4:** Tasks 10, 11, 12 (Controllers + Module + API Client)
- **Batch 5:** Tasks 13, 14, 15 (Frontend pages)
- **Batch 6:** Task 16 (Final verification)

## Key Patterns Reference

- **Backend controller pattern:** See `apps/api/src/complaints/complaints.controller.ts`
- **Backend service pattern:** See `apps/api/src/complaints/complaints.service.ts`
- **Frontend API client pattern:** See `apps/web/lib/api/complaints.ts`
- **Shared types pattern:** See `packages/shared/src/types/complaints.types.ts`
- **DB result types:** `import type { DbResult, DbListResult } from '../database/db-result.types'`
- **Query helpers:** `import { validateSortColumn, sanitizePostgrestFilter } from '../common/utils/query-helpers'`
- **Zod validation pipe:** `new ZodValidationPipe(Schema)` in controller param decorators
- **Auth decorators:** `@Public()`, `@Roles(UserType.ADMIN, UserType.STAFF)`, `@CurrentUser() user: AuthUser`

## Important Notes

- **Worktree setup:** After `pnpm install`, must run `cd packages/shared && pnpm build` before API type-check works
- **Configuration:** `SafepayConfig` still exists in `configuration.ts` — plan adds `GoogleConfig` alongside it
- **No `.env.example`** file exists — add Google env var to `.env` directly with a comment
- **incrementViewCount fix:** Plan's Task 8 has a broken RPC fallback — use simple read-then-increment approach instead
