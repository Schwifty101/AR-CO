'use client'
import { useLayoutEffect, useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import ScrollRevealText from '@/components/shared/animations/ScrollRevealText'
import styles from './PracticeAreasHorizontal.module.css'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
}

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

// Card spacing configuration - cards placed in horizontal sequence
const CARD_SPACING = 70 // vw units between each card center
const CARD_INITIAL_OFFSET = 80 // vw units - where first card starts (higher = enters from further right)
const ACTIVATION_THRESHOLD = 22 // vw units - card must be within this distance of center to expand

// Hardcoded navigation progress for each card (0 to 1)
// Adjust these values to fine-tune where clicking each menu item scrolls to
const CARD_NAV_PROGRESS = [
  0.15,   // Card 0 - IP & Innovation
  0.30,   // Card 1 - Power & Energy
  0.50,   // Card 2 - Oil & Gas
  0.65,   // Card 3 - Renewable Energy
  0.80,   // Card 4 - Dispute Resolution
  0.95,   // Card 5 - Banking & Finance
  1.10,   // Card 6 - Corporate & M&A
  1.25,   // Card 7 - Tech & Telecom
  1.40,   // Card 8 - Construction
  1.55,   // Card 9 - Nuclear & Regulatory
]

// Hardcoded skip section progress - scrolls past the entire section
// Adjust this value to fine-tune where the skip button scrolls to
const SKIP_SECTION_PROGRESS = 1.55

// Random vertical positions and rotations for visual variety
const cardVariations = [
  { top: '25%', rotation: -1.5 },
  { top: '60%', rotation: 2 },
  { top: '35%', rotation: -1.5 },
  { top: '70%', rotation: 2.5 },
  { top: '20%', rotation: -2 },
  { top: '55%', rotation: 3 },
  { top: '30%', rotation: -2.5 },
  { top: '65%', rotation: 1.5 },
  { top: '40%', rotation: -3 },
  { top: '50%', rotation: 2 },
]

// ============================================================
// PIN SPACING MULTIPLIER - Adjust this to change scroll distance
// Higher value = more scroll distance before section completes (slower)
// Lower value = less scroll distance (faster horizontal scroll)
// Try values: 1, 1.5, 2, 2.5, 3
// ============================================================
const PIN_SPACING_MULTIPLIER = 2

export default function PracticeAreasHorizontal() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Navigate to specific card using ScrollToPlugin
  const navigateToPanel = useCallback((panelIndex: number) => {
    const scrollTriggerInstance = ScrollTrigger.getAll().find(
      (st) => st.trigger === triggerRef.current
    )
    if (scrollTriggerInstance) {
      // Use hardcoded progress value for this card
      const progress = CARD_NAV_PROGRESS[panelIndex] ?? panelIndex / (practiceAreas.length - 1)

      const targetScroll =
        scrollTriggerInstance.start +
        (scrollTriggerInstance.end - scrollTriggerInstance.start) * progress

      // Uses ScrollToPlugin for smooth navigation
      gsap.to(window, {
        scrollTo: { y: targetScroll, autoKill: false },
        duration: 1.2,
        ease: 'power2.inOut',
      })
    }
  }, [])

  // Skip entire section
  const skipSection = useCallback(() => {
    const scrollTriggerInstance = ScrollTrigger.getAll().find(
      (st) => st.trigger === triggerRef.current
    )
    if (scrollTriggerInstance) {
      // Use hardcoded progress value to scroll past the section
      const targetScroll =
        scrollTriggerInstance.start +
        (scrollTriggerInstance.end - scrollTriggerInstance.start) * SKIP_SECTION_PROGRESS

      gsap.to(window, {
        scrollTo: { y: targetScroll, autoKill: false },
        duration: 1,
        ease: 'power2.inOut',
      })
    }
  }, [])

  // GSAP ScrollTrigger setup for horizontal scroll with pinning
  useLayoutEffect(() => {
    if (isMobile || !sectionRef.current || !scrollContainerRef.current || !triggerRef.current)
      return

    // Small delay to ensure ScrollSmoother is initialized
    const timeoutId = setTimeout(() => {
      const ctx = gsap.context(() => {
        const scrollContainer = scrollContainerRef.current!

        // Calculate scroll amount to move all cards so the last card can be centered
        // We account for CARD_INITIAL_OFFSET so the translation reaches the final card
        const getScrollAmount = () => {
          const vw = window.innerWidth / 100
          const totalCards = practiceAreas.length

          // position of the last card (in px)
          const lastCardPos = ((totalCards - 1) * CARD_SPACING + CARD_INITIAL_OFFSET) * vw

          // approximate center position of the right column (where cards should appear)
          const centerViewport = vw * 33

          // required movement to bring last card to centerViewport
          const requiredMove = lastCardPos - centerViewport

          // return negative value (translateX left)
          return -requiredMove
        }

        // Create the horizontal scroll animation
        const tween = gsap.to(scrollContainer, {
          x: getScrollAmount,
          ease: 'none',
        })

        // Create ScrollTrigger with pinning
        // pin: true uses transforms (works inside ScrollSmoother!)
        ScrollTrigger.create({
          trigger: triggerRef.current,
          start: 'top top',
          // ============================================================
          // END VALUE - Controls total scroll distance while pinned
          // Format: +=<pixels> means "pin for this many pixels of scrolling"
          // Adjust PIN_SPACING_MULTIPLIER above to change this
          // ============================================================
          end: () => `+=${Math.abs(getScrollAmount()) * PIN_SPACING_MULTIPLIER}`,
          pin: true,
          animation: tween,
          scrub: 1, // Smooth scrubbing (1 second lag) - try 0.5 for snappier, 2 for smoother
          invalidateOnRefresh: true,
          anticipatePin: 1,
          // pinType: 'transform' is auto-detected inside ScrollSmoother
          onUpdate: (self) => {
            const progress = self.progress
            const totalPanels = practiceAreas.length

            // Calculate which card is closest to the center of the viewport
            // Right column is 66.67% wide, center is at ~33vw from its left edge
            const vw = window.innerWidth / 100
            const scrollX = Math.abs(getScrollAmount() * progress)
            const centerViewport = vw * 33 // Center of right column (66.67vw / 2)

            // Each card is at (index * CARD_SPACING + CARD_INITIAL_OFFSET)vw
            // Find which card index is closest to centerViewport + scrollX
            // Only activate if within ACTIVATION_THRESHOLD
            const cardsPositions = practiceAreas.map((_, idx) => (idx * CARD_SPACING + CARD_INITIAL_OFFSET) * vw)
            const currentCenter = centerViewport + scrollX
            const thresholdPx = ACTIVATION_THRESHOLD * vw

            let closestIdx = -1 // -1 means no card is active
            let minDistance = Infinity

            for (let i = 0; i < cardsPositions.length; i++) {
              const distance = Math.abs(cardsPositions[i] - currentCenter)
              if (distance < minDistance && distance < thresholdPx) {
                minDistance = distance
                closestIdx = i
              }
            }

            setActiveIndex(closestIdx)
          },
        })

        // Refresh after setup to ensure measurements are correct
        ScrollTrigger.refresh()
      }, sectionRef)

      return () => ctx.revert()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === triggerRef.current) {
          st.kill()
        }
      })
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
    <section ref={sectionRef} className={styles.section}>
      <div ref={triggerRef} className={styles.pinContainer}>
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
                <ScrollRevealText
                  as="span"
                  className={styles.navTitle}
                  delay={index * 50}
                >
                  {area.shortTitle}
                </ScrollRevealText>
              </button>
            ))}
          </nav>
          <button className={styles.skipButton} onClick={skipSection}>
            <span>Skip Section</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3L8 13M8 13L12 9M8 13L4 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Right Column - Abstract Scattered Cards (2/3) */}
        <div className={styles.rightColumn}>
          <div ref={scrollContainerRef} className={styles.scrollContainer}>
            {/* Flowing curved lines - abstract background */}
            <svg className={styles.flowingLines} viewBox="0 0 2000 800" preserveAspectRatio="none">
              <path
                d="M-100,300 C200,250 400,400 700,350 C1000,300 1200,450 1500,400 C1800,350 2000,450 2200,400"
                fill="none"
                stroke="rgba(139, 111, 71, 0.15)"
                strokeWidth="2"
              />
              <path
                d="M-100,500 C300,450 500,550 800,500 C1100,450 1300,550 1600,500 C1900,450 2100,550 2300,500"
                fill="none"
                stroke="rgba(160, 130, 109, 0.12)"
                strokeWidth="1.5"
              />
              <path
                d="M-100,200 C150,180 350,250 600,200 C850,150 1050,280 1300,230 C1550,180 1750,280 2000,230"
                fill="none"
                stroke="rgba(212, 175, 55, 0.2)"
                strokeWidth="1"
              />
            </svg>

            {/* Large section heading - slides in from right */}
            <div className={styles.sectionHeading}>
              <span className={styles.headingLine}>Our</span>
              <span className={styles.headingLine}>Practice</span>
              <span className={styles.headingLine}>Areas</span>
            </div>

            {/* Practice area cards placed in sequential order with random vertical positions */}
            {practiceAreas.map((area, index) => {
              const isActive = activeIndex === index
              const isPast = index < activeIndex
              const isFuture = index > activeIndex
              const variation = cardVariations[index % cardVariations.length]

              // Calculate horizontal position: each card at index * CARD_SPACING
              const leftPosition = `${index * CARD_SPACING + CARD_INITIAL_OFFSET}vw`

              return (
                <article
                  key={area.id}
                  className={`${styles.card} ${styles.large} ${isActive ? styles.cardActive : ''} ${isPast ? styles.cardPast : ''} ${isFuture ? styles.cardFuture : ''}`}
                  style={{
                    '--card-top': variation.top,
                    '--card-left': leftPosition,
                    '--card-rotation': `${variation.rotation}deg`,
                  } as React.CSSProperties}
                >
                  <span className={styles.cardLabel}>{area.tagline}</span>
                  <h3 className={styles.cardTitle}>{area.shortTitle}</h3>
                  <p className={styles.cardDescription}>{area.description}</p>
                </article>
              )
            })}

            {/* Signature quotes scattered in the layout */}
            <div className={styles.quoteBlock} style={{ '--quote-top': '15%', '--quote-left': '290vw' } as React.CSSProperties}>
              <ScrollRevealText as="p" className={styles.quoteText} delay={0}>
                Excellence in legal practice demands both precision and vision.
              </ScrollRevealText>
              <ScrollRevealText as="span" className={styles.quoteSignature} delay={200}>
                AR&CO
              </ScrollRevealText>
            </div>

            <div className={styles.quoteBlock} style={{ '--quote-top': '75%', '--quote-left': '590vw' } as React.CSSProperties}>
              <ScrollRevealText as="p" className={styles.quoteText} delay={0}>
                Where complex matters meet strategic solutions.
              </ScrollRevealText>
              <ScrollRevealText as="span" className={styles.quoteSignature} delay={200}>
                AR&CO
              </ScrollRevealText>
            </div>

            <div className={styles.quoteBlock} style={{ '--quote-top': '20%', '--quote-left': '850vw' } as React.CSSProperties}>
              <ScrollRevealText as="p" className={styles.quoteText} delay={0}>
                Trusted advisors to industry leaders.
              </ScrollRevealText>
              <ScrollRevealText as="span" className={styles.quoteSignature} delay={200}>
                AR&CO
              </ScrollRevealText>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
