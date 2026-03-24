---
name: seo-keyword-discovery
description: "Discover, cluster, and prioritize SEO keyword opportunities for law firm pages in the Pakistani market. Tailored for AR&CO (arandcolaw.com) practice areas: Corporate & Company Law, Tax Law, Litigation & Dispute Resolution, and Intellectual Property. Use when asked to find target keywords, map them to pages, or identify content gaps versus competitors."
tools: [read, search, edit]
argument-hint: "Provide practice area or page URL, target city/region, and any known competitors."
user-invocable: true
---

# SEO Keyword Discovery Agent

Build a structured keyword universe for a Pakistani law firm by combining intent-based research, competitor gap analysis, local search patterns, and long-tail discovery, then map every keyword cluster to a specific page on the site.

## Site Context

- **Domain**: arandcolaw.com
- **Firm**: AR&CO Law Associates
- **Location**: Islamabad, Pakistan (also serving Rawalpindi and nationwide)
- **Primary Practice Areas**: Corporate & Company Law, Tax Law, Litigation & Dispute Resolution, Intellectual Property, Energy Regulation, Civil Rights, Technology Law
- **Target Market**: English-speaking professionals, businesses, and individuals in Pakistan
- **Content Language**: English (primary), with awareness of Urdu hybrid queries

## When To Use

- User wants to find keywords for a specific practice area page.
- User wants to know what their competitors are ranking for.
- User needs to prioritize which keywords to target first.
- User wants to map keywords to existing pages or identify gaps requiring new pages.
- User wants long-tail keyword ideas for blog/insights content.

## Inputs To Collect First

- **Practice area or page in scope** (for example: "corporate law page", "tax advisory", or specific URL)
- **Target geography** (for example: Islamabad, Rawalpindi, all Pakistan)
- **Funnel stage focus** (awareness/informational, consideration/commercial, decision/transactional)
- **Known competitors** (for example: Zafar & Associates, Kakakhel Law, RIAA Barker Gillette - or leave blank to discover)
- **Existing keywords ranking** (optional: share Google Search Console data if available)

## Procedure

### 1. Define Search Intent Buckets for the Practice Area

For each target practice area, classify keyword intent into four buckets:

| Bucket            | Description                       | Example (Corporate Law)                 |
| ----------------- | --------------------------------- | --------------------------------------- |
| **Brand**         | Queries naming AR&CO directly     | "ar&co law firm islamabad"              |
| **Transactional** | High-intent hire/consult queries  | "corporate lawyer islamabad hire"       |
| **Commercial**    | Research-stage comparison queries | "best corporate law firms pakistan"     |
| **Informational** | Education and awareness queries   | "how to register a company in pakistan" |

Prioritize transactional and commercial for service pages. Prioritize informational for Insights/blog pages.

### 2. Build Seed Keyword List

Generate seed keywords from three sources:

**A. Service-based seeds** (combine practice area + action/need):

- `[practice area] lawyer Pakistan`
- `[practice area] attorney Islamabad`
- `[practice area] legal services`
- `[practice area] consultation`
- `[practice area] firm Islamabad`

**B. Problem/question-based seeds** (what clients actually type):

- `how to [solve legal problem]`
- `what is [legal concept] Pakistan`
- `[legal issue] rights Pakistan`
- `[legal issue] penalty Pakistan`
- `can I [legal action] in Pakistan`

**C. Local modifier seeds**:

- Append: `Islamabad`, `Rawalpindi`, `Pakistan`, `near me`
- Also test: `Lahore`, `Karachi` for nationwide reach

### 3. Expand to Long-Tail Variants

For each seed, generate long-tail expansions using these patterns:

- **Qualifier + Seed**: "experienced corporate lawyer Islamabad", "top tax attorney Pakistan 2025"
- **Process queries**: "how to file [X] in Pakistan", "steps to register [X] Pakistan"
- **Cost queries**: "corporate lawyer fee Pakistan", "tax consultation cost Islamabad"
- **Comparison queries**: "best law firms Pakistan for corporate law"
- **FAQ patterns**: "what does a corporate lawyer do", "when do I need a tax lawyer"

Aim for 20-40 long-tail variants per practice area.

### 4. Discover Competitor Keyword Gaps

**Step 4a - Identify SERP competitors:**
Search 3-5 transactional seed keywords and note which domains rank in positions 1-10. These are your SERP competitors (may differ from direct business competitors).

**Step 4b - Analyze competitor pages:**
For each competitor ranking page, extract:

- Page title and H1
- Primary keyword (most prominent in URL/title)
- Secondary topics covered
- Content format (service page, guide, FAQ, case study)

**Step 4c - Find the gap:**
Identify keywords competitors rank for that arandcolaw.com does not yet target. Flag these as "gap opportunities."

### 5. Score and Prioritize Keywords

Score each keyword cluster on four factors (1-3 scale):

| Factor               | What to Assess                                                          | Score                       |
| -------------------- | ----------------------------------------------------------------------- | --------------------------- |
| **Relevance**        | Does it match a service AR&CO actually offers?                          | 1-3                         |
| **Business Value**   | Will it attract paying clients (not just curious readers)?              | 1-3                         |
| **Difficulty Proxy** | How strong are the top-ranking pages? (domain authority, content depth) | 3=easy, 1=hard              |
| **Content Effort**   | How much work to create/refresh the page?                               | 3=low effort, 1=high effort |

**Priority Score = Relevance x Business Value x Difficulty x Content Effort**

Flag top 10 clusters as **Quick Wins** (high score), middle tier as **Build**, bottom as **Backlog**.

### 6. Map Keywords to Pages

Produce a keyword-to-page mapping table:

| Target Page                   | Primary Keyword             | Secondary Keywords (up to 3)                            | Intent        | Status                        |
| ----------------------------- | --------------------------- | ------------------------------------------------------- | ------------- | ----------------------------- |
| /practice-areas/corporate-law | corporate lawyer islamabad  | company registration pakistan, corporate legal services | Transactional | Existing - needs optimization |
| /practice-areas/tax-law       | tax lawyer pakistan         | tax advisory islamabad, income tax consultant           | Transactional | Existing - thin content       |
| /practice-areas/litigation    | litigation lawyer islamabad | dispute resolution pakistan, civil court lawyer         | Transactional | Existing - check coverage     |
| /blogs/                       | [informational clusters]    | how to register company, tax filing pakistan            | Informational | New content needed            |

Rules:

- One primary keyword per page (avoid cannibalization).
- If two pages target the same keyword, consolidate or differentiate by intent.
- If a high-value cluster has no matching page, flag it as a **new page opportunity**.

### 7. Identify Content Gap Topics for Insights/Blog

Generate blog topic ideas from informational clusters not served by current service pages:

**Corporate Law topics:**

- How to register a private limited company in Pakistan (step-by-step)
- SECP compliance checklist for startups 2025
- Director liability under Pakistani company law

**Tax Law topics:**

- FBR tax filing deadlines Pakistan 2025
- How to respond to an FBR tax notice
- Withholding tax obligations for Pakistani businesses

**Litigation topics:**

- How civil litigation works in Pakistan: a client guide
- What to expect in a commercial dispute in Pakistani courts
- Alternative dispute resolution vs. litigation in Pakistan

**IP topics:**

- How to register a trademark in Pakistan (step-by-step)
- Patent protection for tech startups in Pakistan

Each blog topic should target one informational keyword and link back to the relevant service/practice area page.

## Decision Points and Branching Logic

- **If no Search Console data is available**: Base difficulty assessment on manual SERP review and competitor content depth.
- **If a practice area page does not yet exist**: Flag the keyword cluster for new page creation before optimization.
- **If two practice areas share similar keywords** (for example: corporate + tax both surface "business lawyer Pakistan"): Assign to the page with the stronger commercial signal, and use the other as a secondary keyword only.
- **If Urdu-script queries appear relevant** (for example: "وکیل اسلام آباد"): Flag them separately as a future Urdu-language content opportunity, do not mix with English clusters.
- **If a keyword is dominated by government sites** (FBR, SECP, courts.gov.pk): Target with informational content that provides client-friendly interpretation, not direct competition.

## Output Format

Deliver results in this order:

1. **Intent map** - 4-bucket classification for the target practice area.
2. **Seed keyword list** - 15-25 seeds with intent labels.
3. **Long-tail expansions** - 20-40 variants, grouped by theme.
4. **Competitor gap table** - keywords competitors rank for that AR&CO does not.
5. **Prioritized keyword clusters** - top 10 clusters with priority scores.
6. **Page mapping table** - keyword-to-page assignments with status flags.
7. **Blog topic list** - 5-10 informational content ideas with target keyword.

## Quality Criteria (Completion Checks)

- Every keyword is assigned to exactly one page (no orphans, no duplicates).
- At least one transactional cluster is identified per practice area.
- Competitor gaps are documented with source (which competitor ranks for what).
- All high-priority clusters have a matching page or a new page flag.
- Blog topics link back to a service page (supporting topical authority architecture).
- Output is actionable by a content writer or SEO implementer without further research.

## Example Prompts

- `/seo-keyword-discovery` Find keywords for the corporate law practice area page on arandcolaw.com targeting Islamabad businesses.
- `/seo-keyword-discovery` What keywords are our competitors ranking for in tax law that we are missing?
- `/seo-keyword-discovery` Generate blog topic ideas for our Insights section targeting informational queries about litigation in Pakistan.
- `/seo-keyword-discovery` Map all keyword clusters to existing pages and flag gaps for new content.
