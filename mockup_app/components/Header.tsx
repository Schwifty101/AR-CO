"use client"

import Link from "next/link"
import { useState } from "react"
import styles from "./Header.module.css"

export default function Header() {
  const [practiceSub, setPracticeSub] = useState(false)
  const [facilSub, setFacilSub] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/">AR&CO Law Firm</Link>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/team">Our Team</Link>
            </li>

            {/* Practice Areas Dropdown */}
            <li
              className={styles.dropdown}
              onMouseEnter={() => setPracticeSub(true)}
              onMouseLeave={() => setPracticeSub(false)}
            >
              <span>Practice Areas</span>
              {practiceSub && (
                <div className={styles.submenu}>
                  <div className={styles.submenuColumn}>
                    <Link href="/practice/corporate-law">Corporate Law</Link>
                    <Link href="/practice/tax-law">Tax Law</Link>
                    <Link href="/practice/immigration">Immigration</Link>
                    <Link href="/practice/labor-law">Labour Law</Link>
                    <Link href="/practice/intellectual-property">Intellectual Property</Link>
                    <Link href="/practice/real-estate">Real Estate</Link>
                    <Link href="/practice/litigation">Litigation</Link>
                  </div>
                  <div className={styles.submenuColumn}>
                    <Link href="/practice/contracts">Contracts</Link>
                    <Link href="/practice/compliance">Compliance</Link>
                    <Link href="/practice/family-law">Family Law</Link>
                    <Link href="/practice/banking">Banking & Finance</Link>
                    <Link href="/practice/dispute-resolution">Dispute Resolution</Link>
                    <Link href="/practice/international-law">International Law</Link>
                  </div>
                </div>
              )}
            </li>

            {/* Facilitation Dropdown */}
            <li
              className={styles.dropdown}
              onMouseEnter={() => setFacilSub(true)}
              onMouseLeave={() => setFacilSub(false)}
            >
              <span>Facilitation Centre</span>
              {facilSub && (
                <div className={styles.submenu}>
                  <div className={styles.submenuColumn}>
                    <Link href="/facilitation/document-drafting">Document Drafting</Link>
                    <Link href="/facilitation/legal-consultation">Legal Consultation</Link>
                    <Link href="/facilitation/contract-review">Contract Review</Link>
                    <Link href="/facilitation/compliance-audit">Compliance Audit</Link>
                    <Link href="/facilitation/mediation">Mediation Services</Link>
                  </div>
                </div>
              )}
            </li>

            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>

        {/* CTA Buttons */}
        <div className={styles.ctaButtons}>
          <Link href="/portal/login" className={styles.btnSecondary}>
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
