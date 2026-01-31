'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import SlotMachineText from '../shared/animations/SlotMachineText'
import { getSmoother } from '../SmoothScroll'
import styles from './Footer.module.css'

/**
 * Footer Component - AR&CO Law Firm
 *
 * Features:
 * - 3-column grid layout with image, navigation, and info
 * - Live Pakistan time clock (updates every second)
 * - Dynamic open/closed office status
 * - Slot machine text animation on navigation links
 */
export default function Footer() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isOfficeOpen, setIsOfficeOpen] = useState<boolean>(false)

  const navigationLinks = [
    { label: 'Home', href: '/' },
    { label: 'Our Team', href: '/team' },
    { label: 'About Us', href: '/about' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Practice Areas', href: '/practice-areas' },
    { label: 'Facilitation', href: '/facilitation' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ]

  /**
   * Calculates if the office is currently open
   * Office hours: Monday-Friday, 9:00 AM - 5:00 PM PKT time
   */
  const calculateOfficeStatus = (pktDate: Date): boolean => {
    const dayOfWeek = pktDate.getDay() // 0 = Sunday, 6 = Saturday
    const hours = pktDate.getHours()
    const minutes = pktDate.getMinutes()
    const currentMinutes = hours * 60 + minutes

    // Monday (1) to Friday (5), 9:00 AM (540 min) to 5:00 PM (1020 min)
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
    const isBusinessHours = currentMinutes >= 540 && currentMinutes < 1020

    return isWeekday && isBusinessHours
  }

  /**
   * Scroll to top of the page using ScrollSmoother
   */
  const scrollToTop = useCallback(() => {
    const smoother = getSmoother()
    if (smoother) {
      smoother.scrollTo(0, true) // Smooth scroll to top
    } else {
      // Fallback if ScrollSmoother isn't available
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  /**
   * Live clock effect - updates every second with Pakistan timezone
   */
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const pktTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
      )

      // Format time as "H:MM AM/PM PKT"
      const timeString = pktTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      setCurrentTime(`${timeString} PKT`)

      // Update office status
      setIsOfficeOpen(calculateOfficeStatus(pktTime))
    }

    // Initial update
    updateClock()

    // Update every second
    const interval = setInterval(updateClock, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className={styles.footer} data-theme="dark">
      <div className={styles.container}>
        {/* Main 3-Column Grid */}
        <div className={styles.mainGrid}>
          {/* Left Column - Image Container + Logo */}
          <div className={styles.leftColumn}>
            <div className={styles.imageContainer}>
              {/* Placeholder for 4:3 image */}
            </div>
            <div className={styles.logoContainer}>
              <h2 className={`${styles.logo} cursor-pointer`}>
                {/* <SlotMachineText className={styles.logo1}>
                AR
                </SlotMachineText>
                  <br />
                <SlotMachineText className={styles.logo2}>
                &CO
                </SlotMachineText> */}
                {/* <SlotMachineText>AR&CO</SlotMachineText> */}
                AR <br /> &CO
              </h2>
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
                      <SlotMachineText>{link.label}</SlotMachineText>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right Column - About & Contact Info */}
          <div className={styles.rightColumn}>
            <div className={styles.acknowledgement}>
              <span className={styles.columnLabel}>(ABOUT)</span>
              <p className={styles.acknowledgementText}>
                AR&CO is a premier law firm specializing in intellectual
                property, energy regulation, and corporate law. With decades of
                experience, we provide strategic legal counsel to businesses
                across Pakistan and beyond.
              </p>
            </div>

            <div className={styles.contactInfo}>
              <span className={styles.columnLabel}>(INFO)</span>
              <div className={styles.contactContent}>
                <p className={styles.contactItem}>
                  <span className={styles.contactPrefix}>A:</span>
                  Islamabad, Pakistan
                </p>
                <p className={styles.contactItem}>
                  <span className={styles.contactPrefix}>E:</span>
                  info@arco.law
                </p>
                <p className={styles.contactItem}>
                  <span className={styles.contactPrefix}>P:</span>
                  +92 51 XXX XXXX
                </p>
                <p className={styles.contactItem}>
                  <span className={styles.contactPrefix}>H:</span>
                  Monday to Friday, 9:00am - 5:00pm
                </p>
              </div>
              <button
                className={styles.scrollTopButton}
                onClick={scrollToTop}
                aria-label="Scroll to top"
              >
                <span className={styles.scrollTopText}>
                  <SlotMachineText>Back to Top</SlotMachineText>
                </span>
                <svg
                  className={styles.scrollTopIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 13V3M8 3L3 8M8 3L13 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className={styles.bottomRow}>
          {/* Left Group - Copyright, Time, Status */}
          <div className={styles.bottomLeft}>
            <SlotMachineText className={`${styles.copyright} cursor-pointer`}>{"© 2026 AR&CO"}</SlotMachineText>
            <div className={styles.timeStatusRow}>
              <span className={styles.clockTime}>{currentTime}</span>
              <span
                className={`${styles.officeStatus} ${isOfficeOpen ? styles.statusOpen : styles.statusClosed}`}
              >
                {isOfficeOpen ? 'WE ARE OPEN' : 'WE ARE CLOSED'}
              </span>
            </div>
          </div>

          {/* Center Group - Legal Links */}
          <div className={styles.bottomCenter}>
            <Link href="/privacy" className={styles.legalLink}>
              <SlotMachineText>Privacy Policy</SlotMachineText>
            </Link>
            <Link href="/terms" className={styles.legalLink}>
              <SlotMachineText>Terms of Service</SlotMachineText>
            </Link>
          </div>

          {/* Right Group - Social & Credits */}
          <div className={styles.bottomRight}>
            <a
              href="https://instagram.com/arco.law"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <SlotMachineText>Instagram</SlotMachineText>
            </a>
            <a
              href="https://Linkedin.com/arco.law"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <SlotMachineText>LinkedIn</SlotMachineText>
            </a>
            <a
              href="https://Facebook.com/arco.law"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <SlotMachineText>Facebook</SlotMachineText>
            </a>
            <span className={`${styles.credits} cursor-pointer`}>SITE BY <SlotMachineText>SCHWIFTY</SlotMachineText></span>
          </div>
        </div>
      </div>
    </footer>
  )
}