"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import styles from "./Header.module.css"

export default function Header() {
  const [practiceSub, setPracticeSub] = useState(false)
  const [facilSub, setFacilSub] = useState(false)
  const [practiceClosing, setPracticeClosing] = useState(false)
  const [facilClosing, setFacilClosing] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [practiceTimeout, setPracticeTimeout] = useState<NodeJS.Timeout | null>(null)
  const [facilTimeout, setFacilTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePracticeEnter = () => {
    if (practiceTimeout) {
      clearTimeout(practiceTimeout)
      setPracticeTimeout(null)
    }
    setPracticeClosing(false)
    setPracticeSub(true)
  }

  const handlePracticeLeave = () => {
    const timeout = setTimeout(() => {
      setPracticeClosing(true)
      setTimeout(() => {
        setPracticeSub(false)
        setPracticeClosing(false)
      }, 300)
    }, 200)
    setPracticeTimeout(timeout)
  }

  const handleFacilEnter = () => {
    if (facilTimeout) {
      clearTimeout(facilTimeout)
      setFacilTimeout(null)
    }
    setFacilClosing(false)
    setFacilSub(true)
  }

  const handleFacilLeave = () => {
    const timeout = setTimeout(() => {
      setFacilClosing(true)
      setTimeout(() => {
        setFacilSub(false)
        setFacilClosing(false)
      }, 300)
    }, 200)
    setFacilTimeout(timeout)
  }

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/">AR&CO Law Firm</Link>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link href="/" className="text-hover">Home</Link>
            </li>
            <li>
              <Link href="/about" className="text-hover">About Us</Link>
            </li>
            <li>
              <Link href="/team" className="text-hover">Our Team</Link>
            </li>

            {/* Practice Areas Dropdown */}
            <li
              className={styles.dropdown}
              onMouseEnter={handlePracticeEnter}
              onMouseLeave={handlePracticeLeave}
            >
              <span>Practice Areas</span>
              {practiceSub && (
                <div className={`${styles.submenu} ${practiceClosing ? styles.submenuClosing : ''}`}>
                  <div className={styles.submenuColumn}>
                    <Link href="/practice/corporate-law" className="text-hover">Corporate Law</Link>
                    <Link href="/practice/tax-law" className="text-hover">Tax Law</Link>
                    <Link href="/practice/immigration" className="text-hover">Immigration</Link>
                    <Link href="/practice/labor-law" className="text-hover">Labour Law</Link>
                    <Link href="/practice/intellectual-property" className="text-hover">Intellectual Property</Link>
                    <Link href="/practice/real-estate" className="text-hover">Real Estate</Link>
                    <Link href="/practice/litigation" className="text-hover">Litigation</Link>
                  </div>
                  <div className={styles.submenuColumn}>
                    <Link href="/practice/contracts" className="text-hover">Contracts</Link>
                    <Link href="/practice/compliance" className="text-hover">Compliance</Link>
                    <Link href="/practice/family-law" className="text-hover">Family Law</Link>
                    <Link href="/practice/banking" className="text-hover">Banking & Finance</Link>
                    <Link href="/practice/dispute-resolution" className="text-hover">Dispute Resolution</Link>
                    <Link href="/practice/international-law" className="text-hover">International Law</Link>
                  </div>
                </div>
              )}
            </li>

            {/* Facilitation Dropdown */}
            <li
              className={styles.dropdown}
              onMouseEnter={handleFacilEnter}
              onMouseLeave={handleFacilLeave}
            >
              <span>Facilitation Centre</span>
              {facilSub && (
                <div className={`${styles.submenu} ${facilClosing ? styles.submenuClosing : ''}`}>
                  <div className={styles.submenuColumn}>
                    <Link href="/facilitation/document-drafting" className="text-hover">Document Drafting</Link>
                    <Link href="/facilitation/legal-consultation" className="text-hover">Legal Consultation</Link>
                    <Link href="/facilitation/contract-review" className="text-hover">Contract Review</Link>
                    <Link href="/facilitation/compliance-audit" className="text-hover">Compliance Audit</Link>
                    <Link href="/facilitation/mediation" className="text-hover">Mediation Services</Link>
                  </div>
                </div>
              )}
            </li>

            <li>
              <Link href="/blog" className="text-hover">Blog</Link>
            </li>
            
          </ul>
        </nav>

        {/* CTA Buttons */}
        <div className={styles.ctaButtons}>
          <Link href="/client-portal" className={styles.btnSecondary}>
            Client Portal
          </Link>
          <Link href="/contact" className={styles.btnPrimary}>
            Contact Us
          </Link>
        </div>
      </div>
    </header>
  )
}
