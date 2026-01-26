"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
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

// Navigation items with potential sub-content
const navItems = [
  { id: 'home', label: 'Home', href: '/', hasSubmenu: false },
  { id: 'team', label: 'Our Team', href: '/team', hasSubmenu: false },
  { id: 'practice-areas', label: 'Practice Areas', href: '/practice-areas', hasSubmenu: true },
  { id: 'facilitation', label: 'Facilitation Centre', href: '/facilitation', hasSubmenu: true },
  { id: 'contact', label: 'Contact Us', href: '/contact', hasSubmenu: false },
]

// Submenu data for items with hasSubmenu: true
const submenuData: Record<string, { title: string; categories: Array<{ title: string; highlight?: boolean; links: Array<{ label: string; href: string }> }> }> = {
  'practice-areas': {
    title: 'Practice Areas',
    categories: [
      {
        title: 'Corporate Law',
        links: [
          { label: 'Company Formation', href: '/practice-areas/company-formation' },
          { label: 'Mergers & Acquisitions', href: '/practice-areas/mergers-acquisitions' },
          { label: 'Corporate Governance', href: '/practice-areas/corporate-governance' },
          { label: 'Joint Ventures', href: '/practice-areas/joint-ventures' },
        ]
      },
      {
        title: 'Litigation',
        links: [
          { label: 'Civil Litigation', href: '/practice-areas/civil-litigation' },
          { label: 'Criminal Defense', href: '/practice-areas/criminal-defense' },
          { label: 'Appellate Practice', href: '/practice-areas/appellate-practice' },
          { label: 'Arbitration', href: '/practice-areas/arbitration' },
        ]
      },
      {
        title: 'Real Estate',
        links: [
          { label: 'Property Transactions', href: '/practice-areas/property-transactions' },
          { label: 'Land Disputes', href: '/practice-areas/land-disputes' },
          { label: 'Construction Law', href: '/practice-areas/construction-law' },
        ]
      },
      {
        title: 'Banking & Finance',
        links: [
          { label: 'Banking Regulations', href: '/practice-areas/banking-regulations' },
          { label: 'Project Finance', href: '/practice-areas/project-finance' },
          { label: 'Debt Recovery', href: '/practice-areas/debt-recovery' },
        ]
      },
    ]
  },
  'facilitation': {
    title: 'Facilitation Centre',
    categories: [
      {
        title: 'Business & Corporate',
        links: [
          { label: 'NTN / STRN', href: '/facilitation/ntn-strn' },
          { label: 'SECP Registration', href: '/facilitation/secp-registration' },
          { label: 'Partnership Deeds', href: '/facilitation/partnership-deeds' },
          { label: 'Agreements', href: '/facilitation/agreements' },
        ]
      },
      {
        title: 'Compliance Certificates',
        links: [
          { label: 'AML / CFT Certificate', href: '/facilitation/aml-cft' },
          { label: 'Food Authority Licensing', href: '/facilitation/food-authority' },
          { label: 'Environmental Clearance', href: '/facilitation/environmental' },
          { label: 'Fire Compliance', href: '/facilitation/fire-compliance' },
        ]
      },
      {
        title: 'Real Estate',
        links: [
          { label: 'Property Transfer', href: '/facilitation/property-transfer' },
          { label: 'Fard Verification', href: '/facilitation/fard-verification' },
          { label: 'Rent Agreements', href: '/facilitation/rent-agreements' },
        ]
      },
      {
        title: "Women's Legal Desk",
        highlight: true,
        links: [
          { label: 'Khula / Divorce', href: '/facilitation/khula-divorce' },
          { label: 'Harassment Complaints', href: '/facilitation/harassment' },
          { label: 'Inheritance Documentation', href: '/facilitation/inheritance' },
        ]
      },
    ]
  }
}

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
      const categories = megaContentRef.current.querySelectorAll(`.${styles.megaCategory}`)
      
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
              <Link href="/contact?consultation=true" className={styles.ctaButton} onClick={onClose}>
                BOOK A CALL
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 11L11 3M11 3H5M11 3V9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
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
            <div className={styles.splitContainer}>
              {/* Left Zone - Navigation Links */}
              <div ref={navLinksRef} className={styles.navZone}>
                {navItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.navItem} ${hoveredItem === item.id ? styles.navItemActive : ''}`}
                    onMouseEnter={() => item.hasSubmenu && setHoveredItem(item.id)}
                    onMouseLeave={() => !item.hasSubmenu && setHoveredItem(null)}
                  >
                    <Link
                      href={item.href}
                      className={styles.navLink}
                      onClick={onClose}
                    >
                      <span className={styles.navText}>{item.label}</span>
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
                onMouseEnter={() => hoveredItem && setHoveredItem(hoveredItem)}
                onMouseLeave={() => setHoveredItem(null)}
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
