"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import SlotMachineText from "../shared/animations/SlotMachineText"
import NavButton from "./components/NavButton"
import { NAV_ITEMS, SUBMENU_DATA } from "./data/navData"
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
  const navLinksRef = useRef<HTMLDivElement>(null)
  const megaContentRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setHoveredItem(null) // Reset hover state when closing
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // GSAP stagger animation for nav links
  useEffect(() => {
    if (isOpen && navLinksRef.current) {
      const links = navLinksRef.current.querySelectorAll(`.${styles.navItem}`)

      gsap.fromTo(
        links,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.3,
        }
      )
    }
  }, [isOpen])

  // GSAP animation for mega menu content change
  useEffect(() => {
    if (hoveredItem && megaContentRef.current) {
      // Delay to wait for AnimatePresence to finish rendering new content
      const timer = setTimeout(() => {
        if (megaContentRef.current) {
          const categories = megaContentRef.current.querySelectorAll(`.${styles.megaCategory}`)
          if (categories && categories.length > 0) {
            gsap.fromTo(
              categories,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.05,
                ease: 'power2.out',
              }
            )
          }
        }
      }, 220) // Wait for AnimatePresence transition (200ms) + buffer

      return () => clearTimeout(timer)
    }
  }, [hoveredItem])

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

  const currentSubmenu = hoveredItem ? submenuData[hoveredItem] : null

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
            transition={{ duration: 0.3 }}
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
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation panel"
          >
            {/* Header with Close Button */}
            <div className={styles.panelHeader}>
              <NavButton
                href="/contact?consultation=true"
                onClick={onClose}
                arrowStyle="diagonal"
                className={styles.ctaButton}
              >
                Schedule a Call
              </NavButton>
              <motion.button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close menu"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
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
                    className={`${styles.navItem} ${hoveredItem === item.id ? styles.navItemActive : ''}`}
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
                ref={megaContentRef}
                className={styles.megaZone}
              >
                <AnimatePresence mode="wait">
                  {currentSubmenu ? (
                    <motion.div
                      key={hoveredItem}
                      className={styles.megaContent}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className={styles.megaTitle}>{currentSubmenu.title}</h3>
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
                      transition={{ duration: 0.2 }}
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
            </div>

            {/* Footer */}
            <motion.div
              className={styles.panelFooter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
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
