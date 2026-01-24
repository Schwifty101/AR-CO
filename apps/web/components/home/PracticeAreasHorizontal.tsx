'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './PracticeAreasHorizontal.module.css'

interface PracticeArea {
  id: number
  title: string
  shortTitle: string
  description: string
  tagline: string
}

const practiceAreas: PracticeArea[] = [
  {
    id: 1,
    title: 'Intellectual Property & Innovation Protection',
    shortTitle: 'IP & Innovation',
    tagline: 'Protecting Ideas That Define Businesses',
    description: 'From trademarks and patents to copyrights and global IP enforcement, our Islamabad office stands at the forefront of intellectual property law in Pakistan.',
  },
  {
    id: 2,
    title: 'Power Generation & Energy Regulation',
    shortTitle: 'Power & Energy',
    tagline: 'Regulating Power. Shaping Markets',
    description: 'With senior leadership experience at NEPRA, our firm advises at the very heart of Pakistan\'s power sector.',
  },
  {
    id: 3,
    title: 'Petroleum, Oil, Gas & LNG Infrastructure',
    shortTitle: 'Oil & Gas',
    tagline: 'Legal Precision for Energy Projects',
    description: 'We are pioneers in Pakistan\'s oil, gas, and LNG sector, advising on licensing, concessions, and large-scale infrastructure projects.',
  },
  {
    id: 4,
    title: 'Renewable Energy & Environmental Law',
    shortTitle: 'Renewable Energy',
    tagline: 'Powering the Future Responsibly',
    description: 'As Pakistan\'s leading renewable energy and environmental law firm, we advise on clean energy projects and climate compliance frameworks.',
  },
  {
    id: 5,
    title: 'Arbitration, Litigation & Dispute Resolution',
    shortTitle: 'Dispute Resolution',
    tagline: 'Complex Disputes. Strategic Resolution',
    description: 'We represent clients in high-value domestic and international arbitrations, litigation, and FIDIC-based disputes.',
  },
  {
    id: 6,
    title: 'Banking, Finance & Corporate Funding',
    shortTitle: 'Banking & Finance',
    tagline: 'Legal Strength Behind Financial Decisions',
    description: 'Our banking and finance practice supports financial institutions, corporations, and investors across lending and restructuring.',
  },
  {
    id: 7,
    title: 'Corporate, M&A & Commercial Structuring',
    shortTitle: 'Corporate & M&A',
    tagline: 'Structuring Growth. Securing Value',
    description: 'From incorporations to mergers, acquisitions, and joint ventures, we advise businesses at every stage of their lifecycle.',
  },
  {
    id: 8,
    title: 'Technology, Telecom & Media Law',
    shortTitle: 'Tech & Telecom',
    tagline: 'Law for a Connected World',
    description: 'We advise telecom operators, technology companies, and media entities on licensing, regulatory compliance, and digital operations.',
  },
  {
    id: 9,
    title: 'Construction, Infrastructure & Real Estate',
    shortTitle: 'Construction',
    tagline: 'Building Projects. Managing Risk',
    description: 'Our construction and real estate practice supports projects from concept to completion — advising developers, investors, and contractors.',
  },
  {
    id: 10,
    title: 'Public International, Nuclear & Regulatory Law',
    shortTitle: 'Nuclear & Regulatory',
    tagline: 'Law at the Intersection of State & Strategy',
    description: 'We are among Pakistan\'s few firms advising on nuclear licensing, public international law, and state liability matters.',
  },
]

// Artistic positions for content cards - scattered abstract layout like Lando Norris site
const cardPositions = [
  { top: '5%', left: '8%', size: 'large', rotation: -2 },
  { top: '55%', left: '60%', size: 'medium', rotation: 1 },
  { top: '12%', left: '55%', size: 'large', rotation: 0 },
  { top: '65%', left: '5%', size: 'medium', rotation: -1 },
  { top: '30%', left: '30%', size: 'small', rotation: 2 },
  { top: '75%', left: '40%', size: 'large', rotation: 0 },
  { top: '8%', left: '35%', size: 'medium', rotation: -1 },
  { top: '50%', left: '75%', size: 'small', rotation: 1 },
  { top: '40%', left: '10%', size: 'large', rotation: 0 },
  { top: '80%', left: '20%', size: 'medium', rotation: -2 },
]

export default function PracticeAreasHorizontal() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const navigateToPanel = useCallback((panelIndex: number) => {
    if (!wrapperRef.current) return

    const wrapper = wrapperRef.current
    const rect = wrapper.getBoundingClientRect()
    const wrapperTop = rect.top + window.scrollY
    const viewportHeight = window.innerHeight
    const scrollableHeight = wrapper.offsetHeight - viewportHeight

    const targetProgress = panelIndex / (practiceAreas.length - 1)
    const targetScroll = wrapperTop + (scrollableHeight * targetProgress)

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    })
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    let animationFrameId: number

    const handleScroll = () => {
      if (!wrapperRef.current || !scrollContainerRef.current) return

      const wrapper = wrapperRef.current
      const scrollContainer = scrollContainerRef.current
      const rect = wrapper.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      const sectionStart = rect.top
      const sectionEnd = rect.bottom

      // Only apply horizontal scroll when section is sticky
      if (sectionStart <= 0 && sectionEnd > viewportHeight) {
        const totalScrollableHeight = rect.height - viewportHeight
        const scrolledIntoSection = -sectionStart
        const rawProgress = scrolledIntoSection / totalScrollableHeight
        const progress = Math.min(Math.max(rawProgress, 0), 1)

        setScrollProgress(progress)

        // Calculate horizontal transform - scroll the entire width
        const containerWidth = scrollContainer.scrollWidth
        const viewportWidth = window.innerWidth * 0.667 // 2/3 of viewport
        const maxScroll = containerWidth - viewportWidth
        const translateX = -progress * maxScroll
        scrollContainer.style.transform = `translateX(${translateX}px)`

        // Calculate active index
        const totalPanels = practiceAreas.length
        const activeIdx = Math.min(
          Math.floor(progress * totalPanels),
          totalPanels - 1
        )
        setActiveIndex(activeIdx)
      } else if (sectionStart > 0) {
        // Before section - reset
        setScrollProgress(0)
        setActiveIndex(0)
        scrollContainer.style.transform = `translateX(0px)`
      }
    }

    const throttledScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      animationFrameId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isMobile])

  // Mobile layout
  if (isMobile) {
    return (
      <section className={styles.mobileSection}>
        <div className={styles.mobileHeader}>
          <h2 className={styles.mobileSectionTitle}>Practice Areas</h2>
        </div>
        <div className={styles.mobileContainer}>
          {practiceAreas.map((area) => (
            <article key={area.id} className={styles.mobileCard}>
              <span className={styles.mobileLabel}>{area.tagline}</span>
              <h3 className={styles.mobileTitle}>{area.shortTitle}</h3>
              <p className={styles.mobileDescription}>{area.description}</p>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.stickyContainer}>
        {/* Left Column - Typography List (1/3) */}
        <div className={styles.leftColumn}>
          <nav className={styles.navList}>
            {practiceAreas.map((area, index) => (
              <button
                key={area.id}
                className={`${styles.navItem} ${activeIndex === index ? styles.navItemActive : ''}`}
                onClick={() => navigateToPanel(index)}
              >
                <span className={styles.navLabel}>{area.tagline}</span>
                <span className={styles.navTitle}>{area.shortTitle}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right Column - Abstract Scattered Cards (2/3) */}
        <div className={styles.rightColumn}>
          <div ref={scrollContainerRef} className={styles.scrollContainer}>
            {/* Flowing curved lines - abstract background */}
            <svg className={styles.flowingLines} viewBox="0 0 2000 800" preserveAspectRatio="none">
              <path
                d="M-100,300 C200,250 400,400 700,350 C1000,300 1200,450 1500,400 C1800,350 2000,450 2200,400"
                fill="none"
                stroke="rgba(78, 52, 46, 0.08)"
                strokeWidth="2"
              />
              <path
                d="M-100,500 C300,450 500,550 800,500 C1100,450 1300,550 1600,500 C1900,450 2100,550 2300,500"
                fill="none"
                stroke="rgba(78, 52, 46, 0.06)"
                strokeWidth="1.5"
              />
              <path
                d="M-100,200 C150,180 350,250 600,200 C850,150 1050,280 1300,230 C1550,180 1750,280 2000,230"
                fill="none"
                stroke="rgba(212, 175, 55, 0.08)"
                strokeWidth="1"
              />
            </svg>

            {/* Practice area cards with artistic scattered placement */}
            {practiceAreas.map((area, index) => {
              const position = cardPositions[index % cardPositions.length]
              const isActive = activeIndex === index
              const isPast = index < activeIndex
              const isFuture = index > activeIndex

              return (
                <article
                  key={area.id}
                  className={`${styles.card} ${styles[position.size]} ${isActive ? styles.cardActive : ''} ${isPast ? styles.cardPast : ''} ${isFuture ? styles.cardFuture : ''}`}
                  style={{
                    '--card-top': position.top,
                    '--card-left': `calc(${index * 60}vw / ${practiceAreas.length} + ${position.left})`,
                    '--card-rotation': `${position.rotation}deg`,
                  } as React.CSSProperties}
                >
                  <span className={styles.cardLabel}>{area.tagline}</span>
                  <h3 className={styles.cardTitle}>{area.shortTitle}</h3>
                  <p className={styles.cardDescription}>{area.description}</p>
                </article>
              )
            })}

            {/* Signature quotes scattered in the layout */}
            <div className={styles.quoteBlock} style={{ '--quote-top': '25%', '--quote-left': '35%' } as React.CSSProperties}>
              <p className={styles.quoteText}>Excellence in legal practice demands both precision and vision.</p>
              <span className={styles.quoteSignature}>AR&CO</span>
            </div>

            <div className={styles.quoteBlock} style={{ '--quote-top': '70%', '--quote-left': '55%' } as React.CSSProperties}>
              <p className={styles.quoteText}>Where complex matters meet strategic solutions.</p>
              <span className={styles.quoteSignature}>AR&CO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
