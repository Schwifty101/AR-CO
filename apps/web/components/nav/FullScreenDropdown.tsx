"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import NavButton from "./components/NavButton"
import { NAV_SECTIONS } from "../data/navData"
import styles from "./FullScreenDropdown.module.css"

/**
 * FullScreenDropdown Component - Full Viewport Slide-from-Top Menu
 *
 * Premium full-screen dropdown for desktop navigation when not scrolled.
 * Features slide-from-top animation with staggered content reveals.
 *
 * @param {boolean} isOpen - Controls menu visibility
 * @param {() => void} onClose - Callback when menu should close
 * @param {'facilitation' | null} activeSection - Which section to display
 *
 * @example
 * ```tsx
 * <FullScreenDropdown
 *   isOpen={dropdownOpen}
 *   onClose={() => setDropdownOpen(false)}
 *   activeSection="facilitation"
 * />
 * ```
 */

interface FullScreenDropdownProps {
  isOpen: boolean
  onClose: () => void
  activeSection: 'facilitation' | null
}

// Navigation data structure - using shared data
const navData = NAV_SECTIONS

export default function FullScreenDropdown({
  isOpen,
  onClose,
  activeSection,
}: FullScreenDropdownProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // GSAP stagger animation for categories - premium, luxurious timing
  useEffect(() => {
    if (isOpen && categoriesRef.current) {
      const categories = categoriesRef.current.querySelectorAll(`.${styles.category}`)

      gsap.fromTo(
        categories,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.4,
        }
      )
    }
  }, [isOpen, activeSection])

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

  const currentData = activeSection ? navData[activeSection] : null

  return (
    <AnimatePresence>
      {isOpen && currentData && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Full Screen Menu */}
          <motion.div
            className={styles.fullScreenMenu}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{
              type: 'tween',
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${currentData.title} navigation menu`}
          >
            {/* Close Button */}
            <motion.button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close menu"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>

            <div ref={contentRef} className={styles.content}>
              {/* Header Section */}
              <motion.div
                className={styles.header}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h2 className={styles.title}>{currentData.title}</h2>
                <p className={styles.description}>{currentData.description}</p>
              </motion.div>

              {/* Categories Grid */}
              <div ref={categoriesRef} className={styles.categoriesGrid}>
                {currentData.categories.map((category) => (
                  <div
                    key={category.title}
                    className={`${styles.category} ${category.highlight ? styles.categoryHighlight : ''}`}
                  >
                    <h3 className={styles.categoryTitle}>
                      {category.highlight && <span className={styles.highlightBadge}>★</span>}
                      {category.title}
                    </h3>
                    <ul className={styles.linksList}>
                      {category.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={styles.link}
                            onClick={onClose}
                          >
                            <span className={styles.linkText}>{link.label}</span>
                            <span className={styles.linkArrow}>→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <motion.div
                className={styles.footer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <NavButton
                  href="/contact?consultation=true"
                  onClick={onClose}
                  arrowStyle="diagonal"
                  className={styles.ctaButton}
                >
                  Book Consultation
                </NavButton>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
