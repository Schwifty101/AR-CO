/**
 * Team member data structure and content for the Our Team page
 */

import type { ITeamMemberExtended } from '@/components/team/types/teamInterfaces'

/**
 * Legacy TeamMember interface - kept for backward compatibility
 * @deprecated Use ITeamMemberExtended for new implementations
 */
export interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image: string
  expertise?: string[]
}

/**
 * Extended team member data with additional fields for redesigned page
 * All new fields are optional to maintain compatibility
 */
export const teamMembersExtended: ITeamMemberExtended[] = [
  {
    id: 1,
    name: "Barrister Mohammad Shoaib Razzaq",
    role: "Principal Counsel & Managing Partner",
    bio: "Leading expert in intellectual property law with extensive experience in patent litigation and international arbitration. Former Director Legal at NEPRA with 25+ years of experience in complex commercial disputes and regulatory matters.",
    image: "/our_team/Shoaib_Razaq.webp",
    expertise: ["Intellectual Property", "Patent Law", "International Arbitration", "Regulatory Compliance"],
    isPrimary: true,
    yearsOfExperience: 25,
    education: ["University of Leeds"],
    barAdmissions: ["Supreme Court of Pakistan"]
  },
  {
    id: 2,
    name: "Jawad Niazi",
    role: "Senior Associate - Intellectual Property",
    bio: "Specializes in trademark registration, copyright protection, and IP portfolio management. University of Leeds graduate with expertise in cross-border IP enforcement and technology licensing agreements.",
    image: "/our_team/javad_niazi.webp",
    expertise: ["Trademark Law", "Copyright", "IP Portfolio Management"]
  },
  {
    id: 3,
    name: "Komal Zahra",
    role: "Associate - Corporate Law",
    bio: "Focuses on corporate governance, mergers and acquisitions, and commercial contracts. Experienced in advising startups and established businesses on regulatory compliance and corporate restructuring matters.",
    image: "/our_team/komal_zahra.webp",
    expertise: ["Corporate Governance", "M&A", "Commercial Contracts"]
  },
  {
    id: 4,
    name: "Rohan",
    role: "Senior Litigation Attorney",
    bio: "Handles complex civil and commercial litigation with a track record of successful outcomes in high-stakes disputes. Experienced in arbitration proceedings and alternative dispute resolution mechanisms.",
    image: "/our_team/rohan.webp",
    expertise: ["Civil Litigation", "Commercial Disputes", "Arbitration"]
  },
  {
    id: 5,
    name: "Shehbaz",
    role: "Commercial Law Specialist",
    bio: "Advises clients on contract negotiation, business transactions, and regulatory compliance. Expertise in drafting and reviewing commercial agreements across various industries including finance and technology.",
    image: "/our_team/shehbaz.webp",
    expertise: ["Contract Law", "Business Transactions", "Regulatory Advisory"]
  },
  {
    id: 6,
    name: "Shaheer",
    role: "Associate Counsel - Tax & Corporate",
    bio: "Provides strategic tax planning and compliance advice for corporations and high-net-worth individuals. Specializes in international taxation, transfer pricing, and cross-border transaction structuring.",
    image: "/our_team/Shaheer.webp",
    expertise: ["Tax Planning", "International Taxation", "Transfer Pricing"]
  },
  {
    id: 7,
    name: "Naveed",
    role: "Legal Advisor - Real Estate & Immigration",
    bio: "Handles property transactions, title verification, and immigration matters. Experienced in advising clients on real estate investments, lease agreements, and work permit applications for international clients.",
    image: "/our_team/Naveed.webp",
    expertise: ["Real Estate Law", "Immigration", "Property Transactions"]
  },
]

// Export both for compatibility
// Legacy export for old components
export const teamMembers: TeamMember[] = teamMembersExtended
