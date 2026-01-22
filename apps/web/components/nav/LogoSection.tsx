"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import styles from "./LogoSection.module.css"

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * LogoSection Component
 *
 * Artistic logo component with decorative geometric frame and GSAP parallax scroll effects.
 * Features gold accents, floating patterns, and kinetic animations on scroll.
 *
 * @example
 * ```tsx
 * <LogoSection />
 * ```
 *
 * Performance Notes:
 * - Uses GPU-accelerated transforms (translateY, scale) for smooth 60fps animations
 * - GSAP ScrollTrigger optimized for minimal reflow
 * - Respects prefers-reduced-motion for accessibility
 *
 * Accessibility:
 * - Maintains keyboard navigation and focus indicators
 * - Logo remains clickable with proper ARIA labels
 * - Animations disabled when user prefers reduced motion
 */
export default function LogoSection() {
  const logoRef = useRef<HTMLAnchorElement>(null)
  const frameRef = useRef<SVGSVGElement>(null)
  const iconRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const logo = logoRef.current
    const frame = frameRef.current
    const icon = iconRef.current

    if (!logo || !frame || !icon) return

    // Parallax effect on scroll - logo moves slightly upward
    const parallaxTl = gsap.timeline({
      scrollTrigger: {
        trigger: logo,
        start: 'top top',
        end: '+=500',
        scrub: 1.5,
        invalidateOnRefresh: true,
      },
    })

    parallaxTl.to(icon, {
      y: -8,
      scale: 0.96,
      ease: 'none',
    })

    // Geometric frame rotation on scroll
    gsap.to(frame, {
      rotation: 360,
      scrollTrigger: {
        trigger: logo,
        start: 'top top',
        end: '+=2000',
        scrub: 2,
        invalidateOnRefresh: true,
      },
      ease: 'none',
    })

    // Cleanup GSAP instances
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      parallaxTl.kill()
    }
  }, [])

  return (
    <Link
      href="/"
      ref={logoRef}
      className={styles.logoContainer}
      aria-label="AR&CO Law Firm - Return to homepage"
    >
      {/* Geometric Decorative Frame */}
      <div className={styles.frameWrapper}>
        <svg
          ref={frameRef}
          className={styles.geometricFrame}
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Octagon frame with gold accent */}
          <path
            d="M20 2 L40 2 L58 20 L58 40 L40 58 L20 58 L2 40 L2 20 Z"
            className={styles.framePath}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Inner decorative lines */}
          <path
            d="M20 8 L40 8 L52 20 L52 40 L40 52 L20 52 L8 40 L8 20 Z"
            className={styles.frameInner}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Corner accents */}
          <circle cx="20" cy="2" r="1.5" className={styles.cornerAccent} />
          <circle cx="40" cy="2" r="1.5" className={styles.cornerAccent} />
          <circle cx="58" cy="20" r="1.5" className={styles.cornerAccent} />
          <circle cx="58" cy="40" r="1.5" className={styles.cornerAccent} />
        </svg>
      </div>

      {/* Logo Icon with layers effect */}
      <div className={styles.iconWrapper}>
        <svg
          ref={iconRef}
          className={styles.logoIcon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Layer 1 - Top */}
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            className={styles.iconLayer1}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Layer 2 - Middle */}
          <path
            d="M2 12L12 17L22 12"
            className={styles.iconLayer2}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Layer 3 - Bottom */}
          <path
            d="M2 17L12 22L22 17"
            className={styles.iconLayer3}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Floating accent dot */}
        <span className={styles.floatingDot} aria-hidden="true" />
      </div>

      {/* Text with kinetic split effect */}
      <span className={styles.logoText}>
        <span className={styles.textPrimary}>AR</span>
        <span className={styles.textSeparator}>&</span>
        <span className={styles.textSecondary}>CO</span>
      </span>

      {/* Subtitle */}
      <span className={styles.logoSubtitle}>Law Associates</span>
    </Link>
  )
}
