"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import LogoSection from "./LogoSection"
import FullScreenDropdown from "./FullScreenDropdown"
import SidePanel from "./SidePanel"
import MobileFullScreenMenu from "./MobileFullScreenMenu"
import SlotMachineText from "../shared/animations/SlotMachineText"
import NavButton from "./components/NavButton"
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
  const [pastQuoteSection, setPastQuoteSection] = useState(false)
  const [dropdownSection, setDropdownSection] = useState<'practice-areas' | 'facilitation' | null>(null)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  // Hero section scroll detection - hide during hero, show after
  useEffect(() => {
    // Find the hero section
    const heroSection = document.querySelector('section[class*="hero"]') as HTMLElement
    if (!heroSection) return

    // Create ScrollTrigger to track hero section
    const st = ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        // Hide header when scrolling within hero section (after initial scroll)
        if (self.progress > 0.05 && self.progress < 1) {
          setIsHidden(true)
        } else {
          setIsHidden(false)
        }

        // Update scrolled state
        setIsScrolled(self.progress > 0.05)
      },
      onLeave: () => {
        // Hero section ended - show header
        setIsHidden(false)
        setIsScrolled(true)
      },
      onEnterBack: () => {
        // Scrolled back into hero - hide header
        setIsHidden(true)
      },
      onLeaveBack: () => {
        // Back at top - show header
        setIsHidden(false)
        setIsScrolled(false)
      }
    })

    return () => {
      st.kill()
    }
  }, [])

  // Track quotation section to control hamburger menu visibility
  useEffect(() => {
    // Find the quote section
    const quoteSection = document.querySelector('section[class*="quote"], section[class*="Quote"]') as HTMLElement
    if (!quoteSection) {
      // If quote section not found, default to showing hamburger after hero
      setPastQuoteSection(true)
      return
    }

    // Create ScrollTrigger to track quote section
    const st = ScrollTrigger.create({
      trigger: quoteSection,
      start: "top bottom", // When quote section enters viewport
      end: "bottom top",
      onEnter: () => setPastQuoteSection(true),
      onLeaveBack: () => setPastQuoteSection(false)
    })

    return () => {
      st.kill()
    }
  }, [])

  // Smooth GSAP animation for header show/hide
  useGSAP(() => {
    if (!headerRef.current) return

    // Animate header based on isHidden state with slower, smoother timing
    gsap.to(headerRef.current, {
      y: isHidden ? -100 : 0, // Slide up when hidden, slide down when visible
      duration: 0.9, // Slower for smoother feel
      ease: "power2.inOut", // Smooth easing curve
      overwrite: true // Cancel any existing animations
    })
  }, [isHidden])

  // Smooth GSAP animation for hamburger menu visibility
  useGSAP(() => {
    if (!menuToggleRef.current) return

    // Show hamburger only after quote section is reached (or always on mobile)
    const shouldShow = (isScrolled && pastQuoteSection) || isMobile

    // Coordinate hamburger fade with navbar animation
    gsap.to(menuToggleRef.current, {
      opacity: shouldShow ? 1 : 0,
      duration: 0.4,
      ease: "power2.out",
      delay: shouldShow ? 0.2 : 0, // Slight delay when appearing for sequential effect
      overwrite: true,
      onComplete: () => {
        // Update pointer-events after animation
        if (menuToggleRef.current) {
          menuToggleRef.current.style.pointerEvents = shouldShow ? 'auto' : 'none'
        }
      }
    })
  }, [isScrolled, pastQuoteSection, isMobile])

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
        ref={headerRef}
        className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${isHidden ? styles.hidden : ''} ${isMenuOpen ? styles.menuOpen : ''}`}
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
                  <SlotMachineText>HOME</SlotMachineText>
                </Link>
                <Link href="/team" className={styles.navLink}>
                  <SlotMachineText>OUR TEAM</SlotMachineText>
                </Link>

                {/* Practice Areas - Click Trigger */}
                <button
                  className={`${styles.navButton} ${dropdownSection === 'practice-areas' ? styles.navButtonActive : ''}`}
                  onClick={() => handleNavClick('practice-areas')}
                  aria-expanded={dropdownSection === 'practice-areas'}
                  aria-haspopup="true"
                >
                  <SlotMachineText>PRACTICE AREAS</SlotMachineText>
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
            {/* Desktop CTA Button (always visible on desktop) */}
            <NavButton href="/contact?consultation=true">
              Book Consultation
            </NavButton>

            {/* Hamburger Menu Button (scrolled state on desktop, always on mobile) */}
            <button
              ref={menuToggleRef}
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
            </button>
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
