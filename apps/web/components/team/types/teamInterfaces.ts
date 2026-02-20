/**
 * TypeScript interfaces and utilities for team page components
 * Supports OH Architecture-inspired editorial layout
 */


/**
 * Extended team member data structure for redesigned team page
 * Maintains backward compatibility with existing TeamMember interface
 *
 * @example
 * ```typescript
 * const member: ITeamMemberExtended = {
 *   id: 1,
 *   name: "Barrister Mohammad Shoaib Razzaq",
 *   role: "Principal Counsel & Managing Partner",
 *   bio: "Leading expert in intellectual property law...",
 *   image: "/our_team/Shoaib_Razaq.webp",
 *   expertise: ["IP Law", "Patent Law"],
 *   isPrimary: true,
 *   yearsOfExperience: 25,
 *   education: ["University of Leeds"],
 *   barAdmissions: ["Supreme Court of Pakistan"]
 * }
 * ```
 *
 * @note Only one team member should have isPrimary: true
 * @note yearsOfExperience is optional for privacy
 */
export interface ITeamMemberExtended {
  id: number
  name: string
  role: string
  bio: string
  image: string
  expertise?: string[]
  isPrimary?: boolean
  yearsOfExperience?: number
  education?: string[]
  barAdmissions?: string[]
}

/**
 * Props for TeamHero component
 * Displays large bold typography hero section
 *
 * @example
 * ```typescript
 * <TeamHero
 *   brandStatement="AR&CO LAW FIRM"
 *   subtitle="Excellence in Legal Representation"
 *   backgroundImage="/our_team/Group_photo.webp"
 * />
 * ```
 */
export interface ITeamHeroProps {
  brandStatement: string
  subtitle?: string
  backgroundImage?: string
  className?: string
  textPosition?: 'center' | 'bottom'
  textOpacity?: number
}

/**
 * Props for TeamPhilosophy component
 * Mission statement with supporting imagery (3 images in a row)
 *
 * @example
 * ```typescript
 * <TeamPhilosophy
 *   title="Our Philosophy"
 *   statement="We believe in delivering exceptional legal services..."
 *   images={[
 *     { src: "/team/image1.webp", alt: "Team collaboration" },
 *     { src: "/team/image2.webp", alt: "Legal expertise" },
 *     { src: "/team/image3.webp", alt: "Client success" }
 *   ]}
 * />
 * ```
 *
 * @note Exactly 3 images required for grid layout
 * @note Images should be same aspect ratio for visual consistency
 */
export interface ITeamPhilosophyProps {
  title: string
  statement: string
  images: Array<{
    src: string
    alt: string
  }>
  className?: string
}

/**
 * Props for TeamSectionHeader component
 * Reusable bold typographic section headers
 *
 * @example
 * ```typescript
 * <TeamSectionHeader
 *   text="MEET THE TEAM BEHIND THE EXCELLENCE"
 *   align="center"
 *   size="large"
 * />
 * ```
 */
export interface ITeamSectionHeaderProps {
  text: string
  align?: 'left' | 'center' | 'right'
  size?: 'small' | 'medium' | 'large'
  className?: string
}


/**
 * Props for TeamClosingStatement component
 * Bold typography closing statement
 *
 * @example
 * ```typescript
 * <TeamClosingStatement
 *   statement="FOCUSED ON QUALITY DRIVEN BY EXCELLENCE"
 *   subtext="Building lasting relationships through legal excellence"
 * />
 * ```
 */
export interface ITeamClosingStatementProps {
  statement: string
  subtext?: string
  className?: string
}
