"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import SlotMachineText from "../shared/animations/SlotMachineText"
import NavButton from "./components/NavButton"
import { NAV_ITEMS } from "./data/navData"
import styles from "./MobileFullScreenMenu.module.css"

/**
 * MobileFullScreenMenu Component - Full Screen Mobile Navigation
 *
 * Premium full-screen mobile menu with black background aesthetic.
 * Features large bold navigation links with arrow-on-hover animation.
 * Includes bottom section with contact info and local time display.
 *
 * @param {boolean} isOpen - Controls menu visibility
 * @param {() => void} onClose - Callback when menu should close
 *
 * @example
 * ```tsx
 * <MobileFullScreenMenu
 *   isOpen={mobileMenuOpen}
 *   onClose={() => setMobileMenuOpen(false)}
 * />
 * ```
 */

interface MobileFullScreenMenuProps {
  isOpen: boolean
  onClose: () => void
}

// Navigation items - using shared data
const navItems = NAV_ITEMS.map(({ id, label, href }) => ({ id, label, href }))

export default function MobileFullScreenMenu({ isOpen, onClose }: MobileFullScreenMenuProps) {
  const [currentTime, setCurrentTime] = useState('')
  const navLinksRef = useRef<HTMLDivElement>(null)

  // Update local time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const pakistanTime = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Karachi',
      })
      setCurrentTime(`${pakistanTime}, PKT`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

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

  // GSAP stagger animation for nav links
  useEffect(() => {
    if (isOpen && navLinksRef.current) {
      const links = navLinksRef.current.querySelectorAll(`.${styles.navItem}`)

      gsap.fromTo(
        links,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.2,
        }
      )
    }
  }, [isOpen])

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

  // Get current date for "Available" text
  const getAvailabilityDate = () => {
    const now = new Date()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[now.getMonth()]} '${now.getFullYear().toString().slice(-2)}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.fullScreenMenu}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Header with CTA and Close */}
          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <NavButton
              href="/contact?consultation=true"
              onClick={onClose}
              arrowStyle="diagonal"
              className={styles.ctaButton}
            >
              Schedule a Call
            </NavButton>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close menu"
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
            </button>
          </motion.div>

          {/* Navigation Links */}
          <div ref={navLinksRef} className={styles.navSection}>
            {navItems.map((item) => (
              <motion.div
                key={item.id}
                className={styles.navItem}
                whileHover="hover"
                variants={{
                  hover: {
                    x: 16,
                    transition: {
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    },
                  },
                }}
              >
                <Link href={item.href} className={styles.navLink} onClick={onClose}>
                  <motion.span
                    className={styles.navText}
                    variants={{
                      hover: {
                        color: '#ffffff',
                        transition: { duration: 0.2 },
                      },
                    }}
                  >
                    <SlotMachineText>{item.label}</SlotMachineText>
                  </motion.span>
                  <motion.span
                    className={styles.navArrow}
                    initial={{ opacity: 0, x: -10 }}
                    variants={{
                      hover: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.2, delay: 0.05 },
                      },
                    }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Footer Section */}
          <motion.div
            className={styles.footer}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Left - Email and Time */}
            <div className={styles.footerLeft}>
              <div className={styles.footerBlock}>
                <div className={styles.footerLabel}>EMAIL ADDRESS</div>
                <a href="mailto:info@arco.com.pk" className={styles.footerValue}>
                  info@arco.com.pk
                </a>
              </div>
              <div className={styles.footerBlock}>
                <div className={styles.footerLabel}>LOCAL TIME</div>
                <div className={styles.footerValueMono}>{currentTime}</div>
              </div>
            </div>

            {/* Right - Working Status */}
            <div className={styles.footerRight}>
              <div className={styles.workingStatus}>
                <div className={styles.globeIcon}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <ellipse cx="8" cy="8" rx="3" ry="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M1 8h14" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className={styles.workingText}>WORKING GLOBALLY</span>
              </div>
              <div className={styles.availabilityText}>AVAILABLE {getAvailabilityDate()}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
