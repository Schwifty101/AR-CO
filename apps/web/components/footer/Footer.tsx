'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollRevealText from '../shared/animations/ScrollRevealText'
import styles from './Footer.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const navigationLinks = [
    { label: 'Home', href: '/' },
    { label: 'Our Team', href: '/team' },
    { label: 'Practice Areas', href: '/practice-areas' },
    { label: 'Facilitation Centre', href: '/facilitation' },
    { label: 'Contact Us', href: '/contact' },
  ]

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    // Get the trigger element (spacer in main content)
    const trigger = document.getElementById('footer-trigger')
    if (!trigger) return

    // Set initial state - footer below viewport
    gsap.set(footer, {
      yPercent: 100,
    })

    // Create the slide-up reveal animation
    const st = ScrollTrigger.create({
      trigger: trigger,
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(footer, {
          yPercent: 100 - (self.progress * 100),
        })
      }
    })

    return () => {
      st.kill()
    }
  }, [])

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div ref={containerRef} className={styles.container}>
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
                  <ScrollRevealText as="span" delay={0}>
                    <Link href={link.href} className={styles.navLink}>
                      {link.label}
                    </Link>
                  </ScrollRevealText>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Right Column - Acknowledgement & Info */}
        <div className={styles.rightColumn}>
          <div className={styles.acknowledgement}>
            <span className={styles.columnLabel}>(ABOUT)</span>
            <ScrollRevealText as="p" className={styles.acknowledgementText} delay={0}>
              AR&CO is a premier law firm specializing in intellectual property, energy regulation,
              and corporate law. With decades of experience, we provide strategic legal counsel
              to businesses across Pakistan and beyond.
            </ScrollRevealText>
          </div>

          <div className={styles.contactInfo}>
            <span className={styles.columnLabel}>(CONTACT)</span>
            <div className={styles.contactContent}>
              <ScrollRevealText as="p" className={styles.contactItem} delay={0}>
                Islamabad, Pakistan
              </ScrollRevealText>
              <ScrollRevealText as="p" className={styles.contactItem} delay={0}>
                info@arco.law
              </ScrollRevealText>
              <ScrollRevealText as="p" className={styles.contactItem} delay={0}>
                +92 51 XXX XXXX
              </ScrollRevealText>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}