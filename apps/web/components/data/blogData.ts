/**
 * Sample blog post data for the AR&CO Blogs page.
 * Replace with Supabase-backed data when CMS is integrated.
 */
export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  authorRole: string
  date: string
  readTime: string
  coverImage: string
  featured: boolean
  /** Full article content in HTML-safe plain text paragraphs */
  content?: string[]
}

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-01',
    slug: 'understanding-corporate-governance-pakistan',
    title: 'Understanding Corporate Governance in Pakistan: A 2026 Perspective',
    excerpt:
      'An in-depth analysis of the evolving corporate governance landscape in Pakistan, examining SECP reforms, board accountability standards, and what they mean for businesses operating in the region.',
    category: 'Corporate Law',
    author: 'Adv. Ahmed Raza',
    authorRole: 'Managing Partner',
    date: '2026-01-28',
    readTime: '8 min read',
    coverImage: '/assets/blog/corporate-governance.jpg',
    featured: true,
    content: [
      "Corporate governance in Pakistan has undergone a remarkable transformation over the past decade. With the Securities and Exchange Commission of Pakistan (SECP) introducing sweeping reforms in 2024 and 2025, the regulatory landscape now demands a higher standard of transparency, accountability, and board-level oversight from publicly listed companies and large private enterprises alike.",
      "The SECP Code of Corporate Governance, revised most recently for the 2025-2026 cycle, mandates that all listed companies maintain independent directors constituting at least one-third of the total board. This requirement has reshaped boardroom dynamics, bringing in directors with diverse professional backgrounds including finance, law, technology, and international trade.",
      "One of the most significant developments has been the introduction of mandatory ESG (Environmental, Social, and Governance) reporting for companies with paid-up capital exceeding PKR 200 million. Companies are now required to publish an annual sustainability report alongside their financial statements, detailing their environmental impact, labor practices, community engagement, and governance policies.",
      "For businesses operating in Pakistan, these reforms present both challenges and opportunities. On the compliance side, organizations must invest in robust internal audit functions, establish whistleblower mechanisms, and ensure their boards meet the new composition requirements. Failure to comply can result in penalties ranging from monetary fines to delisting from the Pakistan Stock Exchange.",
      "The role of company secretaries has also evolved significantly. Under the new framework, company secretaries are expected to serve as governance advisors, ensuring that board proceedings, related-party transactions, and shareholder communications adhere to best practices. AR&CO has been advising several mid-cap firms on restructuring their governance frameworks to meet these elevated standards.",
      "International investors are taking notice. Pakistan saw a 40% increase in foreign portfolio investment in the first half of 2025, partially attributed to improved governance scores on global indices. The World Bank has acknowledged the positive trajectory, noting that stronger corporate governance correlates directly with greater market depth and investor confidence.",
      "Looking ahead, the SECP is expected to introduce digital governance mandates, including blockchain-based shareholder voting and AI-powered compliance monitoring. Companies that proactively adopt these technologies will be well-positioned to attract both domestic and international capital.",
      "At AR&CO, we believe that corporate governance is not merely a regulatory obligation but a strategic asset. Firms that embrace transparency and accountability create lasting value for their shareholders, employees, and communities. Our Corporate Advisory practice helps organizations navigate this evolving landscape with clarity and confidence.",
    ],
  },
  {
    id: 'blog-02',
    slug: 'overseas-pakistanis-property-rights',
    title: 'Property Rights for Overseas Pakistanis: Protecting Your Assets from Abroad',
    excerpt:
      'Navigating property disputes, power of attorney requirements, and legal safeguards every overseas Pakistani should know to protect real estate investments back home.',
    category: 'Overseas Desk',
    author: 'Adv. Fatima Malik',
    authorRole: 'Senior Associate',
    date: '2026-01-15',
    readTime: '6 min read',
    coverImage: '/assets/blog/overseas-property.jpg',
    featured: false,
  },
  {
    id: 'blog-03',
    slug: 'women-workplace-harassment-protection-act',
    title: 'The Protection Against Harassment of Women at Workplace Act: A Practical Guide',
    excerpt:
      'Breaking down the legal mechanisms available to women facing workplace harassment in Pakistan — from filing complaints to court proceedings and employer obligations.',
    category: "Women's Desk",
    author: 'Adv. Sana Tariq',
    authorRole: "Women's Desk Lead",
    date: '2026-01-05',
    readTime: '7 min read',
    coverImage: '/assets/blog/women-protection.jpg',
    featured: true,
  },
  {
    id: 'blog-04',
    slug: 'cda-building-regulations-islamabad',
    title: 'CDA Building Regulations: What You Need to Know Before Constructing in Islamabad',
    excerpt:
      'A comprehensive overview of CDA bylaws, NOC requirements, and the approval process for residential and commercial construction projects in the federal capital.',
    category: 'Regulatory',
    author: 'Adv. Usman Shah',
    authorRole: 'Associate',
    date: '2025-12-20',
    readTime: '5 min read',
    coverImage: '/assets/blog/cda-regulations.jpg',
    featured: false,
  },
  {
    id: 'blog-05',
    slug: 'alternative-dispute-resolution-pakistan',
    title: 'Why Alternative Dispute Resolution is the Future of Litigation in Pakistan',
    excerpt:
      'Exploring mediation, arbitration, and conciliation as faster, cost-effective alternatives to traditional court proceedings — and how AR&CO leverages ADR for clients.',
    category: 'Litigation',
    author: 'Adv. Ahmed Raza',
    authorRole: 'Managing Partner',
    date: '2025-12-10',
    readTime: '9 min read',
    coverImage: '/assets/blog/adr-future.jpg',
    featured: false,
  },
  {
    id: 'blog-06',
    slug: 'intellectual-property-registration-guide',
    title: 'Trademark & IP Registration in Pakistan: A Step-by-Step Guide for Startups',
    excerpt:
      'From filing applications with the IPO to enforcement strategies — everything a startup founder needs to know about protecting intellectual property in Pakistan.',
    category: 'Facilitation',
    author: 'Adv. Bilal Qureshi',
    authorRole: 'IP Specialist',
    date: '2025-11-28',
    readTime: '6 min read',
    coverImage: '/assets/blog/ip-registration.jpg',
    featured: false,
  },
]

/** Unique categories extracted from blog posts */
export const blogCategories = Array.from(
  new Set(blogPosts.map((p) => p.category))
)
