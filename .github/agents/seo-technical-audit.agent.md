---
name: seo-technical-audit
description: "Run a structured technical SEO audit for arandcolaw.com. Checks crawlability, indexability, Core Web Vitals, schema markup, internal linking, and Next.js-specific issues. Use when diagnosing why pages aren't ranking, before a content push, or as a quarterly health check."
tools: [read, search, web]
argument-hint: "Provide page URL or scope (e.g., all practice area pages, homepage, blogs). Optionally share Google Search Console coverage report."
user-invocable: true
---

# SEO Technical Audit Agent

Perform a severity-ranked technical SEO audit of arandcolaw.com pages, covering crawlability, indexability, performance, schema, and internal linking - with Next.js-specific checks baked in.

## Site Context

- **Domain**: arandcolaw.com
- **Framework**: Next.js (server-side rendered / static hybrid)
- **Location**: Islamabad, Pakistan
- **CMS**: Custom (Next.js), no WordPress - manual code changes required
- **Key Pages**: Home, Practice Areas (Corporate, Tax, Litigation, IP, Energy), Services, Team, Insights/Blog, About, Complaints

---

## When To Use

- Pages are not appearing in Google Search results.
- Rankings have dropped unexpectedly.
- Before launching a new content push or site update.
- Quarterly health check to catch regressions.
- After a site migration or Next.js version upgrade.

---

## Inputs To Collect First

- **Scope**: Specific URL, section (e.g., all /practice-areas/), or full site.
- **Google Search Console access**: Coverage report, Core Web Vitals report (if available).
- **Recent changes**: Any deployments, URL changes, or content updates in last 30 days.
- **Priority**: Speed, indexing, schema, or all.

---

## Procedure

### 1. Crawlability Check

Verify that Google can discover and access all target pages.

**Checks:**

- `robots.txt` at arandcolaw.com/robots.txt - confirm no `Disallow` blocks on practice area or blog pages.
- `sitemap.xml` at arandcolaw.com/sitemap.xml - confirm all key pages are listed and URLs match live site exactly.
- Check for `noindex` meta tags on pages that should be indexed.
- Verify no password protection or auth walls blocking crawlers (note: site has signin/signup - confirm public pages are fully accessible without login).
- Check for redirect chains (301 -> 301 -> 200) on any renamed URLs.

**Severity flags:**

- P0: Pages blocked by robots.txt or noindex that should rank.
- P1: Pages missing from sitemap.
- P2: Redirect chains longer than one hop.

---

### 2. Next.js-Specific Checks

**Checks unique to Next.js architecture:**

- Confirm canonical tags are set correctly on every page (Next.js can sometimes generate duplicate URLs with/without trailing slash).
- Check for duplicate content between `/practice-areas` and `/services` sections if they cover similar topics.
- Verify that dynamic routes (e.g., `/blogs/[slug]`) render fully server-side and are not client-side only (client-side renders are invisible to Googlebot).
- Check `<head>` metadata - title tags and meta descriptions must be set via `next/head` or Next.js Metadata API, not injected client-side.
- Confirm that the `Link` component is used for internal navigation (not plain `<a>` tags that break prefetching).
- Check for any `loading.js` or skeleton states that might serve empty HTML to crawlers.

**Severity flags:**

- P0: Dynamic blog routes rendering client-side only (Googlebot cannot index).
- P1: Missing or duplicate canonical tags.
- P1: Title/meta injected client-side (invisible to crawlers).
- P2: Trailing slash inconsistency creating soft duplicate pages.

---

### 3. On-Page Metadata Audit

For each page in scope, check:

| Element          | Requirement                                                       | Common Issue                       |
| ---------------- | ----------------------------------------------------------------- | ---------------------------------- |
| Title tag        | 50-60 chars, includes primary keyword + "Pakistan" or "Islamabad" | Too generic: "AR&CO Law Firm" only |
| Meta description | 140-160 chars, includes CTA                                       | Missing or auto-generated          |
| H1               | One per page, matches primary keyword intent                      | Multiple H1s or none               |
| H2s              | Semantic subtopics, not just decorative                           | Missing or keyword-stuffed         |
| URL slug         | Short, keyword-rich, lowercase, hyphens                           | Auto-generated slugs from CMS      |
| Image alt text   | Descriptive, contextual                                           | Blank or filename-only             |

**Severity flags:**

- P0: Pages with no title tag or duplicate titles across pages.
- P1: Missing H1 or H1 that doesn't match page intent.
- P2: Missing meta descriptions on service pages.

---

### 4. Schema Markup Audit

Law firms have specific schema opportunities that directly affect Google's local pack and rich results.

**Required schema for arandcolaw.com:**

| Schema Type      | Where to Apply                        | Current Status to Check                          |
| ---------------- | ------------------------------------- | ------------------------------------------------ |
| `LegalService`   | Homepage, all practice area pages     | Likely missing - highest priority                |
| `LocalBusiness`  | Homepage                              | Check for NAP consistency (Name, Address, Phone) |
| `Person`         | Team page (Barrister Shoaib Razzaq)   | Check for `attorney` role markup                 |
| `Article`        | All Insights/blog posts               | Check for `datePublished`, `author`              |
| `FAQPage`        | Practice area pages with FAQ sections | Add if FAQ content exists                        |
| `BreadcrumbList` | All inner pages                       | Check if Next.js generates automatically         |

**Validation steps:**

- Test existing schema at schema.org validator and Google Rich Results Test.
- Check for errors: missing required fields, incorrect types, malformed JSON-LD.

**Severity flags:**

- P0: No `LegalService` or `LocalBusiness` schema on homepage.
- P1: Blog posts missing `Article` schema with author and date.
- P2: FAQ content present but no `FAQPage` schema applied.

---

### 5. Core Web Vitals & Performance

**Metrics to check (via Google PageSpeed Insights):**

| Metric                                | Target  | Why It Matters                             |
| ------------------------------------- | ------- | ------------------------------------------ |
| LCP (Largest Contentful Paint)        | < 2.5s  | Ranking signal; hero image/text load speed |
| FID / INP (Interaction to Next Paint) | < 200ms | User interaction responsiveness            |
| CLS (Cumulative Layout Shift)         | < 0.1   | Page stability; layout jumping             |
| TTFB (Time to First Byte)             | < 600ms | Server response speed                      |

**Next.js-specific performance checks:**

- Confirm images use `next/image` component (automatic optimization, lazy loading, WebP conversion).
- Check for unoptimized third-party scripts (e.g., analytics, chat widgets) blocking render.
- Verify static pages are being served from CDN cache, not re-rendered on every request.
- Check font loading strategy - self-hosted fonts vs. Google Fonts (Google Fonts can add latency in Pakistan due to DNS resolution).

**Severity flags:**

- P0: LCP > 4s on mobile (Pakistan mobile-first audience).
- P1: Images not using `next/image` (large unoptimized files).
- P1: CLS > 0.25 (layout instability hurts UX and rankings).
- P2: TTFB > 1s (consider CDN or server region closer to Pakistan).

---

### 6. Internal Linking Audit

**Checks:**

- Every practice area page should be linked from the homepage and from at least 2 other pages.
- Identify orphan pages (pages with zero internal links pointing to them).
- Check anchor text diversity - avoid using "click here" or "learn more"; use keyword-rich anchors.
- Verify the Insights/blog posts link back to relevant practice area pages (topical authority signal).
- Check navigation - all primary practice areas should be reachable within 2 clicks from homepage.

**Output:**

- List of orphan pages.
- Pages with fewer than 2 internal links.
- Recommended internal link additions with anchor text suggestions.

**Severity flags:**

- P1: Practice area pages with zero internal links (orphaned).
- P1: Blog posts with no links to service pages.
- P2: Navigation depth greater than 3 clicks for any key page.

---

### 7. Mobile & Local SEO Checks

**Mobile:**

- Confirm site is fully responsive (Next.js default, but verify custom components).
- Test tap target sizes (buttons, nav links) - minimum 48x48px for mobile usability.
- Confirm no horizontal scroll on mobile viewport.

**Local SEO:**

- Verify Google Business Profile exists and is claimed for AR&CO Islamabad.
- Check NAP consistency: Name, Address, Phone number must be identical across site, Google Business Profile, and any directory listings.
- Confirm address is in the footer on every page (it is - verify it renders in HTML, not only via JavaScript).
- Check for local citation consistency on legal directories (e.g., PakistanLaw.com, Mustakil.com, or local bar association listings).

**Severity flags:**

- P0: Google Business Profile not claimed.
- P1: NAP inconsistency between site and Google Business Profile.
- P2: Address rendered only via JavaScript (invisible to crawlers).

---

## Output Format

Deliver audit results in this order:

1. **Executive summary** - overall site health score (Green/Amber/Red per category).
2. **P0 issues** - must fix immediately (blocking ranking or indexing).
3. **P1 issues** - fix within 30 days (significant ranking impact).
4. **P2 issues** - fix within 60 days (optimization opportunities).
5. **Schema implementation checklist** - copy-paste ready JSON-LD templates for LegalService and LocalBusiness.
6. **Quick wins list** - top 5 fixes that can be done in under 2 hours.

---

## Quality Criteria (Completion Checks)

- Every P0 issue includes exact URL, description, and fix instruction.
- Schema recommendations include a JSON-LD template ready for implementation.
- Performance recommendations specify which Next.js component or config to change.
- Internal link recommendations include source page, target page, and anchor text.
- All checks are verified against live site, not assumptions.

---

## Example Prompts

- `/seo-technical-audit` Run a full technical audit of arandcolaw.com and prioritize issues by severity.
- `/seo-technical-audit` Check if the blog posts on arandcolaw.com/blogs are being indexed correctly.
- `/seo-technical-audit` Audit schema markup on all practice area pages and give me JSON-LD templates to implement.
- `/seo-technical-audit` Check Core Web Vitals for the homepage and identify the biggest performance bottleneck.
