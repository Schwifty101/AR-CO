'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ITeamPhilosophyProps } from './types/teamInterfaces'

/**
 * TeamPhilosophy Component
 * Mission statement with 3-image supporting grid
 *
 * Features:
 * - 2-column layout (text left, images right on desktop)
 * - Exactly 3 images in offset grid pattern
 * - Staggered image reveal animations
 * - Responsive stack on mobile
 * - Validates image count (must be 3)
 *
 * @example
 * ```tsx
 * <TeamPhilosophy
 *   title="Our Philosophy"
 *   statement="We deliver exceptional legal services through deep expertise..."
 *   images={[
 *     { src: "/team/image1.webp", alt: "Team collaboration" },
 *     { src: "/team/image2.webp", alt: "Legal expertise" },
 *     { src: "/team/image3.webp", alt: "Client success" }
 *   ]}
 * />
 * ```
 *
 * @throws Error if images.length !== 3
 */
export default function TeamPhilosophy({
  title,
  statement,
  images,
  className = ''
}: ITeamPhilosophyProps) {
  // Validate exactly 3 images
  if (images.length !== 3) {
    throw new Error(
      `TeamPhilosophy requires exactly 3 images for grid layout (received ${images.length})`
    )
  }

  return (
    <section
      className={`py-16 md:py-32 px-4 md:px-8 lg:px-16 ${className}`}
      style={{ background: 'var(--heritage-cream)' }}
    >
      <div className="grid lg:grid-cols-2 gap-12 md:gap-16 max-w-[1600px] mx-auto">
        {/* Left: Statement */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <p
            className="text-xs md:text-sm uppercase tracking-widest mb-8"
            style={{ color: 'var(--heritage-gold)', fontWeight: 700 }}
          >
            01 — Philosophy
          </p>

          <h2
            className="leading-tight mb-8"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              color: 'var(--heritage-walnut)'
            }}
          >
            {title}
          </h2>

          <p
            className="leading-relaxed max-w-2xl"
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.125rem)',
              lineHeight: 1.7,
              color: 'var(--heritage-charcoal)'
            }}
          >
            {statement}
          </p>
        </motion.div>

        {/* Right: Image Grid (2 columns, offset pattern) */}
        <div className="grid grid-cols-2 gap-4 auto-rows-fr">
          {/* Image 1 - Top Left */}
          <motion.div
            className="aspect-[3/4] overflow-hidden rounded-sm"
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 1,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <Image
              src={images[0].src}
              alt={images[0].alt}
              width={400}
              height={533}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </motion.div>

          {/* Image 2 - Top Right (offset down) */}
          <motion.div
            className="aspect-[3/4] overflow-hidden rounded-sm mt-0 md:mt-12"
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 1,
              delay: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <Image
              src={images[1].src}
              alt={images[1].alt}
              width={400}
              height={533}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </motion.div>

          {/* Image 3 - Bottom Left */}
          <motion.div
            className="aspect-[3/4] overflow-hidden rounded-sm col-span-2 md:col-span-1"
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 1,
              delay: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <Image
              src={images[2].src}
              alt={images[2].alt}
              width={400}
              height={533}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
