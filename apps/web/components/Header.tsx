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
                      <svg className={styles.illustration} viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/>
                        <circle cx="90" cy="35" r="25" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                        <circle cx="130" cy="55" r="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/>
                        <circle cx="40" cy="30" r="15" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                        <line x1="50" y1="30" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                        <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                      </svg>
                      <span className={styles.badge}>1</span>
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
                      <svg className={styles.illustration} viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="90" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/>
                        <circle cx="130" cy="40" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                        <circle cx="60" cy="45" r="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/>
                        <line x1="70" y1="35" x2="70" y2="55" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                        <line x1="60" y1="45" x2="80" y2="45" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                      </svg>
                      <span className={styles.badge}>2</span>
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
                      <svg className={styles.illustration} viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="70" cy="50" r="32" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                        <circle cx="120" cy="35" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/>
                        <circle cx="110" cy="65" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                        <line x1="60" y1="40" x2="60" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                        <line x1="50" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                      </svg>
                      <span className={styles.badge}>3</span>
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
                      <svg className={styles.illustration} viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="90" cy="50" r="35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/>
                        <circle cx="130" cy="35" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                        <circle cx="65" cy="60" r="25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/>
                        <circle cx="120" cy="65" r="15" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                        <line x1="80" y1="40" x2="80" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                        <line x1="70" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                      </svg>
                      <span className={styles.badge}>4</span>
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
                      <svg className={styles.illustration} viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="80" cy="45" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                        <circle cx="125" cy="50" r="23" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/>
                        <circle cx="55" cy="60" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                        <circle cx="100" cy="30" r="16" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                        <line x1="70" y1="40" x2="70" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                        <line x1="60" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                      </svg>
                      <span className={styles.badge}>5</span>
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
