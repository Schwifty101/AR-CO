# AR&CO Law Associates — SEO Implementation Tracker

> **Primary intent cluster:** Law Firm in Islamabad + Legal Services in Pakistan
> **Target domain:** `https://arandcolaw.com`
> **Last updated:** 2026-03-26

---

## Strategic Goals

1. Fix canonical and sitemap quality issues that dilute ranking signals.
2. Reposition homepage around one primary intent cluster: *Law firm in Islamabad* + *legal services in Pakistan*.
3. Strengthen internal linking from homepage to high-value service/practice pages.
4. Add trust-focused schema and conversion modules.
5. Publish supporting content to win semantic breadth without cannibalising the homepage.

---

## Top 15 Target Keywords

| # | Keyword | Tier |
|---|---------|------|
| 1 | law firm in Islamabad | Tier 1 |
| 2 | legal services Pakistan | Tier 1 |
| 3 | business lawyer Pakistan | Tier 1 |
| 4 | corporate law firm Pakistan | Tier 1 |
| 5 | corporate lawyer Islamabad | Tier 1 |
| 6 | litigation lawyer Islamabad | Tier 1 |
| 7 | legal consultant Islamabad | Tier 2 |
| 8 | dispute resolution lawyer Pakistan | Tier 2 |
| 9 | intellectual property lawyer Pakistan | Tier 2 |
| 10 | tax consultant Islamabad | Tier 2 |
| 11 | SECP registration lawyer | Tier 2 |
| 12 | company registration legal services Pakistan | Tier 2 |
| 13 | trademark lawyer Pakistan | Tier 2 |
| 14 | best law firm in Islamabad | Tier 2 |
| 15 | law firm Rawalpindi | Tier 3 |

---

## Competitor Monitoring

Track monthly for SERP movement and snippet patterns:

| Competitor | Type | Why They Matter |
|-----------|------|----------------|
| ZAFAR & ASSOCIATES LLP | Direct + SERP | Strong domain authority and broad legal coverage |
| RIAA Barker Gillette | Direct + SERP | Premium corporate/disputes positioning |
| Axis Law Chambers | Direct + Local SERP | Competes for Islamabad firm terms |
| Cornelius, Lane & Mufti | Direct + SERP | Strong institutional trust signals |
| Islamabad boutique firms | Local | Often ranks for city-level conversion keywords |
| Directories / legal publishers | SERP competitors | Can outrank firms on broad generic terms |

---

## Homepage SEO Brief

**Recommended title:** `Law Firm Islamabad | AR&CO Law Associates`
**Recommended H1:** `Law Firm in Islamabad for Businesses and Individuals Across Pakistan`

**Must-have sections:**
1. Clear value proposition with location + service breadth.
2. Practice/service cluster cards linking to core pages.
3. Trust block: credentials, case relevance, testimonials.
4. FAQ section for decision-stage queries.
5. Strong repeated CTA: consult, call, WhatsApp/contact.

**Internal linking priority targets:**
- `apps/web/app/(public)/practice-areas/[slug]/page.tsx`
- `apps/web/app/(public)/blogs/page.tsx`
- `apps/web/app/(public)/team/page.tsx`

---

## Implementation Status

### Already Done ✅

| # | Task | File(s) |
|---|------|---------|
| 1 | Canonical host standardized to non-www `https://arandcolaw.com` | `apps/web/app/layout.tsx`, `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`, `apps/web/app/(public)/page.tsx` |
| 2 | Homepage metadata upgraded with target-intent copy (title, description, keywords, OG, Twitter) | `apps/web/app/(public)/page.tsx` |
| 3 | `Organization` + `LegalService` + `WebSite` JSON-LD schemas added | `apps/web/app/(public)/page.tsx` |
| 4 | Sitemap quality improved — auth routes and form routes excluded via `robots.ts` | `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts` |
| 5 | Testimonials heading corrected from H1 → H2 | `apps/web/components/home/testimonials/Testimonials.tsx` |
| 6 | Crawlable service links present in footer (not modal-only) | `apps/web/components/footer/Footer.tsx` |

---

### Remaining P0 — Highest Priority (Block signal consolidation)

#### P0-1 · Sitemap: Decide `/subscribe` indexability

**File:** `apps/web/app/sitemap.ts`

`/subscribe` is currently in `STATIC_PUBLIC_ROUTES`. The subscription page is a conversion/transaction page with no standalone SEO value.

**Decision needed:** Remove `/subscribe` from the sitemap (recommended) or keep it with `noindex` meta.

**Development step:**
```ts
// In STATIC_PUBLIC_ROUTES, remove '/subscribe':
const STATIC_PUBLIC_ROUTES = [
  '/',
  '/terms',
  '/privacy',
  '/team',
  '/blogs',
  '/complaint-section',  // keep if it has SEO value
]
```

---

#### P0-2 · Add `LocalBusiness` details to schema

**File:** `apps/web/app/(public)/page.tsx`

The existing `Organization` schema lacks `LocalBusiness` geo, `serviceArea`, `openingHours`, and `sameAs` social links — all strong local entity signals.

**Development step:** Upgrade the `organizationSchema` in `page.tsx`:

```ts
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LegalService', 'LocalBusiness'],
  '@id': `${SITE_URL}/#organization`,
  name: 'AR&CO Law Associates',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon-512x512.png`,
  email: 'info@arco.law',
  telephone: '+92 51 2252144',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '[Office Street Address]',
    addressLocality: 'Islamabad',
    addressRegion: 'Islamabad Capital Territory',
    postalCode: '[Postal Code]',
    addressCountry: 'PK',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '[lat]',
    longitude: '[lng]',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  ],
  serviceArea: {
    '@type': 'Country',
    name: 'Pakistan',
  },
  sameAs: [
    'https://www.instagram.com/arcolaw/',
    'https://www.linkedin.com/company/arcolaw/',
    'https://www.facebook.com/arcolaw/',
  ],
  areaServed: 'Pakistan',
  priceRange: '$$$',
}
```

**Note:** Fill in `streetAddress`, `postalCode`, `latitude`, `longitude`, and confirm social profile URLs before deploying.

---

#### P0-3 · Live production validation

**Not a code task — deployment checklist:**
- [ ] Run GSC URL inspection on `https://arandcolaw.com/`
- [ ] Verify canonical in rendered HTML (`<link rel="canonical" href="https://arandcolaw.com/">`)
- [ ] Validate sitemap at `https://arandcolaw.com/sitemap.xml` renders correct URLs
- [ ] Confirm `robots.txt` disallows are correct at `https://arandcolaw.com/robots.txt`
- [ ] Test JSON-LD via Google Rich Results Test

---

### Remaining P1 — High Impact

#### P1-1 · Add primary H1 to homepage hero

**File:** `apps/web/components/home/hero/HeroV2.tsx`

The `HeroV2` component currently has **no `<h1>` tag**. Google requires an explicit, visible H1 on the page to anchor keyword-intent signals. The background text layer in `HomePageClient.tsx` uses `<p>` tags (`aria-hidden="true"`) — these do not count.

**Development step:** Add an SEO-visible H1 inside the hero section. It can be visually styled to match the existing design (overlay on video, or part of the existing heading structure), but must be in the DOM and not `aria-hidden`:

```tsx
// In HeroV2.tsx, inside the hero JSX:
<h1 className="sr-only">
  Law Firm in Islamabad for Businesses and Individuals Across Pakistan
</h1>
```

Or integrate it visually as the hero's primary headline if the design supports it. The `sr-only` (visually hidden but in DOM) approach works as a minimum viable fix.

---

#### P1-2 · Add homepage conversion modules

**File:** `apps/web/app/(public)/HomePageClient.tsx`

The current homepage sections are: `Hero → AboutSection → LegalServices → ClientLogosCarousel → Testimonials`. Missing conversion infrastructure:

**A. Consultation CTA block** — Repeatable section pushing users to book/call:

Add a visible `ConsultationCTA` section between `LegalServices` and `Testimonials` (and optionally after `Testimonials`):

```tsx
// HomePageClient.tsx — add after LegalServices
const ConsultationCTA = dynamic(() => import('@/components/home/ConsultationCTA'), { ssr: false })

// In JSX:
<LegalServices />
<ConsultationCTA />          {/* New CTA block */}
<ClientLogosCarousel />
<Testimonials />
<ConsultationCTA />          {/* Repeated CTA at bottom */}
```

The `ConsultationCTA` component should contain:
- Headline: "Get Expert Legal Advice — Book a Consultation Today"
- Subtext with location signal: "Trusted by individuals and businesses across Pakistan"
- CTA buttons: "Book Consultation", "Call Us", "WhatsApp"

**B. FAQ section** — Decision-stage queries (prerequisite for FAQ schema):

```tsx
const FAQSection = dynamic(() => import('@/components/home/FAQSection'), { ssr: false })

// In JSX (before final CTA):
<FAQSection />
```

Suggested FAQs (keep to 6–8 for homepage):
1. What areas of law does AR&CO specialise in?
2. Is AR&CO Law Associates based in Islamabad?
3. How do I book a legal consultation?
4. Does AR&CO handle corporate and business legal matters?
5. Can AR&CO represent clients across Pakistan?
6. What is the process for SECP or NTN registration?

**C. Trust proof block** (credentials/stats):

Consider a stats/credentials strip between Hero and AboutSection:
- `15+ Years of Legal Excellence`
- `500+ Cases Successfully Resolved`
- `Trusted by Leading Corporations`
- `Islamabad's Premier Law Firm`

---

#### P1-3 · Add FAQPage JSON-LD schema

**File:** `apps/web/app/(public)/page.tsx`

**Prerequisite:** P1-2B (visible FAQ section) must be implemented first.

**Development step:** Add `FAQPage` schema after FAQ content is in the DOM:

```ts
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What areas of law does AR&CO specialise in?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AR&CO Law Associates specialises in corporate law, litigation and dispute resolution, intellectual property, energy law, tax law, immigration, labour law, and real estate law.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is AR&CO Law Associates based in Islamabad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, AR&CO Law Associates is headquartered in Islamabad, Pakistan, and serves clients across Pakistan including Rawalpindi, Lahore, and Karachi.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I book a legal consultation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can book a consultation by calling +92 51 2252144, emailing info@arco.law, or using the consultation booking form on our website.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does AR&CO handle corporate and business legal matters?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we provide comprehensive corporate legal services including company incorporation, SECP compliance, contract drafting, mergers and acquisitions, and ongoing corporate advisory.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can AR&CO represent clients across Pakistan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, AR&CO represents individuals and businesses across all provinces of Pakistan and handles matters before courts and tribunals nationwide.',
      },
    },
  ],
}
```

Add the `<script>` block in `HomePage()` alongside the existing schemas.

---

#### P1-4 · CTA click tracking (analytics events)

**Files:** `apps/web/components/footer/Footer.tsx`, `apps/web/components/home/ConsultationCTA.tsx` (new)

Track conversion intent events on call, WhatsApp, and consult clicks. This does not depend on a specific analytics provider — use a generic `gtag` / `dataLayer` push or whatever the project uses.

**Development step — add event helpers:**

```ts
// lib/analytics.ts
export function trackCTAClick(type: 'call' | 'whatsapp' | 'email' | 'consult', location: string) {
  if (typeof window === 'undefined') return
  // Replace with actual analytics implementation
  window.gtag?.('event', 'cta_click', { cta_type: type, cta_location: location })
}
```

**Apply to all CTA anchor tags** in footer phone/email/WhatsApp links and homepage CTA buttons:

```tsx
<a
  href="tel:+925122521444"
  onClick={() => trackCTAClick('call', 'footer')}
>
  +92 51 2252144
</a>
```

---

#### P1-5 · In-content contextual internal links on homepage

**File:** `apps/web/app/(public)/HomePageClient.tsx`

Footer links exist but in-content crawlable links from homepage body sections are missing. Add contextual links within the `LegalServices` or `AboutSection` components pointing to:

- `/practice-areas/corporate-law` — "Corporate Law"
- `/practice-areas/litigation` — "Litigation & Dispute Resolution"
- `/practice-areas/intellectual-property` — "Intellectual Property"
- `/practice-areas/tax-law` — "Tax Law"
- `/team` — "Meet Our Attorneys"
- `/blogs` — "Legal Insights & Articles"

These links should be visible `<a>` tags in the DOM (not interaction-gated) so crawlers can traverse them without JavaScript execution.

---

### Remaining P2 — Performance + Authority

#### P2-1 · Hero/media loading optimization (Mobile CWV)

**Files:** `apps/web/app/layout.tsx`, `apps/web/components/home/hero/HeroV2.tsx`

**Audit checklist:**
- [ ] Verify `<link rel="preload">` for hero video fires before first paint in layout.tsx
- [ ] Confirm `fetchpriority="high"` on the hero `<video>` or `<img>` element
- [ ] Ensure poster image (static frame) loads before video for LCP signal
- [ ] Test with Lighthouse mobile — target LCP < 2.5s on simulated 4G
- [ ] Lazy-load below-fold images (already done via `dynamic()` — verify no layout shift)

---

#### P2-2 · Practice area page depth upgrades

**File:** `apps/web/app/(public)/practice-areas/[slug]/page.tsx`

Each practice area page needs:
- Unique, keyword-aligned `<title>` and `<meta description>` per slug
- Explicit `<h1>` with service name + location signal (e.g., "Corporate Lawyer in Islamabad")
- `LegalService` JSON-LD per page with `serviceType` and `areaServed`
- Body content covering: what the service is, why a client needs it, AR&CO's approach, CTA
- Minimum 400–600 words of indexable copy per page
- Internal links to related practice areas and the homepage

---

#### P2-3 · Tier 2 support content (blog posts)

**Path:** `apps/web/app/(public)/blogs/`

Publish cluster articles to cover intent gaps without cannibalising the homepage:

| Article Target | Keyword Intent | Priority |
|---------------|---------------|----------|
| "How to register a company in Pakistan" | SECP registration lawyer | High |
| "Trademark registration process in Pakistan" | trademark lawyer Pakistan | High |
| "How to file an income tax return in Pakistan" | tax consultant Islamabad | High |
| "Dispute resolution options in Pakistan" | dispute resolution lawyer Pakistan | Medium |
| "Best law firms in Islamabad: what to look for" | best law firm Islamabad | Medium |
| "Legal services for overseas Pakistanis" | legal consultant Islamabad | Medium |

Each post should link back to the relevant practice area page and include a CTA to the homepage.

---

## 30 / 60 / 90 Day Checklist

### Next 30 Days (Stabilise technical signals)

- [x] **P0-1** — `/subscribe` kept in sitemap (confirmed: page has subscription feature details)
- [x] **P0-2** — `LocalBusiness` + `openingHours` + `sameAs` added to organization schema — `apps/web/app/(public)/page.tsx` — **Note: street address, postal code, GPS coordinates still need real values**
- [x] **P1-1** — Primary `sr-only` `<h1>` added to `HeroV2.tsx`
- [x] **P1-2A** — `ConsultationCTA` component created — `apps/web/components/home/ConsultationCTA/`
- [x] **P1-2B** — `FAQSection` component created (6 FAQs, DOM-persistent for Google) — `apps/web/components/home/FAQSection/`
- [x] **P1-3** — `FAQPage` JSON-LD added to `page.tsx`
- [x] **P1-4** — `lib/analytics.ts` created (gtag + Vercel); `Analytics` component added to `layout.tsx`; CTA tracking wired in `ConsultationCTA`
- [x] **P1-5** — Crawlable `<Link>` added to every service row in `LegalServices.tsx`
- [x] **HomePageClient** — `TrustStats`, `ConsultationCTA` (×2), and `FAQSection` wired into page flow
- [ ] **P0-3** — Run post-deploy GSC + Rich Results Test validation (do after next deploy)
- [ ] **Address** — Add full street address, postal code, GPS coordinates to `organizationSchema` in `page.tsx`
- [ ] **Social URLs** — Confirm correct LinkedIn/Facebook profile URLs (currently using footer placeholders)

### 60 Days (Authority build)

- [x] **P2-2** — Practice area pages refactored: server/client split, `generateMetadata` + `generateStaticParams` + per-slug `LegalService` JSON-LD added — `apps/web/app/(public)/practice-areas/[slug]/page.tsx` + `PracticeAreaContent.tsx`
- [x] **P2-1** — `fetchPriority="high"` added to hero video preload links in `layout.tsx`. **Remaining:** add a poster image (`/banner/hero-poster.jpg`) — no static frame currently exists in `/public/banner/`
- [ ] **P1-5** — Audit and expand internal link graph from service pages → homepage and cross-links
- [ ] **P2-3** — Blog infrastructure is SEO-ready (generateMetadata + Article JSON-LD already in place). Publish content via admin CMS: SECP registration, trademark, tax posts
- [ ] Homepage copy review for Tier 1 keyword density (no stuffing)

### 90 Days (Scale and iterate)

- [ ] **P2-3** — Publish remaining Tier 2 + first Tier 3 blog posts
- [ ] A/B test homepage title variants for CTR improvement
- [ ] Expand converting clusters (Rawalpindi, secondary city terms)
- [ ] Rebalance internal links based on GSC ranking movement
- [ ] Add more trust assets: case pattern summaries, expertise depth sections

---

## KPI Targets

| KPI | Target | Cadence |
|-----|--------|---------|
| Average position — top 15 keywords | Page 1 by month 2, top 3 by month 3+ | Weekly |
| Homepage CTR on non-brand commercial queries | +20% MoM after month 1 | Weekly |
| Organic leads from homepage CTA clicks | Track baseline in month 1 | Weekly |
| Index coverage cleanliness | 0 crawl errors on GSC | Biweekly |
| Crawl efficiency | No auth/transactional URLs indexed | Biweekly |
| Keyword cluster expansion | +3 new ranking terms per month | Monthly |

---

## Key Files Reference

| File | SEO Relevance | Status |
|------|--------------|--------|
| `apps/web/app/(public)/page.tsx` | Homepage metadata, all JSON-LD schemas (Org, LegalService, WebSite, FAQ, LocalBusiness) | Done ✅ |
| `apps/web/app/(public)/HomePageClient.tsx` | Homepage section order: Hero → TrustStats → About → LegalServices → ConsultationCTA → Logos → Testimonials → FAQ → ConsultationCTA | Done ✅ |
| `apps/web/components/home/hero/HeroV2.tsx` | `sr-only` H1 present — add `poster` attribute when `/public/banner/hero-poster.jpg` is ready | Partial ⚠️ |
| `apps/web/app/layout.tsx` | `metadataBase`, font/video preloads with `fetchPriority="high"`, Vercel `<Analytics />` | Done ✅ |
| `apps/web/app/sitemap.ts` | `/subscribe` kept (confirmed). All public routes indexed. | Done ✅ |
| `apps/web/app/robots.ts` | Disallows: /admin, /client, /api, /auth/*, form routes | Done ✅ |
| `apps/web/components/footer/Footer.tsx` | CTA tracking on phone + email links via `trackCTAClick` | Done ✅ |
| `apps/web/lib/analytics.ts` | `trackCTAClick` — fires to Vercel Analytics + gtag | Done ✅ |
| `apps/web/app/(public)/practice-areas/[slug]/page.tsx` | Server component: `generateMetadata` + `generateStaticParams` + `LegalService` JSON-LD per slug | Done ✅ |
| `apps/web/app/(public)/practice-areas/[slug]/PracticeAreaContent.tsx` | Client component: all animated UI for practice area pages | Done ✅ |
| `apps/web/app/(public)/blogs/[slug]/page.tsx` | `generateMetadata` + `Article` JSON-LD — infrastructure complete | Done ✅ |
| `apps/web/app/(public)/blogs/` | Publish Tier 2 content via admin CMS (SECP, trademark, tax) | Pending — content only |
| `apps/web/app/(public)/page.tsx` — `organizationSchema` | Add `streetAddress`, `postalCode`, `geo` coordinates, confirm social profile URLs | Pending — awaiting data |
