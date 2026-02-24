'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ITeamClosingStatementProps } from './types/teamInterfaces'
import { getSmoother } from '../SmoothScroll'

gsap.registerPlugin(ScrollTrigger)

/**
 * TeamClosingStatement Component
 * "The Blueprint of Excellence" - Dark, Architectural, Bold.
 *
 * Design Direction: Refined Editorial / Luxury Industrial.
 * Context: Dark "Wood Espresso" background with thin "Cedar" lines (Blueprint).
 * Animation: Staggered reveal of text, drawing of lines, subtle gold shine.
 */
export default function TeamClosingStatement({
  statement,
  subtext,
  className = ''
}: ITeamClosingStatementProps) {
  const containerRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const wordsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-10%' })

  // Split statement into words for staggered animation
  const words = statement.split(' ')

  useEffect(() => {
    let ctx: gsap.Context | undefined

    const initScrollTrigger = () => {
      if (ctx) return
      if (!containerRef.current) return

      ctx = gsap.context(() => {
        // Pin the section, no spacing so footer can overlap
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          pinSpacing: false,
        })

        // Gold shimmer: animate backgroundPosition on all word spans
        if (wordsRef.current) {
          const wordSpans = wordsRef.current.querySelectorAll('.shimmer-word')
          if (wordSpans.length > 0) {
            gsap.fromTo(wordSpans,
              { backgroundPosition: '0% 50%' },
              {
                backgroundPosition: '200% 50%',
                ease: 'power2.inOut',
                stagger: 0.03,
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: 'top top',
                  end: '+=105%',
                  scrub: 1,
                },
              }
            )
          }
        }
      }, containerRef)

      ScrollTrigger.refresh()
    }

    // Defer init by one animation frame so the DOM has painted and
    // ScrollTrigger can measure pin positions against a settled layout.
    // A secondary refresh after 600ms catches late-loading images.
    let rafId: number | undefined
    let settleTimer: ReturnType<typeof setTimeout> | undefined
    let onSmootherReady: (() => void) | undefined
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined

    const deferredInit = () => {
      rafId = requestAnimationFrame(() => {
        initScrollTrigger()
        settleTimer = setTimeout(() => ScrollTrigger.refresh(), 600)
      })
    }

    if (getSmoother()) {
      deferredInit()
    } else {
      onSmootherReady = () => {
        deferredInit()
        window.removeEventListener('scroll-smoother-ready', onSmootherReady!)
      }
      window.addEventListener('scroll-smoother-ready', onSmootherReady)
      fallbackTimer = setTimeout(() => {
        if (!ctx) deferredInit()
        window.removeEventListener('scroll-smoother-ready', onSmootherReady!)
      }, 1000)
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (settleTimer) clearTimeout(settleTimer)
      ctx?.revert()
      if (onSmootherReady) {
        window.removeEventListener('scroll-smoother-ready', onSmootherReady)
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer)
      }
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className={`
        relative
        min-h-[100vh]
        flex
        items-center
        justify-center
        px-6
        py-24
        overflow-hidden
        ${className}
      `}
    >
      {/* Architectural Grid Lines - "The Blueprint" */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical Line */}
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'circOut' }}
          className="absolute left-1/2 top-0 w-px -translate-x-1/2 opacity-20"
          style={{ background: 'var(--wood-cedar)' }}
        />
        {/* Horizontal Line */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'circOut', delay: 0.2 }}
          className="absolute top-1/2 left-0 h-px -translate-y-1/2 opacity-20"
          style={{ background: 'var(--wood-cedar)' }}
        />
        {/* Decorative Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 0.1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] border border-[var(--wood-cedar)] rounded-full"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">

        {/* decorative label */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-block mb-12 text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--heritage-gold)] font-medium"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          Our Philosophy
        </motion.span>

        {/* 3. Main Statement - "Cinematic Typography" */}
        <div ref={textRef} className="relative perspective-1000">
          <h2 className="sr-only">{statement}</h2>
          <div
            ref={wordsRef}
            className="flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.1em] leading-[0.9]"
            aria-hidden="true"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block relative overflow-hidden"
                initial={{ opacity: 0, y: 100, rotateX: 20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1], // Custom ease for "luxury" feel
                  delay: i * 0.08
                }}
              >
                <span
                  className="shimmer-word block font-[300] tracking-tighter"
                  style={{
                    fontSize: 'clamp(3rem, 9vw, 8rem)',
                    fontFamily: "'Lora', Georgia, serif",
                    // Custom Gold Shine for Dark Mode
                    background: `linear-gradient(to right,
                      var(--heritage-cream) 0%,
                      var(--heritage-cream) 40%,
                      var(--heritage-gold) 50%,
                      var(--heritage-cream) 60%,
                      var(--heritage-cream) 100%)`,
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    animation: isInView ? 'text-shine 6s cubic-bezier(0.4, 0, 0.2, 1) 1' : 'none'
                  }}
                >
                  {word}
                </span>
              </motion.span>
            ))}
          </div>
        </div>

        {/* 4. Subtext - "Refined Detail" */}
        {subtext && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <p
              className="text-lg md:text-xl font-light italic"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: 'rgba(249, 248, 246, 0.7)'
              }}
            >
              {subtext}
            </p>

            {/* Decorative separator */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 1 }}
              className="h-px w-24 mx-auto mt-8 bg-[var(--heritage-gold)] opacity-50"
            />
          </motion.div>
        )}
      </div>
    </section>
  )
}

