"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import ScrollRevealText from "@/components/shared/animations/ScrollRevealText"
import { setOverlapScroll, setNormalScroll } from "@/components/SmoothScroll"
import styles from "./QuoteSection.module.css"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // GSAP parallax overlap animation
  useGSAP(() => {
    if (!sectionRef.current || !contentRef.current) return

    const section = sectionRef.current
    const content = contentRef.current

    // Create the overlap animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top bottom", // Start when section enters viewport from bottom
        end: "top top", // End when section reaches top
        scrub: 1, // Smooth scrubbing
        // markers: true, // Enable for debugging

        // Use overlap scroll preset for smoother transition
        onEnter: () => setOverlapScroll(),
        onLeave: () => setNormalScroll(),
        onEnterBack: () => setOverlapScroll(),
        onLeaveBack: () => setNormalScroll(),
      }
    })

    // Animate section sliding up
    tl.fromTo(
      section,
      {
        y: "50vh", // Start slightly below for parallax effect
      },
      {
        y: 0, // Slide to normal position
        ease: "none", // Linear easing for scrub
        duration: 1,
      }
    )

    // Subtle scale and blur on content for depth
    tl.fromTo(
      content,
      {
        scale: 0.95,
        filter: "blur(4px)",
      },
      {
        scale: 1,
        filter: "blur(0px)",
        ease: "none",
        duration: 1,
      },
      0 // Start at same time as section animation
    )

    // Second ScrollTrigger: Keep scroll slow while IN the section content
    // This prevents users from scrolling too fast and missing the section
    ScrollTrigger.create({
      trigger: section,
      start: "top top",      // When section reaches top
      end: "bottom 80%",     // Until bottom of section is near viewport bottom
      onEnter: () => setNormalScroll(),      // Slow scroll when in section
      onLeave: () => setNormalScroll(),      // Reset when leaving (will be overridden by Practice Areas if needed)
      onEnterBack: () => setNormalScroll(),  // Slow scroll when scrolling back in
      onLeaveBack: () => setOverlapScroll(), // Set overlap for reverse transition
    })

  }, [])

  return (
    <motion.section
      ref={sectionRef}
      className={styles.quoteSection}
      data-section="quote"
      id="quote-section"
      viewport={{ once: false, amount: 0.3 }}
    >
      {/* Abstract Visual Elements */}
      <div className={styles.abstractElements}>
        {/* Flowing curved line - top right */}
        <svg className={styles.flowingLine} viewBox="0 0 400 200" preserveAspectRatio="none">
          <path
            d="M0,100 Q100,20 200,80 T400,60"
            fill="none"
            stroke="var(--wood-oak, #8B6F47)"
            strokeWidth="1"
            opacity="0.35"
          />
          <path
            d="M0,120 Q150,40 250,100 T400,80"
            fill="none"
            stroke="var(--wood-espresso, #3D2817)"
            strokeWidth="0.5"
            opacity="0.2"
          />
        </svg>

        {/* Geometric circle - subtle accent */}
        <div className={styles.geometricCircle} />

        {/* Small decorative dots cluster */}
        <div className={styles.dotsCluster}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>

        {/* Minimal corner accent */}
        <div className={styles.cornerAccent}>
          <div className={styles.cornerLine} />
          <div className={styles.cornerLineVertical} />
        </div>

        {/* Abstract floating shape */}
        <div className={styles.floatingShape} />

        {/* Subtle grid pattern overlay */}
        <div className={styles.gridPattern} />
      </div>

      {/* Quote mark decoration */}
      <div className={styles.quoteMarkDecor}>
        <span className={styles.quoteMark}>&ldquo;</span>
      </div>

      <div className={styles.container}>
        <div ref={contentRef} className={styles.quoteContent}>
          <ScrollRevealText
            as="h1"
            className={`${styles.quoteLine} ${styles.medium}`}
            delay={0}
          >
            Where <span className={styles.italic}>expertise</span> meets
          </ScrollRevealText>

          <ScrollRevealText
            as="h1"
            className={`${styles.quoteLine} ${styles.bold}`}
            delay={150}
          >
            dedication,
          </ScrollRevealText>

          <ScrollRevealText
            as="h1"
            className={`${styles.quoteLine} ${styles.medium}`}
            delay={300}
          >
            <span className={styles.bold}> every case</span>
          </ScrollRevealText>

          <ScrollRevealText
            as="h1"
            className={`${styles.quoteLine} ${styles.italic}`}
            delay={450}
          >
            becomes a story
          </ScrollRevealText>

          <ScrollRevealText
            as="h1"
            className={`${styles.quoteLine} ${styles.medium}`}
            delay={600}
          >
            of <span className={styles.bold}>justice</span> <span className={styles.italic}>delivered.</span>
          </ScrollRevealText>

          {/* Signature accent line */}
          <div className={styles.signatureAccent}>
            <span className={styles.accentLine} />
            <span className={styles.accentText}>AR&CO</span>
          </div>
        </div>
      </div>

      {/* Closing quote mark */}
      <div className={styles.quoteMarkDecorEnd}>
        <span className={styles.quoteMark}>&rdquo;</span>
      </div>
    </motion.section>
  )
}
