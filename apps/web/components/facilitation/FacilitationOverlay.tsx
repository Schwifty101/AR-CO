'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { FACILITATION_DATA } from '@/components/data/navData'
import styles from './FacilitationOverlay.module.css'

interface FacilitationOverlayProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * FacilitationOverlay Component
 *
 * Full-screen overlay that slides down from top showing all facilitation services
 * organized in categories with dark wood styling and special highlighting for
 * Women's Legal Desk.
 */
export default function FacilitationOverlay({ isOpen, onClose }: FacilitationOverlayProps) {
  // Handle escape key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll while allowing overlay scroll
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999]"
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
            height: '100dvh',
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
            aria-label="Close facilitation services"
          >
            <X
              className="w-6 h-6 transition-colors duration-300 group-hover:text-[var(--wood-espresso)]"
              style={{ color: 'var(--heritage-cream)' }}
            />
          </button>

          {/* Content Container */}
          <div className="px-6 md:px-12 lg:px-20 pt-12 md:pt-16 pb-12 md:pb-16">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8 md:mb-12"
            >
              <span
                className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] mb-3 block"
                style={{ color: 'var(--heritage-gold)', opacity: 0.9 }}
              >
                (Legal Facilitation Services)
              </span>
              <h1
                className="uppercase"
                style={{
                  fontSize: 'clamp(2.5rem, 10vw, 7rem)',
                  fontWeight: 100,
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                  color: 'var(--heritage-cream)',
                }}
              >
                Facilitation Centre
              </h1>
            </motion.div>

            {/* Categories Grid - 3 Columns on Desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 md:gap-y-10"
            >
              {FACILITATION_DATA.categories
                .filter((category) => category.title !== 'Overseas Pakistanis')
                .map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + categoryIndex * 0.05, duration: 0.4 }}
                  className="border-t pt-5"
                  style={{ borderColor: 'rgba(249, 248, 246, 0.15)' }}
                >
                  {/* Category Title */}
                  <h3
                    className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2"
                    style={{
                      color: category.highlight ? 'var(--heritage-gold)' : 'var(--heritage-cream)'
                    }}
                  >
                    {category.title}
                    {category.highlight && (
                      <span style={{ color: 'var(--heritage-gold)' }}>★</span>
                    )}
                  </h3>

                  {/* Category Links */}
                  <ul className="space-y-2.5">
                    {category.links.map((link, linkIndex) => (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.6 + categoryIndex * 0.05 + linkIndex * 0.03,
                          duration: 0.3
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className={`${styles.categoryLink} flex items-center justify-between py-1.5`}
                        >
                          <span className="text-sm md:text-base">
                            {link.label}
                          </span>
                          <svg
                            className={`${styles.linkArrow} w-4 h-4`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>

            {/* Overseas Pakistanis Section - Full Width with Two Columns */}
            {(() => {
              const overseasCategory = FACILITATION_DATA.categories.find(
                (c) => c.title === 'Overseas Pakistanis'
              )
              if (!overseasCategory) return null
              const midpoint = Math.ceil(overseasCategory.links.length / 2)
              const leftColumn = overseasCategory.links.slice(0, midpoint)
              const rightColumn = overseasCategory.links.slice(midpoint)
              const baseIndex = FACILITATION_DATA.categories.length - 1

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="mt-8 md:mt-10 border-t pt-6"
                  style={{ borderColor: 'rgba(249, 248, 246, 0.15)' }}
                >
                  <h3
                    className="text-xl md:text-2xl font-semibold mb-5 flex items-center gap-2"
                    style={{ color: 'var(--heritage-gold)' }}
                  >
                    {overseasCategory.title}
                    <span style={{ color: 'var(--heritage-gold)' }}>★</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    {/* Left Column */}
                    <ul className="space-y-2.5">
                      {leftColumn.map((link, linkIndex) => (
                        <motion.li
                          key={link.href}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.8 + linkIndex * 0.03,
                            duration: 0.3
                          }}
                        >
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className={`${styles.categoryLink} flex items-center justify-between py-1.5`}
                          >
                            <span className="text-sm md:text-base">
                              {link.label}
                            </span>
                            <svg
                              className={`${styles.linkArrow} w-4 h-4`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Right Column */}
                    <ul className="space-y-2.5">
                      {rightColumn.map((link, linkIndex) => (
                        <motion.li
                          key={link.href}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.8 + (midpoint + linkIndex) * 0.03,
                            duration: 0.3
                          }}
                        >
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className={`${styles.categoryLink} flex items-center justify-between py-1.5`}
                          >
                            <span className="text-sm md:text-base">
                              {link.label}
                            </span>
                            <svg
                              className={`${styles.linkArrow} w-4 h-4`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )
            })()}

            {/* Bottom Decorative Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-12 md:mt-16 h-px origin-left"
              style={{ background: 'var(--heritage-gold)', opacity: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
