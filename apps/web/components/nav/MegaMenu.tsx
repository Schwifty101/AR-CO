"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import styles from "./MegaMenu.module.css"

/**
 * MegaMenu Component - Asymmetric 3-Zone Layout
 *
 * Premium mega menu with artistic layout featuring:
 * - Left Zone: Featured services with large icons (40% width)
 * - Center Zone: Grid of service categories (35% width)
 * - Right Zone: Highlighted Women's Legal Desk (25% width)
 *
 * @param {boolean} isOpen - Controls menu visibility
 * @param {() => void} onClose - Callback when menu should close
 * @param {() => void} onMouseEnter - Callback for mouse enter (keeps menu open)
 * @param {() => void} onMouseLeave - Callback for mouse leave (triggers close)
 *
 * @example
 * ```tsx
 * <MegaMenu
 *   isOpen={facilitationOpen}
 *   onClose={() => setFacilitationOpen(false)}
 *   onMouseEnter={handleFacilitationEnter}
 *   onMouseLeave={handleFacilitationLeave}
 * />
 * ```
 *
 * Performance Notes:
 * - Uses GPU-accelerated transforms for icon animations
 * - GSAP stagger animations for smooth reveals (100ms delay per item)
 * - Glassmorphism backdrop-filter for premium visual effect
 * - Optimized for 60fps with will-change hints
 *
 * Accessibility:
 * - Proper ARIA labels and navigation roles
 * - Keyboard navigation support (Escape to close)
 * - Focus management with visible indicators
 * - Respects prefers-reduced-motion
 */

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function MegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const leftZoneRef = useRef<HTMLDivElement>(null)
  const centerZoneRef = useRef<HTMLDivElement>(null)
  const rightZoneRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [shouldRender, setShouldRender] = useState(isOpen)

  // Handle mount/unmount with animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!shouldRender) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    const leftZone = leftZoneRef.current
    const centerZone = centerZoneRef.current
    const rightZone = rightZoneRef.current

    if (!leftZone || !centerZone || !rightZone) return

    if (isOpen) {
      // Opening animation
      if (tlRef.current) tlRef.current.kill()
      
      if (prefersReducedMotion) {
        gsap.set([leftZone, centerZone.children, rightZone], { opacity: 1, x: 0, y: 0, scale: 1 })
        return
      }

      tlRef.current = gsap.timeline()

      tlRef.current
        .fromTo(
          leftZone,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }
        )
        .fromTo(
          centerZone.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo(
          rightZone,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' },
          '-=0.4'
        )
    } else {
      // Closing animation - reverse of opening
      if (tlRef.current) tlRef.current.kill()
      
      if (prefersReducedMotion) {
        setShouldRender(false)
        return
      }

      tlRef.current = gsap.timeline({
        onComplete: () => setShouldRender(false)
      })

      tlRef.current
        .to(
          rightZone,
          { opacity: 0, scale: 0.95, duration: 0.35, ease: 'power2.in' }
        )
        .to(
          centerZone.children,
          { opacity: 0, y: 20, duration: 0.3, stagger: 0.05, ease: 'power2.in' },
          '-=0.2'
        )
        .to(
          leftZone,
          { opacity: 0, x: -30, duration: 0.35, ease: 'power3.in' },
          '-=0.2'
        )
    }

    return () => {
      if (tlRef.current) {
        tlRef.current.kill()
        tlRef.current = null
      }
    }
  }, [isOpen, shouldRender])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!shouldRender) return null

  return (
    <div
      ref={menuRef}
      className={styles.megaMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={handleKeyDown}
      role="navigation"
      aria-label="Facilitation Centre services menu"
    >
      {/* Floating geometric patterns (background decoration) */}
      <div className={styles.floatingPatterns} aria-hidden="true">
        <div className={styles.pattern1} />
        <div className={styles.pattern2} />
        <div className={styles.pattern3} />
      </div>

      <div className={styles.megaMenuContainer}>
        {/* LEFT ZONE - Featured Services (40% width) */}
        <div ref={leftZoneRef} className={styles.leftZone}>
          <div className={styles.zoneHeader}>
            <h3 className={styles.zoneTitle}>Featured Services</h3>
            <p className={styles.zoneSubtitle}>Most popular facilitation services</p>
          </div>

          <div className={styles.featuredGrid}>
            {/* NTN/STRN - Large Card */}
            <Link href="/facilitation/ntn-strn" className={styles.featuredCard}>
              <div className={styles.featuredIcon}>
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    x="10"
                    y="14"
                    width="28"
                    height="24"
                    rx="2"
                    className={styles.iconShape}
                    strokeWidth="2"
                  />
                  <path d="M10 20h28" className={styles.iconAccent} strokeWidth="2" />
                  <path d="M16 10h16v4H16z" className={styles.iconShape} strokeWidth="2" />
                </svg>
              </div>
              <div className={styles.featuredContent}>
                <h4 className={styles.featuredTitle}>NTN / STRN</h4>
                <p className={styles.featuredDescription}>Tax registration services</p>
              </div>
            </Link>

            {/* SECP Registration - Large Card */}
            <Link href="/facilitation/secp-registration" className={styles.featuredCard}>
              <div className={styles.featuredIcon}>
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M24 8L28 4L32 8L38 6L40 12L46 14L44 20L48 24L44 28L46 34L40 36L38 42L32 40L28 44L24 40L20 44L16 40L10 42L8 36L2 34L4 28L0 24L4 20L2 14L8 12L10 6L16 8L20 4L24 8Z"
                    className={styles.iconShape}
                    strokeWidth="2"
                  />
                  <path d="M17 24l4 4l10-10" className={styles.iconAccent} strokeWidth="2" />
                </svg>
              </div>
              <div className={styles.featuredContent}>
                <h4 className={styles.featuredTitle}>SECP Registration</h4>
                <p className={styles.featuredDescription}>Company incorporation</p>
              </div>
            </Link>
          </div>
        </div>

        {/* CENTER ZONE - Service Categories Grid (35% width) */}
        <div ref={centerZoneRef} className={styles.centerZone}>
          {/* Business & Corporate */}
          <div className={styles.categoryColumn}>
            <h4 className={styles.categoryTitle}>Business & Corporate</h4>
            <div className={styles.categoryLinks}>
              <Link href="/facilitation/partnership-deeds" className={styles.categoryLink}>
                Partnership Deeds
              </Link>
              <Link href="/facilitation/agreements" className={styles.categoryLink}>
                Agreements
              </Link>
              <Link href="/facilitation/bank-documents" className={styles.categoryLink}>
                Bank Documents
              </Link>
            </div>
          </div>

          {/* Compliance Certificates */}
          <div className={styles.categoryColumn}>
            <h4 className={styles.categoryTitle}>Compliance Certificates</h4>
            <div className={styles.categoryLinks}>
              <Link href="/facilitation/aml-cft" className={styles.categoryLink}>
                AML / CFT Certificate
              </Link>
              <Link href="/facilitation/food-authority" className={styles.categoryLink}>
                Food Authority Licensing
              </Link>
              <Link href="/facilitation/environmental" className={styles.categoryLink}>
                Environmental Clearance
              </Link>
              <Link href="/facilitation/fire-compliance" className={styles.categoryLink}>
                Fire Compliance
              </Link>
            </div>
          </div>

          {/* Real Estate & Personal */}
          <div className={styles.categoryColumn}>
            <h4 className={styles.categoryTitle}>Real Estate</h4>
            <div className={styles.categoryLinks}>
              <Link href="/facilitation/property-transfer" className={styles.categoryLink}>
                Property Transfer
              </Link>
              <Link href="/facilitation/fard-verification" className={styles.categoryLink}>
                Fard Verification
              </Link>
              <Link href="/facilitation/rent-agreements" className={styles.categoryLink}>
                Rent Agreements
              </Link>
            </div>
          </div>

          <div className={styles.categoryColumn}>
            <h4 className={styles.categoryTitle}>Personal Certificates</h4>
            <div className={styles.categoryLinks}>
              <Link href="/facilitation/character-certificate" className={styles.categoryLink}>
                Character Certificate
              </Link>
              <Link href="/facilitation/succession-certificate" className={styles.categoryLink}>
                Succession Certificate
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT ZONE - Women's Legal Desk Highlight (25% width) */}
        <div ref={rightZoneRef} className={styles.rightZone}>
          <div className={styles.highlightCard}>
            <div className={styles.highlightBadge}>
              <span className={styles.badgeIcon}>★</span>
              <span className={styles.badgeText}>Specialized Services</span>
            </div>

            <div className={styles.highlightIcon}>
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14 18L24 8L34 18"
                  className={styles.iconShape}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M14 18L8 18L8 22L40 22L40 18L34 18"
                  className={styles.iconAccent}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="24"
                  y1="22"
                  x2="24"
                  y2="40"
                  className={styles.iconShape}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="14"
                  y1="40"
                  x2="34"
                  y2="40"
                  className={styles.iconAccent}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3 className={styles.highlightTitle}>Women's Legal Desk</h3>
            <p className={styles.highlightDescription}>
              Dedicated legal support for women's rights and family matters
            </p>

            <div className={styles.highlightLinks}>
              <Link href="/facilitation/khula-divorce" className={styles.highlightLink}>
                <span className={styles.linkIcon}>→</span>
                Khula / Divorce
              </Link>
              <Link href="/facilitation/harassment" className={styles.highlightLink}>
                <span className={styles.linkIcon}>→</span>
                Harassment Complaints
              </Link>
              <Link href="/facilitation/inheritance" className={styles.highlightLink}>
                <span className={styles.linkIcon}>→</span>
                Inheritance Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
