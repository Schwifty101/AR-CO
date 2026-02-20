'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useScrollLock } from '@/lib/hooks/useScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { practiceAreas } from '@/app/(public)/practice-areas/practiceAreasData'
import styles from './PracticeAreasOverlay.module.css'

interface PracticeAreasOverlayProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * PracticeAreasOverlay Component
 *
 * Full-screen overlay that slides down from top showing all practice areas
 * in a 3-column grid layout with dark wood styling.
 */
export default function PracticeAreasOverlay({ isOpen, onClose }: PracticeAreasOverlayProps) {
  // Handle escape key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Close overlay when a page transition is about to start
  useEffect(() => {
    if (!isOpen) return

    const handleTransitionStart = () => onClose()
    window.addEventListener('page-transition-start', handleTransitionStart)
    return () => window.removeEventListener('page-transition-start', handleTransitionStart)
  }, [isOpen, onClose])

  const { lock, unlock } = useScrollLock()

  // Lock body scroll + pause Lenis when overlay is open
  useEffect(() => {
    if (isOpen) {
      lock()
      window.addEventListener('keydown', handleKeyDown)
    } else {
      unlock()
    }

    return () => {
      unlock()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown, lock, unlock])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-[9999] ${styles.overlayScroll}`}
          data-lenis-prevent
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{
            duration: 0.6,
            ease: [0.32, 0.72, 0, 1]
          }}
          style={{
            background: 'var(--wood-espresso)',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            height: '100vh',
            width: '100vw'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 md:top-10 md:right-10 z-50 p-3 rounded-full border transition-all duration-300 hover:bg-[var(--heritage-gold)] hover:border-[var(--heritage-gold)] group"
            style={{
              borderColor: 'rgba(249, 248, 246, 0.3)',
            }}
            aria-label="Close practice areas"
          >
            <X
              className="w-6 h-6 transition-colors duration-300 group-hover:text-[var(--wood-espresso)]"
              style={{ color: 'var(--heritage-cream)' }}
            />
          </button>

          {/* Content Container */}
          <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-12 md:pt-16 pb-20 md:pb-28">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-10 md:mb-16"
            >
              <span
                className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] mb-4 block"
                style={{
                  color: 'var(--heritage-gold)',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              >
                (Explore Our Expertise)
              </span>
              <h1
                className="uppercase"
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: 'clamp(2rem, 8vw, 5.5rem)',
                  fontWeight: 300,
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                  color: 'var(--heritage-cream)',
                }}
              >
                Practice Areas
              </h1>
            </motion.div>

            {/* Practice Areas Grid - 3 Columns */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1"
            >
              {practiceAreas.map((area, index) => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={`/practice-areas/${area.slug}`}
                    onClick={onClose}
                    className="group block py-5 border-b transition-all duration-300"
                    style={{ borderColor: 'rgba(249, 248, 246, 0.1)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-4">
                        <span
                          className="text-sm text-[rgba(249,248,246,0.4)] transition-colors duration-300 group-hover:text-[var(--heritage-gold)]"
                          style={{
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            letterSpacing: '0.1em',
                          }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="text-lg md:text-xl text-[var(--heritage-cream)] transition-colors duration-300 group-hover:text-[var(--heritage-gold)]"
                          style={{
                            fontFamily: "'Lora', Georgia, serif",
                            fontWeight: 400,
                          }}
                        >
                          {area.title}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 transform transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                        style={{ color: 'var(--heritage-gold)' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom Decorative Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-20 h-px origin-left"
              style={{ background: 'var(--heritage-gold)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
