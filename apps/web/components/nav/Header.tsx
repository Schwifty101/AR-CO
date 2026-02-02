"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import LogoSection from "./LogoSection"
import FullScreenDropdown from "./FullScreenDropdown"
import SidePanel from "./SidePanel"
import MobileFullScreenMenu from "./MobileFullScreenMenu"
import SlotMachineText from "../shared/animations/SlotMachineText"
import styles from "./Header.module.css"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

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
  const [isHidden, setIsHidden] = useState(false)
  const [quotationReached, setQuotationReached] = useState(false)
  const [onDarkSection, setOnDarkSection] = useState(false)
  const [dropdownSection, setDropdownSection] = useState<'facilitation' | null>(null)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  // Set mounted state to prevent initial animations
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Hero section scroll detection - hide during hero, show after
  useEffect(() => {
    // Find the hero section
    const heroSection = document.querySelector('section[class*="hero"]') as HTMLElement
    if (!heroSection || !headerRef.current) return

    const header = headerRef.current
    let currentlyHidden = false
    let currentScrollState = false

    // Helper to animate header visibility with GSAP
    const animateHeader = (hide: boolean) => {
      if (hide === currentlyHidden) return // Avoid redundant animations
      currentlyHidden = hide

      gsap.to(header, {
        y: hide ? '-100%' : '0%',
        opacity: hide ? 0 : 1,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
          if (!hide) {
            header.style.pointerEvents = 'auto'
          }
        },
        onComplete: () => {
          if (hide) {
            header.style.pointerEvents = 'none'
          }
          setIsHidden(hide)
        }
      })
    }

    // Create ScrollTrigger to track hero section
    const st = ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        // Only update when crossing threshold to reduce jitter
        const shouldBeScrolled = self.progress > 0.05
        if (shouldBeScrolled !== currentScrollState) {
          currentScrollState = shouldBeScrolled
          setIsScrolled(shouldBeScrolled)
        }

        // Hide header when scrolling within hero section (after initial scroll)
        const shouldHide = self.progress > 0.05 && self.progress < 1
        animateHeader(shouldHide)
      },
      onLeave: () => {
        // Hero section ended - show header
        animateHeader(false)
        setIsScrolled(true)
        currentScrollState = true
      },
      onEnterBack: () => {
        // Scrolled back into hero - hide header
        animateHeader(true)
      },
      onLeaveBack: () => {
        // Back at top - show header
        animateHeader(false)
        setIsScrolled(false)
        currentScrollState = false
      },
      // Reduce update frequency to prevent jitter
      invalidateOnRefresh: false
    })

    return () => {
      st.kill()
    }
  }, [])

  // Quotation section scroll detection - trigger CTA and hamburger visibility
  useEffect(() => {
    const quotationSection = document.getElementById('quote-section')
    if (!quotationSection || !headerRef.current) return

    const header = headerRef.current
    let currentQuotationState = false

    // Helper to animate header when quotation section is reached
    const animateSecondHeader = (show: boolean) => {
      if (show === currentQuotationState) return // Avoid redundant animations
      currentQuotationState = show

      if (show) {
        // Header reappears - animate in from top
        gsap.fromTo(header,
          { y: '-100%', opacity: 0 },
          {
            y: '0%',
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            onStart: () => {
              header.style.pointerEvents = 'auto'
            },
            onComplete: () => {
              setQuotationReached(true)
            }
          }
        )
      } else {
        // Header hides - animate out to top
        gsap.to(header, {
          y: '-100%',
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            header.style.pointerEvents = 'none'
            setQuotationReached(false)
          }
        })
      }
    }

    const st = ScrollTrigger.create({
      trigger: quotationSection,
      start: "top bottom", // When quotation enters viewport from bottom
      end: "bottom top", // When quotation leaves viewport from top
      onEnter: () => {
        // Quotation section reached - animate header in
        animateSecondHeader(true)
      },
      onLeaveBack: () => {
        // Scrolled back above quotation - animate header out
        animateSecondHeader(false)
      }
    })

    return () => {
      st.kill()
    }
  }, [])

  // Dark section detection - change header colors when over dark backgrounds
  useEffect(() => {
    const triggers: ScrollTrigger[] = []

    const setupDarkSectionTriggers = () => {
      // Kill existing triggers first
      triggers.forEach((st) => st.kill())
      triggers.length = 0

      // Find all sections with dark backgrounds
      const darkSections = document.querySelectorAll(
        '.section-dark, .section-wood, .section-wood-light, [data-theme="dark"]'
      )

      if (darkSections.length === 0) return

      darkSections.forEach((section) => {
        // Check if this section has a GSAP pin spacer (indicates it's pinned)
        const pinSpacer = section.parentElement?.classList.contains('pin-spacer')
          ? section.parentElement
          : null

        // For pinned sections, use the pin spacer's dimensions
        // Pin spacer represents the full scroll distance of the pinned element
        const trigger = pinSpacer || section

        const st = ScrollTrigger.create({
          trigger: trigger,
          start: 'top 88px', // When section top reaches header bottom
          end: 'bottom 0px', // When section bottom passes header top
          onEnter: () => setOnDarkSection(true),
          onLeave: () => setOnDarkSection(false),
          onEnterBack: () => setOnDarkSection(true),
          onLeaveBack: () => setOnDarkSection(false),
        })
        triggers.push(st)
      })
    }

    // Initial setup after GSAP pins are ready
    const initTimeout = setTimeout(setupDarkSectionTriggers, 800)

    // Re-setup when ScrollTrigger refreshes (pins may have changed)
    ScrollTrigger.addEventListener('refresh', setupDarkSectionTriggers)

    return () => {
      clearTimeout(initTimeout)
      ScrollTrigger.removeEventListener('refresh', setupDarkSectionTriggers)
      triggers.forEach((st) => st.kill())
    }
  }, [])

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

  const handleNavClick = (section: 'facilitation') => {
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
        ref={headerRef}
        className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${isHidden ? styles.hidden : ''} ${isMenuOpen ? styles.menuOpen : ''}`}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.gridContainer}>
          {/* LEFT SECTION - Logo (visible at top and when quotation reached) */}
          <AnimatePresence mode="wait">
            {((!isScrolled || quotationReached) && !isHidden) && (
              <motion.div
                key="logo-section"
                className={styles.logoSection}
                initial={isMounted ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  duration: isMounted ? 0.15 : 0,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <LogoSection />
              </motion.div>
            )}
          </AnimatePresence>

          {/* CENTER SECTION - Navigation Links (Desktop, Non-scrolled) */}
          <AnimatePresence>
            {!isScrolled && !isMobile && (
              <motion.nav
                className={styles.navSection}
                aria-label="Main navigation"
                initial={isMounted ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  duration: isMounted ? 0.15 : 0,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <Link href="/" className={styles.navLink}>
                  <SlotMachineText>HOME</SlotMachineText>
                </Link>
                <Link href="/team" className={styles.navLink}>
                  <SlotMachineText>OUR TEAM</SlotMachineText>
                </Link>

                <Link href="/practice-areas" className={styles.navLink}>
                  <SlotMachineText>PRACTICE AREAS</SlotMachineText>
                </Link>

                {/* Facilitation Centre - Click Trigger */}
                <button
                  className={`${styles.navButton} ${dropdownSection === 'facilitation' ? styles.navButtonActive : ''}`}
                  onClick={() => handleNavClick('facilitation')}
                  aria-expanded={dropdownSection === 'facilitation'}
                  aria-haspopup="true"
                >
                  <SlotMachineText>FACILITATION CENTRE</SlotMachineText>
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
                  <SlotMachineText>CONTACT US</SlotMachineText>
                </Link>
              </motion.nav>
            )}
          </AnimatePresence>

          {/* RIGHT SECTION - Actions */}
          <div className={styles.actionsSection}>
            {/* CTA Button - visible at top, hides during hero scroll, reappears at quotation section */}
            <AnimatePresence mode="wait">
              {((!isScrolled || quotationReached) && !isHidden) && (
                <motion.div
                  key="cta-button"
                  initial={isMounted ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{
                    duration: isMounted ? 0.15 : 0,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <Link
                    href="/contact?consultation=true"
                    className={`${styles.btnPrimary} ${onDarkSection ? styles.btnPrimaryLight : ''}`}
                  >
                    BOOK CONSULTATION
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hamburger Menu Button - appears when quotation reached or always on mobile */}
            <AnimatePresence mode="wait">
              {((quotationReached || isMobile) && !isHidden) && (
                <motion.button
                  key="hamburger-menu"
                  className={`${styles.menuToggle} ${!onDarkSection ? styles.menuToggleLight : ''}`}
                  onClick={() => {
                    if (isMobile) {
                      setMobileMenuOpen(!mobileMenuOpen)
                    } else {
                      setSidePanelOpen(!sidePanelOpen)
                    }
                  }}
                  aria-label={sidePanelOpen || mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={sidePanelOpen || mobileMenuOpen}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.15,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  style={{ pointerEvents: 'auto' }}
                >
                  <span
                    className={styles.menuLine}
                    style={{
                      transform: sidePanelOpen || mobileMenuOpen ? 'rotate(45deg) translateY(7px)' : 'none',
                    }}
                  />
                  <span
                    className={styles.menuLine}
                    style={{
                      opacity: sidePanelOpen || mobileMenuOpen ? 0 : 1,
                    }}
                  />
                  <span
                    className={styles.menuLine}
                    style={{
                      transform: sidePanelOpen || mobileMenuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
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
