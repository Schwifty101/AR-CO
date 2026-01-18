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
              onMouseEnter={() => setPracticeSub(true)}
              onMouseLeave={() => setPracticeSub(false)}
            >
              <span>Practice Areas</span>
              {practiceSub && (
                <div className={styles.submenu}>
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
              onMouseEnter={() => setFacilSub(true)}
              onMouseLeave={() => setFacilSub(false)}
            >
              <span>Facilitation Centre</span>
              {facilSub && (
                <div className={styles.submenu}>
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
            <li>
              <Link href="/contact" className="text-hover">Contact</Link>
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
