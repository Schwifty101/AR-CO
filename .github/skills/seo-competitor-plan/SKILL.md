---
name: seo-competitor-plan
description: "Build and execute end-to-end SEO plans for public website pages using competitor research, keyword mapping, technical audits, and measurable rollout steps. Use when asked to improve organic visibility, outrank competitors, or create SEO implementation roadmaps."
argument-hint: "Provide website URL, market, top competitors, and target pages."
user-invocable: true
---

# SEO Competitor Plan

Create an end-to-end SEO implementation workflow for public pages by combining market discovery, competitor intelligence, technical SEO checks, on-page optimization, content planning, and KPI-driven iteration.

## Agent Integration (Required)

Use the specialized agents below to execute each phase instead of doing all work in a single pass.

- `seo-technical-audit`: Use for crawl/index checks, Core Web Vitals triage, schema validation, and internal linking health.
- `seo-keyword-discovery`: Use for intent buckets, keyword universe creation, clustering, gap analysis, and page mapping.
- `seo-page-brief`: Use for page-level optimization briefs (title/meta, H1-H3 outline, schema, links, CTAs).
- `seo-content-refresh`: Use when existing pages need rewrite/refresh recommendations based on competitor gaps and stale legal content.
- `seo-nextjs-implementer`: Use to convert approved SEO recommendations into production-ready Next.js code changes (metadata, JSON-LD, canonical logic, sitemap/robots updates).
- `Sitemap Builder`: Use to build verified URL inventory, IA map, and sitemap coverage baseline before keyword/page mapping.

### Orchestration Rules

1. Start with `Sitemap Builder` if page inventory is unclear, incomplete, or likely outdated.
2. Run `seo-technical-audit` before major content expansion when crawl/index issues are suspected.
3. Run `seo-keyword-discovery` after inventory is confirmed and technical blockers are triaged.
4. Use `seo-page-brief` for every high-priority in-scope page identified from clustering.
5. Use `seo-content-refresh` for existing pages that are stale, underperforming, or misaligned with intent.
6. Use `seo-nextjs-implementer` when the user asks for implementation-ready code or commit-ready diffs.
7. Merge all agent outputs into one unified implementation roadmap and KPI plan.

## When To Use

- User asks for SEO strategy or implementation plan.
- User wants competitor benchmarking for public pages.
- User asks for keyword gap analysis and page-level recommendations.
- User needs a practical roadmap with priorities, owners, and measurable outcomes.

## Inputs To Collect First

- Primary site domain and public page scope (for example: home, services, practice areas, blog).
- Geo/language market (for example: Pakistan, English).
- Business goals (lead generation, brand awareness, service-specific ranking).
- Known competitors (direct and SERP competitors).
- Constraints (timeline, team size, CMS limitations, legal/compliance review needs).

## Procedure

1. Define scope and success metrics.

- Confirm which public pages are in scope and which are excluded.
- Set baseline KPIs: impressions, clicks, average position, organic conversions, page speed, index coverage.
- Define ranking intent buckets: brand, commercial, informational, local.

2. Build competitor set.

- Start with user-provided competitors.
- Expand using SERP discovery for top service keywords.
- Split into two groups:
- Direct competitors (same business model/service).
- Search competitors (domains ranking for target queries).

3. Crawl and map page inventory.

- Inventory all indexable public pages from the target site.
- Map each page to one primary intent and up to three secondary keyword themes.
- Detect cannibalization risks where multiple pages target the same intent.
- Preferred execution: delegate inventory and canonical URL verification to `Sitemap Builder`.

4. Perform technical SEO triage.

- Check crawlability and indexability: robots directives, canonical tags, noindex usage, sitemap status.
- Check performance signals: Core Web Vitals, render blocking, media size, caching opportunities.
- Check structured data coverage and validity where applicable.
- Check internal linking depth and orphan pages.
- Output a severity-ranked issue list (P0/P1/P2).
- Preferred execution: delegate this full step to `seo-technical-audit` and import its prioritized findings.

5. Run competitor content and on-page analysis.

- Compare top-ranking competitor pages for each target keyword cluster.
- Extract content patterns:
- Search intent match and content format.
- Topic depth and semantic coverage.
- Heading architecture and FAQ patterns.
- Trust signals (author, citations, case results, social proof).
- Compare metadata patterns: title structure, meta descriptions, URL slugs.

6. Execute keyword gap and opportunity sizing.

- Build keyword universe from:
- Existing ranking terms.
- Competitor ranking terms.
- Related questions and long-tail variants.
- Cluster keywords by page intent and funnel stage.
- Score opportunities using: relevance, difficulty proxy, business value, and content effort.
- Preferred execution: delegate keyword universe, clustering, and priority scoring to `seo-keyword-discovery`.

7. Produce page-level optimization briefs.

- For each in-scope page, define:
- Primary keyword + search intent.
- Suggested title tag and meta description.
- H1/H2 outline with semantic subtopics.
- Internal link opportunities (source pages and anchor guidance).
- Schema recommendations where relevant.
- Conversion element recommendations (CTA placement, proof blocks, FAQ).
- Preferred execution: delegate each priority page to `seo-page-brief` and standardize outputs into one brief template.

8. Build content roadmap.

- Decide whether to refresh existing pages or create new ones.
- Create a 30/60/90-day roadmap:
- Wave 1: quick wins (metadata, indexing issues, internal linking).
- Wave 2: medium effort (content refreshes, FAQ blocks, schema).
- Wave 3: high effort (new pillar pages, long-form guides, digital PR assets).
- Include owner, estimate, dependencies, and acceptance criteria per item.
- Preferred execution: use `seo-content-refresh` for existing page refresh waves and `seo-page-brief` outputs for net-new/major rewrite waves.

9. Convert approved recommendations into code changes when requested.

- Apply recommendations directly to Next.js App Router files (metadata, generateMetadata, JSON-LD, canonical, sitemap.ts, robots.ts).
- Keep implementation scoped to public, indexable routes unless explicitly asked otherwise.
- Preferred execution: delegate coding tasks to `seo-nextjs-implementer` after strategy sign-off.

10. Define measurement and reporting loop.

- Set dashboard views for page-level ranking, CTR, and conversions.
- Define review cadence (weekly tactical, monthly strategic).
- Add decision rules:
- If impressions rise but CTR lags, improve titles/meta and rich result eligibility.
- If rankings stall, deepen topical coverage and improve internal links.
- If traffic rises but conversions lag, improve page UX and CTA funnel.

11. Finalize implementation handoff.

- Deliver a consolidated SEO plan with:
- Executive summary.
- Baseline and target KPIs.
- Competitor insights.
- Technical issue backlog.
- Page-level briefs.
- 30/60/90-day roadmap.
- Confirm sign-off criteria and first sprint plan.

## Decision Points And Branching Logic

- If the site has critical crawl/indexing blockers, prioritize technical fixes before content expansion.
- If competitors dominate with deeper topical authority, prioritize cluster expansion and internal linking architecture.
- If SERP intent is mixed, split target into separate pages by intent instead of forcing one page.
- If a page is already top 3 with low CTR, prioritize snippet optimization before rewriting the full page.
- If legal content is sensitive, route all copy recommendations through compliance review before publishing.
- If recommendations are approved for execution, switch from planning agents to `seo-nextjs-implementer` for code-level rollout.

## Agent Selection Matrix

| Task Type                                | Primary Agent            | Trigger Condition                                                         |
| ---------------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| Site/page inventory and sitemap coverage | `Sitemap Builder`        | Unknown route coverage, missing URL inventory, IA uncertainty             |
| Technical ranking blockers               | `seo-technical-audit`    | Indexing drops, CWV issues, schema uncertainty, pre-rollout QA            |
| Keyword universe and clustering          | `seo-keyword-discovery`  | Need intent mapping, keyword gaps, prioritization                         |
| Page-level optimization instructions     | `seo-page-brief`         | Need implementation-ready brief for a target page                         |
| Existing page rewrite/refresh            | `seo-content-refresh`    | Stalled rankings, outdated legal content, weak conversions                |
| SEO code implementation                  | `seo-nextjs-implementer` | User requests code edits, metadata/schema rollout, sitemap/robots updates |

If multiple conditions apply, run agents in this order: `Sitemap Builder` -> `seo-technical-audit` -> `seo-keyword-discovery` -> `seo-page-brief`/`seo-content-refresh` -> `seo-nextjs-implementer`.

## Quality Criteria (Completion Checks)

- Every public page in scope has a mapped target intent and keyword theme.
- Technical issues are prioritized by severity and impact.
- Competitor analysis covers both direct and SERP competitors.
- Each recommendation is tied to a measurable KPI.
- Roadmap includes owner, effort, dependency, and acceptance criteria.
- When implementation is requested, code outputs are mapped to concrete file targets and validation checks.
- Handoff package supports immediate execution by content, engineering, and design teams.

## Output Format

Provide final deliverables in this order:

1. One-page executive summary.
2. Competitor snapshot table.
3. Technical audit findings (P0/P1/P2).
4. Keyword clusters and page mapping.
5. Page-level optimization briefs.
6. 30/60/90-day implementation roadmap.
7. Code implementation backlog (only when requested) with target files and owning agent (`seo-nextjs-implementer`).
8. KPI tracking plan and reporting cadence.

## Example Prompts

- /seo-competitor-plan Build an SEO plan for https://example.com in Pakistan for corporate law and tax law pages.
- /seo-competitor-plan Compare our public pages against 5 local law firm competitors and prioritize quick wins in 30 days.
- /seo-competitor-plan Create page-level briefs for home, services, and practice-areas pages based on competitor gaps.
- /seo-competitor-plan Build the roadmap, then generate commit-ready Next.js SEO changes for the top 3 priority pages using `seo-nextjs-implementer`.
