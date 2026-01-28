'use client'

import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  const navigationLinks = [
    { label: 'Home', href: '/' },
    { label: 'Our Team', href: '/team' },
    { label: 'Practice Areas', href: '/practice-areas' },
    { label: 'Facilitation Centre', href: '/facilitation' },
    { label: 'Contact Us', href: '/contact' },
  ]

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Left Column - Image Container + Logo */}
        <div className={styles.leftColumn}>
          <div className={styles.imageContainer}>
            {/* Image will be added here */}
          </div>
          <div className={styles.logoContainer}>
            <h2 className={styles.logo}>AR&CO</h2>
          </div>
        </div>

        {/* Middle Column - Navigation */}
        <div className={styles.middleColumn}>
          <span className={styles.columnLabel}>(NAVIGATION)</span>
          <nav className={styles.navigation}>
            <ul className={styles.navList}>
              {navigationLinks.map((link, index) => (
                <li key={index} className={styles.navItem}>
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Right Column - Acknowledgement & Info */}
        <div className={styles.rightColumn}>
          <div className={styles.acknowledgement}>
            <span className={styles.columnLabel}>(ABOUT)</span>
            <p className={styles.acknowledgementText}>
              AR&CO is a premier law firm specializing in intellectual property, energy regulation,
              and corporate law. With decades of experience, we provide strategic legal counsel
              to businesses across Pakistan and beyond.
            </p>
          </div>

          <div className={styles.contactInfo}>
            <span className={styles.columnLabel}>(CONTACT)</span>
            <div className={styles.contactContent}>
              <p className={styles.contactItem}>Islamabad, Pakistan</p>
              <p className={styles.contactItem}>info@arco.law</p>
              <p className={styles.contactItem}>+92 51 XXX XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}