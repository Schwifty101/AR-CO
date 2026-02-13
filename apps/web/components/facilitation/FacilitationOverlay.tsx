'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { Lock } from 'lucide-react'
import { facilitationServices } from '@/components/data/facilitationCenterData'
import { regulatoryServices } from '@/components/data/regulatoryServiceData'
import { overseasServices } from '@/components/data/overseasServicesData'
import { womenDeskServices } from '@/components/data/womenDeskData'
import { getSmoother } from '@/components/SmoothScroll'
import { useConsultationOverlay } from '@/components/consultation'
import styles from './FacilitationOverlay.module.css'

interface SubService {
  label: string
  href: string
}

interface OverlayCategory {
  id: string
  title: string
  tagline: string
  services: SubService[]
  isPremium?: boolean
}

/** Maps service id to a URL-friendly slug */
function toSlug(id: string): string {
  return id.replace(/_/g, '-')
}

/** Overlay categories derived from the three data sources */
const OVERLAY_CATEGORIES: OverlayCategory[] = [
  {
    id: 'facilitation',
    title: 'Facilitation Centre',
    tagline: 'Business Registration, Licensing & Compliance',
    services: facilitationServices.map((s) => ({
      label: s.title,
      href: `/services/facilitation/${toSlug(s.id)}`,
    })),
  },
  {
    id: 'overseas',
    title: 'Overseas Pakistanis',
    tagline: 'Property, Family Law & Legal Representation Abroad',
    services: overseasServices.map((s) => ({
      label: s.title,
      href: `/services/overseas/${toSlug(s.id)}`,
    })),
  },
  {
    id: 'regulatory',
    title: 'Regulatory & Government',
    tagline: 'Authority Complaints, Tax & Public Service Issues',
    services: regulatoryServices.map((s) => ({
      label: s.title,
      href: `/services/regulatory/${toSlug(s.id)}`,
    })),
  },
  {
    id: 'women-desk',
    title: 'Women\'s Desk',
    tagline: 'Family Law, Protection & Women\'s Rights',
    services: womenDeskServices.map((s) => ({
      label: s.title,
      href: `/services/women-desk/${toSlug(s.id)}`,
    })),
  },
  {
    id: 'litigation',
    title: 'Litigation Services',
    tagline: 'Court Representation & Legal Disputes',
    services: [],
  },
  {
    id: 'complaint-section',
    title: 'Complaint Section',
    tagline: 'Premium Service - Formal Legal Complaints & Representations',
    services: [],
    isPremium: true,
  },
]

interface FacilitationOverlayProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * FacilitationOverlay Component
 *
 * Full-screen overlay with three expandable category panels.
 * Clicking a category reveals its sub-services in a grid.
 */
export default function FacilitationOverlay({ isOpen, onClose }: FacilitationOverlayProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { openOverlay: openConsultationOverlay } = useConsultationOverlay()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    const smoother = getSmoother()

    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      window.addEventListener('keydown', handleKeyDown)

      // Pause ScrollSmoother so it stops intercepting wheel/touch events
      if (smoother) {
        smoother.paused(true)
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      setExpandedId(null)

      // Resume ScrollSmoother
      if (smoother) {
        smoother.paused(false)
      }
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', handleKeyDown)
      // Ensure smoother is resumed on unmount
      const sm = getSmoother()
      if (sm) sm.paused(false)
    }
  }, [isOpen, handleKeyDown])

  const toggleCategory = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-[9999] ${styles.overlayScroll}`}
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: 'var(--wood-espresso)',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            height: '100dvh',
            width: '100vw',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close services overlay"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="px-6 md:px-12 lg:px-20 pt-14 md:pt-20 pb-12 md:pb-16">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-6 md:mb-10"
            >
              <span
                className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] mb-3 block"
                style={{
                  color: 'var(--heritage-gold)',
                  opacity: 0.8,
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              >
                Legal Services
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
                Services
              </h1>
            </motion.div>

            {/* Decorative line below header */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
              className="h-px origin-left mb-2"
              style={{ background: 'rgba(212, 175, 55, 0.3)' }}
            />

            {/* Category Accordion Panels */}
            {OVERLAY_CATEGORIES.map((category, index) => {
              const isExpanded = expandedId === category.id

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className={`${styles.categoryPanel} ${isExpanded ? styles.categoryPanelActive : ''}`}
                >
                  {/* Panel Header — Clickable */}
                  <div
                    className={styles.panelHeader}
                    onClick={() => {
                      if (category.id === 'litigation') {
                        onClose()
                        openConsultationOverlay()
                      } else {
                        toggleCategory(category.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={category.id === 'litigation' ? undefined : isExpanded}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (category.id === 'litigation') {
                          onClose()
                          openConsultationOverlay()
                        } else {
                          toggleCategory(category.id)
                        }
                      }
                    }}
                  >
                    <span className={styles.categoryNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <h2 className={styles.categoryTitle}>
                      {category.title}
                      {category.isPremium && (
                        <Lock
                          className="inline-block ml-2 mb-1"
                          style={{
                            width: 'clamp(14px, 1.2vw, 20px)',
                            height: 'clamp(14px, 1.2vw, 20px)',
                            color: 'var(--heritage-gold)',
                            opacity: 0.7,
                          }}
                        />
                      )}
                    </h2>

                    <span className={`${styles.serviceCount} hidden sm:block`}>
                      {category.isPremium
                        ? 'Premium'
                        : `${category.services.length} services`}
                    </span>

                    <div className={styles.expandIcon}>
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Expandable Sub-services */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
                          opacity: { duration: 0.3, delay: 0.1 },
                        }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="pb-6 md:pb-8 pl-0 sm:pl-8">
                          {/* Tagline */}
                          <p className={styles.categoryTagline}>{category.tagline}</p>

                          {/* Premium Notice or Empty Message */}
                          {category.services.length === 0 ? (
                            <div
                              className="mt-4 py-8 px-6 rounded-lg flex flex-col items-center justify-center text-center"
                              style={{
                                background: 'rgba(212, 175, 55, 0.08)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                              }}
                            >
                              {category.isPremium ? (
                                <>
                                  <Lock
                                    className="mb-3"
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      color: 'var(--heritage-gold)',
                                      opacity: 0.6,
                                    }}
                                  />
                                  <p
                                    className="text-sm md:text-base mb-2"
                                    style={{
                                      color: 'var(--heritage-cream)',
                                      fontFamily: "'Lora', Georgia, serif",
                                      fontWeight: 400,
                                    }}
                                  >
                                    Premium Service
                                  </p>
                                  <p
                                    className="text-xs md:text-sm"
                                    style={{
                                      color: 'var(--heritage-cream)',
                                      fontFamily: "'Georgia', 'Times New Roman', serif",
                                      opacity: 0.6,
                                    }}
                                  >
                                    This service is available exclusively to our premium clients.
                                    <br />
                                    Contact us for more information.
                                  </p>
                                </>
                              ) : (
                                <p
                                  className="text-sm"
                                  style={{
                                    color: 'var(--heritage-cream)',
                                    fontFamily: "'Georgia', 'Times New Roman', serif",
                                    opacity: 0.6,
                                  }}
                                >
                                  Services in this category are being prepared.
                                  <br />
                                  Please check back soon.
                                </p>
                              )}
                            </div>
                          ) : (
                            /* Services Grid */
                            <div className={styles.servicesGrid}>
                              {category.services.map((service, sIdx) => (
                                <motion.div
                                  key={service.href}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    delay: 0.05 * sIdx,
                                    duration: 0.25,
                                  }}
                                >
                                  <Link
                                    href={service.href}
                                    onClick={onClose}
                                    className={styles.serviceLink}
                                  >
                                    <span className={styles.serviceDot} />
                                    <span className={styles.serviceLabel}>{service.label}</span>
                                    <svg
                                      className={styles.serviceArrow}
                                      width="14"
                                      height="14"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                      />
                                    </svg>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {/* Bottom gold line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-10 md:mt-14 h-px origin-left"
              style={{ background: 'var(--heritage-gold)', opacity: 0.4 }}
            />

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="mt-4 text-xs tracking-[0.1em] uppercase"
              style={{
                color: 'rgba(249, 248, 246, 0.25)',
                fontFamily: "'Georgia', 'Times New Roman', serif",
              }}
            >
              Click a category to explore services
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
