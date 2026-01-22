"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import styles from "./Header.module.css"

export default function Header() {
  const [facilitationOpen, setFacilitationOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileFacilitationOpen, setMobileFacilitationOpen] = useState(false)
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleFacilitationEnter = () => {
    // Clear any pending close timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      setCloseTimeout(null)
    }
    setFacilitationOpen(true)
  }

  const handleFacilitationLeave = () => {
    // Add a small delay before closing for forgiving UX
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
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${facilitationOpen ? styles.menuOpen : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>AR&CO</span>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>HOME</Link>
          <Link href="/team" className={styles.navLink}>OUR TEAM</Link>
          <Link href="/practice-areas" className={styles.navLink}>PRACTICE AREAS</Link>

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
              <svg className={`${styles.chevron} ${facilitationOpen ? styles.chevronOpen : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {facilitationOpen && (
              <div
                className={styles.megaMenu}
                onMouseEnter={handleFacilitationEnter}
                onMouseLeave={handleFacilitationLeave}
                role="navigation"
                aria-label="Facilitation Centre services menu"
              >
                <div className={styles.megaMenuContent}>
                  {/* Column 1: Business & Corporate */}
                  <div className={styles.megaMenuColumn}>
                    <div className={styles.columnIllustration}>
                      <svg className={styles.illustration} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="14" width="28" height="24" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 20h28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 10h16v4H16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.columnHeader}>
                      <h3 className={styles.columnTitle}>Business & Corporate</h3>
                    </div>
                    <div className={styles.columnLinks}>
                      <Link href="/facilitation/ntn-strn" className={styles.megaMenuLink}>NTN / STRN</Link>
                      <Link href="/facilitation/secp-registration" className={styles.megaMenuLink}>SECP Registration</Link>
                      <Link href="/facilitation/partnership-deeds" className={styles.megaMenuLink}>Partnership Deeds</Link>
                      <Link href="/facilitation/agreements" className={styles.megaMenuLink}>Agreements</Link>
                      <Link href="/facilitation/bank-documents" className={styles.megaMenuLink}>Bank Documents</Link>
                    </div>
                  </div>

                  {/* Column 2: Compliance Certificates */}
                  <div className={styles.megaMenuColumn}>
                    <div className={styles.columnIllustration}>
                      <svg className={styles.illustration} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 8L28 4L32 8L38 6L40 12L46 14L44 20L48 24L44 28L46 34L40 36L38 42L32 40L28 44L24 40L20 44L16 40L10 42L8 36L2 34L4 28L0 24L4 20L2 14L8 12L10 6L16 8L20 4L24 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 24l4 4l10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.columnHeader}>
                      <h3 className={styles.columnTitle}>Compliance Certificates</h3>
                    </div>
                    <div className={styles.columnLinks}>
                      <Link href="/facilitation/aml-cft" className={styles.megaMenuLink}>AML / CFT Certificate</Link>
                      <Link href="/facilitation/food-authority" className={styles.megaMenuLink}>Food Authority Licensing</Link>
                      <Link href="/facilitation/environmental" className={styles.megaMenuLink}>Environmental Clearance</Link>
                      <Link href="/facilitation/fire-compliance" className={styles.megaMenuLink}>Fire Compliance</Link>
                      <Link href="/facilitation/labour" className={styles.megaMenuLink}>Labour Registration</Link>
                    </div>
                  </div>

                  {/* Column 3: Real Estate Documentation */}
                  <div className={styles.megaMenuColumn}>
                    <div className={styles.columnIllustration}>
                      <svg className={styles.illustration} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 20L24 6L42 20V40C42 41.1046 41.1046 42 40 42H8C6.89543 42 6 41.1046 6 40V20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 42V28H30V42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.columnHeader}>
                      <h3 className={styles.columnTitle}>Real Estate Documentation</h3>
                    </div>
                    <div className={styles.columnLinks}>
                      <Link href="/facilitation/property-transfer" className={styles.megaMenuLink}>Property Transfer</Link>
                      <Link href="/facilitation/fard-verification" className={styles.megaMenuLink}>Fard Verification</Link>
                      <Link href="/facilitation/rent-agreements" className={styles.megaMenuLink}>Rent Agreements</Link>
                    </div>
                  </div>

                  {/* Column 4: Personal Certificates */}
                  <div className={styles.megaMenuColumn}>
                    <div className={styles.columnIllustration}>
                      <svg className={styles.illustration} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="10" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="24" cy="20" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 32C16 28.6863 18.6863 26 22 26H26C29.3137 26 32 28.6863 32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className={styles.columnHeader}>
                      <h3 className={styles.columnTitle}>Personal Certificates</h3>
                    </div>
                    <div className={styles.columnLinks}>
                      <Link href="/facilitation/character-certificate" className={styles.megaMenuLink}>Character Certificate</Link>
                      <Link href="/facilitation/succession-certificate" className={styles.megaMenuLink}>Succession Certificate</Link>
                    </div>
                  </div>

                  {/* Column 5: Women's Legal Desk */}
                  <div className={styles.megaMenuColumn}>
                    <div className={styles.columnIllustration}>
                      <svg className={styles.illustration} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 18L24 8L34 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 18L8 18L8 22L40 22L40 18L34 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="24" y1="22" x2="24" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="14" y1="40" x2="34" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className={styles.columnHeader}>
                      <h3 className={styles.columnTitle}>Women's Legal Desk</h3>
                    </div>
                    <div className={styles.columnLinks}>
                      <Link href="/facilitation/khula-divorce" className={styles.megaMenuLink}>Khula / Divorce</Link>
                      <Link href="/facilitation/harassment" className={styles.megaMenuLink}>Harassment Complaints</Link>
                      <Link href="/facilitation/inheritance" className={styles.megaMenuLink}>Inheritance Documentation</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/contact" className={styles.navLink}>CONTACT US</Link>
        </nav>

        {/* CTA Buttons */}
        <div className={styles.actions}>
          <Link href="/about" className={styles.btnDemo}>
            ABOUT US
          </Link>
          <Link href="/contact?consultation=true" className={styles.btnPrimary}>
            BOOK CONSULTATION
          </Link>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={mobileMenuOpen ? styles.menuIconOpen : ''}></span>
            <span className={mobileMenuOpen ? styles.menuIconOpen : ''}></span>
            <span className={mobileMenuOpen ? styles.menuIconOpen : ''}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/team" onClick={() => setMobileMenuOpen(false)}>Our Team</Link>
            <Link href="/practice-areas" onClick={() => setMobileMenuOpen(false)}>Practice Areas</Link>

            <div className={styles.mobileDropdown}>
              <button
                className={styles.mobileDropdownBtn}
                onClick={() => setMobileFacilitationOpen(!mobileFacilitationOpen)}
              >
                Facilitation Centre
                <svg className={`${styles.mobileChevron} ${mobileFacilitationOpen ? styles.mobileChevronOpen : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {mobileFacilitationOpen && (
                <div className={styles.mobileSubmenu}>
                  <h4 className={styles.mobileSubmenuHeader}>Business & Corporate</h4>
                  <Link href="/facilitation/ntn-strn" onClick={() => setMobileMenuOpen(false)}>NTN / STRN</Link>
                  <Link href="/facilitation/secp-registration" onClick={() => setMobileMenuOpen(false)}>SECP Registration</Link>
                  <Link href="/facilitation/partnership-deeds" onClick={() => setMobileMenuOpen(false)}>Partnership Deeds</Link>
                  <Link href="/facilitation/agreements" onClick={() => setMobileMenuOpen(false)}>Agreements</Link>
                  <Link href="/facilitation/bank-documents" onClick={() => setMobileMenuOpen(false)}>Bank Documents</Link>

                  <h4 className={styles.mobileSubmenuHeader}>Compliance Certificates</h4>
                  <Link href="/facilitation/aml-cft" onClick={() => setMobileMenuOpen(false)}>AML / CFT Certificate</Link>
                  <Link href="/facilitation/food-authority" onClick={() => setMobileMenuOpen(false)}>Food Authority Licensing</Link>
                  <Link href="/facilitation/environmental" onClick={() => setMobileMenuOpen(false)}>Environmental Clearance</Link>
                  <Link href="/facilitation/fire-compliance" onClick={() => setMobileMenuOpen(false)}>Fire Compliance</Link>
                  <Link href="/facilitation/labour" onClick={() => setMobileMenuOpen(false)}>Labour Registration</Link>

                  <h4 className={styles.mobileSubmenuHeader}>Real Estate Documentation</h4>
                  <Link href="/facilitation/property-transfer" onClick={() => setMobileMenuOpen(false)}>Property Transfer</Link>
                  <Link href="/facilitation/fard-verification" onClick={() => setMobileMenuOpen(false)}>Fard Verification</Link>
                  <Link href="/facilitation/rent-agreements" onClick={() => setMobileMenuOpen(false)}>Rent Agreements</Link>

                  <h4 className={styles.mobileSubmenuHeader}>Personal Certificates</h4>
                  <Link href="/facilitation/character-certificate" onClick={() => setMobileMenuOpen(false)}>Character Certificate</Link>
                  <Link href="/facilitation/succession-certificate" onClick={() => setMobileMenuOpen(false)}>Succession Certificate</Link>

                  <h4 className={styles.mobileSubmenuHeader}>Women's Legal Desk</h4>
                  <Link href="/facilitation/khula-divorce" onClick={() => setMobileMenuOpen(false)}>Khula / Divorce</Link>
                  <Link href="/facilitation/harassment" onClick={() => setMobileMenuOpen(false)}>Harassment Complaints</Link>
                  <Link href="/facilitation/inheritance" onClick={() => setMobileMenuOpen(false)}>Inheritance Documentation</Link>
                </div>
              )}
            </div>

            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>

            <div className={styles.mobileCTAs}>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={styles.mobileBtnDemo}>
                About Us
              </Link>
              <Link href="/contact?consultation=true" onClick={() => setMobileMenuOpen(false)} className={styles.mobileBtnPrimary}>
                Book Consultation
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
