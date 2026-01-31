'use client'

import { useRef, useState, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { practiceAreas, type PracticeArea, type KeyPersonnel } from './practiceAreasData'
import styles from './page.module.css'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Personnel Card Component
function PersonnelCard({
  person,
}: {
  person: KeyPersonnel
}) {
  return (
    <div className={styles.personnelCard}>
      <h4 className={styles.personnelName}>{person.name}</h4>
      <p className={styles.personnelRole}>{person.role}</p>
      <p className={styles.personnelExpertise}>{person.expertise}</p>
    </div>
  )
}

// Practice Section Component
function PracticeSection({
  area,
  index,
}: {
  area: PracticeArea
  index: number
}) {
  return (
    <section
      id={`section-${area.slug}`}
      className={styles.section}
      data-section-index={index}
      data-section-title={area.title}
    >
      {/* Left Column - Personnel */}
      <div className={styles.leftColumn}>
        <motion.span
          className={styles.personnelLabel}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          Key Personnel
        </motion.span>
        <motion.div
          className={styles.personnelList}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {area.keyPersonnel.length > 0 ? (
            area.keyPersonnel.map((person) => (
              <PersonnelCard
                key={person.name}
                person={person}
              />
            ))
          ) : (
            <p className={styles.noPersonnel}>Contact us for more information</p>
          )}
        </motion.div>
      </div>

      {/* Right Column - Content */}
      <div className={styles.rightColumn}>
        {/* Overview */}
        <motion.div
          className={styles.overview}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <span className={styles.sectionLabel}>Practice Overview</span>
          <p className={styles.overviewText}>{area.overview}</p>
        </motion.div>

        {/* Services */}
        {area.services && area.services.length > 0 && (
          <motion.div
            className={styles.services}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <span className={styles.sectionLabel}>Services & Expertise</span>
            <ul className={styles.servicesList}>
              {area.services.map((service, serviceIndex) => (
                <li key={serviceIndex} className={styles.serviceItem}>
                  {service}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Past Cases */}
        {area.pastCases && area.pastCases.length > 0 && (
          <motion.div
            className={styles.cases}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.5,
              delay: 0.15,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <span className={styles.sectionLabel}>Notable Cases & Work</span>
            <ul className={styles.casesList}>
              {area.pastCases.map((caseItem, caseIndex) => (
                <li key={caseIndex} className={styles.caseItem}>
                  {caseItem}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Client Portfolio */}
        {area.clientPortfolio && area.clientPortfolio.length > 0 && (
          <motion.div
            className={styles.clients}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <span className={styles.sectionLabel}>Client Portfolio</span>
            <ul className={styles.clientsList}>
              {area.clientPortfolio.map((client, clientIndex) => (
                <li key={clientIndex} className={styles.clientItem}>
                  {client}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  )
}

// Main Page Component
export default function PracticeAreasPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentTitle, setCurrentTitle] = useState('Practice Areas')
  const currentTitleRef = useRef('Practice Areas')
  const currentIndexRef = useRef(-1)
  const isAnimatingRef = useRef(false)

  // Animate title change with GSAP - uses refs to avoid stale closures
  const animateTitle = (newTitle: string) => {
    if (isAnimatingRef.current || !titleRef.current) return
    if (currentTitleRef.current === newTitle) return

    isAnimatingRef.current = true
    currentTitleRef.current = newTitle

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false
      },
    })

    tl.to(titleRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentTitle(newTitle)
      },
    }).to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  // Set up GSAP pinning and scroll triggers
  useLayoutEffect(() => {
    if (!titleContainerRef.current || !contentRef.current || !containerRef.current) return

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Pin the title container
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: titleContainerRef.current,
          pinSpacing: false,
        })

        // Create scroll triggers for each section
        practiceAreas.forEach((area, index) => {
          const sectionEl = document.getElementById(`section-${area.slug}`)
          if (!sectionEl) return

          ScrollTrigger.create({
            trigger: sectionEl,
            start: 'top 40%',
            end: 'bottom 40%',
            onEnter: () => {
              if (currentIndexRef.current !== index) {
                currentIndexRef.current = index
                animateTitle(area.title)
              }
            },
            onEnterBack: () => {
              if (currentIndexRef.current !== index) {
                currentIndexRef.current = index
                animateTitle(area.title)
              }
            },
          })
        })

        // Reset to "Practice Areas" when scrolling back to top
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: '200px top',
          onEnterBack: () => {
            if (currentIndexRef.current !== -1) {
              currentIndexRef.current = -1
              animateTitle('Practice Areas')
            }
          },
        })

        // Refresh after setup
        ScrollTrigger.refresh()
      }, containerRef)

      return () => ctx.revert()
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div ref={containerRef} className={styles.pageContainer}>
      {/* Fixed Title Header - Pinned by GSAP */}
      <div ref={titleContainerRef} className={styles.titleContainer}>
        <div className={styles.titleWrapper}>
          <h1 ref={titleRef} className={styles.pageTitle}>
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Hero Spacer - Empty space at top showing only title */}
      <div className={styles.heroSpacer} />

      {/* Scrollable Content */}
      <div ref={contentRef} className={styles.contentContainer}>
        {practiceAreas.map((area, index) => (
          <PracticeSection key={area.id} area={area} index={index} />
        ))}
      </div>
    </div>
  )
}
