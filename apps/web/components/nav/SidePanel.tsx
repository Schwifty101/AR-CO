"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import SlotMachineText from "../shared/animations/SlotMachineText"
import NavButton from "./components/NavButton"
import { NAV_ITEMS, SUBMENU_DATA } from "../data/navData"
import { pauseScroll, resumeScroll } from "../SmoothScroll"
import styles from "./SidePanel.module.css"

/**
 * SidePanel Component - 75% Width Right-Side Panel
 *
 * Premium side panel for scrolled navigation state.
 * Features split layout: Left (nav links) / Right (mega menu content).
 * Mega menu content transitions on hover over nav items.
 *
 * @param {boolean} isOpen - Controls panel visibility
 * @param {() => void} onClose - Callback when panel should close
 *
 * @example
 * ```tsx
 * <SidePanel
 *   isOpen={sidePanelOpen}
 *   onClose={() => setSidePanelOpen(false)}
 * />
 * ```
 */

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
}

// Navigation items with potential sub-content - using shared data
const navItems = NAV_ITEMS

// Submenu data for items with hasSubmenu: true - using shared data
const submenuData = SUBMENU_DATA

export default function SidePanel({ isOpen, onClose }: SidePanelProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const navLinksRef = useRef<HTMLDivElement>(null)
  const megaContentRef = useRef<HTMLDivElement>(null)
  const megaZoneRef = useRef<HTMLDivElement>(null)
  const megaAnimationRef = useRef<gsap.core.Tween | null>(null)

  // Lock body scroll and pause ScrollSmoother when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      pauseScroll()
    } else {
      document.body.style.overflow = ''
      resumeScroll()
    }
    return () => {
      document.body.style.overflow = ''
      resumeScroll()
    }
  }, [isOpen])

  // Only show hover state when panel is open
  const activeHoveredItem = isOpen ? hoveredItem : null

  // GSAP stagger animation for nav links - premium, luxurious timing
  useEffect(() => {
    if (isOpen && navLinksRef.current) {
      const links = navLinksRef.current.querySelectorAll(`.${styles.navItem}`)

      gsap.fromTo(
        links,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.4,
        }
      )
    }
  }, [isOpen])

  // GSAP animation for mega menu content change - premium timing
  useEffect(() => {
    if (activeHoveredItem && megaContentRef.current) {
      // Kill any existing animation to ensure clean state
      if (megaAnimationRef.current) {
        megaAnimationRef.current.kill()
        megaAnimationRef.current = null
      }

      // Poll for DOM elements to be ready (handles AnimatePresence mode="wait")
      let attempts = 0
      const maxAttempts = 20
      const checkInterval = 20 // Check every 20ms

      const tryAnimate = () => {
        if (!megaContentRef.current || attempts >= maxAttempts) return

        const categories = megaContentRef.current.querySelectorAll(`.${styles.megaCategory}`)

        if (categories && categories.length > 0) {
          // Elements found - animate them
          gsap.set(categories, { opacity: 0, y: 20 })
          megaAnimationRef.current = gsap.to(
            categories,
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
            }
          )
        } else {
          // Elements not ready yet - try again
          attempts++
          setTimeout(tryAnimate, checkInterval)
        }
      }

      // Start checking after AnimatePresence exit duration
      const timer = setTimeout(tryAnimate, 220)

      return () => {
        clearTimeout(timer)
        // Kill animation on cleanup
        if (megaAnimationRef.current) {
          megaAnimationRef.current.kill()
          megaAnimationRef.current = null
        }
      }
    }
  }, [activeHoveredItem])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Scroll indicator detection - only for practice areas
  useEffect(() => {
    const megaZone = megaZoneRef.current
    if (!megaZone) return

    const checkScroll = () => {
      // Only show for practice areas
      if (activeHoveredItem !== 'practice-areas') {
        setShowScrollIndicator(false)
        return
      }

      const { scrollTop, scrollHeight, clientHeight } = megaZone
      const hasMoreContent = scrollHeight > clientHeight
      const isNotAtBottom = scrollTop < scrollHeight - clientHeight - 50 // 50px threshold
      setShowScrollIndicator(hasMoreContent && isNotAtBottom)
    }

    // Poll for content to be mounted before checking scroll
    let attempts = 0
    const maxAttempts = 15
    const checkInterval = 20

    const tryCheckScroll = () => {
      if (!megaContentRef.current || attempts >= maxAttempts) {
        setShowScrollIndicator(false)
        return
      }

      const categories = megaContentRef.current.querySelectorAll(`.${styles.megaCategory}`)

      if (categories && categories.length > 0) {
        // Content is mounted - check scroll
        checkScroll()
      } else {
        // Content not ready yet - try again
        attempts++
        setTimeout(tryCheckScroll, checkInterval)
      }
    }

    // Start checking after AnimatePresence exit duration
    const initialCheckTimer = setTimeout(tryCheckScroll, 220)

    megaZone.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      clearTimeout(initialCheckTimer)
      megaZone.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [activeHoveredItem])

  // Scroll down handler
  const handleScrollDown = () => {
    megaZoneRef.current?.scrollBy({
      top: 200,
      behavior: 'smooth'
    })
  }

  const currentSubmenu = activeHoveredItem ? submenuData[activeHoveredItem] : null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - 25% left side */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Side Panel - 75% right side */}
          <motion.div
            className={styles.sidePanel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'tween',
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation panel"
          >
            {/* Header with Logo and Close Button */}
            <div className={styles.panelHeader}>
              {/* Logo on the left */}
              <Link href="/" onClick={onClose} className={styles.panelLogo}>
                <Image
                  src="/assets/logos/main-logo.png"
                  alt="AR&CO Law Associates"
                  width={100}
                  height={40}
                  className={styles.logoImage}
                />
              </Link>

              {/* Right side: CTA + Close */}
              <div className={styles.headerActions}>
                <NavButton
                  href="/contact?consultation=true"
                  onClick={onClose}
                  arrowStyle="diagonal"
                  className={styles.ctaButton}
                >
                  Book Consultation
                </NavButton>
                <motion.button
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Close menu"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M15 5L5 15M5 5L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Split Content Area */}
            <div
              className={styles.splitContainer}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Left Zone - Navigation Links */}
              <div ref={navLinksRef} className={styles.navZone}>
                {navItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.navItem} ${activeHoveredItem === item.id ? styles.navItemActive : ''}`}
                    onMouseEnter={() => {
                      if (item.hasSubmenu) {
                        setHoveredItem(item.id)
                      } else {
                        setHoveredItem(null)
                      }
                    }}
                  >
                    <Link
                      href={item.href}
                      className={styles.navLink}
                      onClick={onClose}
                    >
                      <span className={styles.navText}>
                        <SlotMachineText>{item.label}</SlotMachineText>
                      </span>
                      {item.hasSubmenu && (
                        <span className={styles.navArrow}>→</span>
                      )}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Right Zone - Mega Menu Content */}
              <div
                ref={megaZoneRef}
                className={styles.megaZone}
              >
                <div ref={megaContentRef} className={styles.megaZoneInner}>
                <AnimatePresence mode="wait">
                  {currentSubmenu ? (
                    <motion.div
                      key={activeHoveredItem}
                      className={styles.megaContent}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <div className={styles.megaGrid}>
                        {currentSubmenu.categories.map((category) => (
                          <div
                            key={category.title}
                            className={`${styles.megaCategory} ${category.highlight ? styles.megaCategoryHighlight : ''}`}
                          >
                            <h4 className={styles.categoryTitle}>
                              {category.highlight && <span className={styles.highlightBadge}>★</span>}
                              {category.title}
                            </h4>
                            <ul className={styles.categoryLinks}>
                              {category.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    className={styles.categoryLink}
                                    onClick={onClose}
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      className={styles.megaPlaceholder}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                      <div className={styles.placeholderIcon}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                          <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                          <path d="M18 24h12M24 18v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className={styles.placeholderText}>
                        Hover over <strong>Practice Areas</strong> or <strong>Facilitation Centre</strong> to explore services
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>

                {/* Scroll Indicator */}
                <AnimatePresence>
                  {showScrollIndicator && (
                    <motion.button
                      className={styles.scrollIndicator}
                      onClick={handleScrollDown}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Scroll for more"
                    >
                      {/* <span className={styles.scrollText}></span> */}
                      <motion.svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        animate={{ y: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <path
                          d="M8 3V13M8 13L12 9M8 13L4 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <motion.div
              className={styles.panelFooter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className={styles.footerLeft}>
                <div className={styles.footerLabel}>Email</div>
                <a href="mailto:info@arco.com.pk" className={styles.footerValue}>
                  info@arco.com.pk
                </a>
              </div>
              <div className={styles.footerRight}>
                <div className={styles.footerLabel}>Phone</div>
                <a href="tel:+923001234567" className={styles.footerValue}>
                  +92 300 123 4567
                </a>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
