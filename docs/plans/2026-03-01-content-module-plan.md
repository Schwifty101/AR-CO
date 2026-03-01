# Content Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Google Docs-backed content management system for blogs and case studies with auto SEO generation, plus testimonials and legal news services.

**Architecture:** Single `blog_posts` table with `content_type` discriminator (blog/case_study). Backend fetches Google Docs via service account, converts to HTML, auto-generates SEO fields. Frontend admin pages for content management, public pages updated from static data to API-backed SSR with `generateMetadata()`.

**Tech Stack:** NestJS (backend), `googleapis` (Google Docs API), Zod (validation), Next.js 16 (frontend), Supabase (database), shadcn/ui (admin UI)

**Design doc:** `docs/plans/2026-03-01-content-module-design.md`

---

### Task 1: Database Migration — Add Content Columns to blog_posts

**Files:**
- Modify: Supabase migration (via MCP tool)

**Step 1: Run the migration to add new columns**

Use the Supabase MCP `apply_migration` tool with this SQL:

```sql
-- Add content_type column to distinguish blogs from case studies
ALTER TABLE blog_posts
  ADD COLUMN content_type text NOT NULL DEFAULT 'blog';

-- Add JSONB metadata for case-study-specific fields (outcome, client_name, duration, year, tags)
ALTER TABLE blog_posts
  ADD COLUMN metadata jsonb DEFAULT '{}';

-- Add SEO fields
ALTER TABLE blog_posts
  ADD COLUMN meta_title text;
ALTER TABLE blog_posts
  ADD COLUMN meta_description text;
ALTER TABLE blog_posts
  ADD COLUMN read_time text;

-- Add featured flag and Google Docs integration fields
ALTER TABLE blog_posts
  ADD COLUMN is_featured boolean DEFAULT false;
ALTER TABLE blog_posts
  ADD COLUMN google_doc_id text;
ALTER TABLE blog_posts
  ADD COLUMN google_doc_url text;

-- Add index on content_type for filtered queries
CREATE INDEX idx_blog_posts_content_type ON blog_posts (content_type);

-- Add index on is_featured for featured post queries
CREATE INDEX idx_blog_posts_is_featured ON blog_posts (is_featured) WHERE is_featured = true;
```

Migration name: `add_content_columns_to_blog_posts`

**Step 2: Verify the migration**

Use the Supabase MCP `list_tables` tool and confirm `blog_posts` now has columns: `content_type`, `metadata`, `meta_title`, `meta_description`, `read_time`, `is_featured`, `google_doc_id`, `google_doc_url`.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat(db): add content_type, metadata, SEO columns to blog_posts"
```

---

### Task 2: Shared Package — Enums

**Files:**
- Modify: `packages/shared/src/enums.ts`
- Modify: `packages/shared/src/index.ts`

**Step 1: Add ContentType and PostStatus enums**

Add to end of `packages/shared/src/enums.ts`:

```typescript
/** Content type discriminator for blog_posts table */
export enum ContentType {
  BLOG = 'blog',
  CASE_STUDY = 'case_study',
}

/** Blog post publication status — matches DB post_status enum */
export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
```

**Step 2: Export new enums from barrel**

Add `ContentType` and `PostStatus` to the export list in `packages/shared/src/index.ts`.

**Step 3: Verify build**

```bash
cd packages/shared && pnpm tsc --noEmit
```

Expected: No errors.

**Step 4: Commit**

```bash
git add packages/shared/src/enums.ts packages/shared/src/index.ts && git commit -m "feat(shared): add ContentType and PostStatus enums"
```

---

### Task 3: Shared Package — Content Schemas

**Files:**
- Create: `packages/shared/src/schemas/content.schemas.ts`
- Modify: `packages/shared/src/schemas/index.ts`

**Step 1: Create content schemas file**

Create `packages/shared/src/schemas/content.schemas.ts`:

```typescript
import { z } from 'zod';
import { ContentType, PostStatus } from '../enums';

// ─── Blog Post / Case Study Schemas ───

/** Schema for creating a content post from a Google Doc URL */
export const CreateContentPostSchema = z.object({
  googleDocUrl: z.string().min(1, 'Google Doc URL is required'),
  contentType: z.nativeEnum(ContentType).default(ContentType.BLOG),
  categoryId: z.string().uuid('Valid category ID required').optional(),
  isFeatured: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

/** Schema for updating a content post */
export const UpdateContentPostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z.string().min(1).max(500).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  featuredImage: z.string().url().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  contentType: z.nativeEnum(ContentType).optional(),
  status: z.nativeEnum(PostStatus).optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(170).optional(),
  isFeatured: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Schema for filtering content posts */
export const ContentFiltersSchema = z.object({
  contentType: z.nativeEnum(ContentType).optional(),
  categoryId: z.string().uuid().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  search: z.string().optional(),
  isFeatured: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});

/** Content post response with joined author and category */
export const ContentPostResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  featuredImage: z.string().nullable(),
  authorId: z.string().uuid(),
  authorName: z.string().nullable(),
  categoryId: z.string().uuid().nullable(),
  categoryName: z.string().nullable(),
  categorySlug: z.string().nullable(),
  contentType: z.nativeEnum(ContentType),
  status: z.nativeEnum(PostStatus),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  readTime: z.string().nullable(),
  isFeatured: z.boolean(),
  googleDocId: z.string().nullable(),
  googleDocUrl: z.string().nullable(),
  metadata: z.record(z.unknown()),
  publishedAt: z.string().nullable(),
  viewCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Paginated content posts response */
export const PaginatedContentPostsResponseSchema = z.object({
  data: z.array(ContentPostResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// ─── Category Schemas ───

/** Schema for creating a blog category */
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
});

/** Schema for updating a blog category */
export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

/** Category response */
export const CategoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ─── Testimonial Schemas ───

/** Schema for submitting a testimonial */
export const CreateTestimonialSchema = z.object({
  content: z.string().min(10, 'Testimonial must be at least 10 characters').max(2000),
  rating: z.number().int().min(1).max(5),
});

/** Testimonial response */
export const TestimonialResponseSchema = z.object({
  id: z.string().uuid(),
  clientProfileId: z.string().uuid(),
  clientName: z.string().nullable(),
  content: z.string(),
  rating: z.number(),
  isApproved: z.boolean(),
  approvedBy: z.string().uuid().nullable(),
  approvedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Paginated testimonials response */
export const PaginatedTestimonialsResponseSchema = z.object({
  data: z.array(TestimonialResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// ─── Legal News Schemas ───

/** Schema for creating a legal news item */
export const CreateLegalNewsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  source: z.string().max(255).optional(),
  url: z.string().url().optional(),
  publishedAt: z.string(),
});

/** Legal news response */
export const LegalNewsResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  source: z.string().nullable(),
  url: z.string().nullable(),
  publishedAt: z.string(),
  createdAt: z.string(),
});
```

**Step 2: Export from schemas barrel**

Add to `packages/shared/src/schemas/index.ts`:

```typescript
// Content
export {
  CreateContentPostSchema,
  UpdateContentPostSchema,
  ContentFiltersSchema,
  ContentPostResponseSchema,
  PaginatedContentPostsResponseSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryResponseSchema,
  CreateTestimonialSchema,
  TestimonialResponseSchema,
  PaginatedTestimonialsResponseSchema,
  CreateLegalNewsSchema,
  LegalNewsResponseSchema,
} from './content.schemas';
```

**Step 3: Verify build**

```bash
cd packages/shared && pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add packages/shared/src/schemas/ && git commit -m "feat(shared): add content, testimonial, legal news Zod schemas"
```

---

### Task 4: Shared Package — Content Types

**Files:**
- Create: `packages/shared/src/types/content.types.ts`
- Modify: `packages/shared/src/types/index.ts`

**Step 1: Create content types file**

Create `packages/shared/src/types/content.types.ts`:

```typescript
import type { z } from 'zod';
import type {
  CreateContentPostSchema,
  UpdateContentPostSchema,
  ContentFiltersSchema,
  ContentPostResponseSchema,
  PaginatedContentPostsResponseSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryResponseSchema,
  CreateTestimonialSchema,
  TestimonialResponseSchema,
  PaginatedTestimonialsResponseSchema,
  CreateLegalNewsSchema,
  LegalNewsResponseSchema,
} from '../schemas/content.schemas';

/** Data for creating a content post from Google Doc */
export type CreateContentPostData = z.infer<typeof CreateContentPostSchema>;

/** Data for updating a content post */
export type UpdateContentPostData = z.infer<typeof UpdateContentPostSchema>;

/** Content post list filter parameters */
export type ContentFilters = z.infer<typeof ContentFiltersSchema>;

/** Full content post response from the API */
export type ContentPostResponse = z.infer<typeof ContentPostResponseSchema>;

/** Paginated content posts API response */
export type PaginatedContentPostsResponse = z.infer<typeof PaginatedContentPostsResponseSchema>;

/** Data for creating a blog category */
export type CreateCategoryData = z.infer<typeof CreateCategorySchema>;

/** Data for updating a blog category */
export type UpdateCategoryData = z.infer<typeof UpdateCategorySchema>;

/** Category response from the API */
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

/** Data for submitting a testimonial */
export type CreateTestimonialData = z.infer<typeof CreateTestimonialSchema>;

/** Testimonial response from the API */
export type TestimonialResponse = z.infer<typeof TestimonialResponseSchema>;

/** Paginated testimonials API response */
export type PaginatedTestimonialsResponse = z.infer<typeof PaginatedTestimonialsResponseSchema>;

/** Data for creating a legal news item */
export type CreateLegalNewsData = z.infer<typeof CreateLegalNewsSchema>;

/** Legal news response from the API */
export type LegalNewsResponse = z.infer<typeof LegalNewsResponseSchema>;
```

**Step 2: Export from types barrel**

Add to `packages/shared/src/types/index.ts`:

```typescript
// Content
export type {
  CreateContentPostData,
  UpdateContentPostData,
  ContentFilters,
  ContentPostResponse,
  PaginatedContentPostsResponse,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryResponse,
  CreateTestimonialData,
  TestimonialResponse,
  PaginatedTestimonialsResponse,
  CreateLegalNewsData,
  LegalNewsResponse,
} from './content.types';
```

**Step 3: Verify build**

```bash
cd packages/shared && pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add packages/shared/src/types/ && git commit -m "feat(shared): add content, testimonial, legal news TypeScript types"
```

---

### Task 5: Backend — Install googleapis & Add Google Config

**Files:**
- Modify: `apps/api/package.json` (via pnpm add)
- Modify: `apps/api/src/config/configuration.ts`
- Modify: `apps/api/src/config/validation.schema.ts`
- Modify: `apps/api/.env` and `apps/api/.env.example`

**Step 1: Install googleapis**

```bash
pnpm add googleapis --filter api
```

**Step 2: Add GoogleConfig interface and section to configuration.ts**

Add to `apps/api/src/config/configuration.ts`:

```typescript
/** Google APIs configuration interface */
export interface GoogleConfig {
  serviceAccountKey: string;
}
```

Add `google` field to the `Configuration` interface and factory:

```typescript
// In Configuration interface:
google: GoogleConfig;

// In factory return:
google: {
  serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '',
},
```

**Step 3: Add Google env var validation to validation.schema.ts**

Add to the Joi.object in `validation.schema.ts`:

```typescript
// Google APIs Configuration (Optional for development)
GOOGLE_SERVICE_ACCOUNT_KEY: Joi.string().when('NODE_ENV', {
  is: 'production',
  then: Joi.required(),
  otherwise: Joi.optional(),
}).messages({
  'any.required': 'GOOGLE_SERVICE_ACCOUNT_KEY is required in production. Base64-encode the service account JSON key.',
}),
```

**Step 4: Add to .env.example**

Add to `apps/api/.env.example`:
```
# Google APIs (for Google Docs content integration)
GOOGLE_SERVICE_ACCOUNT_KEY=   # Base64-encoded JSON service account credentials
```

**Step 5: Verify build**

```bash
cd apps/api && pnpm tsc --noEmit
```

**Step 6: Commit**

```bash
git add apps/api/package.json apps/api/src/config/ pnpm-lock.yaml && git commit -m "feat(api): add googleapis dependency and Google config"
```

---

### Task 6: Backend — SEO Service

**Files:**
- Create: `apps/api/src/content/seo.service.ts`

**Step 1: Create SEO service**

Create `apps/api/src/content/seo.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

/** Generated SEO fields for a content post */
export interface SeoFields {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  readTime: string;
  excerpt: string;
}

/**
 * Service for auto-generating SEO fields from content
 *
 * Generates slug, meta title, meta description, read time, and excerpt
 * from the post title and content. All generated fields are meant to be
 * editable by admin before publishing.
 *
 * @example
 * ```typescript
 * const seo = await seoService.generateSeoFields('My Blog Post Title', '<p>Content...</p>');
 * // { slug: 'my-blog-post-title', metaTitle: 'My Blog Post Title | AR&CO Law', ... }
 * ```
 */
@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Generate all SEO fields from title and content
   *
   * @param title - The post title
   * @param content - The HTML content
   * @param existingExcerpt - Optional existing excerpt to use instead of auto-generated
   * @returns Generated SEO fields
   */
  async generateSeoFields(
    title: string,
    content: string,
    existingExcerpt?: string,
  ): Promise<SeoFields> {
    const slug = await this.generateUniqueSlug(title);
    const metaTitle = this.generateMetaTitle(title);
    const plainText = this.stripHtml(content);
    const excerpt = existingExcerpt || this.generateExcerpt(plainText);
    const metaDescription = this.generateMetaDescription(excerpt);
    const readTime = this.generateReadTime(plainText);

    return { slug, metaTitle, metaDescription, readTime, excerpt };
  }

  /**
   * Generate a URL-safe slug from title, ensuring uniqueness in DB
   *
   * @param title - The post title
   * @returns Unique slug string
   */
  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200);

    const adminClient = this.supabaseService.getAdminClient();

    // Check if slug exists
    const { data } = await adminClient
      .from('blog_posts')
      .select('slug')
      .like('slug', `${baseSlug}%`);

    if (!data || data.length === 0) {
      return baseSlug;
    }

    const existingSlugs = new Set(data.map((row: { slug: string }) => row.slug));

    if (!existingSlugs.has(baseSlug)) {
      return baseSlug;
    }

    // Append suffix: -2, -3, etc.
    let counter = 2;
    while (existingSlugs.has(`${baseSlug}-${counter}`)) {
      counter++;
    }

    return `${baseSlug}-${counter}`;
  }

  /**
   * Generate meta title: title + " | AR&CO Law", truncated to 60 chars
   */
  generateMetaTitle(title: string): string {
    const suffix = ' | AR&CO Law';
    if (title.length + suffix.length <= 60) {
      return title + suffix;
    }
    return title.slice(0, 60 - suffix.length - 3) + '...' + suffix;
  }

  /**
   * Generate meta description from excerpt, truncated to 155 chars
   */
  generateMetaDescription(excerpt: string): string {
    if (excerpt.length <= 155) {
      return excerpt;
    }
    return excerpt.slice(0, 152) + '...';
  }

  /**
   * Generate read time estimate: wordCount / 200, rounded up
   */
  generateReadTime(plainText: string): string {
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
  }

  /**
   * Generate excerpt from first paragraph of plain text
   */
  private generateExcerpt(plainText: string): string {
    const firstParagraph = plainText.split(/\n\n/)[0] || plainText;
    if (firstParagraph.length <= 300) {
      return firstParagraph;
    }
    return firstParagraph.slice(0, 297) + '...';
  }

  /**
   * Strip HTML tags from content to get plain text
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
```

**Step 2: Verify build**

```bash
cd apps/api && pnpm tsc --noEmit
```

**Step 3: Commit**

```bash
git add apps/api/src/content/seo.service.ts && git commit -m "feat(api): add SEO auto-generation service"
```

---

### Task 7: Backend — Google Docs Service

**Files:**
- Create: `apps/api/src/content/google-docs.service.ts`

**Step 1: Create Google Docs service**

Create `apps/api/src/content/google-docs.service.ts`:

```typescript
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, type docs_v1 } from 'googleapis';
import type { Configuration } from '../config/configuration';

/** Parsed content from a Google Doc */
export interface ParsedGoogleDoc {
  title: string;
  htmlContent: string;
  /** Case study metadata extracted from "Key Facts" section */
  caseStudyMetadata?: {
    outcome?: string;
    clientName?: string;
    duration?: string;
    year?: string;
    tags?: string[];
  };
}

/**
 * Service for fetching and converting Google Docs to HTML
 *
 * Uses a Google Cloud service account to read documents.
 * Converts the structured Google Docs JSON into clean HTML.
 *
 * @example
 * ```typescript
 * const parsed = await googleDocsService.fetchAndParse('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms');
 * // { title: 'My Blog Post', htmlContent: '<h2>Intro</h2><p>Content...</p>' }
 * ```
 */
@Injectable()
export class GoogleDocsService {
  private readonly logger = new Logger(GoogleDocsService.name);
  private docsClient: docs_v1.Docs | null = null;

  constructor(
    private readonly configService: ConfigService<Configuration>,
  ) {}

  /**
   * Extract Google Doc ID from various URL formats
   *
   * @param urlOrId - Google Doc URL or raw document ID
   * @returns The document ID
   * @throws {BadRequestException} If URL format is unrecognized
   *
   * @example
   * ```typescript
   * extractDocId('https://docs.google.com/document/d/1abc123/edit'); // '1abc123'
   * extractDocId('1abc123'); // '1abc123'
   * ```
   */
  extractDocId(urlOrId: string): string {
    // Already a raw ID (no slashes)
    if (!urlOrId.includes('/')) {
      return urlOrId.trim();
    }

    const match = urlOrId.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return match[1];
    }

    throw new BadRequestException(
      'Invalid Google Doc URL. Expected format: https://docs.google.com/document/d/{DOC_ID}/...',
    );
  }

  /**
   * Fetch a Google Doc and convert it to HTML
   *
   * @param docIdOrUrl - Google Doc ID or URL
   * @returns Parsed document with title, HTML content, and optional case study metadata
   * @throws {BadRequestException} If document cannot be fetched
   */
  async fetchAndParse(docIdOrUrl: string): Promise<ParsedGoogleDoc> {
    const docId = this.extractDocId(docIdOrUrl);
    this.logger.log(`Fetching Google Doc: ${docId}`);

    const client = this.getDocsClient();
    if (!client) {
      throw new BadRequestException(
        'Google Docs integration not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY env var.',
      );
    }

    try {
      const response = await client.documents.get({ documentId: docId });
      const doc = response.data;

      const title = doc.title || 'Untitled';
      const htmlContent = this.convertToHtml(doc);
      const caseStudyMetadata = this.extractCaseStudyMetadata(htmlContent);

      this.logger.log(`Successfully parsed Google Doc: ${title}`);
      return { title, htmlContent, caseStudyMetadata };
    } catch (error) {
      this.logger.error(`Failed to fetch Google Doc ${docId}`, error);
      throw new BadRequestException(
        'Failed to fetch Google Doc. Ensure the document is shared with the service account.',
      );
    }
  }

  /**
   * Convert Google Docs structured JSON to HTML
   */
  private convertToHtml(doc: docs_v1.Schema$Document): string {
    const content = doc.body?.content;
    if (!content) return '';

    const parts: string[] = [];

    for (const element of content) {
      if (element.paragraph) {
        parts.push(this.convertParagraph(element.paragraph));
      } else if (element.table) {
        parts.push(this.convertTable(element.table));
      }
    }

    return parts.filter(Boolean).join('\n');
  }

  /**
   * Convert a Google Docs paragraph to HTML
   */
  private convertParagraph(paragraph: docs_v1.Schema$Paragraph): string {
    const style = paragraph.paragraphStyle?.namedStyleType;
    const elements = paragraph.elements || [];

    let text = '';
    for (const element of elements) {
      if (element.textRun) {
        text += this.convertTextRun(element.textRun);
      }
    }

    // Skip empty paragraphs
    if (!text.trim()) return '';

    // Handle horizontal rules (three dashes)
    if (text.trim() === '---' || text.trim() === '___') {
      return '<hr />';
    }

    // Map Google Docs heading styles to HTML tags
    switch (style) {
      case 'HEADING_1':
        return `<h1>${text}</h1>`;
      case 'HEADING_2':
        return `<h2>${text}</h2>`;
      case 'HEADING_3':
        return `<h3>${text}</h3>`;
      case 'HEADING_4':
        return `<h4>${text}</h4>`;
      default:
        // Check if this is a list item
        if (paragraph.bullet) {
          return `<li>${text}</li>`;
        }
        return `<p>${text}</p>`;
    }
  }

  /**
   * Convert a Google Docs text run to HTML with formatting
   */
  private convertTextRun(textRun: docs_v1.Schema$TextRun): string {
    let text = textRun.content || '';

    // Skip newline-only content
    if (text === '\n') return '';

    // Remove trailing newline
    text = text.replace(/\n$/, '');

    const style = textRun.textStyle;
    if (!style) return text;

    // Apply formatting
    if (style.bold) text = `<strong>${text}</strong>`;
    if (style.italic) text = `<em>${text}</em>`;
    if (style.underline) text = `<u>${text}</u>`;
    if (style.strikethrough) text = `<s>${text}</s>`;

    // Handle links
    if (style.link?.url) {
      text = `<a href="${style.link.url}">${text}</a>`;
    }

    return text;
  }

  /**
   * Convert a Google Docs table to HTML
   */
  private convertTable(table: docs_v1.Schema$Table): string {
    const rows = table.tableRows || [];
    let html = '<table>';

    for (const row of rows) {
      html += '<tr>';
      for (const cell of row.tableCells || []) {
        const cellContent = (cell.content || [])
          .map((el) =>
            el.paragraph ? this.convertParagraph(el.paragraph) : '',
          )
          .filter(Boolean)
          .join('');
        html += `<td>${cellContent}</td>`;
      }
      html += '</tr>';
    }

    html += '</table>';
    return html;
  }

  /**
   * Extract case study metadata from "Key Facts" section in HTML
   */
  private extractCaseStudyMetadata(
    html: string,
  ): ParsedGoogleDoc['caseStudyMetadata'] | undefined {
    // Check if "Key Facts" section exists
    if (!html.includes('Key Facts')) return undefined;

    const metadata: NonNullable<ParsedGoogleDoc['caseStudyMetadata']> = {};

    // Extract outcome from "Outcome" section
    const outcomeMatch = html.match(
      /<h2>Outcome<\/h2>\s*([\s\S]*?)(?=<h[12]|$)/i,
    );
    if (outcomeMatch) {
      metadata.outcome = outcomeMatch[1]
        .replace(/<[^>]*>/g, '')
        .trim();
    }

    // Extract key facts (Client, Practice Area, Duration, Year, Tags)
    const extractField = (label: string): string | undefined => {
      const regex = new RegExp(
        `<strong>${label}:?</strong>\\s*(.+?)(?=<|$)`,
        'i',
      );
      const match = html.match(regex);
      return match ? match[1].trim() : undefined;
    };

    metadata.clientName = extractField('Client');
    metadata.duration = extractField('Duration');
    metadata.year = extractField('Year');

    const tagsStr = extractField('Tags');
    if (tagsStr) {
      metadata.tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    }

    return metadata;
  }

  /**
   * Get or initialize the Google Docs API client
   */
  private getDocsClient(): docs_v1.Docs | null {
    if (this.docsClient) return this.docsClient;

    const keyBase64 = this.configService.get('google.serviceAccountKey', {
      infer: true,
    });

    if (!keyBase64) {
      this.logger.warn('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
      return null;
    }

    try {
      const credentials = JSON.parse(
        Buffer.from(keyBase64, 'base64').toString('utf-8'),
      );

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/documents.readonly'],
      });

      this.docsClient = google.docs({ version: 'v1', auth });
      return this.docsClient;
    } catch (error) {
      this.logger.error('Failed to initialize Google Docs client', error);
      return null;
    }
  }
}
```

**Step 2: Verify build**

```bash
cd apps/api && pnpm tsc --noEmit
```

**Step 3: Commit**

```bash
git add apps/api/src/content/google-docs.service.ts && git commit -m "feat(api): add Google Docs fetch and HTML conversion service"
```

---

### Task 8: Backend — Blog Service

**Files:**
- Create: `apps/api/src/content/blog.service.ts`

**Step 1: Create blog service**

Create `apps/api/src/content/blog.service.ts`:

```typescript
import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { GoogleDocsService } from './google-docs.service';
import { SeoService } from './seo.service';
import {
  validateSortColumn,
  sanitizePostgrestFilter,
} from '../common/utils/query-helpers';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  PostStatus,
  type CreateContentPostData,
  type UpdateContentPostData,
  type ContentFilters,
  type ContentPostResponse,
  type PaginatedContentPostsResponse,
  type PaginationParams,
  type CategoryResponse,
  type CreateCategoryData,
  type UpdateCategoryData,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for blog_posts with joined relations */
interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author_id: string;
  category_id: string | null;
  content_type: string;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  read_time: string | null;
  is_featured: boolean;
  google_doc_id: string | null;
  google_doc_url: string | null;
  metadata: Record<string, unknown>;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  author: { full_name: string } | null;
  category: { name: string; slug: string } | null;
}

/** Database row shape for blog_categories */
interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const POST_SELECT_WITH_JOINS =
  '*, author:user_profiles!blog_posts_author_id_fkey(full_name), category:blog_categories!blog_posts_category_id_fkey(name, slug)' as const;

const ALLOWED_POST_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'published_at',
  'view_count',
  'title',
] as const;

/**
 * Service for managing blog posts and case studies
 *
 * Handles creation from Google Docs, SEO generation, CRUD operations,
 * and category management.
 *
 * @example
 * ```typescript
 * const post = await blogService.createPost(
 *   { googleDocUrl: 'https://docs.google.com/document/d/1abc/edit', contentType: ContentType.BLOG },
 *   currentUser,
 * );
 * ```
 */
@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly googleDocsService: GoogleDocsService,
    private readonly seoService: SeoService,
  ) {}

  /**
   * Create a new content post from a Google Doc URL
   *
   * @param dto - Creation data with Google Doc URL and content type
   * @param user - Authenticated staff user (becomes author)
   * @returns Created post with SEO fields
   */
  async createPost(
    dto: CreateContentPostData,
    user: AuthUser,
  ): Promise<ContentPostResponse> {
    this.logger.log(`Creating post from Google Doc for user ${user.id}`);

    // Fetch and parse Google Doc
    const parsed = await this.googleDocsService.fetchAndParse(dto.googleDocUrl);
    const docId = this.googleDocsService.extractDocId(dto.googleDocUrl);

    // Auto-generate SEO fields
    const seo = await this.seoService.generateSeoFields(
      parsed.title,
      parsed.htmlContent,
    );

    // Merge case study metadata from template parsing with any manual overrides
    const metadata = {
      ...(parsed.caseStudyMetadata || {}),
      ...(dto.metadata || {}),
    };

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_posts')
      .insert({
        title: parsed.title,
        slug: seo.slug,
        excerpt: seo.excerpt,
        content: parsed.htmlContent,
        author_id: user.id,
        category_id: dto.categoryId ?? null,
        content_type: dto.contentType,
        status: PostStatus.DRAFT,
        meta_title: seo.metaTitle,
        meta_description: seo.metaDescription,
        read_time: seo.readTime,
        is_featured: dto.isFeatured,
        google_doc_id: docId,
        google_doc_url: dto.googleDocUrl,
        metadata,
      })
      .select(POST_SELECT_WITH_JOINS)
      .single()) as DbResult<BlogPostRow>;

    if (error || !data) {
      this.logger.error('Failed to create post', error);
      throw new InternalServerErrorException('Failed to create post');
    }

    this.logger.log(`Post created: ${data.slug}`);
    return this.mapPostRow(data);
  }

  /**
   * Update an existing content post
   *
   * @param postId - Post UUID
   * @param dto - Update data (partial)
   * @returns Updated post
   */
  async updatePost(
    postId: string,
    dto: UpdateContentPostData,
  ): Promise<ContentPostResponse> {
    this.logger.log(`Updating post ${postId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const updateData: Record<string, unknown> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.excerpt !== undefined) updateData.excerpt = dto.excerpt;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.featuredImage !== undefined) updateData.featured_image = dto.featuredImage;
    if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
    if (dto.contentType !== undefined) updateData.content_type = dto.contentType;
    if (dto.metaTitle !== undefined) updateData.meta_title = dto.metaTitle;
    if (dto.metaDescription !== undefined) updateData.meta_description = dto.metaDescription;
    if (dto.isFeatured !== undefined) updateData.is_featured = dto.isFeatured;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === PostStatus.PUBLISHED) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = (await adminClient
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select(POST_SELECT_WITH_JOINS)
      .single()) as DbResult<BlogPostRow>;

    if (error || !data) {
      this.logger.error(`Failed to update post ${postId}`, error);
      throw new NotFoundException('Post not found');
    }

    return this.mapPostRow(data);
  }

  /**
   * Re-sync content from the linked Google Doc
   *
   * @param postId - Post UUID
   * @returns Updated post with fresh content and re-generated SEO
   */
  async syncFromGoogleDoc(postId: string): Promise<ContentPostResponse> {
    this.logger.log(`Syncing post ${postId} from Google Doc`);

    const adminClient = this.supabaseService.getAdminClient();

    // Fetch the existing post to get the google_doc_id
    const { data: existing, error: fetchError } = (await adminClient
      .from('blog_posts')
      .select('google_doc_id, google_doc_url')
      .eq('id', postId)
      .single()) as DbResult<{ google_doc_id: string | null; google_doc_url: string | null }>;

    if (fetchError || !existing?.google_doc_id) {
      throw new NotFoundException('Post not found or no Google Doc linked');
    }

    // Re-fetch and parse the document
    const parsed = await this.googleDocsService.fetchAndParse(existing.google_doc_id);
    const seo = await this.seoService.generateSeoFields(
      parsed.title,
      parsed.htmlContent,
    );

    const updateData: Record<string, unknown> = {
      title: parsed.title,
      content: parsed.htmlContent,
      excerpt: seo.excerpt,
      meta_title: seo.metaTitle,
      meta_description: seo.metaDescription,
      read_time: seo.readTime,
    };

    // Update case study metadata if found
    if (parsed.caseStudyMetadata) {
      updateData.metadata = parsed.caseStudyMetadata;
    }

    const { data, error } = (await adminClient
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select(POST_SELECT_WITH_JOINS)
      .single()) as DbResult<BlogPostRow>;

    if (error || !data) {
      this.logger.error(`Failed to sync post ${postId}`, error);
      throw new InternalServerErrorException('Failed to sync from Google Doc');
    }

    this.logger.log(`Post ${postId} synced successfully`);
    return this.mapPostRow(data);
  }

  /**
   * Delete a content post
   */
  async deletePost(postId: string): Promise<void> {
    this.logger.log(`Deleting post ${postId}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient
      .from('blog_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      this.logger.error(`Failed to delete post ${postId}`, error);
      throw new InternalServerErrorException('Failed to delete post');
    }
  }

  /**
   * Get published posts with pagination and filters (public)
   */
  async getPublishedPosts(
    pagination: PaginationParams,
    filters: ContentFilters,
  ): Promise<PaginatedContentPostsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit, sort, order } = pagination;
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('blog_posts')
      .select(POST_SELECT_WITH_JOINS, { count: 'exact' })
      .eq('status', PostStatus.PUBLISHED);

    if (filters.contentType) {
      query = query.eq('content_type', filters.contentType);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.isFeatured) {
      query = query.eq('is_featured', true);
    }
    if (filters.search) {
      const sanitized = sanitizePostgrestFilter(filters.search);
      query = query.or(`title.ilike.%${sanitized}%,excerpt.ilike.%${sanitized}%`);
    }

    const validSort = validateSortColumn(sort, ALLOWED_POST_SORT_COLUMNS);
    query = query
      .order(validSort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = (await query) as DbListResult<BlogPostRow>;

    if (error) {
      this.logger.error('Failed to fetch published posts', error);
      throw new InternalServerErrorException('Failed to fetch posts');
    }

    return {
      data: (data ?? []).map((row) => this.mapPostRow(row)),
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Get a single post by slug (public)
   */
  async getPostBySlug(slug: string): Promise<ContentPostResponse> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_posts')
      .select(POST_SELECT_WITH_JOINS)
      .eq('slug', slug)
      .single()) as DbResult<BlogPostRow>;

    if (error || !data) {
      throw new NotFoundException('Post not found');
    }

    return this.mapPostRow(data);
  }

  /**
   * Get all posts for admin (staff only, includes drafts/archived)
   */
  async getAllPosts(
    pagination: PaginationParams,
    filters: ContentFilters,
  ): Promise<PaginatedContentPostsResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const { page, limit, sort, order } = pagination;
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('blog_posts')
      .select(POST_SELECT_WITH_JOINS, { count: 'exact' });

    if (filters.contentType) {
      query = query.eq('content_type', filters.contentType);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      const sanitized = sanitizePostgrestFilter(filters.search);
      query = query.or(`title.ilike.%${sanitized}%,excerpt.ilike.%${sanitized}%`);
    }

    const validSort = validateSortColumn(sort, ALLOWED_POST_SORT_COLUMNS);
    query = query
      .order(validSort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = (await query) as DbListResult<BlogPostRow>;

    if (error) {
      this.logger.error('Failed to fetch all posts', error);
      throw new InternalServerErrorException('Failed to fetch posts');
    }

    return {
      data: (data ?? []).map((row) => this.mapPostRow(row)),
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Increment view count for a post
   */
  async incrementViewCount(postId: string): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    await adminClient.rpc('increment_view_count', { post_id: postId }).catch(() => {
      // Fallback: manual increment
      return adminClient
        .from('blog_posts')
        .update({ view_count: adminClient.rpc('', {}) as unknown as number })
        .eq('id', postId);
    });

    // Simple fallback approach
    const { data } = await adminClient
      .from('blog_posts')
      .select('view_count')
      .eq('id', postId)
      .single();

    if (data) {
      await adminClient
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', postId);
    }
  }

  // ─── Category Methods ───

  /**
   * Get all blog categories
   */
  async getCategories(): Promise<CategoryResponse[]> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_categories')
      .select('*')
      .order('name', { ascending: true })) as DbListResult<CategoryRow>;

    if (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }

    return (data ?? []).map((row) => this.mapCategoryRow(row));
  }

  /**
   * Create a blog category with auto-generated slug
   */
  async createCategory(dto: CreateCategoryData): Promise<CategoryResponse> {
    const slug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('blog_categories')
      .insert({
        name: dto.name,
        slug,
        description: dto.description ?? null,
      })
      .select('*')
      .single()) as DbResult<CategoryRow>;

    if (error || !data) {
      this.logger.error('Failed to create category', error);
      throw new InternalServerErrorException('Failed to create category');
    }

    return this.mapCategoryRow(data);
  }

  /**
   * Update a blog category
   */
  async updateCategory(
    categoryId: string,
    dto: UpdateCategoryData,
  ): Promise<CategoryResponse> {
    const adminClient = this.supabaseService.getAdminClient();
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      updateData.slug = dto.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
    }
    if (dto.description !== undefined) updateData.description = dto.description;

    const { data, error } = (await adminClient
      .from('blog_categories')
      .update(updateData)
      .eq('id', categoryId)
      .select('*')
      .single()) as DbResult<CategoryRow>;

    if (error || !data) {
      throw new NotFoundException('Category not found');
    }

    return this.mapCategoryRow(data);
  }

  /**
   * Delete a blog category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const adminClient = this.supabaseService.getAdminClient();

    const { error } = await adminClient
      .from('blog_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  // ─── Row Mappers ───

  private mapPostRow(row: BlogPostRow): ContentPostResponse {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      featuredImage: row.featured_image,
      authorId: row.author_id,
      authorName: row.author?.full_name ?? null,
      categoryId: row.category_id,
      categoryName: row.category?.name ?? null,
      categorySlug: row.category?.slug ?? null,
      contentType: row.content_type as ContentPostResponse['contentType'],
      status: row.status as ContentPostResponse['status'],
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      readTime: row.read_time,
      isFeatured: row.is_featured,
      googleDocId: row.google_doc_id,
      googleDocUrl: row.google_doc_url,
      metadata: row.metadata || {},
      publishedAt: row.published_at,
      viewCount: row.view_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapCategoryRow(row: CategoryRow): CategoryResponse {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

**Step 2: Verify build**

```bash
cd apps/api && pnpm tsc --noEmit
```

**Step 3: Commit**

```bash
git add apps/api/src/content/blog.service.ts && git commit -m "feat(api): add blog service with Google Docs integration and SEO"
```

---

### Task 9: Backend — Testimonials & Legal News Services

**Files:**
- Create: `apps/api/src/content/testimonials.service.ts`
- Create: `apps/api/src/content/legal-news.service.ts`

**Step 1: Create testimonials service**

Create `apps/api/src/content/testimonials.service.ts`. Follow the exact same patterns as `complaints.service.ts`:
- Injectable, Logger, SupabaseService
- `submitTestimonial(dto, user)` — insert with `client_profile_id` from user, join `client_profiles(company_name)` for clientName
- `getApprovedTestimonials(pagination)` — filter `is_approved = true`, paginated
- `getAllTestimonials(pagination)` — staff only, all testimonials, paginated
- `approveTestimonial(id, approverId)` — set `is_approved = true`, `approved_by`, `approved_at`
- `rejectTestimonial(id)` — delete the testimonial
- `mapTestimonialRow()` — snake_case to camelCase

**Step 2: Create legal news service**

Create `apps/api/src/content/legal-news.service.ts`:
- `createNewsItem(dto)` — insert into `legal_news`
- `getLatestNews(limit)` — select ordered by `published_at DESC`, limit
- `mapNewsRow()` — snake_case to camelCase

**Step 3: Verify build**

```bash
cd apps/api && pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add apps/api/src/content/testimonials.service.ts apps/api/src/content/legal-news.service.ts && git commit -m "feat(api): add testimonials and legal news services"
```

---

### Task 10: Backend — Content Controllers

**Files:**
- Create: `apps/api/src/content/blog.controller.ts`
- Create: `apps/api/src/content/testimonials.controller.ts`
- Create: `apps/api/src/content/legal-news.controller.ts`

**Step 1: Create blog controller**

Create `apps/api/src/content/blog.controller.ts`. Follow `complaints.controller.ts` pattern:

```typescript
@Controller('content')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Public endpoints
  @Get('posts')
  @Public()
  async getPublishedPosts(@Query pagination, @Query filters) { ... }

  @Get('posts/:slug')
  @Public()
  async getPostBySlug(@Param('slug') slug: string) { ... }

  @Post('posts/:id/view')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementView(@Param('id') id: string) { ... }

  // Admin endpoints
  @Get('posts/admin')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async getAllPosts(@Query pagination, @Query filters) { ... }

  @Post('posts')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body dto, @CurrentUser() user) { ... }

  @Patch('posts/:id')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async updatePost(@Param('id') id, @Body dto) { ... }

  @Post('posts/:id/sync')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async syncPost(@Param('id') id) { ... }

  @Delete('posts/:id')
  @Roles(UserType.ADMIN)
  async deletePost(@Param('id') id) { ... }

  // Category endpoints
  @Get('categories')
  @Public()
  async getCategories() { ... }

  @Post('categories')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body dto) { ... }

  @Patch('categories/:id')
  @Roles(UserType.ADMIN, UserType.STAFF)
  async updateCategory(@Param('id') id, @Body dto) { ... }

  @Delete('categories/:id')
  @Roles(UserType.ADMIN)
  async deleteCategory(@Param('id') id) { ... }
}
```

**IMPORTANT:** Place `@Get('posts/admin')` BEFORE `@Get('posts/:slug')` so NestJS doesn't treat "admin" as a slug parameter.

**Step 2: Create testimonials controller**

Create `apps/api/src/content/testimonials.controller.ts`:
- `GET /api/testimonials` (@Public) — approved only
- `POST /api/testimonials` (@Roles CLIENT) — submit
- `GET /api/testimonials/all` (@Roles ADMIN, STAFF) — all
- `POST /api/testimonials/:id/approve` (@Roles ADMIN) — approve
- `POST /api/testimonials/:id/reject` (@Roles ADMIN) — reject

**Step 3: Create legal news controller**

Create `apps/api/src/content/legal-news.controller.ts`:
- `GET /api/legal-news` (@Public) — latest news
- `POST /api/legal-news` (@Roles ADMIN, STAFF) — create

**Step 4: Verify build**

```bash
cd apps/api && pnpm tsc --noEmit
```

**Step 5: Commit**

```bash
git add apps/api/src/content/*.controller.ts && git commit -m "feat(api): add blog, testimonials, legal news controllers"
```

---

### Task 11: Backend — Content Module & Registration

**Files:**
- Create: `apps/api/src/content/content.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Step 1: Create content module**

Create `apps/api/src/content/content.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { TestimonialsController } from './testimonials.controller';
import { LegalNewsController } from './legal-news.controller';
import { BlogService } from './blog.service';
import { GoogleDocsService } from './google-docs.service';
import { SeoService } from './seo.service';
import { TestimonialsService } from './testimonials.service';
import { LegalNewsService } from './legal-news.service';

/**
 * Content management module
 *
 * Manages blog posts, case studies (via content_type), testimonials, and legal news.
 * Integrates with Google Docs API for content creation and auto-generates SEO fields.
 */
@Module({
  controllers: [BlogController, TestimonialsController, LegalNewsController],
  providers: [
    BlogService,
    GoogleDocsService,
    SeoService,
    TestimonialsService,
    LegalNewsService,
  ],
  exports: [BlogService, TestimonialsService, LegalNewsService],
})
export class ContentModule {}
```

**Step 2: Register in app.module.ts**

Add to imports in `apps/api/src/app.module.ts`:

```typescript
import { ContentModule } from './content/content.module';

// In @Module imports array, add:
ContentModule,
```

**Step 3: Verify build**

```bash
cd apps/api && pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add apps/api/src/content/content.module.ts apps/api/src/app.module.ts && git commit -m "feat(api): register ContentModule in app"
```

---

### Task 12: Frontend — Content API Client

**Files:**
- Create: `apps/web/lib/api/content.ts`

**Step 1: Create content API client**

Create `apps/web/lib/api/content.ts` following the pattern from `apps/web/lib/api/complaints.ts`:

Functions to create:
- `getPublishedPosts(params)` — `GET /api/content/posts` with query params (contentType, categoryId, search, page, limit)
- `getPostBySlug(slug)` — `GET /api/content/posts/${slug}`
- `getAdminPosts(params)` — `GET /api/content/posts/admin` (authenticated)
- `createPost(data)` — `POST /api/content/posts` (authenticated)
- `updatePost(id, data)` — `PATCH /api/content/posts/${id}` (authenticated)
- `syncPost(id)` — `POST /api/content/posts/${id}/sync` (authenticated)
- `deletePost(id)` — `DELETE /api/content/posts/${id}` (authenticated)
- `incrementView(id)` — `POST /api/content/posts/${id}/view` (no auth needed)
- `getCategories()` — `GET /api/content/categories` (no auth needed)
- `createCategory(data)` — `POST /api/content/categories` (authenticated)
- `updateCategory(id, data)` — `PATCH /api/content/categories/${id}` (authenticated)
- `deleteCategory(id)` — `DELETE /api/content/categories/${id}` (authenticated)

**Note:** Public endpoints don't need `getSessionToken()` or Authorization header.

**Step 2: Verify build**

```bash
cd apps/web && pnpm tsc --noEmit
```

**Step 3: Commit**

```bash
git add apps/web/lib/api/content.ts && git commit -m "feat(web): add content API client functions"
```

---

### Task 13: Frontend — Admin Content List Page

**Files:**
- Create: `apps/web/app/admin/content/page.tsx`
- Modify: `apps/web/components/dashboard/sidebar.tsx` (add Content link)

**Step 1: Add Content link to admin sidebar**

In `apps/web/components/dashboard/sidebar.tsx`:
- Import `FileText` from `lucide-react`
- Add to `ADMIN_NAV` array: `{ label: 'Content', href: '/admin/content', icon: FileText }`

**Step 2: Create admin content list page**

Create `apps/web/app/admin/content/page.tsx`:
- Client component (`'use client'`)
- Two tabs: "Blogs" and "Case Studies" (filter by contentType)
- DataTable with columns: Title, Status badge, Category, Author, Published Date, Views, Actions (Edit/Delete)
- Status badges: Draft (gray), Published (green), Archived (yellow)
- Search input, category filter dropdown
- "New Post" button linking to `/admin/content/new`
- Fetch from `getAdminPosts()` with content type filter
- Follow existing admin page patterns (e.g., `/admin/complaints/page.tsx` or `/admin/service-registrations/page.tsx`)

**Step 3: Verify build**

```bash
cd apps/web && pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add apps/web/app/admin/content/ apps/web/components/dashboard/sidebar.tsx && git commit -m "feat(web): add admin content list page with sidebar link"
```

---

### Task 14: Frontend — Admin Content Create/Edit Pages

**Files:**
- Create: `apps/web/app/admin/content/new/page.tsx`
- Create: `apps/web/app/admin/content/[id]/page.tsx`

**Step 1: Create the "New Post" page**

Create `apps/web/app/admin/content/new/page.tsx`:
- Form fields:
  - **Google Doc URL** — text input (required)
  - **Content Type** — select: Blog / Case Study
  - **Category** — dropdown populated from `getCategories()`
  - **Featured** — checkbox
- "Fetch & Preview" button that calls `createPost()` (saves as draft)
- After creation, redirect to `/admin/content/[id]` for SEO editing
- Template links section: "Use our [Blog Template] or [Case Study Template] for consistent formatting"
- Use React Hook Form + Zod validation with `CreateContentPostSchema`
- Toast notifications via `sonner`

**Step 2: Create the "Edit Post" page**

Create `apps/web/app/admin/content/[id]/page.tsx`:
- Fetches post by ID from `getAdminPosts()` or a dedicated `getPostById()` endpoint
- Editable fields:
  - Title, Slug, Excerpt, Featured Image URL
  - SEO section: Meta Title (with character counter /60), Meta Description (with counter /160), Read Time
  - Category, Content Type, Featured toggle
  - For case studies: metadata fields (Outcome, Client Name, Duration, Year, Tags)
  - Status: Draft / Published / Archived (with publish confirmation)
- "Re-sync from Google Doc" button that calls `syncPost(id)`
- "Delete" button (admin only, with confirmation dialog)
- Content preview panel showing rendered HTML
- Use React Hook Form + Zod validation with `UpdateContentPostSchema`

**Step 3: Verify build**

```bash
cd apps/web && pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add apps/web/app/admin/content/ && git commit -m "feat(web): add admin content create and edit pages"
```

---

### Task 15: Frontend — Update Public Blog Pages to Use API

**Files:**
- Modify: `apps/web/app/(public)/blogs/page.tsx`
- Modify: `apps/web/app/(public)/blogs/[slug]/page.tsx`

**Step 1: Update blog listing page**

Modify `apps/web/app/(public)/blogs/page.tsx`:
- Keep existing UI/animations but replace static data imports with API calls
- Fetch blogs via `getPublishedPosts({ contentType: 'blog' })` and case studies via `getPublishedPosts({ contentType: 'case_study' })`
- Fetch categories from `getCategories()`
- Map API response to the existing component interfaces
- Keep the `InsightsSection` and `CaseStudiesSection` components but feed them API data
- Handle loading states and errors

**Step 2: Update blog detail page with SSR SEO**

Convert `apps/web/app/(public)/blogs/[slug]/page.tsx` to a **server component**:

```typescript
import type { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || '',
      images: [post.featuredImage || '/og-default.jpg'],
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      authors: post.authorName ? [post.authorName] : [],
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: `https://arco.law/blogs/${post.slug}` },
  };
}
```

Add JSON-LD structured data as a `<script type="application/ld+json">` in the page:

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
  "image": "..."
}
```

Call `incrementView(post.id)` from a client component on page load.

**Step 3: Verify build**

```bash
cd apps/web && pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add apps/web/app/\(public\)/blogs/ && git commit -m "feat(web): update public blog pages to API-backed with SSR SEO"
```

---

### Task 16: Final Verification & Cleanup

**Step 1: Full type check**

```bash
cd apps/api && pnpm tsc --noEmit
cd apps/web && pnpm tsc --noEmit
cd packages/shared && pnpm tsc --noEmit
```

**Step 2: Lint**

```bash
pnpm lint
```

**Step 3: Remove static data files (only after API integration verified)**

Delete `apps/web/components/data/blogData.ts` and `apps/web/components/data/caseStudyData.ts` if no other components reference them.

**Step 4: Verify no broken imports**

```bash
cd apps/web && pnpm tsc --noEmit
```

**Step 5: Final commit**

```bash
git add -A && git commit -m "chore: cleanup static blog data after API migration"
```
