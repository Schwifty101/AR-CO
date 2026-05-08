'use client'

/**
 * ClientLogosCarousel
 *
 * Two-row logo strip that auto-scrolls in opposite directions using CSS animation.
 * No JS scroll tracking — rows run as continuous CSS marquees, which are
 * GPU-composited and conflict-free with Lenis smooth scroll.
 *
 * Desktop/Tablet: 200px logos, 35s/38s animation duration.
 * Mobile (<768px): 110px logos, 25s animation duration (overridden in CSS).
 *
 * @example
 * ```tsx
 * import ClientLogosCarousel from '@/components/home/ClientLogosCarousel'
 * <ClientLogosCarousel />
 * ```
 */

import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './ClientLogosCarousel.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogoEntry {
  id: string
  name: string
  imageSrc: string
}

// ─── Logo data ────────────────────────────────────────────────────────────────

const LOGOS_ROW_1: LogoEntry[] = [
  { id: 'l1', name: 'ARY Communications', imageSrc: '/client-logos/ary-logo.png' },
  { id: 'l2', name: 'Askari Bank', imageSrc: '/client-logos/askariBank-logo.png' },
  { id: 'l3', name: 'Audi', imageSrc: '/client-logos/audi-logo.png' },
  { id: 'l4', name: 'DHA Islamabad', imageSrc: '/client-logos/DHA-Logo.png' },
  { id: 'l5', name: 'MCB Bank', imageSrc: '/client-logos/mcb-logo.png' },
  { id: 'l6', name: 'NITB', imageSrc: '/client-logos/nitb-logo.png' },
  { id: 'l7', name: 'PTCL', imageSrc: '/client-logos/ptcl-logo.png' },
]

const LOGOS_ROW_2: LogoEntry[] = [
  { id: 'l8', name: 'QAU', imageSrc: '/client-logos/QAU-Logo.png' },
  { id: 'l9', name: 'Ten Sports', imageSrc: '/client-logos/TenSports-logo.png' },
  { id: 'l10', name: 'Tullow Oil', imageSrc: '/client-logos/Tullow-logo.png' },
  { id: 'l11', name: 'Ufone', imageSrc: '/client-logos/ufone-logo.png' },
  { id: 'l12', name: 'Westminster', imageSrc: '/client-logos/westminister-logo.png' },
  { id: 'l13', name: 'BOL Network', imageSrc: '/client-logos/bol-logo.png' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function LogoCard({ logo }: { logo: LogoEntry }) {
  return (
    <div className={styles.logoCard} aria-label={logo.name}>
      <div className={styles.logoImageWrapper}>
        <Image
          src={logo.imageSrc}
          alt={logo.name}
          fill
          style={{ objectFit: 'contain' }}
          className={styles.logoImage}
          sizes='(max-width: 767px) 110px, 200px'
        />
      </div>
    </div>
  )
}

/** 4 repetitions ensure the track extends well beyond both viewport edges
 *  so the CSS loop seam is never visible. */
function LogoRow({ logos, reverse }: { logos: LogoEntry[]; reverse: boolean }) {
  const repeated = [...logos, ...logos, ...logos, ...logos]
  return (
    <div
      className={`${styles.rowTrack} ${reverse ? styles.reverseRow : ''}`}
      aria-hidden='true'
    >
      {repeated.map((logo, idx) => (
        <LogoCard key={`${logo.id}-${idx}`} logo={logo} />
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ClientLogosCarousel() {
  return (
    <section className={styles.section} aria-label='Trusted clients'>
      <div className={styles.wrapper}>

        <div className={styles.atmosphere} aria-hidden='true' />

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.eyebrow}>Our Clients</span>
          <h2 className={styles.title}>
            Trusted by <em>Leading</em> Organizations
          </h2>
          <div className={styles.titleRule} aria-hidden='true' />
        </motion.div>

        <div className={styles.carouselContainer}>
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoRow logos={LOGOS_ROW_1} reverse={false} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoRow logos={LOGOS_ROW_2} reverse={true} />
          </motion.div>
        </div>

        <div className={styles.vignette} aria-hidden='true' />
      </div>
    </section>
  )
}
