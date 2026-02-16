'use client'

import { notFound } from 'next/navigation'
import { use, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { practiceAreas } from '../practiceAreasData'
import ScrollRevealText from '@/components/shared/animations/ScrollRevealText'
import DotGrid from '@/components/shared/animations/DotsBackground'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface PracticeAreaPageProps {
  params: Promise<{ slug: string }>
}

/**
 * KeyPersonnelSection Component - Interactive hover layout
 * Shows names on left, reveals details on right when hovering
 */
interface KeyPersonnelProps {
  personnel: Array<{ name: string; role: string; expertise: string }>
}

function KeyPersonnelSection({ personnel }: KeyPersonnelProps) {
  const [activePersonId, setActivePersonId] = useState<number | null>(null)
  const [hoveredY, setHoveredY] = useState<number>(0)
  const listRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (id: number, e: React.MouseEvent<HTMLDivElement>) => {
    setActivePersonId(id)
    if (listRef.current) {
      const listRect = listRef.current.getBoundingClientRect()
      const itemRect = e.currentTarget.getBoundingClientRect()
      setHoveredY(itemRect.top - listRect.top)
    }
  }

  const activePerson = personnel[activePersonId ?? -1]

  return (
    <div className="mb-20 md:mb-32">
      <ScrollRevealText
        as="h2"
        className="uppercase mb-10"
        style={{
          fontSize: 'clamp(1.5rem, 5vw, 3rem)',
          fontWeight: 100,
          letterSpacing: '0.02em',
          wordSpacing: '0.15em',
          color: 'var(--heritage-cream)',
        }}
      >
        Key Personnel
      </ScrollRevealText>

      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 relative"
        ref={listRef}
        onMouseLeave={() => setActivePersonId(null)}
      >
        {/* LEFT COLUMN: Names List */}
        <div className="lg:col-span-7 flex flex-col">
          {personnel.map((person, index) => (
            <div
              key={index}
              className="group flex flex-row items-baseline cursor-pointer py-6 md:py-8 transition-all duration-500 ease-out border-b border-heritage-gold/10 hover:border-heritage-gold/30"
              onMouseEnter={(e) => handleMouseEnter(index, e)}
            >
              {/* Name */}
              <div className="flex-1 overflow-hidden relative z-10">
                <h3
                  className={`text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.9] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    activePersonId === index
                      ? 'opacity-100 translate-x-4'
                      : activePersonId !== null
                      ? 'opacity-20 blur-[2px]'
                      : 'opacity-100'
                  }`}
                  style={{
                    fontFamily: 'var(--font-cabinet-grotesk, sans-serif)',
                    color: activePersonId === index ? 'var(--heritage-gold)' : 'var(--heritage-cream)'
                  }}
                >
                  {person.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: Floating Details */}
        <div className="hidden lg:block lg:col-span-5 relative pointer-events-none">
          <div
            className="absolute right-0 w-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              top: 0,
              transform: `translateY(${hoveredY}px) translateY(-10%)`
            }}
          >
            <AnimatePresence mode="wait">
              {activePerson && (
                <motion.div
                  key={activePersonId}
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  className="p-8 rounded-sm bg-gradient-to-br from-wood-walnut-dark/40 to-wood-mahogany/20 border border-wood-cedar/20"
                >
                  <p className="text-heritage-gold/80 text-sm uppercase tracking-wide mb-4">
                    {activePerson.role}
                  </p>
                  <p className="text-heritage-cream/70 text-base leading-relaxed">
                    {activePerson.expertise}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PracticeAreaPage({ params }: PracticeAreaPageProps) {
  const { slug } = use(params)
  const practiceArea = practiceAreas.find((pa) => pa.slug === slug)

  if (!practiceArea) {
    notFound()
  }

  // Initialize scroll-pinning effect for heading
  // Animation flow:
  // 1. Heading starts near middle of viewport (around 35% from top)
  // 2. Content peeks at the bottom of the screen
  // 3. On scroll, heading AND mask move UP together to top (scrubbed animation)
  // 4. Once at top, heading pins and stays there
  // 5. Content scrolls up and gets clipped at bottom of title
  //
  // Performance notes:
  // - Uses GPU-accelerated transforms (translateY) only
  // - Scrub value of 0.8 creates buttery smooth 60fps animation
  // - anticipatePin prevents layout flicker during pin transition
  useEffect(() => {
    const headingWrapper = document.querySelector('.heading-wrapper') as HTMLElement
    const headingElement = document.querySelector('.pinned-heading') as HTMLElement
    const topMask = document.querySelector('.top-mask') as HTMLElement
    const goldenLine = document.querySelector('.golden-line') as HTMLElement

    if (!headingWrapper || !headingElement || !topMask || !goldenLine) return

    // Check user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Calculate how far the heading needs to move to reach the top
    // Heading starts at ~35% from top, needs to move up to ~5% (with padding)
    const moveDistance = window.innerHeight * 0.30 // Move up by 30vh

    if (prefersReducedMotion) {
      // Skip animations, just pin at top immediately
      gsap.set(headingElement, { y: -moveDistance })
      gsap.set(topMask, { height: '5vh' }) // Shrink mask to final position
      gsap.set(goldenLine, { opacity: 1 }) // Show golden line
      ScrollTrigger.create({
        trigger: headingWrapper,
        start: 'top top',
        endTrigger: '.scrollable-content',
        end: 'bottom bottom',
        pin: headingWrapper,
        pinSpacing: false,
      })
      return
    }

    // Timeline for upward movement from near-middle to top
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headingWrapper,
        start: 'top top', // Start when wrapper hits top of viewport
        end: '+=60vh', // Animation completes over 60vh of scroll (slower, smoother)
        scrub: 1.5, // Higher scrub value for smoother, slower animation
        anticipatePin: 1, // Smooth pin behavior
      }
    })

    // Animate heading from near-middle to top of viewport
    // Also shrink the mask so it stays above the title
    // Animate golden line opacity as heading reaches top
    tl.to(headingElement, {
      y: -moveDistance, // Move up to top position
      ease: 'none', // Linear for scrub (easing handled by scrub)
    }, 0)
    .to(topMask, {
      height: '5vh', // Shrink mask as title moves up
      ease: 'none',
    }, 0)
    .to(goldenLine, {
      opacity: 1, // Fade in golden line as heading reaches top
      ease: 'none',
    }, 0.5) // Start slightly later so it appears as heading nears top

    // Pin the heading once it reaches the top
    ScrollTrigger.create({
      trigger: headingWrapper,
      start: 'top top',
      endTrigger: '.scrollable-content',
      end: 'bottom bottom',
      pin: headingWrapper,
      pinSpacing: false, // Content already positioned below
    })

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [slug])

  return (
    <main className="min-h-screen bg-wood-espresso">
      {/* Heading Wrapper - Fixed position container that gets pinned */}
      {/* Heading starts near middle (~35% from top) with content peeking below */}
      {/* Has solid background ABOVE title to clip/mask content as it scrolls up */}
      <div className="heading-wrapper fixed top-0 left-0 w-full h-screen pointer-events-none z-30">
        {/* Solid mask from top of viewport to title - clips content as it scrolls up */}
        {/* This creates the effect of content being cut off at the title's bottom edge */}
        <div 
          className="top-mask absolute top-0 left-0 w-full bg-wood-espresso"
          style={{ 
            height: '35vh', // Cover from top to where title starts
          }}
        />
        
        <div 
          className="pinned-heading w-full absolute pointer-events-auto bg-wood-espresso"
          style={{ top: '35vh' }} // Position heading near middle of viewport
        >
          {/* Practice Area Title - Starts near middle, animates to top on scroll */}
          <ScrollRevealText
            as="h1"
            className="uppercase text-center px-6 md:px-12 lg:px-20 pt-4"
            style={{
              fontSize: 'clamp(2.5rem, 10vw, 7rem)',
              fontWeight: 100,
              letterSpacing: '-0.01em',
              wordSpacing: '0.15em',
              color: 'var(--heritage-cream)',
            } as React.CSSProperties}
          >
            {practiceArea.title}
          </ScrollRevealText>
          
          {/* Golden line - appears when heading reaches top */}
          <div 
            className="golden-line w-full h-[1px] opacity-0"
            style={{ backgroundColor: 'var(--heritage-gold)' }}
          />
        </div>
      </div>

      {/* Spacer to create initial layout where content peeks at bottom */}
      <div className="h-[5vh]" aria-hidden="true" />

      {/* Content Section - Scrolls underneath pinned heading */}
      {/* Starts visible at bottom of initial viewport, scrolls up as user scrolls */}
      {/* Content gets clipped by the solid mask below the title */}
      <section className="scrollable-content section-wood py-20 md:py-32 relative z-10 bg-wood-espresso">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          {/* Overview */}
          <div className="mb-20 md:mb-32">
            <h2 
              className="uppercase mb-8"
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                fontWeight: 100,
                letterSpacing: '0.02em',
                wordSpacing: '0.15em',
                color: 'var(--heritage-cream)',
              }}
            >
              Overview
            </h2>
            <p className="text-3xl md:text-4xl lg:text-5xl font-light text-heritage-cream/90 leading-relaxed max-w-4xl">
              {practiceArea.overview}
            </p>
            {practiceArea.description && (
              <p className="mt-8 text-2xl md:text-3xl text-heritage-cream/70 leading-relaxed max-w-4xl">
                {practiceArea.description}
              </p>
            )}
          </div>

          {/* Services */}
          {practiceArea.services && practiceArea.services.length > 0 && (
            <div className="mb-20 md:mb-32">
              <ScrollRevealText
                as="h2" 
                className="uppercase mb-8"
                style={{
                  fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                  fontWeight: 100,
                  letterSpacing: '0.02em',
                  wordSpacing: '0.15em',
                  color: 'var(--heritage-cream)',
                }}
              >
                Services & Expertise
              </ScrollRevealText>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-0">
                {practiceArea.services.map((service, index) => (
                  <ScrollRevealText
                    key={index}
                    as="div"
                    delay={index * 50}
                    className="group py-3 border-b transition-all duration-300"
                    style={{ borderColor: 'rgba(249, 248, 246, 0.1)' }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="text-sm font-mono transition-colors duration-300 group-hover:text-heritage-gold"
                        style={{ color: 'rgba(249, 248, 246, 0.4)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-xl md:text-2xl text-heritage-cream transition-colors duration-300 group-hover:text-heritage-gold">
                        {service}
                      </p>
                    </div>
                  </ScrollRevealText>
                ))}
              </div>
            </div>
          )}

          {/* Past Cases & Client Work */}
          {practiceArea.pastCases && practiceArea.pastCases.length > 0 && (
            <div className="mb-20 md:mb-32">
              <ScrollRevealText
                as="h2" 
                className="uppercase mb-8"
                style={{
                  fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                  fontWeight: 100,
                  letterSpacing: '0.02em',
                  wordSpacing: '0.15em',
                  color: 'var(--heritage-cream)',
                }}
              >
                Notable Cases & Client Work
              </ScrollRevealText>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-0">
                {practiceArea.pastCases.map((caseItem, index) => (
                  <ScrollRevealText
                    key={index}
                    as="div"
                    delay={index * 50}
                    className="group py-3 border-b transition-all duration-300"
                    style={{ borderColor: 'rgba(249, 248, 246, 0.1)' }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="text-sm font-mono transition-colors duration-300 group-hover:text-heritage-gold"
                        style={{ color: 'rgba(249, 248, 246, 0.4)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-xl md:text-2xl text-heritage-cream transition-colors duration-300 group-hover:text-heritage-gold">
                        {caseItem}
                      </p>
                    </div>
                  </ScrollRevealText>
                ))}
              </div>
            </div>
          )}

          {/* Client Portfolio */}
          {practiceArea.clientPortfolio && practiceArea.clientPortfolio.length > 0 && (
            <div className="mb-20 md:mb-32">
              <ScrollRevealText
                as="h2" 
                className="uppercase mb-8"
                style={{
                  fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                  fontWeight: 100,
                  letterSpacing: '0.02em',
                  wordSpacing: '0.15em',
                  color: 'var(--heritage-cream)',
                }}
              >
                Client Portfolio
              </ScrollRevealText>
              <div className="flex flex-wrap gap-3">
                {practiceArea.clientPortfolio.map((client, index) => (
                  <ScrollRevealText
                    key={index}
                    as="span"
                    delay={index * 30}
                    className="px-4 py-2 text-sm md:text-base text-heritage-cream/80 bg-wood-mahogany/40 rounded-sm border border-wood-cedar/30 hover:border-heritage-gold/40 transition-colors"
                  >
                    {client}
                  </ScrollRevealText>
                ))}
              </div>
            </div>
          )}

          {/* Key Personnel */}
          {practiceArea.keyPersonnel && practiceArea.keyPersonnel.length > 0 && (
            <KeyPersonnelSection personnel={practiceArea.keyPersonnel} />
          )}
        </div>
      </section>
    </main>
  )
}
