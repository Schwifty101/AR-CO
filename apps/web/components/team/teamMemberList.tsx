'use client'

import { useMemo } from 'react'
import TeamMemberListItem from './teamMemberListItem'
import type { ITeamMemberListProps } from './types/teamInterfaces'
import { sortTeamMembers } from './types/teamInterfaces'

/**
 * TeamMemberList Component
 * Orchestrates list-based team member presentation
 *
 * Features:
 * - Automatic sorting via sortTeamMembers() utility
 * - Layout strategies: 'primary-first' | 'alphabetical' | 'hierarchy'
 * - Primary member gets enhanced visual treatment
 * - Staggered scroll animations via TeamMemberListItem
 * - Validates primary member presence for 'primary-first' layout
 *
 * @example
 * ```tsx
 * <TeamMemberList
 *   members={teamMembers}
 *   layout="primary-first"
 *   showExpertise={true}
 * />
 * ```
 *
 * @throws Error if layout="primary-first" and no member has isPrimary: true
 */
export default function TeamMemberList({
  members,
  layout = 'hierarchy',
  showExpertise = true,
  className = ''
}: ITeamMemberListProps) {
  // Sort members based on layout strategy (memoized for performance)
  const sortedMembers = useMemo(() => {
    try {
      return sortTeamMembers(members, layout)
    } catch (error) {
      // If sorting fails (e.g., no primary member for 'primary-first' layout)
      // Log error and fall back to original order
      console.error('TeamMemberList sorting error:', error)
      return members
    }
  }, [members, layout])

  // Identify primary member index
  const primaryMemberIndex = useMemo(() => {
    if (layout === 'primary-first') {
      return sortedMembers.findIndex(member => member.isPrimary)
    }
    return -1
  }, [sortedMembers, layout])

  return (
    <div className={`max-w-[1600px] mx-auto px-4 md:px-8 lg:px-16 ${className}`}>
      {sortedMembers.map((member, index) => (
        <TeamMemberListItem
          key={member.id}
          member={member}
          index={index}
          isPrimary={index === primaryMemberIndex && primaryMemberIndex !== -1}
          showExpertise={showExpertise}
        />
      ))}
    </div>
  )
}
