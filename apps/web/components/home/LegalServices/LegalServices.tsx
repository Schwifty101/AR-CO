"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { useFacilitationOverlay } from "@/components/facilitation"
import TextReveal from "@/components/shared/animations/TextReveal"
import styles from "./LegalServices.module.css"

/**
 * Service verticals displayed as full-width editorial rows.
 * Each row links to its dedicated page for crawlability and internal link equity.
 */
const SERVICES = [
  {
    id: "litigation",
    number: "I",
    title: "Litigation",
    headline: "We provide strong advocacy with trusted legal representation.",
    cta: "Explore litigation services",
    href: "/practice-areas/alternative-dispute-resolution",
  },
  {
    id: "complaint-section",
    number: "II",
    title: "Complaint Section",
    headline: "Tackle your issues through us regarding regulators and public institutions — CDA, HEC, NADRA & more.",
    cta: "File your complaint",
    href: "/complaint-section",
  },
  {
    id: "facilitation",
    number: "III",
    title: "Facilitation Centre",
    headline: "We simplify legal processes through effective facilitation regarding licensing, registration & certification.",
    cta: "Explore facilitation services",
    href: "/services/facilitation/ip-services",
  },
  {
    id: "women-desk",
    number: "IV",
    title: "Women's Desk",
    headline: "We offer dedicated legal protection and support to empower women through law.",
    cta: "Access the women's desk",
    href: "/services/women-desk/harassment-cases",
  },
  {
    id: "overseas",
    number: "V",
    title: "Overseas Desk",
    headline: "We provide reliable legal solutions beyond borders for overseas Pakistanis.",
    cta: "Access the overseas desk",
    href: "/services/overseas/property-verification",
  },
]

export default function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { openOverlay } = useFacilitationOverlay()

  // ── Golden timeline line ─────────────────────────────────────────────────────
  // Tracks the full section scroll range. Using plain useTransform instead of
  // useSpring — Lenis already smooths scroll position, so a spring on top would
  // create oscillating wobble (double-smoothing).
  const { scrollYProgress: lineProgress } = useScroll({
    target: sectionRef,
    offset: ["start 55%", "end 45%"],
  })
  const lineScaleY = useTransform(lineProgress, [0, 1], [0, 1])

  return (
    <motion.section
      ref={sectionRef}
      className={styles.section}
      data-section="services-showcase"
      id="services-showcase"
    >
      {/* Vertical side text */}
      <span className={styles.sideText}>Services</span>

      {/* Container — no scroll-driven y/opacity here; per-row whileInView
           handles entrance. Moving the entire container on every frame caused
           visible jitter with Lenis smooth scroll. */}
      <div className={styles.container}>
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

              <Link href={service.href} className={styles.rowLink}>
                {service.cta} →
              </Link>
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
      </div>
    </motion.section>
  )
}
