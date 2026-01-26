"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import LogoSection from "./LogoSection"
import FullScreenDropdown from "./FullScreenDropdown"
import SidePanel from "./SidePanel"
import MobileFullScreenMenu from "./MobileFullScreenMenu"
import styles from "./Header.module.css"

/**
 * Header Component - Multi-State Navigation System
 *
 * Premium navigation header featuring three distinct behaviors:
 * 1. Non-scrolled (desktop): Full navbar with click-triggered full-screen dropdowns
 * 2. Scrolled (desktop): Floating CTA + hamburger, click opens 75% side panel
 * 3. Mobile: Full-screen black overlay menu
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [dropdownSection, setDropdownSection] = useState<'practice-areas' | 'facilitation' | null>(null)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Scroll detection for header state change - optimized for immediate response
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const handleScroll = () => {
      const scrolled = window.scrollY > 50 // Reduced threshold for earlier trigger
      
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // Immediate update for performance-critical transitions
      if (!scrolled && isScrolled) {
        // Scrolling back to top - immediate response
        setIsScrolled(false)
      } else if (scrolled && !isScrolled) {
        // Scrolling down - slight delay to prevent flickering
        timeoutId = setTimeout(() => {
          setIsScrolled(true)
        }, 50)
      }
    }

    // Initial check
    setIsScrolled(window.scrollY > 50)
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isScrolled])

  // Track viewport size for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close all menus on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileMenuOpen])

  // Close dropdown when scrolled
  useEffect(() => {
    if (isScrolled && dropdownSection) {
      setDropdownSection(null)
    }
  }, [isScrolled, dropdownSection])

  const handleNavClick = (section: 'practice-areas' | 'facilitation') => {
    if (dropdownSection === section) {
      setDropdownSection(null)
    } else {
      setDropdownSection(section)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDropdownSection(null)
      setSidePanelOpen(false)
    }
  }

  // Determine if any menu is open (for header styling)
  const isMenuOpen = dropdownSection !== null || sidePanelOpen || mobileMenuOpen

  return (
    <>
      {/* Main Header */}
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${isMenuOpen ? styles.menuOpen : ''}`}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.gridContainer}>
          {/* LEFT SECTION - Logo */}
          <div className={styles.logoSection}>
            <LogoSection />
          </div>

          {/* CENTER SECTION - Navigation Links (Desktop, Non-scrolled) */}
          <AnimatePresence>
            {!isScrolled && !isMobile && (
              <motion.nav
                className={styles.navSection}
                aria-label="Main navigation"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.15,
                  ease: [0.22, 1, 0.36, 1] // Smooth easing for natural feel
                }}
              >
                <Link href="/" className={styles.navLink}>
                  HOME
                </Link>
                <Link href="/team" className={styles.navLink}>
                  OUR TEAM
                </Link>

                {/* Practice Areas - Click Trigger */}
                <button
                  className={`${styles.navButton} ${dropdownSection === 'practice-areas' ? styles.navButtonActive : ''}`}
                  onClick={() => handleNavClick('practice-areas')}
                  aria-expanded={dropdownSection === 'practice-areas'}
                  aria-haspopup="true"
                >
                  PRACTICE AREAS
                  <svg
                    className={`${styles.chevron} ${dropdownSection === 'practice-areas' ? styles.chevronOpen : ''}`}
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

                {/* Facilitation Centre - Click Trigger */}
                <button
                  className={`${styles.navButton} ${dropdownSection === 'facilitation' ? styles.navButtonActive : ''}`}
                  onClick={() => handleNavClick('facilitation')}
                  aria-expanded={dropdownSection === 'facilitation'}
                  aria-haspopup="true"
                >
                  FACILITATION CENTRE
                  <svg
                    className={`${styles.chevron} ${dropdownSection === 'facilitation' ? styles.chevronOpen : ''}`}
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

                <Link href="/contact" className={styles.navLink}>
                  CONTACT US
                </Link>
              </motion.nav>
            )}
          </AnimatePresence>

          {/* RIGHT SECTION - Actions */}
          <div className={styles.actionsSection}>
            {/* Desktop CTA Button (always visible on desktop) */}
            <Link href="/contact?consultation=true" className={styles.btnPrimary}>
              BOOK CONSULTATION
            </Link>

            {/* Hamburger Menu Button (scrolled state on desktop, always on mobile) */}
            <AnimatePresence>
              {(isScrolled || isMobile) && (
                <motion.button
                  className={styles.menuToggle}
                  onClick={() => {
                    if (isMobile) {
                      setMobileMenuOpen(!mobileMenuOpen)
                    } else {
                      setSidePanelOpen(!sidePanelOpen)
                    }
                  }}
                  aria-label={sidePanelOpen || mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={sidePanelOpen || mobileMenuOpen}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.1, 
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <motion.span
                    className={styles.menuLine}
                    animate={{
                      rotate: sidePanelOpen || mobileMenuOpen ? 45 : 0,
                      y: sidePanelOpen || mobileMenuOpen ? 7 : 0,
                    }}
                    transition={{ 
                      duration: 0.2,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  />
                  <motion.span
                    className={styles.menuLine}
                    animate={{
                      opacity: sidePanelOpen || mobileMenuOpen ? 0 : 1,
                    }}
                    transition={{ 
                      duration: 0.15,
                      ease: "easeOut"
                    }}
                  />
                  <motion.span
                    className={styles.menuLine}
                    animate={{
                      rotate: sidePanelOpen || mobileMenuOpen ? -45 : 0,
                      y: sidePanelOpen || mobileMenuOpen ? -7 : 0,
                    }}
                    transition={{ 
                      duration: 0.2,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Full Screen Dropdown (Desktop, Non-scrolled) */}
      <FullScreenDropdown
        isOpen={dropdownSection !== null && !isScrolled && !isMobile}
        onClose={() => setDropdownSection(null)}
        activeSection={dropdownSection}
      />

      {/* Side Panel (Desktop, Scrolled) */}
      <SidePanel
        isOpen={sidePanelOpen && !isMobile}
        onClose={() => setSidePanelOpen(false)}
      />

      {/* Mobile Full Screen Menu */}
      <MobileFullScreenMenu
        isOpen={mobileMenuOpen && isMobile}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  )
}
