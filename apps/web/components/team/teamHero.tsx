'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { initTeamParallax } from './animations/teamScrollAnimations'
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

  // Initialize parallax effect on background image
  useEffect(() => {
    if (!backgroundImage) return
    const cleanup = initTeamParallax('.heroBackgroundImage', 0.3)
    return cleanup
  }, [backgroundImage])

  return (
    <section
      data-hero-section="true"
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
            className="object-cover heroBackgroundImage"
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

      {/* Content - Updated to fix overflow */}
      <div className="relative z-20 text-center px-4 md:px-8 max-w-[1700px] mx-auto w-full">
        {/* Massive brand statement */}
        <div className="overflow-visible flex flex-wrap justify-center gap-x-[0.2em] md:gap-x-[0.25em] leading-[0.85]">
          {words.map((word, index) => (
            <motion.h1
              key={index}
              className="inline-block"
              style={{
                fontSize: 'clamp(3.5rem, 13vw, 15rem)', // Reduced from 18vw/22rem to prevent overflow
                fontWeight: 100,
                lineHeight: 0.85,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                color: backgroundImage
                  ? 'var(--heritage-cream)'
                  : 'var(--heritage-walnut)',
              }}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1.2,
                delay: index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {word}
            </motion.h1>
          ))}
        </div>

        {/* Subtitle with bracket decorations */}
        {subtitle && (
          <div className="relative inline-block mt-8">
            {/* Left bracket */}
            <motion.div
              className="absolute -left-12 top-1/2 h-0.5 bg-heritage-gold"
              style={{ width: '2rem' }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '2rem', opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: words.length * 0.2 + 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            />

            {/* Right bracket */}
            <motion.div
              className="absolute -right-12 top-1/2 h-0.5 bg-heritage-gold"
              style={{ width: '2rem' }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '2rem', opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: words.length * 0.2 + 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            />

            <motion.p
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
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: words.length * 0.2 + 0.8,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        style={{
          animation: 'chevronBounce 2s ease-in-out infinite'
        }}
      >
        <ChevronDown
          className="w-6 h-6"
          style={{
            color: backgroundImage ? 'var(--heritage-gold)' : 'var(--heritage-walnut)'
          }}
        />
      </motion.div>
    </section>
  )
}
