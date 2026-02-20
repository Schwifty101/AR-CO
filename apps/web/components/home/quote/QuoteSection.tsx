"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { useFacilitationOverlay } from "@/components/facilitation"
import TextReveal from "@/components/shared/animations/TextReveal"
import styles from "./QuoteSection.module.css"

/**
 * Service verticals displayed as full-width editorial rows.
 */
const SERVICES = [
  {
    id: "litigation",
    number: "I",
    title: "Litigation",
    headline: "We provide strong advocacy with trusted legal representation.",
    cta: "Explore our litigation services",
  },
  {
    id: "complaint-section",
    number: "II",
    title: "Complaint Section",
    headline: "Tackle your issues through us regarding regulators and public institutions — CDA, HEC, NADRA & more.",
    cta: "File your complaint",
  },
  {
    id: "facilitation",
    number: "III",
    title: "Facilitation Centre",
    headline: "We simplify legal processes through effective facilitation regarding licensing, registration & certification.",
    cta: "Explore our facilitation services",
  },
  {
    id: "women-desk",
    number: "IV",
    title: "Women's Desk",
    headline: "We offer dedicated legal protection and support to empower women through law.",
    cta: "Access our women's desk",
  },
  {
    id: "overseas",
    number: "V",
    title: "Overseas Desk",
    headline: "We provide reliable legal solutions beyond borders for overseas Pakistanis.",
    cta: "Access our overseas desk",
  },
]

export default function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { openOverlay } = useFacilitationOverlay()

  // ── Content entrance ────────────────────────────────────────────────────────
  // Framer reads window.scrollY which Lenis updates on each frame — no conflict.
  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "start 30%"],
  })
  const contentY = useTransform(entranceProgress, [0, 1], [30, 0])
  const contentOpacity = useTransform(entranceProgress, [0, 1], [0.8, 1])

  // ── Golden timeline line ─────────────────────────────────────────────────────
  // Tracks the full section scroll range; spring adds natural deceleration.
  const { scrollYProgress: lineProgress } = useScroll({
    target: sectionRef,
    offset: ["start 55%", "end 45%"],
  })
  const lineScaleY = useSpring(lineProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  })

  return (
    <motion.section
      ref={sectionRef}
      className={styles.section}
      data-section="services-showcase"
      id="services-showcase"
    >
      {/* Vertical side text */}
      <span className={styles.sideText}>Services</span>

      {/* Container — subtle entrance driven by scroll */}
      <motion.div
        className={styles.container}
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* Eyebrow + Title */}
        <motion.header
          className={styles.header}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className={styles.eyebrow}>What We Do</span>
          <TextReveal delay={100} duration={1.1}>
            <h2 className={styles.sectionTitle}>
              Our <em>Legal</em> Services
            </h2>
          </TextReveal>
        </motion.header>

        {/* Service rows */}
        <div className={styles.servicesList}>
          {/* Scroll-driven golden timeline line — scaleY 0→1 via Framer spring */}
          <motion.div
            className={styles.goldenLine}
            style={{ scaleY: lineScaleY }}
          />

          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.id}
              className={styles.serviceRow}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className={styles.rowNumber}>{service.number}</span>

              <TextReveal delay={80} duration={1}>
                <h3 className={styles.rowTitle}>{service.title}</h3>
              </TextReveal>

              <TextReveal delay={200} duration={0.9}>
                <p className={styles.rowHeadline}>{service.headline}</p>
              </TextReveal>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className={styles.bottomArea}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={styles.bottomRule} />

          <motion.button
            onClick={openOverlay}
            className={styles.ctaButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Explore All Services</span>
            <ArrowUpRight className={styles.ctaBtnArrow} />
          </motion.button>

          <p className={styles.firmStamp}>AR&CO — Trusted Legal Partners</p>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
