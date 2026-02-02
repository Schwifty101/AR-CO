'use client'

import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { practiceAreas, type PracticeArea, type KeyPersonnel } from './practiceAreasData'
import { setMediumScroll, setNormalScroll, pauseScroll, resumeScroll } from '@/components/SmoothScroll'
import styles from './page.module.css'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
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
  const expandedMenuRef = useRef<HTMLDivElement>(null)
  const menuScrollRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const [currentTitle, setCurrentTitle] = useState('Practice Areas')
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const currentTitleRef = useRef('Practice Areas')
  const currentIndexRef = useRef(-1)
  const isAnimatingRef = useRef(false)
  const menuAnimationRef = useRef<gsap.core.Timeline | null>(null)

  // Set medium scroll for this page and cleanup animations on unmount
  useEffect(() => {
    setMediumScroll()
    return () => {
      setNormalScroll()
      // Cleanup menu animation on unmount
      if (menuAnimationRef.current) {
        menuAnimationRef.current.kill()
      }
      // Resume ScrollSmoother and re-enable body scroll on unmount
      resumeScroll()
      document.body.style.overflow = ''
    }
  }, [])

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

  // Toggle expanded menu with GSAP animation
  const toggleMenu = () => {
    if (!expandedMenuRef.current) return

    // Kill any ongoing menu animation
    if (menuAnimationRef.current) {
      menuAnimationRef.current.kill()
    }

    const menu = expandedMenuRef.current
    const menuItems = menuItemsRef.current.filter(Boolean)

    if (!isMenuExpanded) {
      // Opening the menu
      setIsMenuExpanded(true)
      menu.classList.add(styles.open)
      // Pause ScrollSmoother and prevent body scroll when menu is open
      pauseScroll()
      document.body.style.overflow = 'hidden'

      menuAnimationRef.current = gsap.timeline()

      // Animate menu container
      menuAnimationRef.current.to(menu, {
        maxHeight: '60vh',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
      })

      // Stagger animate menu items
      menuAnimationRef.current.fromTo(
        menuItems,
        { opacity: 0, y: 20 },
        {
          opacity: 0.7,
          y: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.out',
        },
        '-=0.2'
      )
    } else {
      // Closing the menu
      menuAnimationRef.current = gsap.timeline({
        onComplete: () => {
          setIsMenuExpanded(false)
          menu.classList.remove(styles.open)
          // Resume ScrollSmoother and re-enable body scroll
          resumeScroll()
          document.body.style.overflow = ''
          // Refresh ScrollTrigger after menu closes
          ScrollTrigger.refresh()
        },
      })

      // Stagger animate menu items out
      menuAnimationRef.current.to(menuItems.reverse(), {
        opacity: 0,
        y: -10,
        duration: 0.2,
        stagger: 0.03,
        ease: 'power2.in',
      })

      // Animate menu container
      menuAnimationRef.current.to(
        menu,
        {
          maxHeight: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in',
        },
        '-=0.1'
      )
    }
  }

  // Handle clicking on a practice area in the menu
  const handleMenuItemClick = (slug: string, title: string) => {
    const sectionEl = document.getElementById(`section-${slug}`)
    if (!sectionEl) return

    // Close the menu first
    if (expandedMenuRef.current) {
      const menu = expandedMenuRef.current
      const menuItems = menuItemsRef.current.filter(Boolean)

      // Kill any ongoing animation
      if (menuAnimationRef.current) {
        menuAnimationRef.current.kill()
      }

      menuAnimationRef.current = gsap.timeline({
        onComplete: () => {
          setIsMenuExpanded(false)
          menu.classList.remove(styles.open)
          // Resume ScrollSmoother and re-enable body scroll
          resumeScroll()
          document.body.style.overflow = ''

          // Update the title to the selected practice area
          const areaIndex = practiceAreas.findIndex((a) => a.slug === slug)
          if (areaIndex !== -1) {
            currentIndexRef.current = areaIndex
            currentTitleRef.current = title
            setCurrentTitle(title)
          }

          // Use GSAP scrollTo for smooth scrolling that works with ScrollTrigger
          // Calculate offset to account for pinned header
          const headerOffset = titleContainerRef.current?.offsetHeight || 0
          const sectionTop = sectionEl.getBoundingClientRect().top + window.scrollY - headerOffset

          gsap.to(window, {
            scrollTo: {
              y: sectionTop,
              autoKill: false,
            },
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
              // Refresh ScrollTrigger after scroll completes
              ScrollTrigger.refresh()
            },
          })
        },
      })

      // Animate menu closing
      menuAnimationRef.current.to(menuItems, {
        opacity: 0,
        y: -10,
        duration: 0.15,
        stagger: 0.02,
        ease: 'power2.in',
      })

      menuAnimationRef.current.to(
        menu,
        {
          maxHeight: 0,
          opacity: 0,
          duration: 0.25,
          ease: 'power3.in',
        },
        '-=0.1'
      )
    }
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
          invalidateOnRefresh: true,
        })

        // Create scroll triggers for each section
        practiceAreas.forEach((area, index) => {
          const sectionEl = document.getElementById(`section-${area.slug}`)
          if (!sectionEl) return

          ScrollTrigger.create({
            trigger: sectionEl,
            start: 'top 40%',
            end: 'bottom 40%',
            invalidateOnRefresh: true,
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
          invalidateOnRefresh: true,
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
    <div ref={containerRef} className={styles.pageContainer} data-page-theme="light">
      {/* Fixed Title Header - Pinned by GSAP */}
      <div ref={titleContainerRef} className={styles.titleContainer}>
        <div className={`${styles.titleWrapper} ${isMenuExpanded ? styles.menuOpen : ''}`}>
          {/* Title Row with heading and View All button */}
          <div className={styles.titleRow}>
            <h1 ref={titleRef} className={styles.pageTitle}>
              {currentTitle}
            </h1>
            <button
              className={`${styles.viewAllButton} ${isMenuExpanded ? styles.expanded : ''}`}
              onClick={toggleMenu}
              aria-expanded={isMenuExpanded}
              aria-controls="practice-areas-menu"
            >
              View All
              <svg
                className={styles.viewAllIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Expanded Menu */}
          <div
            ref={expandedMenuRef}
            id="practice-areas-menu"
            className={styles.expandedMenu}
            role="menu"
            aria-hidden={!isMenuExpanded}
          >
            <div
              ref={menuScrollRef}
              className={styles.menuScrollContainer}
              onWheel={(e) => {
                // Prevent scroll from propagating to body when menu is open
                if (!isMenuExpanded || !menuScrollRef.current) return

                const { scrollTop, scrollHeight, clientHeight } = menuScrollRef.current
                const isAtTop = scrollTop === 0
                const isAtBottom = scrollTop + clientHeight >= scrollHeight

                // Prevent scroll propagation when not at boundaries, or at boundaries scrolling the wrong way
                if (e.deltaY < 0 && isAtTop) {
                  e.preventDefault()
                } else if (e.deltaY > 0 && isAtBottom) {
                  e.preventDefault()
                }
                e.stopPropagation()
              }}
            >
              {practiceAreas.map((area, index) => (
                <button
                  key={area.id}
                  ref={(el) => { menuItemsRef.current[index] = el }}
                  className={styles.menuItem}
                  onClick={() => handleMenuItemClick(area.slug, area.title)}
                  role="menuitem"
                  tabIndex={isMenuExpanded ? 0 : -1}
                >
                  {area.title}
                </button>
              ))}
            </div>
          </div>
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
