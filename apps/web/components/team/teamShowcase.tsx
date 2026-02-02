'use client'

import { motion } from 'framer-motion'
import type { ITeamShowcaseProps } from './types/teamInterfaces'

/**
 * TeamShowcase Component
 * Awards, achievements, or notable projects section
 *
 * Features:
 * - Grid layout for awards/achievements
 * - Dark background for visual contrast
 * - Staggered cascade animation
 * - Optional year badges
 * - Optional icons for visual hierarchy
 * - Responsive grid (1 col mobile → 3 cols desktop)
 *
 * @example
 * ```tsx
 * <TeamShowcase
 *   title="Recognition & Awards"
 *   items={[
 *     {
 *       title: "Best Law Firm 2024",
 *       description: "Legal Excellence Awards",
 *       year: "2024"
 *     },
 *     {
 *       title: "500+ Cases Won",
 *       description: "Successful outcomes across all practice areas"
 *     }
 *   ]}
 *   layout="grid"
 * />
 * ```
 */
export default function TeamShowcase({
  title,
  items,
  layout = 'grid',
  className = ''
}: ITeamShowcaseProps) {
  return (
    <section
      className={`py-16 md:py-32 px-4 md:px-8 lg:px-16 ${className}`}
      style={{ background: 'var(--heritage-charcoal)' }}
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Section Label */}
        <motion.p
          className="text-xs md:text-sm uppercase tracking-widest mb-8"
          style={{ color: 'var(--heritage-gold)', fontWeight: 700 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          03 — Recognition
        </motion.p>

        {/* Title */}
        <motion.h2
          className="leading-tight mb-12 md:mb-16"
          style={{
            fontSize: 'clamp(2rem, 5vw, 4.5rem)',
            fontWeight: 300,
            letterSpacing: '-0.03em',
            color: 'var(--heritage-cream)'
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {title}
        </motion.h2>

        {/* Items Grid */}
        <div
          className={`
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-8
            md:gap-12
          `}
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {/* Icon (if provided) */}
              {item.icon && (
                <div className="mb-4" style={{ color: 'var(--heritage-gold)' }}>
                  {item.icon}
                </div>
              )}

              {/* Year Badge (if provided) */}
              {item.year && (
                <p
                  className="text-xs uppercase tracking-wide mb-3"
                  style={{ color: 'var(--heritage-gold)', fontWeight: 600 }}
                >
                  {item.year}
                </p>
              )}

              {/* Title */}
              <h3
                className="mb-3 group-hover:text-heritage-gold transition-colors duration-300"
                style={{
                  fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: 'var(--heritage-cream)',
                  lineHeight: 1.3
                }}
              >
                {item.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: 'clamp(0.875rem, 1.1vw, 1rem)',
                  lineHeight: 1.6,
                  color: 'var(--heritage-cream)',
                  opacity: 0.7
                }}
              >
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
