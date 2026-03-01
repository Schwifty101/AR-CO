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
3. Next batch to execute: **Tasks 10–12**

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

### Task 7: Backend — Google Docs Service ✅
- Created `apps/api/src/content/google-docs.service.ts` (299 lines)
- Methods: `extractDocId()`, `fetchAndParse()`, `convertToHtml()`, `extractCaseStudyMetadata()`
- Verified: `pnpm tsc --noEmit` passes
- Commit: `1f9169b`

### Task 8: Backend — Blog Service ✅
- Created `apps/api/src/content/blog.service.ts` (622 lines)
- Methods: `createPost()`, `updatePost()`, `syncFromGoogleDoc()`, `deletePost()`, `getPublishedPosts()`, `getPostBySlug()`, `getAllPosts()`, `incrementViewCount()`, category CRUD
- Fixed `incrementViewCount` — uses simple read-then-increment (no broken RPC fallback)
- **Note:** File exceeds 500-line limit; category methods could be extracted in future refactor
- Verified: `pnpm tsc --noEmit` passes
- Commit: `f68c21a`

### Task 9: Backend — Testimonials & Legal News Services ✅
- Created `apps/api/src/content/testimonials.service.ts` (228 lines)
- Created `apps/api/src/content/legal-news.service.ts` (118 lines)
- Followed `complaints.service.ts` patterns (Injectable, Logger, DbResult, mapRow)
- Required `pnpm build` in shared package to expose new type exports
- Verified: `pnpm tsc --noEmit` passes
- Commit: `4996f49`

---

## Remaining Tasks (1 of 16)

### Task 10: Backend — Content Controllers ✅
- Created `apps/api/src/content/blog.controller.ts` (12 endpoints: posts CRUD, categories CRUD, view tracking)
- Created `apps/api/src/content/testimonials.controller.ts` (5 endpoints: submit, approve/reject, list)
- Created `apps/api/src/content/legal-news.controller.ts` (2 endpoints: list, create)
- Route ordering verified: `@Get('posts/admin')` BEFORE `@Get('posts/:slug')`
- Fixed method name mismatches: `incrementView` → `incrementViewCount`, `syncPost` → `syncFromGoogleDoc`
- Verified: `pnpm tsc --noEmit` passes
- Commit: `ce4bfe7`

### Task 11: Backend — Content Module & Registration ✅
- Created `apps/api/src/content/content.module.ts` (3 controllers, 5 providers, 3 exports)
- Registered `ContentModule` in `apps/api/src/app.module.ts`
- Verified: `pnpm tsc --noEmit` passes
- Commit: `ce4bfe7`

### Task 12: Frontend — Content API Client ✅
- Created `apps/web/lib/api/content.ts` with 19 typed API functions
- Blog: getPublishedPosts, getPostBySlug, getAdminPosts, createPost, updatePost, syncPost, deletePost, incrementView
- Categories: getCategories, createCategory, updateCategory, deleteCategory
- Testimonials: getApprovedTestimonials, submitTestimonial, getAllTestimonials, approveTestimonial, rejectTestimonial
- Legal News: getLatestNews, createNewsItem
- Verified: `pnpm tsc --noEmit` passes
- Commit: `ce4bfe7`

### Task 13: Frontend — Admin Content List Page ✅
- Created `apps/web/app/admin/content/page.tsx` (~456 lines)
- Added "Content" link with `FileText` icon to `ADMIN_NAV` in sidebar.tsx
- Tabs (Blogs/Case Studies), DataTable with status badges, search, category filter, pagination
- Delete action with confirmation
- Verified: `pnpm tsc --noEmit` passes
- Commit: `5884eaa`

### Task 14: Frontend — Admin Content Create/Edit Pages ✅
- Created `apps/web/app/admin/content/new/page.tsx` (~190 lines, Google Doc URL form)
- Created `apps/web/app/admin/content/[id]/page.tsx` (~400 lines, SEO fields, re-sync, publish, delete)
- Uses Next.js 16 async params pattern with `use()` hook
- Verified: `pnpm tsc --noEmit` passes
- Commit: `5884eaa`

### Task 15: Frontend — Update Public Blog Pages ✅
- Modified `apps/web/app/(public)/blogs/page.tsx` — API-backed with loading state, kept all animations
- Modified `apps/web/app/(public)/blogs/[slug]/page.tsx` — API fetch, view increment, HTML content rendering
- Fixed ContentType enum usage (string literals → `ContentType.BLOG`/`ContentType.CASE_STUDY`)
- Verified: `pnpm tsc --noEmit` passes
- Commit: `5884eaa`

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

- ~~**Batch 1:** Tasks 1, 2, 3~~ ✅
- ~~**Batch 2:** Tasks 4, 5, 6~~ ✅
- ~~**Batch 3:** Tasks 7, 8, 9~~ ✅
- ~~**Batch 4:** Tasks 10, 11, 12~~ ✅
- ~~**Batch 5:** Tasks 13, 14, 15~~ ✅
- **Batch 6 (NEXT):** Task 16 (Final verification)

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
- **incrementViewCount fix:** ~~Plan's Task 8 has a broken RPC fallback~~ — DONE, uses simple read-then-increment
- **Shared package rebuild:** After modifying shared types/schemas, run `cd packages/shared && pnpm build` before API type-check
- **blog.service.ts is 622 lines** — exceeds 500-line rule; category methods could be extracted later
- **Agents can't write files:** Bash-type subagents lack Write tool — use general-purpose agents or do file writes directly
