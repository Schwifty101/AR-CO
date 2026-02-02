/**
 * TypeScript interfaces and utilities for team page components
 * Supports OH Architecture-inspired editorial layout
 */

import type React from 'react'

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
 * Props for TeamMemberList component
 * Orchestrates list-based team member presentation
 *
 * @example
 * ```typescript
 * <TeamMemberList
 *   members={teamMembers}
 *   layout="primary-first"
 *   showExpertise={true}
 * />
 * ```
 *
 * @note If layout="primary-first", exactly one member must have isPrimary: true
 * @note Component automatically sorts members based on layout prop
 */
export interface ITeamMemberListProps {
  members: ITeamMemberExtended[]
  layout?: 'primary-first' | 'alphabetical' | 'hierarchy'
  showExpertise?: boolean
  className?: string
}

/**
 * Props for TeamMemberListItem component
 * Individual team member in list presentation
 *
 * @example
 * ```typescript
 * <TeamMemberListItem
 *   member={member}
 *   index={0}
 *   isPrimary={true}
 *   showExpertise={true}
 * />
 * ```
 */
export interface ITeamMemberListItemProps {
  member: ITeamMemberExtended
  index: number
  isPrimary?: boolean
  showExpertise?: boolean
  className?: string
}

/**
 * Props for TeamShowcase component
 * Awards, achievements, or notable projects section
 *
 * @example
 * ```typescript
 * <TeamShowcase
 *   title="Recognition & Awards"
 *   items={[
 *     {
 *       title: "Best Law Firm 2024",
 *       description: "Legal Excellence Awards",
 *       year: "2024"
 *     }
 *   ]}
 * />
 * ```
 */
export interface ITeamShowcaseProps {
  title: string
  items: Array<{
    title: string
    description: string
    year?: string
    icon?: React.ReactNode
  }>
  layout?: 'grid' | 'carousel'
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

/**
 * Animation configuration for Framer Motion components
 * Standardizes animation timings across team page
 */
export interface ITeamAnimationConfig {
  initial: object
  animate: object
  transition: {
    duration: number
    delay?: number
    ease?: number[] | string
  }
  viewport?: {
    once: boolean
    margin?: string
  }
}

/**
 * Utility: Generate staggered animation delays
 *
 * @param index - Index of the element in the list
 * @param baseDelay - Base delay multiplier in seconds (default: 0.1)
 * @returns Animation configuration object for Framer Motion
 *
 * @example
 * ```typescript
 * const config = getStaggeredAnimation(2, 0.1)
 * // Returns animation config with 0.2s delay for index 2
 *
 * <motion.div {...config}>Content</motion.div>
 * ```
 */
export function getStaggeredAnimation(
  index: number,
  baseDelay: number = 0.1
): ITeamAnimationConfig {
  return {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.6,
      delay: index * baseDelay,
      ease: [0.25, 0.46, 0.45, 0.94]
    },
    viewport: {
      once: true,
      margin: '-50px'
    }
  }
}

/**
 * Utility: Sort team members by layout strategy
 *
 * @param members - Array of team members to sort
 * @param layout - Sorting strategy ('primary-first' | 'alphabetical' | 'hierarchy')
 * @returns Sorted array of team members
 *
 * @throws Error if 'primary-first' layout is used but no primary member found
 *
 * @example
 * ```typescript
 * const sorted = sortTeamMembers(members, 'primary-first')
 * // Returns array with primary member first, then alphabetical by name
 * ```
 *
 * @note 'primary-first' requires exactly one member with isPrimary: true
 * @note 'alphabetical' sorts by name A-Z
 * @note 'hierarchy' maintains original order (assumes pre-sorted by seniority)
 */
export function sortTeamMembers(
  members: ITeamMemberExtended[],
  layout: 'primary-first' | 'alphabetical' | 'hierarchy' = 'hierarchy'
): ITeamMemberExtended[] {
  switch (layout) {
    case 'primary-first': {
      const primaryMembers = members.filter(m => m.isPrimary)
      const otherMembers = members.filter(m => !m.isPrimary)

      if (primaryMembers.length === 0) {
        throw new Error(
          'sortTeamMembers: primary-first layout requires at least one member with isPrimary: true'
        )
      }

      if (primaryMembers.length > 1) {
        console.warn(
          'sortTeamMembers: Multiple primary members found, using first one'
        )
      }

      // Sort other members alphabetically by name
      otherMembers.sort((a, b) => a.name.localeCompare(b.name))

      return [...primaryMembers, ...otherMembers]
    }

    case 'alphabetical': {
      return [...members].sort((a, b) => a.name.localeCompare(b.name))
    }

    case 'hierarchy':
    default: {
      // Maintain original order (assumes pre-sorted by seniority)
      return [...members]
    }
  }
}
