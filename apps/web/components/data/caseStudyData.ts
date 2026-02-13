/**
 * Sample case study data for the AR&CO Blogs / Case Studies page.
 * Replace with Supabase-backed data when CMS is integrated.
 */
export interface CaseStudy {
  id: string
  slug: string
  title: string
  summary: string
  outcome: string
  practiceArea: string
  year: string
  client: string
  duration: string
  tags: string[]
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'case-01',
    slug: 'multinational-joint-venture-dispute',
    title: 'Multinational Joint Venture Dispute — ₨2.4B Settlement',
    summary:
      'Represented a leading Pakistani conglomerate in a cross-border joint venture dispute involving breach of shareholder agreements and misappropriation of partnership assets across three jurisdictions.',
    outcome: 'Secured a ₨2.4 billion settlement through international arbitration at the ICC, with full recovery of misappropriated assets and dissolution of the joint venture on favourable terms.',
    practiceArea: 'Litigation & Arbitration',
    year: '2025',
    client: 'Confidential — Fortune 500 Affiliate',
    duration: '18 months',
    tags: ['International Arbitration', 'Corporate Dispute', 'Cross-Border'],
  },
  {
    id: 'case-02',
    slug: 'overseas-pakistani-land-fraud-recovery',
    title: 'Overseas Pakistani Land Fraud Recovery — Islamabad',
    summary:
      'An overseas Pakistani family discovered forged power of attorney documents had been used to illegally transfer their 4-kanal residential property in F-7 Islamabad to a third party through collusion with revenue authorities.',
    outcome: 'Successfully reversed the fraudulent mutation, restored property title to the rightful owners, and secured criminal prosecution of the forgers under PPC sections 467, 468 & 471.',
    practiceArea: 'Overseas Desk',
    year: '2025',
    client: 'Overseas Pakistani Family — UK',
    duration: '12 months',
    tags: ['Property Fraud', 'Overseas Pakistanis', 'Criminal Prosecution'],
  },
  {
    id: 'case-03',
    slug: 'workplace-harassment-landmark-verdict',
    title: 'Workplace Harassment — Landmark Corporate Verdict',
    summary:
      'Represented a senior female executive in a high-profile workplace harassment case against a major financial institution, involving systematic harassment, wrongful termination, and retaliation.',
    outcome: "Achieved a landmark verdict ordering reinstatement with full back pay, ₨15 million in compensatory damages, and mandatory policy reforms across the institution's nationwide branches.",
    practiceArea: "Women's Desk",
    year: '2024',
    client: 'Confidential — Senior Executive',
    duration: '14 months',
    tags: ['Workplace Harassment', "Women's Rights", 'Employment Law'],
  },
  {
    id: 'case-04',
    slug: 'cda-commercial-licensing-challenge',
    title: 'CDA Commercial Licensing — Regulatory Challenge Overturned',
    summary:
      "Challenged the CDA's arbitrary refusal to grant commercial licences for a mixed-use development in Blue Area, Islamabad, on grounds of procedural irregularity and violation of the developer's legitimate expectations.",
    outcome: "Islamabad High Court ruled in our client's favour, directing CDA to issue commercial licences within 30 days and awarding costs. Set a precedent for development licensing transparency.",
    practiceArea: 'Regulatory & Government',
    year: '2024',
    client: 'Premier Developers Ltd.',
    duration: '8 months',
    tags: ['CDA', 'Commercial Licensing', 'Administrative Law'],
  },
  {
    id: 'case-05',
    slug: 'startup-ip-portfolio-protection',
    title: 'Startup IP Portfolio — Full Trademark & Patent Protection',
    summary:
      'Engaged by a Pakistani fintech startup to build a comprehensive IP portfolio covering trademarks, patents for their proprietary payment algorithm, and trade secret protections ahead of Series A funding.',
    outcome: "Secured 12 trademark registrations across 4 classes, 2 patent grants, and implemented robust NDA frameworks — directly contributing to the startup's successful $8M Series A raise.",
    practiceArea: 'Facilitation Centre',
    year: '2025',
    client: 'Confidential — Fintech Startup',
    duration: '6 months',
    tags: ['Intellectual Property', 'Startups', 'Patent Law'],
  },
]

/** Unique practice areas extracted from case studies */
export const caseStudyAreas = Array.from(
  new Set(caseStudies.map((c) => c.practiceArea))
)
