# Content Module Design — HEAD TASK 11

**Date:** 2026-03-01
**Status:** Approved
**Scope:** Blog posts, case studies (via content_type enum), Google Docs integration, auto SEO, testimonials, legal news

---

## 1. Architecture Overview

Content is managed through a single `blog_posts` table with a `content_type` discriminator column (`blog` or `case_study`). Admins create content by pasting a Google Doc URL; the backend fetches the document via Google Docs API (service account), converts it to HTML, auto-generates SEO fields, and stores it in Supabase. Admins can review/edit SEO fields before publishing and re-sync from the source doc at any time.

---

## 2. Database Changes

### 2.1 New Columns on `blog_posts`

```sql
ALTER TABLE blog_posts
  ADD COLUMN content_type text NOT NULL DEFAULT 'blog',
  ADD COLUMN metadata jsonb DEFAULT '{}',
  ADD COLUMN meta_title text,
  ADD COLUMN meta_description text,
  ADD COLUMN read_time text,
  ADD COLUMN is_featured boolean DEFAULT false,
  ADD COLUMN google_doc_id text,
  ADD COLUMN google_doc_url text;
```

**`content_type` values:** `blog`, `case_study`

**`metadata` JSONB (for case studies):**
```json
{
  "outcome": "Secured a 2.4B settlement...",
  "client_name": "Confidential — Fortune 500 Affiliate",
  "duration": "18 months",
  "year": "2025",
  "tags": ["International Arbitration", "Corporate Dispute"]
}
```

### 2.2 New Enum in Shared Package

```typescript
// packages/shared/src/enums.ts
export enum ContentType {
  BLOG = 'blog',
  CASE_STUDY = 'case_study',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
```

---

## 3. Google Docs Integration

### 3.1 Authentication

- **Method:** Google Cloud service account with read-only Docs API access
- **Setup:** Share a Google Drive folder with the service account email
- **Env var:** `GOOGLE_SERVICE_ACCOUNT_KEY` (base64-encoded JSON credentials)
- **Package:** `googleapis` npm package

### 3.2 Flow

```
Admin pastes Google Doc URL
  → Backend extracts Document ID from URL
  → google-docs.service.ts calls Docs API v1 documents.get()
  → Converts structured JSON to HTML (headings, paragraphs, lists, bold/italic, links, images)
  → Extracts title from doc title or first H1
  → seo.service.ts auto-generates SEO fields
  → Returns preview to frontend
  → Admin reviews, edits SEO/metadata, selects category + content_type
  → Saves to blog_posts table with google_doc_id stored for re-sync
```

### 3.3 Re-sync

`POST /api/content/posts/:id/sync` re-fetches the Google Doc and updates the `content` column. SEO fields are re-generated but the admin can choose to keep existing overrides.

### 3.4 Google Doc URL Parsing

Supported formats:
- `https://docs.google.com/document/d/{DOC_ID}/edit`
- `https://docs.google.com/document/d/{DOC_ID}/`
- Raw document ID

---

## 4. Google Doc Templates (Skeletons)

Two template documents will be created in Google Docs and linked from the admin panel. These ensure consistent structure so the parser can reliably extract content.

### 4.1 Blog Post Template

```
[Document Title — becomes the blog post title]

[First paragraph — becomes the excerpt / meta_description. Keep under 160 characters for SEO.]

---

## Introduction

[Opening paragraph setting context for the article.]

## [Section Heading]

[Body content. Use subheadings (###) for subsections.]

## [Section Heading]

[Body content. Include bullet points or numbered lists where appropriate.]

## Key Takeaways

- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

## Conclusion

[Closing paragraph with call-to-action or summary.]

---

**Author:** [Author Name]
**Practice Area:** [e.g., Corporate Law, Tax Law]
```

### 4.2 Case Study Template

```
[Document Title — becomes the case study title]

[One-paragraph summary of the case. This becomes the excerpt.]

---

## Background

[Detailed background of the case — who the client was, what the situation involved, and what legal challenges existed.]

## Our Approach

[How AR&CO handled the case — strategy, legal arguments, proceedings.]

## Outcome

[The result — settlement amount, verdict, policy changes, etc. This section is extracted into metadata.outcome.]

## Key Facts

- **Client:** [Client name or "Confidential"]
- **Practice Area:** [e.g., Litigation & Arbitration]
- **Duration:** [e.g., 18 months]
- **Year:** [e.g., 2025]
- **Tags:** [Comma-separated: International Arbitration, Corporate Dispute]

---

**Author:** [Author Name]
```

### 4.3 Template Handling

- The backend parser looks for the `## Key Facts` section in case studies to auto-populate the `metadata` JSONB field
- The `## Outcome` section content is extracted into `metadata.outcome`
- If the structured sections aren't found, the admin can fill metadata fields manually in the admin form
- Templates are stored as actual Google Docs in the shared Drive folder; links are shown in the admin "New Post" page as reference

---

## 5. SEO Auto-Generation

### 5.1 seo.service.ts

| Field | Generation Logic |
|-------|-----------------|
| `slug` | kebab-case from title, deduplicated with `-2`, `-3` suffix |
| `meta_title` | `title + " \| AR&CO Law"` truncated to 60 chars |
| `meta_description` | First 155 chars of excerpt, or first paragraph if no excerpt |
| `read_time` | `Math.ceil(wordCount / 200) + " min read"` |

All auto-generated fields are **editable** by admin before publishing.

### 5.2 Frontend SSR SEO

`/blogs/[slug]/page.tsx` uses Next.js `generateMetadata()`:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.featuredImage || '/og-default.jpg'],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.authorName],
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: {
      canonical: `https://arco.law/blogs/${post.slug}`,
    },
  };
}
```

### 5.3 JSON-LD Structured Data

Injected in the `[slug]/page.tsx` layout:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "description": "...",
  "author": { "@type": "Person", "name": "..." },
  "publisher": { "@type": "Organization", "name": "AR&CO Law Firm" },
  "datePublished": "...",
  "dateModified": "...",
  "image": "...",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "..." }
}
```

For case studies, `@type` is `Article` with `articleSection: "Case Study"`.

---

## 6. Backend Module Structure

```
apps/api/src/content/
├── content.module.ts          # Registers all providers + controllers
├── blog.controller.ts         # Content posts CRUD (blog + case study)
├── blog.service.ts            # Business logic, delegates to SEO + Google Docs services
├── google-docs.service.ts     # Fetch Google Doc, convert to HTML
├── seo.service.ts             # Auto-generate SEO fields from content
├── testimonials.controller.ts # Testimonial submission + approval
├── testimonials.service.ts
├── legal-news.controller.ts   # Legal news ticker CRUD
└── legal-news.service.ts
```

### 6.1 Blog Controller Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/content/posts` | @Public | List published posts (filter by content_type, category) |
| GET | `/api/content/posts/:slug` | @Public | Get post by slug |
| POST | `/api/content/posts/:id/view` | @Public | Increment view count |
| GET | `/api/content/posts/admin` | Staff | List all posts (drafts included) |
| POST | `/api/content/posts` | Staff | Create from Google Doc URL |
| PATCH | `/api/content/posts/:id` | Staff | Update post / SEO fields |
| POST | `/api/content/posts/:id/sync` | Staff | Re-sync from Google Doc |
| DELETE | `/api/content/posts/:id` | Admin | Delete post |
| GET | `/api/content/categories` | @Public | List blog categories |
| POST | `/api/content/categories` | Staff | Create category |
| PATCH | `/api/content/categories/:id` | Staff | Update category |
| DELETE | `/api/content/categories/:id` | Admin | Delete category |

### 6.2 Testimonials Controller Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/testimonials` | @Public | Approved testimonials |
| POST | `/api/testimonials` | Client | Submit testimonial |
| GET | `/api/testimonials/all` | Staff | All testimonials |
| POST | `/api/testimonials/:id/approve` | Admin | Approve |
| POST | `/api/testimonials/:id/reject` | Admin | Reject |

### 6.3 Legal News Controller Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/legal-news` | @Public | Latest news |
| POST | `/api/legal-news` | Staff | Create news item |

---

## 7. Shared Package Schemas

### 7.1 content.schemas.ts

- `CreateContentPostSchema` — googleDocUrl, contentType, categoryId, isFeatured, metadata (optional for case studies)
- `UpdateContentPostSchema` — partial of above + title, slug, excerpt, metaTitle, metaDescription, status, featuredImage
- `SyncContentPostSchema` — empty body (just triggers re-fetch)
- `ContentPostResponseSchema` — full post with author, category joined
- `ContentFiltersSchema` — contentType, categoryId, status, search
- `CreateCategorySchema`, `UpdateCategorySchema`, `CategoryResponseSchema`
- `CreateTestimonialSchema`, `TestimonialResponseSchema`
- `CreateLegalNewsSchema`, `LegalNewsResponseSchema`

### 7.2 content.types.ts

TypeScript interfaces inferred from Zod schemas.

---

## 8. Frontend Changes

### 8.1 New Admin Pages

- `/admin/content` — DataTable of all posts with tabs (Blogs / Case Studies), status badges, search, filters
- `/admin/content/new` — Form: Google Doc URL input, content type selector, category dropdown, SEO preview panel, metadata fields (for case studies), template links
- `/admin/content/[id]` — Edit form, re-sync button, SEO editor, publish/archive controls

### 8.2 Update Public Pages

- `/blogs/page.tsx` — Fetch from `GET /api/content/posts?contentType=blog` and `?contentType=case_study` instead of static data
- `/blogs/[slug]/page.tsx` — Server component with `generateMetadata()`, JSON-LD injection, fetch from `GET /api/content/posts/:slug`

### 8.3 API Client

- `apps/web/lib/api/content.ts` — typed functions for all content endpoints

---

## 9. Environment Variables

**New backend env vars:**
```
GOOGLE_SERVICE_ACCOUNT_KEY=<base64-encoded JSON service account credentials>
```

**Google Cloud setup (one-time):**
1. Create Google Cloud project
2. Enable Google Docs API
3. Create service account
4. Download JSON key, base64-encode it
5. Share content Drive folder with service account email
6. Add to `apps/api/.env`

---

## 10. Dependencies

**Backend:**
- `googleapis` — Google Docs API client

**No new frontend dependencies** (uses existing shadcn/ui, React Hook Form, Zod).
