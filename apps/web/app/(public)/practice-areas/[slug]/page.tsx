'use client'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { use, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { practiceAreas } from '../practiceAreasData'
import { ChevronDown, ArrowLeft } from 'lucide-react'
import ScrollRevealText from '@/components/shared/animations/ScrollRevealText'
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
      <ScrollRevealText as="h2" className="text-2xl md:text-3xl font-bold text-heritage-cream mb-10">
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

  // Initialize parallax effect on hero image
  useEffect(() => {
    const element = document.querySelector('.practiceAreaHeroImage')
    if (!element) return

    const scrollTrigger = gsap.to(element, {
      y: () => window.innerHeight * 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })

    return () => {
      scrollTrigger.scrollTrigger?.kill()
      scrollTrigger.kill()
    }
  }, [slug])

  return (
    <main className="min-h-screen bg-wood-espresso">
      {/* Hero Section - 100vh split: 70% image, 30% title */}
      <section className="relative h-screen w-full flex flex-col">
        {/* Image Section - 70% height */}
        <div className="relative h-[70vh] w-full overflow-hidden">
          <Image
            src={practiceArea.image}
            alt={practiceArea.title}
            fill
            className="object-cover object-center practiceAreaHeroImage"
            priority
            sizes="100vw"
          />
          {/* Strong brownish tint overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(92, 61, 46, 0.6)',
              mixBlendMode: 'multiply'
            }}
          />
        </div>

        {/* Title Section - 30% height, below image */}
        <div className="h-[30vh] bg-[var(--wood-espresso)] flex items-center">
          {/* Practice Area Title - Matching Team Hero Style (slightly smaller) */}
          <ScrollRevealText
            as="h1"
            className="uppercase"
            style={{
              fontSize: 'clamp(2.5rem, 10vw, 7rem)',
              fontWeight: 100,
              textAlign: 'left',
              letterSpacing: '0.02em',
              wordSpacing: '0.15em',
              paddingLeft: 'clamp(1.5rem, 4vw, 3rem)',
              color: 'var(--heritage-cream)',
            } as React.CSSProperties}
          >
            {practiceArea.title}
          </ScrollRevealText>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-heritage-cream/60 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* Content Section */}
      <section className="section-wood py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Overview */}
          <div className="mb-20 md:mb-32">
            <ScrollRevealText as="span" className="section-label mb-4 block">
              Overview
            </ScrollRevealText>
            <ScrollRevealText as="p" className="text-2xl md:text-3xl lg:text-4xl font-light text-heritage-cream/90 leading-relaxed max-w-4xl" delay={100}>
              {practiceArea.overview}
            </ScrollRevealText>
            {practiceArea.description && (
              <ScrollRevealText as="p" className="mt-8 text-lg md:text-xl text-heritage-cream/70 leading-relaxed max-w-4xl" delay={200}>
                {practiceArea.description}
              </ScrollRevealText>
            )}
          </div>

          {/* Services */}
          {practiceArea.services && practiceArea.services.length > 0 && (
            <div className="mb-20 md:mb-32">
              <ScrollRevealText as="h2" className="text-2xl md:text-3xl font-bold text-heritage-cream mb-8">
                Services & Expertise
              </ScrollRevealText>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
                {practiceArea.services.map((service, index) => (
                  <ScrollRevealText
                    key={index}
                    as="div"
                    delay={index * 50}
                    className="group py-5 border-b transition-all duration-300"
                    style={{ borderColor: 'rgba(249, 248, 246, 0.1)' } as React.CSSProperties}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="text-sm font-mono transition-colors duration-300 group-hover:text-heritage-gold"
                        style={{ color: 'rgba(249, 248, 246, 0.4)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-lg md:text-xl text-heritage-cream transition-colors duration-300 group-hover:text-heritage-gold">
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
              <ScrollRevealText as="h2" className="text-2xl md:text-3xl font-bold text-heritage-cream mb-8">
                Notable Cases & Client Work
              </ScrollRevealText>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
                {practiceArea.pastCases.map((caseItem, index) => (
                  <ScrollRevealText
                    key={index}
                    as="div"
                    delay={index * 50}
                    className="group py-5 border-b transition-all duration-300"
                    style={{ borderColor: 'rgba(249, 248, 246, 0.1)' } as React.CSSProperties}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="text-sm font-mono transition-colors duration-300 group-hover:text-heritage-gold"
                        style={{ color: 'rgba(249, 248, 246, 0.4)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-lg md:text-xl text-heritage-cream transition-colors duration-300 group-hover:text-heritage-gold">
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
              <ScrollRevealText as="h2" className="text-2xl md:text-3xl font-bold text-heritage-cream mb-8">
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
