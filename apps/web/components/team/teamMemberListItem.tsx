'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ITeamMemberListItemProps } from './types/teamInterfaces'
import { getStaggeredAnimation } from './types/teamInterfaces'

/**
 * TeamMemberListItem Component
 * Individual team member in editorial list format
 *
 * Features:
 * - Two visual variants: Primary (large, prominent) vs. Standard (compact)
 * - Horizontal layout (text left, portrait right)
 * - Expertise tags displayed as badges
 * - Grayscale to color image hover effect
 * - Scroll-triggered stagger animation
 * - Responsive stack on mobile
 *
 * @example
 * ```tsx
 * <TeamMemberListItem
 *   member={member}
 *   index={0}
 *   isPrimary={true}
 *   showExpertise={true}
 * />
 * ```
 */
export default function TeamMemberListItem({
  member,
  index,
  isPrimary = false,
  showExpertise = true,
  className = ''
}: ITeamMemberListItemProps) {
  const animationConfig = getStaggeredAnimation(index, 0.1)

  return (
    <motion.article
      className={`
        border-t
        py-12
        md:py-16
        grid
        lg:grid-cols-[2fr_1fr]
        gap-8
        md:gap-16
        ${className}
      `}
      style={{ borderColor: 'rgba(78, 52, 46, 0.2)' }}
      {...animationConfig}
    >
      {/* Left: Text Content */}
      <div>
        {/* Member Name */}
        <h3
          className={`
            leading-tight
            mb-2
            transition-colors
            duration-300
            hover:text-heritage-gold
            cursor-pointer
          `}
          style={{
            fontSize: isPrimary
              ? 'clamp(2.5rem, 5vw, 4rem)'
              : 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--heritage-walnut)'
          }}
        >
          {member.name}
        </h3>

        {/* Role */}
        <p
          className="uppercase mb-6"
          style={{
            fontSize: isPrimary ? 'clamp(1rem, 1.5vw, 1.25rem)' : '1rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: 'var(--heritage-charcoal)',
            opacity: 0.7
          }}
        >
          {member.role}
        </p>

        {/* Bio */}
        <p
          className="mb-6 max-w-2xl"
          style={{
            fontSize: isPrimary ? 'clamp(1.125rem, 1.3vw, 1.25rem)' : '1rem',
            lineHeight: 1.7,
            color: 'var(--heritage-charcoal)'
          }}
        >
          {member.bio}
        </p>

        {/* Expertise Tags */}
        {showExpertise && member.expertise && member.expertise.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {member.expertise.map((tag, tagIndex) => (
              <li
                key={tagIndex}
                className="px-3 py-1 rounded-sm"
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: 'var(--heritage-walnut)',
                  fontWeight: 500
                }}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {/* Additional Info (Years of Experience, Education, Bar Admissions) */}
        {isPrimary && (
          <div className="mt-6 space-y-2">
            {member.yearsOfExperience && (
              <p
                className="text-sm"
                style={{ color: 'var(--heritage-charcoal)', opacity: 0.8 }}
              >
                <span className="font-semibold">Experience:</span>{' '}
                {member.yearsOfExperience}+ years
              </p>
            )}
            {member.education && member.education.length > 0 && (
              <p
                className="text-sm"
                style={{ color: 'var(--heritage-charcoal)', opacity: 0.8 }}
              >
                <span className="font-semibold">Education:</span>{' '}
                {member.education.join(', ')}
              </p>
            )}
            {member.barAdmissions && member.barAdmissions.length > 0 && (
              <p
                className="text-sm"
                style={{ color: 'var(--heritage-charcoal)', opacity: 0.8 }}
              >
                <span className="font-semibold">Bar Admissions:</span>{' '}
                {member.barAdmissions.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right: Portrait */}
      <div
        className={`
          overflow-hidden
          rounded-sm
          ${isPrimary ? 'aspect-[3/4]' : 'aspect-[3/4]'}
        `}
      >
        <Image
          src={member.image}
          alt={member.name}
          width={isPrimary ? 500 : 400}
          height={isPrimary ? 667 : 533}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={isPrimary}
        />
      </div>
    </motion.article>
  )
}
