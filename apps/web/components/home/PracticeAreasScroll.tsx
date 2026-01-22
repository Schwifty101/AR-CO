'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import ScrollRevealText from '@/components/shared/animations/ScrollRevealText'
import styles from './PracticeAreasScroll.module.css'

interface PracticeArea {
  id: number
  title: string
  description: string
  image: string
}

const practiceAreas: PracticeArea[] = [
  {
    id: 1,
    title: 'Intellectual Property & Innovation Protection',
    description: 'Protecting Ideas That Define Businesses. From trademarks and patents to copyrights and global IP enforcement, our Islamabad office stands at the forefront of intellectual property law in Pakistan. We provide end-to-end protection — from creation and registration to cross-border enforcement — helping innovators secure, defend, and commercialize their intellectual assets across South Asia, the Middle East, and Europe.',
    image: '/practic-areas/intellectual_property.jpg',
  },
  {
    id: 2,
    title: 'Power Generation & Energy Regulation',
    description: 'Regulating Power. Shaping the Energy Market. With senior leadership experience at NEPRA, our firm advises at the very heart of Pakistan\'s power sector. We guide generation and distribution projects through licensing, regulatory frameworks, and tariff structures — ensuring compliance while enabling market-driven growth in the national energy landscape.',
    image: '/practic-areas/power_generation.jpg',
  },
  {
    id: 3,
    title: 'Petroleum, Oil, Gas & LNG Infrastructure',
    description: 'Legal Precision for High-Value Energy Projects. We are pioneers in Pakistan\'s oil, gas, and LNG sector, advising on licensing, concessions, fuel supply agreements, and large-scale infrastructure projects. From upstream exploration to downstream distribution, we provide strategic legal support that drives energy security and investment confidence.',
    image: '/practic-areas/petroleum.jpg',
  },
  {
    id: 4,
    title: 'Renewable Energy & Environmental Law',
    description: 'Powering the Future Responsibly. As Pakistan\'s leading renewable energy and environmental law firm, we advise on clean energy projects, carbon financing, and climate compliance frameworks. Our expertise bridges global environmental commitments with commercially viable energy solutions.',
    image: '/practic-areas/renewable_energy.jpg',
  },
  {
    id: 5,
    title: 'Arbitration, Litigation & Dispute Resolution',
    description: 'Where Complex Disputes Meet Strategic Resolution. We represent clients in high-value domestic and international arbitrations, litigation, and FIDIC-based disputes. Our lawyers combine courtroom strength with negotiation expertise — resolving conflicts while protecting commercial interests.',
    image: '/practic-areas/arbitration.jpg',
  },
  {
    id: 6,
    title: 'Banking, Finance & Corporate Funding',
    description: 'Legal Strength Behind Financial Decisions. Our banking and finance practice supports financial institutions, corporations, and investors across lending, restructuring, Islamic finance, and securities regulation. We deliver legally sound, commercially practical solutions in complex financial environments.',
    image: '/practic-areas/banking.jpg',
  },
  {
    id: 7,
    title: 'Corporate, M&A & Commercial Structuring',
    description: 'Structuring Growth. Securing Value. From incorporations to mergers, acquisitions, and joint ventures, we advise businesses at every stage of their lifecycle. Our corporate team delivers strategic structuring, regulatory compliance, and deal execution for local and international enterprises.',
    image: '/practic-areas/corporate.jpg',
  },
  {
    id: 8,
    title: 'Technology, Telecom & Media Law',
    description: 'Law for a Connected World. We advise telecom operators, technology companies, and media entities on licensing, regulatory compliance, and digital operations. Our work bridges law and innovation in Pakistan\'s most dynamic sectors.',
    image: '/practic-areas/telecom.jpg',
  },
  {
    id: 9,
    title: 'Construction, Infrastructure & Real Estate',
    description: 'Building Projects. Managing Risk. Delivering Certainty. Our construction and real estate practice supports projects from concept to completion — advising developers, investors, and contractors on financing, compliance, EPC contracts, and dispute resolution.',
    image: '/practic-areas/construction.jpg',
  },
  {
    id: 10,
    title: 'Public International, Nuclear & Regulatory Law',
    description: 'Law at the Intersection of State, Strategy & Security. We are among Pakistan\'s few firms advising on nuclear licensing, public international law, extradition, and state liability matters. Our work supports governments, regulators, and international stakeholders in highly sensitive legal frameworks.',
    image: '/practic-areas/nuclear.jpg',
  },
]

export default function PracticeAreasScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrollLocked, setIsScrollLocked] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollLockPositionRef = useRef(0)

  const navigateToPanel = (panelIndex: number) => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const totalScrollableHeight = rect.height - viewportHeight
    
    // Calculate target scroll position
    const targetProgress = panelIndex / practiceAreas.length
    const targetScroll = container.offsetTop + (totalScrollableHeight * targetProgress)
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    })
  }

  const skipSection = () => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const targetScroll = container.offsetTop + container.offsetHeight
    
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
      
      // Section starts when it enters viewport and ends when it leaves
      const sectionStart = rect.top
      const sectionEnd = rect.bottom
      
      // Activate when section top reaches top of viewport
      // Deactivate when section bottom leaves viewport
      const shouldBeActive = sectionStart <= 0 && sectionEnd > viewportHeight

      if (shouldBeActive) {
        if (!isScrollLocked) {
          setIsScrollLocked(true)
        }

        // Calculate progress through the section
        // Progress from 0 (section just entered) to 1 (section about to leave)
        const totalScrollableHeight = rect.height - viewportHeight
        const scrolledIntoSection = -sectionStart
        const rawProgress = scrolledIntoSection / totalScrollableHeight
        const progress = Math.min(Math.max(rawProgress, 0), 1)
        
        setScrollProgress(progress)
        setActiveIndex(Math.min(
          Math.floor(progress * totalPanels),
          totalPanels - 1
        ))
        
        // Apply horizontal transform
        const maxScroll = (totalPanels - 1) * window.innerWidth
        const translateX = -progress * maxScroll
        scrollContainer.style.transform = `translateX(${translateX}px)`
      } else {
        if (isScrollLocked) {
          setIsScrollLocked(false)
        }
      }
    }

    const throttledScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      animationFrameId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isScrollLocked, isMobile])

  // Calculate parallax values for each panel
  const getParallaxValues = (index: number) => {
    const totalPanels = practiceAreas.length
    const currentProgress = scrollProgress * totalPanels
    const panelProgress = currentProgress - index
    
    // Text parallax (slower, 60-70% speed)
    const textX = panelProgress * -30 // Subtle horizontal movement
    const textY = Math.sin(panelProgress * Math.PI) * 20 // Subtle vertical drift
    
    // Keep content visible - different thresholds for different panel positions
    let textOpacity = 1
    const absProgress = Math.abs(panelProgress)
    
    if (index >= 8) {
      // Last 2 panels: stay at full opacity until extremely far away
      if (absProgress > 0.9) {
        textOpacity = Math.max(0, 1 - (absProgress - 0.9) * 3)
      }
    } else if (index > 6) {
      // Panel 7-8: stay at full opacity until very far away
      if (absProgress > 0.8) {
        textOpacity = Math.max(0, 1 - (absProgress - 0.8) * 2)
      }
    } else {
      // Earlier panels: start fading after 0.6
      if (absProgress > 0.6) {
        textOpacity = Math.max(0, 1 - (absProgress - 0.6) * 1.5)
      }
    }
    
    // Image parallax (horizontal movement within container)
    // Move left when approaching, right when leaving
    const imageX = -panelProgress * 15 // Horizontal parallax movement percentage
    const imageScale = 1.0 + Math.abs(panelProgress) * 0.05 // Slight scale for depth
    
    return {
      text: {
        transform: `translate(${textX}px, ${textY}px)`,
        opacity: textOpacity,
      },
      image: {
        transform: `translateX(${imageX}%)`,
      },
      isActive: Math.abs(panelProgress) < 0.8,
    }
  }

  if (isMobile) {
    // Mobile: Vertical stacking with simple animations
    return (
      <section className={styles.mobileSection}>
        <div className={styles.mobileContainer}>
          {practiceAreas.map((area) => (
            <div key={area.id} className={styles.mobilePanel}>
              <div className={styles.mobileContent}>
                <ScrollRevealText as="h2" className={styles.mobileTitle} delay={1000}>
                  {area.title}
                </ScrollRevealText>
                <ScrollRevealText as="p" className={styles.mobileDescription} delay={350}>
                  {area.description}
                </ScrollRevealText>
              </div>
              <div className={styles.mobileImageContainer}>
                <Image
                  src={area.image}
                  alt={area.title}
                  fill
                  className={styles.mobileImage}
                  sizes="100vw"
                />
                <div className={styles.mobileImageOverlay} />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div ref={containerRef} className={styles.wrapper}>
      {/* Navigation Sidebar - Outside section to avoid overflow clipping */}
      {!isMobile && (
        <div className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <div className={styles.sidebarNav}>
              {practiceAreas.map((area, index) => (
                <button
                  key={area.id}
                  className={`${styles.sidebarItem} ${activeIndex === index ? styles.sidebarItemActive : ''}`}
                  onClick={() => navigateToPanel(index)}
                  title={area.title}
                >
                  <span className={styles.sidebarNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.sidebarTitle}>{area.title}</span>
                </button>
              ))}
            </div>
            <button className={styles.skipButton} onClick={skipSection}>
              Skip Section
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3L8 13M8 13L12 9M8 13L4 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <section className={styles.section}>
        <div ref={scrollContainerRef} className={styles.scrollContainer}>
        {practiceAreas.map((area, index) => {
          const parallax = getParallaxValues(index)
          
          return (
            <div key={area.id} className={styles.panel}>
              {/* Left Side - Content */}
              <div 
                className={styles.content}
                style={parallax.text}
              >
                <div className={styles.contentInner}>
                  <ScrollRevealText 
                    as="h1" 
                    className={`${styles.title} ${parallax.isActive ? styles.active : ''}`}
                    delay={200}
                  >
                    {area.title}
                  </ScrollRevealText>
                  <ScrollRevealText 
                    as="p" 
                    className={`${styles.description} ${parallax.isActive ? styles.active : ''}`}
                    delay={400}
                  >
                    {area.description}
                  </ScrollRevealText>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className={styles.imageContainer}>
                <div className={styles.imageWrapper}>
                  <div 
                    className={styles.imageInner}
                    style={parallax.image}
                  >
                    <Image
                      src={area.image}
                      alt={area.title}
                      fill
                      className={styles.image}
                      sizes="80vw"
                      priority={index < 2}
                    />
                  </div>
                  <div className={styles.imageOverlay} />
                </div>
              </div>
            </div>
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
  )
}
