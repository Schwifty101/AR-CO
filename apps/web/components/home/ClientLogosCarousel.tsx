'use client'

/**
 * ClientLogosCarousel
 *
 * Two-row logo strip that slides in opposite directions as the user scrolls
 * through the 300 vh section. Uses Framer Motion `useScroll` + `useTransform`
 * on the section element so it works correctly with the Lenis smooth-scroll
 * setup (which drives scroll via GSAP ticker, not native scroll events).
 *
 * Desktop: rows translate horizontally based on scroll progress.
 * Mobile (<768 px): rows auto-marquee via CSS animation (no JS needed).
 *
 * @example
 * ```tsx
 * import ClientLogosCarousel from '@/components/home/ClientLogosCarousel'
 * <ClientLogosCarousel />
 * ```
 */

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
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
  { id: 'l2', name: 'Askari Bank',        imageSrc: '/client-logos/askariBank-logo.png' },
  { id: 'l3', name: 'Audi',               imageSrc: '/client-logos/audi-logo.png' },
  { id: 'l4', name: 'DHA Islamabad',      imageSrc: '/client-logos/DHA-Logo.png' },
  { id: 'l5', name: 'MCB Bank',           imageSrc: '/client-logos/mcb-logo.png' },
  { id: 'l6', name: 'NITB',               imageSrc: '/client-logos/nitb-logo.png' },
  { id: 'l7', name: 'PTCL',               imageSrc: '/client-logos/ptcl-logo.png' },
]

const LOGOS_ROW_2: LogoEntry[] = [
  { id: 'l8',  name: 'QAU',         imageSrc: '/client-logos/QAU-Logo.png' },
  { id: 'l9',  name: 'Ten Sports',  imageSrc: '/client-logos/TenSports-logo.png' },
  { id: 'l10', name: 'Tullow Oil',  imageSrc: '/client-logos/Tullow-logo.png' },
  { id: 'l11', name: 'Ufone',       imageSrc: '/client-logos/ufone-logo.png' },
  { id: 'l12', name: 'Westminster', imageSrc: '/client-logos/westminister-logo.png' },
  { id: 'l13', name: 'BOL Network', imageSrc: '/client-logos/bol-logo.png' },
]

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * How far (px) each row travels across the full scroll range.
 * Row 1 goes from -ROW_TRAVEL/2 → +ROW_TRAVEL/2 (left → right).
 * Row 2 goes from +ROW_TRAVEL/2 → -ROW_TRAVEL/2 (right → left).
 *
 * With offset ['start end', 'end start'], the progress range covers
 * ~400 vh (100 vh enter + 200 vh sticky + 100 vh exit). The sticky
 * phase occupies the middle 50 %, so travel during sticky ≈ 1200 / 2 = 600 px —
 * matching the original feel while also animating on enter and exit.
 */
const ROW_TRAVEL_PX = 1200

/** Mobile breakpoint — marquee animation instead of scroll-driven motion */
const MOBILE_BREAKPOINT = 768

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single logo card displaying the client image */
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
          sizes='120px'
        />
      </div>
    </div>
  )
}

/** Duplicated row of logos for a seamless looping appearance */
function LogoRow({
  logos,
  reverse,
  translateX,
  isMobile,
}: {
  logos: LogoEntry[]
  reverse: boolean
  translateX: MotionValue<number>
  isMobile: boolean
}) {
  // 4 repetitions ensure the track extends well beyond both viewport edges
  // even at the maximum ±ROW_TRAVEL_PX/2 translation.
  const repeated = [...logos, ...logos, ...logos, ...logos]

  return (
    <motion.div
      className={`${styles.rowTrack} ${reverse ? styles.reverseRow : ''}`}
      // On desktop: pre-shift the track left by half the travel range so a
      // positive x translation never reveals empty space on the left.
      style={isMobile ? { x: translateX } : { x: translateX, marginLeft: -(ROW_TRAVEL_PX / 2) }}
      aria-hidden='true'
    >
      {repeated.map((logo, idx) => (
        <LogoCard key={`${logo.id}-${idx}`} logo={logo} />
      ))}
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ClientLogosCarousel() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // ── Mobile detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Scroll-driven translations ────────────────────────────────────────────
  // offset 'start end' fires (progress=0) when the section top enters the
  // viewport bottom — i.e. the section first becomes visible.
  // offset 'end start' fires (progress=1) when the section bottom exits the
  // viewport top — i.e. the section fully disappears.
  // This covers ~400 vh total: 100 vh entering + 200 vh sticky + 100 vh exiting,
  // so logos animate on enter, through the sticky phase, and on exit.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Row 1 slides left → right; Row 2 slides right → left
  const row1X = useTransform(
    scrollYProgress,
    [0, 1],
    [-ROW_TRAVEL_PX / 2, ROW_TRAVEL_PX / 2],
  )
  const row2X = useTransform(
    scrollYProgress,
    [0, 1],
    [ROW_TRAVEL_PX / 2, -ROW_TRAVEL_PX / 2],
  )

  // Scroll progress bar width (0–100%)
  const progressBarWidth = useTransform(scrollYProgress, (v) => `${v * 100}%`)

  return (
    <section ref={sectionRef} className={styles.section} aria-label='Trusted clients'>
      <div className={styles.stickyWrapper}>

        {/* Atmospheric background glow */}
        <div className={styles.atmosphere} aria-hidden='true' />

        {/* ── Section Header ─────────────────────────────────────── */}
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

        {/* ── Logo Rows ──────────────────────────────────────────── */}
        <div className={styles.carouselContainer}>

          {/* Row 1 — enters from left, slides left→right on scroll */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoRow
              logos={LOGOS_ROW_1}
              reverse={false}
              translateX={row1X}
              isMobile={isMobile}
            />
          </motion.div>

          {/* Row 2 — enters from right, slides right→left on scroll */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoRow
              logos={LOGOS_ROW_2}
              reverse={true}
              translateX={row2X}
              isMobile={isMobile}
            />
          </motion.div>
        </div>

        {/* Edge vignette — masks row ends */}
        <div className={styles.vignette} aria-hidden='true' />

        {/* ── Scroll progress bar (desktop only) ─────────────────── */}
        {!isMobile && (
          <div className={styles.progressBar} aria-hidden='true'>
            <div className={styles.progressTrack}>
              <motion.div
                className={styles.progressFill}
                style={{ width: progressBarWidth }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
