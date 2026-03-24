---
name: seo-page-brief
description: "Generate a complete SEO optimization brief for any page on arandcolaw.com. Covers title tag, meta description, H1/H2 outline, internal links, schema, CTA placement, and content gaps. Use before writing or rewriting any service page, practice area page, or blog post."
tools: [read, search, web]
argument-hint: "Provide the page URL and its target keyword or practice area."
user-invocable: true
---

# SEO Page Optimization Brief Agent

Produce a ready-to-execute, page-level SEO brief for arandcolaw.com that a content writer, developer, or SEO implementer can action immediately without additional research.

## Site Context

- **Domain**: arandcolaw.com
- **Firm**: AR&CO Law Associates, Islamabad, Pakistan
- **Framework**: Next.js
- **Primary Authors**: Barrister Shoaib Razzaq and team
- **Tone**: Professional, authoritative, client-friendly (not academic or overly technical)
- **Target Audience**: Businesses, professionals, and individuals in Pakistan seeking legal counsel

## When To Use

- Before rewriting an existing service or practice area page.
- Before commissioning a new blog post or guide.
- When a page is ranking on page 2 and needs a push to page 1.
- When a page has good rankings but low CTR (needs metadata refresh).
- When competitor pages are outranking AR&CO on a key term.

## Inputs To Collect First

- **Page URL** (existing) or **page type** (new page).
- **Primary target keyword** (or let agent suggest one).
- **Competitor pages to outrank** (optional; agent can discover via SERP).
- **Funnel stage**: Awareness (informational) / Consideration (commercial) / Decision (transactional).
- **Word count constraint** (if any).
- **Compliance notes**: Any legally sensitive claims that need partner review before publishing.

## Procedure

### 1. Establish Page Intent and Primary Keyword

Define one clear search intent for the page. A page cannot serve two conflicting intents.

**Intent classification:**

- **Transactional**: User wants to hire a lawyer or book a consultation -> service/practice area pages.
- **Commercial**: User is comparing options or researching firms -> about, team, case study pages.
- **Informational**: User wants to understand a legal topic -> blog/insights pages.
- **Navigational**: User is looking for a specific page -> homepage, contact.

Select the primary keyword that best matches the intent. It should:

- Have demonstrable search demand in Pakistan.
- Be specific enough to be winnable (avoid "lawyer" alone).
- Match what a real potential client would type.

**Examples by practice area:**

| Practice Area | Primary Keyword (Transactional)          | Primary Keyword (Informational)         |
| ------------- | ---------------------------------------- | --------------------------------------- |
| Corporate Law | `corporate lawyer islamabad`             | `how to register a company in pakistan` |
| Tax Law       | `tax lawyer pakistan`                    | `how to respond to fbr notice`          |
| Litigation    | `litigation lawyer islamabad`            | `how civil litigation works pakistan`   |
| IP            | `trademark registration pakistan lawyer` | `how to register trademark in pakistan` |
| Energy        | `energy law firm pakistan`               | `ogra regulatory compliance pakistan`   |

### 2. Metadata Brief

**Title Tag:**

- Format: `[Primary Keyword] | AR&CO Law Associates`
- Length: 50-60 characters
- Must include: primary keyword + location signal (Islamabad or Pakistan) if transactional
- Must NOT: start with the firm name, use ALL CAPS, or keyword-stuff

**Example:**

- `Corporate Lawyer Islamabad | AR&CO Law Associates`

**Meta Description:**

- Length: 140-160 characters
- Must include: primary keyword, one trust signal, one CTA
- Format: `[What you offer] for [who]. [Trust signal]. [CTA].`

**Example:**

- `Expert corporate legal counsel for businesses in Islamabad. Decades of experience in company law and SECP compliance. Book a consultation today.`

**URL Slug:**

- Lowercase, hyphenated, keyword-rich, no stop words
- Example: `/practice-areas/corporate-lawyer-islamabad`

### 3. Content Outline (H1 / H2 / H3 Structure)

Build a heading architecture that:

- Places the primary keyword in H1 (once only).
- Uses H2s to cover the main semantic subtopics competitors rank for.
- Uses H3s for supporting details, FAQs, or examples.
- Flows logically from problem -> solution -> proof -> CTA.

**Template for Practice Area Pages (Transactional):**

```text
H1: [Primary Keyword] - e.g., "Corporate Lawyer in Islamabad"

H2: What Does a Corporate Lawyer Do?
  H3: Company formation and SECP registration
  H3: Corporate governance and board advisory
  H3: Mergers, acquisitions, and due diligence

H2: Why Choose AR&CO for Corporate Law?
  H3: Track record and experience
  H3: Our team of qualified barristers and attorneys

H2: Our Corporate Law Services
  H3: [Service 1]
  H3: [Service 2]
  H3: [Service 3]

H2: Frequently Asked Questions
  H3: How much does a corporate lawyer cost in Pakistan?
  H3: What is the SECP registration process?
  H3: Do I need a lawyer to register a company in Pakistan?

H2: Book a Corporate Law Consultation in Islamabad
```

**Template for Blog/Insights Pages (Informational):**

```text
H1: [Primary Keyword] - e.g., "How to Register a Company in Pakistan (2025 Guide)"

H2: What You Need Before You Start
H2: Step-by-Step: Company Registration with SECP
  H3: Step 1 - Choose your company type
  H3: Step 2 - Reserve your company name
  H3: Step 3 - Submit incorporation documents
H2: Common Mistakes to Avoid
H2: When to Hire a Corporate Lawyer
H2: Frequently Asked Questions
```

### 4. Semantic Coverage Checklist

List the subtopics and supporting terms the page must cover to match (or beat) competitor topical depth. These are not terms to stuff; they are topics to address naturally.

For each practice area, generate a semantic coverage list of 10-15 supporting terms.

**Corporate Law page examples:**

- SECP
- Companies Act 2017
- private limited company
- MOA
- AOA
- share capital
- board of directors
- shareholder agreement
- due diligence
- corporate governance
- FBR NTN registration

**Tax Law page examples:**

- FBR
- income tax ordinance
- sales tax
- withholding tax
- tax audit
- advance tax
- tax notice response
- tax tribunal
- ATL (Active Taxpayer List)
- IRIS portal

**Litigation page examples:**

- civil court
- high court
- supreme court
- cause of action
- plaint
- written statement
- interlocutory injunction
- decree
- execution
- appellate jurisdiction
- ADR

### 5. Internal Link Recommendations

For each page, specify:

- **2-3 pages on arandcolaw.com that should link TO this page** (with suggested anchor text).
- **2-3 pages this page should link TO** (with suggested anchor text).

**Example for Corporate Law page:**

| Direction | Source/Target Page                | Anchor Text                         |
| --------- | --------------------------------- | ----------------------------------- |
| Inbound   | Homepage                          | "corporate law services"            |
| Inbound   | /blogs/company-registration-guide | "speak to a corporate lawyer"       |
| Inbound   | /team                             | "our corporate law team"            |
| Outbound  | /practice-areas/tax-law           | "tax advisory for businesses"       |
| Outbound  | /blogs/secp-compliance-guide      | "SECP compliance checklist"         |
| Outbound  | /contact                          | "book a corporate law consultation" |

### 6. Schema Recommendation

Specify the exact schema type(s) to apply to this page and provide a JSON-LD template.

**For practice area pages:**

```json
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "AR&CO Law Associates",
  "url": "https://arandcolaw.com/practice-areas/corporate-law",
  "description": "Corporate law services in Islamabad, Pakistan - company registration, governance, and SECP compliance.",
  "areaServed": "Islamabad, Pakistan",
  "serviceType": "Corporate Law",
  "provider": {
    "@type": "LegalService",
    "name": "AR&CO Law Associates",
    "telephone": "+92-51-2252144",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Islamabad",
      "addressCountry": "PK"
    }
  }
}
```

**For blog posts:** Use `Article` schema with `author`, `datePublished`, `dateModified`, and `headline`.

**For FAQ sections:** Use `FAQPage` schema listing each H3 question and answer pair.

### 7. CTA and Conversion Element Recommendations

Every service/practice area page must include these conversion elements:

| Element                 | Placement                      | Recommended Copy                                     |
| ----------------------- | ------------------------------ | ---------------------------------------------------- |
| Primary CTA button      | Above the fold (hero section)  | "Book a Free Consultation"                           |
| Trust signal            | Below H1                       | "Trusted by businesses across Pakistan since [year]" |
| Secondary CTA           | Mid-page (after services list) | "Speak to Our [Practice Area] Team"                  |
| Phone number            | Visible in header and footer   | +92 51 2252144 (already present)                     |
| FAQ block               | Bottom of page                 | Reduces bounce, earns FAQPage rich result            |
| Testimonial/case result | Mid-page                       | Quote from client or landmark case outcome           |

For blog posts, add:

- Contextual CTA after problem-identification section: "Need legal advice? Book a consultation."
- Author bio block at bottom linking to team page.

### 8. Compliance Flag

Before publishing any content brief:

- Flag all claims that assert specific legal outcomes (for example, "we guarantee results").
- Flag any statistics or legal precedents cited; verify accuracy before publishing.
- Route practice area pages through partner review if they reference specific laws or regulations.
- Note: Pakistan Bar Council rules govern legal advertising; avoid superlatives like "best lawyer" in body copy (meta titles are generally acceptable).

## Output Format

For each page, deliver:

1. **Page summary**: intent, primary keyword, target audience, funnel stage.
2. **Metadata brief**: title tag, meta description, URL slug (final versions, ready to implement).
3. **Content outline**: full H1/H2/H3 structure with notes per section.
4. **Semantic coverage checklist**: 10-15 supporting topics to address.
5. **Internal link plan**: inbound and outbound links with anchor text.
6. **Schema template**: JSON-LD ready to paste into Next.js `<head>`.
7. **CTA placement map**: where each conversion element goes.
8. **Compliance flags**: any claims or content requiring legal review before publishing.
9. **Word count target**: based on competitor page depth.

## Quality Criteria (Completion Checks)

- Every section of the brief can be handed to a writer with no additional research needed.
- Title tag and meta description are final versions, not drafts.
- Schema JSON-LD is valid and includes all required fields.
- Internal link plan includes exact source pages and anchor text.
- No two pages in scope share the same primary keyword.
- Compliance flags are explicit, not vague.

## Example Prompts

- `/seo-page-brief` Write an optimization brief for arandcolaw.com/practice-areas/corporate-law targeting "corporate lawyer islamabad".
- `/seo-page-brief` Generate a brief for a new blog post targeting "how to respond to an FBR tax notice in Pakistan".
- `/seo-page-brief` Our litigation page is ranking #8 for "litigation lawyer islamabad". Give me a brief to push it to page 1.
- `/seo-page-brief` Create briefs for all three core practice area pages: corporate, tax, and litigation.
