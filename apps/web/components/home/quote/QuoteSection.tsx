"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { ArrowUpRight } from "lucide-react"
import { useFacilitationOverlay } from "@/components/facilitation"
import { setSlowScroll } from "../../SmoothScroll"
import styles from "./QuoteSection.module.css"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

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
  const contentRef = useRef<HTMLDivElement>(null)
  const { openOverlay } = useFacilitationOverlay()

  // GSAP scroll-speed control & entrance animation
  useGSAP(() => {
    if (!sectionRef.current || !contentRef.current) return

    const section = sectionRef.current
    const content = contentRef.current

    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => setSlowScroll(),
      onLeaveBack: () => setSlowScroll(),
    })

    // Pin the section when it fills the viewport, creating a scroll pause
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=200%",       // hold for 200% of viewport height worth of scroll - requires active scrolling to continue
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,    // prevents flashing
    })

    gsap.fromTo(
      content,
      { opacity: 0.8, y: 30 },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 30%",
          scrub: 0.5,
        },
      }
    )
  }, [])

  return (
    <>
      <motion.section
        ref={sectionRef}
        className={styles.section}
        data-section="services-showcase"
        id="services-showcase"
        viewport={{ once: false, amount: 0.3 }}
      >
        {/* Atmosphere */}
        <div className={styles.atmosphereGlow} />
        <div className={styles.grainOverlay} />

        {/* Vertical side text */}
        <span className={styles.sideText}>Services</span>

        <div ref={contentRef} className={styles.container}>
          {/* Eyebrow + Title */}
          <motion.header
            className={styles.header}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className={styles.eyebrow}>What We Do</span>
            <h2 className={styles.sectionTitle}>
              Our <em>Legal</em> Services
            </h2>
          </motion.header>

          {/* Service rows */}
          <div className={styles.servicesList}>
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                className={styles.serviceRow}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.7,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Roman numeral */}
                <span className={styles.rowNumber}>{service.number}</span>

                {/* Title — the dominant element */}
                <h3 className={styles.rowTitle}>{service.title}</h3>

                {/* Headline description */}
                <p className={styles.rowHeadline}>{service.headline}</p>
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
    </>
  )
}
