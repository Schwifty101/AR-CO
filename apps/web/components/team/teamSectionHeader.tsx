'use client'

import { motion } from 'framer-motion'
import type { ITeamSectionHeaderProps } from './types/teamInterfaces'

/**
 * TeamSectionHeader Component
 * Reusable bold typographic section headers
 *
 * Features:
 * - Three size variants (small, medium, large)
 * - Three alignment options (left, center, right)
 * - Fade-in animation on scroll
 * - Uppercase styling for editorial feel
 *
 * @example
 * ```tsx
 * <TeamSectionHeader
 *   text="MEET THE TEAM BEHIND THE EXCELLENCE"
 *   align="center"
 *   size="large"
 * />
 * ```
 */
export default function TeamSectionHeader({
  text,
  align = 'left',
  size = 'medium',
  className = ''
}: ITeamSectionHeaderProps) {
  // Size variants using Tailwind classes
  const sizeClasses = {
    small: 'text-2xl md:text-3xl lg:text-4xl',
    medium: 'text-3xl md:text-4xl lg:text-6xl',
    large: 'text-4xl md:text-6xl lg:text-7xl xl:text-8xl'
  }

  // Alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <motion.h2
      className={`
        font-light
        uppercase
        tracking-tight
        leading-tight
        ${sizeClasses[size]}
        ${alignClasses[align]}
        ${className}
      `}
      style={{
        color: 'var(--heritage-walnut)',
        letterSpacing: '-0.03em'
      }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {text}
    </motion.h2>
  )
}
