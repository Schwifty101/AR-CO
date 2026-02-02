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
        relative
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
      {/* Optional: Very subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.05" /%3E%3C/svg%3E")'
        }}
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Simple horizontal accent lines */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div
            className="w-16 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.6))'
            }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--heritage-gold)' }}
          />
          <div
            className="w-16 h-px"
            style={{
              background:
                'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.6))'
            }}
          />
        </div>
        {/* Main statement with refined animated underline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative inline-block"
        >
          <h2
            className="leading-tight"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 6rem)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: 'var(--heritage-walnut)'
            }}
          >
            {/* Split by newlines or render as-is */}
            {statement.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < statement.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h2>

          {/* Refined animated underline - subtle and elegant */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{
              duration: 1,
              delay: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="absolute bottom-0 left-0 h-0.5"
            style={{ background: 'var(--heritage-gold)' }}
          />
        </motion.div>

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
