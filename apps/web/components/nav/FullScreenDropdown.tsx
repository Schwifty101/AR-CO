"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import styles from "./FullScreenDropdown.module.css"

/**
 * FullScreenDropdown Component - Full Viewport Slide-from-Top Menu
 *
 * Premium full-screen dropdown for desktop navigation when not scrolled.
 * Features slide-from-top animation with staggered content reveals.
 *
 * @param {boolean} isOpen - Controls menu visibility
 * @param {() => void} onClose - Callback when menu should close
 * @param {'practice-areas' | 'facilitation' | null} activeSection - Which section to display
 *
 * @example
 * ```tsx
 * <FullScreenDropdown
 *   isOpen={dropdownOpen}
 *   onClose={() => setDropdownOpen(false)}
 *   activeSection="practice-areas"
 * />
 * ```
 */

interface FullScreenDropdownProps {
  isOpen: boolean
  onClose: () => void
  activeSection: 'practice-areas' | 'facilitation' | null
}

// Category type definition
interface Category {
  title: string
  highlight?: boolean
  links: Array<{ label: string; href: string }>
}

interface NavSection {
  title: string
  description: string
  categories: Category[]
}

// Navigation data structure
const navData: Record<'practice-areas' | 'facilitation', NavSection> = {
  'practice-areas': {
    title: 'Practice Areas',
    description: 'Our comprehensive legal services',
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
          { label: 'Lease Agreements', href: '/practice-areas/lease-agreements' },
        ]
      },
      {
        title: 'Banking & Finance',
        links: [
          { label: 'Banking Regulations', href: '/practice-areas/banking-regulations' },
          { label: 'Project Finance', href: '/practice-areas/project-finance' },
          { label: 'Debt Recovery', href: '/practice-areas/debt-recovery' },
          { label: 'Securities Law', href: '/practice-areas/securities-law' },
        ]
      },
    ]
  },
  'facilitation': {
    title: 'Facilitation Centre',
    description: 'Legal facilitation services',
    categories: [
      {
        title: 'Business & Corporate',
        links: [
          { label: 'NTN / STRN', href: '/facilitation/ntn-strn' },
          { label: 'SECP Registration', href: '/facilitation/secp-registration' },
          { label: 'Partnership Deeds', href: '/facilitation/partnership-deeds' },
          { label: 'Agreements', href: '/facilitation/agreements' },
          { label: 'Bank Documents', href: '/facilitation/bank-documents' },
        ]
      },
      {
        title: 'Compliance Certificates',
        links: [
          { label: 'AML / CFT Certificate', href: '/facilitation/aml-cft' },
          { label: 'Food Authority Licensing', href: '/facilitation/food-authority' },
          { label: 'Environmental Clearance', href: '/facilitation/environmental' },
          { label: 'Fire Compliance', href: '/facilitation/fire-compliance' },
          { label: 'Labour Registration', href: '/facilitation/labour' },
        ]
      },
      {
        title: 'Real Estate Documentation',
        links: [
          { label: 'Property Transfer', href: '/facilitation/property-transfer' },
          { label: 'Fard Verification', href: '/facilitation/fard-verification' },
          { label: 'Rent Agreements', href: '/facilitation/rent-agreements' },
        ]
      },
      {
        title: 'Personal Certificates',
        links: [
          { label: 'Character Certificate', href: '/facilitation/character-certificate' },
          { label: 'Succession Certificate', href: '/facilitation/succession-certificate' },
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

  // GSAP stagger animation for categories
  useEffect(() => {
    if (isOpen && categoriesRef.current) {
      const categories = categoriesRef.current.querySelectorAll(`.${styles.category}`)
      
      gsap.fromTo(
        categories,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.3,
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
            transition={{ duration: 0.3 }}
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
              duration: 0.6,
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
              transition={{ delay: 0.4 }}
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
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className={styles.title}>{currentData.title}</h2>
                <p className={styles.description}>{currentData.description}</p>
              </motion.div>

              {/* Categories Grid */}
              <div ref={categoriesRef} className={styles.categoriesGrid}>
                {currentData.categories.map((category, index) => (
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
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <Link href="/contact?consultation=true" className={styles.ctaButton} onClick={onClose}>
                  Book Consultation
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 12L12 4M12 4H6M12 4V10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
