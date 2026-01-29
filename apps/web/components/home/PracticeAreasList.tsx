'use client'

import { useEffect, useRef, useState } from 'react'
import ScrollRevealText from '@/components/shared/animations/ScrollRevealText'
import styles from './PracticeAreasList.module.css'

interface PracticeArea {
  id: number
  title: string
  shortTitle: string
  description: string
}

const practiceAreas: PracticeArea[] = [
  {
    id: 1,
    title: 'Intellectual Property & Innovation Protection',
    shortTitle: 'IP & Innovation',
    description: 'Protecting Ideas That Define Businesses. From trademarks and patents to copyrights and global IP enforcement, our Islamabad office stands at the forefront of intellectual property law in Pakistan. We provide end-to-end protection — from creation and registration to cross-border enforcement — helping innovators secure, defend, and commercialize their intellectual assets across South Asia, the Middle East, and Europe.',
  },
  {
    id: 2,
    title: 'Power Generation & Energy Regulation',
    shortTitle: 'Power & Energy',
    description: 'Regulating Power. Shaping the Energy Market. With senior leadership experience at NEPRA, our firm advises at the very heart of Pakistan\'s power sector. We guide generation and distribution projects through licensing, regulatory frameworks, and tariff structures — ensuring compliance while enabling market-driven growth in the national energy landscape.',
  },
  {
    id: 3,
    title: 'Petroleum, Oil, Gas & LNG Infrastructure',
    shortTitle: 'Oil & Gas',
    description: 'Legal Precision for High-Value Energy Projects. We are pioneers in Pakistan\'s oil, gas, and LNG sector, advising on licensing, concessions, fuel supply agreements, and large-scale infrastructure projects. From upstream exploration to downstream distribution, we provide strategic legal support that drives energy security and investment confidence.',
  },
  {
    id: 4,
    title: 'Renewable Energy & Environmental Law',
    shortTitle: 'Renewable Energy',
    description: 'Powering the Future Responsibly. As Pakistan\'s leading renewable energy and environmental law firm, we advise on clean energy projects, carbon financing, and climate compliance frameworks. Our expertise bridges global environmental commitments with commercially viable energy solutions.',
  },
  {
    id: 5,
    title: 'Arbitration, Litigation & Dispute Resolution',
    shortTitle: 'Dispute Resolution',
    description: 'Where Complex Disputes Meet Strategic Resolution. We represent clients in high-value domestic and international arbitrations, litigation, and FIDIC-based disputes. Our lawyers combine courtroom strength with negotiation expertise — resolving conflicts while protecting commercial interests.',
  },
  {
    id: 6,
    title: 'Banking, Finance & Corporate Funding',
    shortTitle: 'Banking & Finance',
    description: 'Legal Strength Behind Financial Decisions. Our banking and finance practice supports financial institutions, corporations, and investors across lending, restructuring, Islamic finance, and securities regulation. We deliver legally sound, commercially practical solutions in complex financial environments.',
  },
  {
    id: 7,
    title: 'Corporate, M&A & Commercial Structuring',
    shortTitle: 'Corporate & M&A',
    description: 'Structuring Growth. Securing Value. From incorporations to mergers, acquisitions, and joint ventures, we advise businesses at every stage of their lifecycle. Our corporate team delivers strategic structuring, regulatory compliance, and deal execution for local and international enterprises.',
  },
  {
    id: 8,
    title: 'Technology, Telecom & Media Law',
    shortTitle: 'Tech & Telecom',
    description: 'Law for a Connected World. We advise telecom operators, technology companies, and media entities on licensing, regulatory compliance, and digital operations. Our work bridges law and innovation in Pakistan\'s most dynamic sectors.',
  },
  {
    id: 9,
    title: 'Construction, Infrastructure & Real Estate',
    shortTitle: 'Construction',
    description: 'Building Projects. Managing Risk. Delivering Certainty. Our construction and real estate practice supports projects from concept to completion — advising developers, investors, and contractors on financing, compliance, EPC contracts, and dispute resolution.',
  },
  {
    id: 10,
    title: 'Public International, Nuclear & Regulatory Law',
    shortTitle: 'Nuclear',
    description: 'Law at the Intersection of State, Strategy & Security. We are among Pakistan\'s few firms advising on nuclear licensing, public international law, extradition, and state liability matters. Our work supports governments, regulators, and international stakeholders in highly sensitive legal frameworks.',
  },
]

export default function PracticeAreasList() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const navigateToPanel = (panelIndex: number) => {
    if (!containerRef.current || !scrollContainerRef.current) return

    const container = containerRef.current
    const scrollContainer = scrollContainerRef.current
    const viewportHeight = window.innerHeight

    // To make panelIndex the active (rightmost visible) panel, we show (panelIndex-1, panelIndex)
    // For the first panel (index 0), we show (0, 1) with panel 0 as active
    const maxFirstPanelIndex = practiceAreas.length - 2
    // Use panelIndex directly as the target first visible panel position
    // This makes the clicked panel appear as the leftmost visible panel
    const targetFirstPanelIndex = Math.max(0, Math.min(panelIndex, maxFirstPanelIndex))

    // Match the same panel-width based logic used in scroll updates
    const firstPanel = scrollContainer.firstElementChild as HTMLElement | null
    const panelWidth = firstPanel?.offsetWidth || window.innerWidth * 0.70 / 2
    const maxScroll = maxFirstPanelIndex * panelWidth
    const targetTranslateX = -(targetFirstPanelIndex * panelWidth)
    const targetProgress = maxScroll === 0 ? 0 : Math.min(Math.max(-targetTranslateX / maxScroll, 0), 1)

    // Get the container's absolute position in the document using getBoundingClientRect
    const containerRect = container.getBoundingClientRect()
    const containerTop = containerRect.top + window.scrollY
    const containerHeight = container.offsetHeight
    const scrollableHeight = containerHeight - viewportHeight

    // Calculate absolute scroll position
    const targetScroll = containerTop + (scrollableHeight * targetProgress)

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    })
  }

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

    const totalPanels = practiceAreas.length
    let animationFrameId: number

    const handleScroll = () => {
      if (!containerRef.current || !scrollContainerRef.current) return

      const container = containerRef.current
      const scrollContainer = scrollContainerRef.current
      const rect = container.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      const sectionStart = rect.top
      const sectionEnd = rect.bottom
      
      // Smooth easing function for entrance animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
      
      // Calculate entrance progress (0 = just starting to enter, 1 = fully entered/sticky)
      // This happens during the first viewport height of scrolling into the section
      if (sectionStart > 0 && sectionStart < viewportHeight) {
        // Section is entering the viewport from below
        const entranceRaw = 1 - (sectionStart / viewportHeight)
        const entranceClamped = Math.min(Math.max(entranceRaw, 0), 1)
        const entranceEased = easeOutCubic(entranceClamped)

        // Apply entrance animation - panels slide in from right with easing
        const maxEntranceOffset = window.innerWidth * 1.0 // Start from 100% off-screen right
        const entranceOffset = (1 - entranceEased) * maxEntranceOffset
        scrollContainer.style.transform = `translateX(${entranceOffset}px)`
        setScrollProgress(0)
        setActiveIndex(0)
      } else if (sectionStart <= 0 && sectionEnd > viewportHeight) {
        // Section is fully in view and sticky - normal horizontal scrolling
        
        const totalScrollableHeight = rect.height - viewportHeight
        const scrolledIntoSection = -sectionStart
        const rawProgress = scrolledIntoSection / totalScrollableHeight
        const progress = Math.min(Math.max(rawProgress, 0), 1)
        
        setScrollProgress(progress)
        
        // Apply horizontal transform using actual panel width
        const maxFirstPanelIndex = totalPanels - 2 // 8 for 10 panels
        const firstPanel = scrollContainer.firstElementChild as HTMLElement | null
        const panelWidth = firstPanel?.offsetWidth || window.innerWidth * 0.70 / 2
        const maxScroll = maxFirstPanelIndex * panelWidth // last view shows last 2 panels
        const translateX = -progress * maxScroll
        scrollContainer.style.transform = `translateX(${translateX}px)`

        // Calculate active index from the real horizontal position (rightmost visible panel)
        const firstVisiblePanel = Math.min(
          Math.max(-translateX / panelWidth, 0),
          maxFirstPanelIndex
        )
        const activeIdx = Math.floor(firstVisiblePanel) + 1
        setActiveIndex(Math.min(activeIdx, totalPanels - 1))
      } else if (sectionStart >= viewportHeight) {
        // Section is below viewport - reset to initial state (off-screen right)
        setScrollProgress(0)
        setActiveIndex(0)
        scrollContainer.style.transform = `translateX(${window.innerWidth * 1.0}px)`
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

  // Calculate parallax values for each panel
  const getParallaxValues = (index: number) => {
    const totalPanels = practiceAreas.length
    const currentProgress = scrollProgress * totalPanels
    const panelProgress = currentProgress - index
    
    // Text parallax (slower, 60-70% speed)
    const textX = panelProgress * -30 // Subtle horizontal movement
    const textY = Math.sin(panelProgress * Math.PI) * 20 // Subtle vertical drift
    
    // Keep content visible much longer - only fade when very far away
    let textOpacity = 1
    const absProgress = Math.abs(panelProgress)
    
    // Only start fading after 1.2 distance (well off screen)
    if (absProgress > 1.2) {
      textOpacity = Math.max(0.3, 1 - (absProgress - 1.2) * 0.8)
    }
    
    return {
      text: {
        transform: `translate(${textX}px, ${textY}px)`,
        opacity: textOpacity,
      },
      isActive: Math.abs(panelProgress) < 1.0,
    }
  }

  const skipSection = () => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const containerBottom = containerRect.bottom + window.scrollY
    
    window.scrollTo({
      top: containerBottom,
      behavior: 'smooth'
    })
  }

  if (isMobile) {
    return (
      <section className={styles.mobileSection}>
        <div className={styles.mobileContainer}>
          {practiceAreas.map((area) => (
            <article key={area.id} className={styles.mobileCard}>
              <h3 className={styles.mobileTitle}>{area.title}</h3>
              <p className={styles.mobileDescription}>{area.description}</p>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className={styles.outerWrapper}>
    <div className={styles.container}>
      {/* Fixed Sidebar - Completely Separate */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <ScrollRevealText as="h2" className={styles.sidebarTitle} delay={100}>
            Practice Areas
          </ScrollRevealText>
          <nav className={styles.sidebarNav}>
            {practiceAreas.map((area, index) => (
              <button
                key={area.id}
                className={`${styles.sidebarItem} ${activeIndex === index ? styles.sidebarItemActive : ''}`}
                onClick={() => navigateToPanel(index)}
              >
                <ScrollRevealText as="span" className={styles.sidebarLabel} delay={150 + index * 50}>
                  {area.shortTitle}
                </ScrollRevealText>
              </button>
            ))}
          </nav>
          <button className={styles.skipButton} onClick={skipSection}>
            Skip Section
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Horizontal Scroll */}
      <div ref={containerRef} className={styles.wrapper}>
        <section className={styles.section}>
          <div ref={scrollContainerRef} className={styles.scrollContainer}>
            {practiceAreas.map((area, index) => {
              const parallax = getParallaxValues(index)
              const isActive = activeIndex === index
              
              return (
                <article key={area.id} className={`${styles.panel} ${isActive ? styles.panelActive : styles.panelDull}`}>
                  <div 
                    className={styles.panelContent}
                    style={parallax.text}
                  >
                    <ScrollRevealText 
                      as="span" 
                      className={`${styles.panelNumber} ${parallax.isActive ? styles.active : ''}`}
                      delay={100}
                    >
                      {String(area.id).padStart(2, '0')}
                    </ScrollRevealText>
                    <ScrollRevealText 
                      as="h1" 
                      className={`${styles.panelTitle} ${parallax.isActive ? styles.active : ''}`}
                      delay={200}
                    >
                      {area.title}
                    </ScrollRevealText>
                    <ScrollRevealText 
                      as="p" 
                      className={`${styles.panelDescription} ${parallax.isActive ? styles.active : ''}`}
                      delay={400}
                    >
                      {area.description}
                    </ScrollRevealText>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Progress indicator */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {activeIndex + 1} / {practiceAreas.length}
            </div>
          </div>
        </section>
      </div>
    </div>
    </div>
  )
}
