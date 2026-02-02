'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ITeamHeroProps } from './types/teamInterfaces'

/**
 * TeamHero Component
 * Massive typography hero section with optional background image
 *
 * Features:
 * - Billboard-sized typography (up to 22rem / 352px)
 * - Optional background image with overlay
 * - Staggered text reveal animation
 * - Responsive scaling using clamp()
 * - Full viewport height
 *
 * @example
 * ```tsx
 * <TeamHero
 *   brandStatement="THE TEAM"
 *   subtitle="Excellence Rooted in Expertise"
 *   backgroundImage="/our_team/Group_photo.webp"
 * />
 * ```
 */
export default function TeamHero({
  brandStatement,
  subtitle,
  backgroundImage,
  className = ''
}: ITeamHeroProps) {
  // Split statement into words for stagger animation
  const words = brandStatement.split(' ')

  return (
    <section
      className={`
        relative
        h-screen
        flex
        items-center
        justify-center
        overflow-hidden
        ${className}
      `}
      style={{ background: 'var(--heritage-cream)' }}
    >
      {/* Background Image (if provided) */}
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: '50% 20%' }}
          />
          {/* Overlay for text readability */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                'linear-gradient(to bottom, rgba(26, 17, 10, 0.75) 0%, rgba(26, 17, 10, 0.65) 100%)'
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-20 text-center px-4 md:px-8 max-w-[1600px] mx-auto">
        {/* Massive brand statement */}
        <div className="overflow-hidden">
          {words.map((word, index) => (
            <motion.h1
              key={index}
              className="inline-block"
              style={{
                fontSize: 'clamp(4rem, 18vw, 22rem)',
                fontWeight: 100,
                lineHeight: 0.9,
                letterSpacing: '-0.06em',
                textTransform: 'uppercase',
                color: backgroundImage
                  ? 'var(--heritage-cream)'
                  : 'var(--heritage-walnut)',
                marginRight: '0.2em'
              }}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1.2,
                delay: index * 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {word}
            </motion.h1>
          ))}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className="mt-8"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: backgroundImage
                ? 'var(--heritage-gold)'
                : 'var(--heritage-walnut)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: words.length * 0.2 + 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  )
}
