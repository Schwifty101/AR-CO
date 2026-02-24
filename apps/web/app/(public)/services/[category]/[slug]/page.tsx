'use client'

import { use, useRef } from 'react'
import { notFound } from 'next/navigation'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  isValidCategory,
  findServiceBySlug,
  type CategoryType,
} from '@/lib/categoryDataMapper'
import styles from './services.module.css'
import overviewStyles from './overview.module.css'

const MotionLink = motion.create(Link)

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

/**
 * Step 1: Overview — Editorial luxury layout matching QuoteSection aesthetic.
 * Left-aligned title, animated gold line, centered description + deliverable lines.
 */
export default function ServiceOverview({ params }: PageProps) {
  const { category, slug } = use(params)

  // Validate category
  if (!isValidCategory(category)) return notFound()

  // Find service
  const service = findServiceBySlug(category as CategoryType, slug)
  if (!service) return notFound()

  return (
    <ServiceOverviewInner
      service={service}
      category={category}
      slug={slug}
    />
  )
}

interface InnerProps {
  service: {
    title: string
    tagline: string
    whatWeDo: string[]
  }
  category: string
  slug: string
}

/**
 * Inner component holds refs + scroll hooks so they run unconditionally.
 */
function ServiceOverviewInner({ service, category, slug }: InnerProps) {
  const sectionRef = useRef<HTMLElement>(null)

  // ── Content entrance — subtle upward drift as section enters view ─────────
  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'start 35%'],
  })
  const contentY = useTransform(entranceProgress, [0, 1], [24, 0])
  const contentOpacity = useTransform(entranceProgress, [0, 1], [0.75, 1])

  // ── Scroll-driven vertical golden line — same spring as QuoteSection ──────
  const { scrollYProgress: lineProgress } = useScroll({
    target: sectionRef,
    offset: ['start 60%', 'end 40%'],
  })
  const lineScaleY = useSpring(lineProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  })

  return (
    <motion.section
      ref={sectionRef}
      className={overviewStyles.section}
      data-section="service-overview"
    >
      {/* Vertical side text — mirrors QuoteSection's ambient label */}
      <span className={overviewStyles.sideText}>Overview</span>

      {/* Container — subtle entrance parallax */}
      <motion.div
        className={overviewStyles.container}
        style={{ y: contentY, opacity: contentOpacity }}
      >

        {/* ── Service Title — left-aligned, italic, Lora ───────────────── */}
        <motion.header
          className={overviewStyles.titleBlock}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className={overviewStyles.serviceTitle}>
            <em>{service.title}</em>
          </h1>
        </motion.header>

        {/* ── Animated gold horizontal rule — scaleX 0→1 from left ─────── */}
        <motion.div
          className={overviewStyles.goldRuleAnimated}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.32, 0.72, 0, 1] }}
        />

        {/* ── What We Do block ─────────────────────────────────────────── */}
        <motion.div
          className={overviewStyles.whatWeDoBlock}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          {/* Eyebrow — centered, gold, tracked */}
          <span className={overviewStyles.eyebrow}>What We Do</span>

          {/* Tagline — centered, slightly larger body — the description */}
          <motion.p
            className={overviewStyles.tagline}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {service.tagline}
          </motion.p>
        </motion.div>

        {/* ── Deliverable Lines — QuoteSection row aesthetic ────────────── */}
        <div className={overviewStyles.deliverablesList}>

          {/* Scroll-driven vertical golden line — identical to QuoteSection */}
          <motion.div
            className={overviewStyles.goldenLine}
            style={{ scaleY: lineScaleY }}
          />

          {/* Top border of the list */}
          <div className={overviewStyles.listTopRule} />

          {service.whatWeDo.map((item, idx) => (
            <motion.div
              key={idx}
              className={overviewStyles.deliverableRow}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.65,
                delay: idx * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Roman numeral index — matches QuoteSection rowNumber */}
              <span className={overviewStyles.rowNumber}>
                {toRoman(idx + 1)}
              </span>

              {/* Deliverable text — large, italic, centered */}
              <p className={overviewStyles.deliverableText}>{item}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom CTA area ───────────────────────────────────────────── */}
        <motion.div
          className={overviewStyles.bottomArea}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className={overviewStyles.bottomRule} />

          <MotionLink
            href={`/services/${category}/${slug}/process`}
            className={styles.buttonPrimary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>View Process</span>
            <ArrowRight style={{ width: '14px', height: '14px' }} />
          </MotionLink>

          <p className={overviewStyles.firmStamp}>AR&amp;CO — Trusted Legal Partners</p>
        </motion.div>

      </motion.div>
    </motion.section>
  )
}

/** Convert integer 1–20 to Roman numeral string */
function toRoman(n: number): string {
  const numerals: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let result = ''
  for (const [val, sym] of numerals) {
    while (n >= val) { result += sym; n -= val }
  }
  return result
}
