"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import LogoSection from "./LogoSection"
import MegaMenu from "./MegaMenu"
import MobileMenu from "./MobileMenu"
import styles from "./Header.module.css"

/**
 * Header Component - Redesigned with CSS Grid Layout
 *
 * Premium navigation header featuring:
 * - CSS Grid layout: Left nav (auto) / Center logo (centered) / Right actions (auto)
 * - GSAP-powered logo with geometric frame and parallax
 * - Asymmetric 3-zone mega menu with glassmorphism
 * - Slide-in mobile drawer from right
 *
 * Layout Structure:
 * ```
 * [Nav Links] [Logo (centered)] [Action Buttons + Mobile Menu]
 * ```
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 *
 * Performance Notes:
 * - Uses CSS Grid for layout (no JavaScript layout calculations)
 * - GPU-accelerated transforms for all animations
 * - Debounced scroll listener for performance
 * - Glassmorphism with optimized backdrop-filter
 *
 * Accessibility:
 * - Keyboard navigation support (Tab, Escape, Enter)
 * - ARIA labels for all interactive elements
 * - Focus indicators with visible outlines
 * - Respects prefers-reduced-motion
 *
 * Responsive Breakpoints:
 * - Desktop: 1024px+ (full grid layout)
 * - Tablet: 768px - 1023px (simplified nav)
 * - Mobile: < 768px (slide-in drawer menu)
 */
export default function Header() {
  const [facilitationOpen, setFacilitationOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null)

  // Scroll detection for header background change
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileMenuOpen])

  const handleFacilitationEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      setCloseTimeout(null)
    }
    setFacilitationOpen(true)
  }

  const handleFacilitationLeave = () => {
    const timeout = setTimeout(() => {
      setFacilitationOpen(false)
    }, 150)
    setCloseTimeout(timeout)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && facilitationOpen) {
      setFacilitationOpen(false)
      if (closeTimeout) {
        clearTimeout(closeTimeout)
        setCloseTimeout(null)
      }
    }
  }

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${
        facilitationOpen ? styles.menuOpen : ''
      }`}
    >
      <div className={styles.gridContainer}>
        {/* LEFT SECTION - Logo */}
        <div className={styles.logoSection}>
          <LogoSection />
        </div>

        {/* CENTER SECTION - Navigation Links */}
        <nav className={styles.navSection} aria-label="Main navigation">
          <Link href="/" className={styles.navLink}>
            HOME
          </Link>
          <Link href="/team" className={styles.navLink}>
            OUR TEAM
          </Link>
          <Link href="/practice-areas" className={styles.navLink}>
            PRACTICE AREAS
          </Link>

          <div
            className={styles.navItem}
            onMouseEnter={handleFacilitationEnter}
            onMouseLeave={handleFacilitationLeave}
            onKeyDown={handleKeyDown}
          >
            <button
              className={styles.navButton}
              aria-expanded={facilitationOpen}
              aria-haspopup="true"
            >
              FACILITATION CENTRE
              <svg
                className={`${styles.chevron} ${facilitationOpen ? styles.chevronOpen : ''}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <Link href="/contact" className={styles.navLink}>
            CONTACT US
          </Link>
        </nav>

        {/* RIGHT SECTION - Action Buttons + Mobile Menu Toggle */}
        <div className={styles.actionsSection}>
          <Link href="/contact?consultation=true" className={styles.btnPrimary}>
            BOOK CONSULTATION
          </Link>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className={mobileMenuOpen ? styles.menuIconOpen : ''} />
            <span className={mobileMenuOpen ? styles.menuIconOpen : ''} />
            <span className={mobileMenuOpen ? styles.menuIconOpen : ''} />
          </button>
        </div>
      </div>

      {/* Mega Menu */}
      <MegaMenu
        isOpen={facilitationOpen}
        onClose={() => setFacilitationOpen(false)}
        onMouseEnter={handleFacilitationEnter}
        onMouseLeave={handleFacilitationLeave}
      />

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}
