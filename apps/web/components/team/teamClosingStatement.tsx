'use client'

import { motion } from 'framer-motion'
import type { ITeamClosingStatementProps } from './types/teamInterfaces'

/**
 * TeamClosingStatement Component
 * Bold typography closing section for team page
 *
 * Features:
 * - Large display typography
 * - Optional supporting subtext
 * - Center-aligned layout
 * - Scale + fade entrance animation
 * - 60vh minimum height for impact
 *
 * @example
 * ```tsx
 * <TeamClosingStatement
 *   statement="FOCUSED ON QUALITY DRIVEN BY EXCELLENCE"
 *   subtext="Building lasting relationships through legal excellence"
 * />
 * ```
 */
export default function TeamClosingStatement({
  statement,
  subtext,
  className = ''
}: ITeamClosingStatementProps) {
  return (
    <section
      className={`
        min-h-[60vh]
        flex
        items-center
        justify-center
        px-4
        md:px-8
        py-16
        md:py-24
        ${className}
      `}
      style={{ background: 'var(--heritage-cream)' }}
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Main statement */}
        <motion.h2
          className="leading-tight"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--heritage-walnut)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Split by newlines or render as-is */}
          {statement.split('\n').map((line, index) => (
            <span key={index}>
              {line}
              {index < statement.split('\n').length - 1 && <br />}
            </span>
          ))}
        </motion.h2>

        {/* Subtext */}
        {subtext && (
          <motion.p
            className="mt-8"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'var(--heritage-charcoal)',
              opacity: 0.8
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {subtext}
          </motion.p>
        )}
      </div>
    </section>
  )
}
