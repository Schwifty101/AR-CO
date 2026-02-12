'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Calendar, Check } from 'lucide-react'
import { getSmoother } from '@/components/SmoothScroll'
import styles from './ConsultationOverlay.module.css'

/* ─── Types ─── */
interface ConsultationOverlayProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  name: string
  email: string
  phone: string
  practiceArea: string
  caseDescription: string
}

const PRACTICE_AREAS = [
  'Corporate & Commercial Law',
  'Tax Law & Compliance',
  'Real Estate & Property',
  'Immigration Law',
  'Family Law',
  'Criminal Law',
  'Labour & Employment Law',
  'Intellectual Property',
  'Banking & Finance',
  'Overseas Pakistani Matters',
  'Women\'s Legal Rights',
  'Regulatory Complaints',
  'Other',
]

const TOTAL_STEPS = 3

/**
 * ConsultationOverlay
 *
 * Three-step booking overlay:
 *   1. Personal info (name, email, phone)
 *   2. Case details (practice area + description)
 *   3. Cal.com scheduling embed
 *
 * Unfolds from top with backdrop blur.
 */
export default function ConsultationOverlay({ isOpen, onClose }: ConsultationOverlayProps) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    practiceArea: '',
    caseDescription: '',
  })

  /* ─── Keyboard ─── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  /* ─── Body lock & ScrollSmoother pause ─── */
  useEffect(() => {
    const smoother = getSmoother()

    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      window.addEventListener('keydown', handleKeyDown)
      if (smoother) smoother.paused(true)
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      // Reset form when closing
      setTimeout(() => {
        setStep(1)
        setSubmitted(false)
        setErrors({})
        setFormData({ name: '', email: '', phone: '', practiceArea: '', caseDescription: '' })
      }, 400)
      if (smoother) smoother.paused(false)
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', handleKeyDown)
      const sm = getSmoother()
      if (sm) sm.paused(false)
    }
  }, [isOpen, handleKeyDown])

  /* ─── Field change handler ─── */
  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  /* ─── Validation ─── */
  const validateStep = (s: number): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {}

    if (s === 1) {
      if (!formData.name.trim()) errs.name = 'Name is required'
      if (!formData.email.trim()) {
        errs.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errs.email = 'Enter a valid email address'
      }
      if (!formData.phone.trim()) {
        errs.phone = 'Phone number is required'
      }
    }

    if (s === 2) {
      if (!formData.practiceArea) errs.practiceArea = 'Please select a practice area'
      if (!formData.caseDescription.trim()) {
        errs.caseDescription = 'Please describe your case briefly'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ─── Navigation ─── */
  const goNext = () => {
    if (!validateStep(step)) return
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  const goBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  /* ─── Framer variants ─── */
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { delay: 0.15, duration: 0.3 } },
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: '-60%',
      scaleY: 0.6,
      scaleX: 0.95,
    },
    visible: {
      opacity: 1,
      y: '0%',
      scaleY: 1,
      scaleX: 1,
      transition: {
        type: 'spring' as const,
        damping: 28,
        stiffness: 260,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      y: '-50%',
      scaleY: 0.7,
      transition: { duration: 0.35, ease: [0.32, 0, 0.67, 0] as const },
    },
  }

  const sectionVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.25 } },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4 }}
            onClick={onClose}
          />

          {/* Overlay wrapper */}
          <div className={styles.overlay}>
            <motion.div
              className={styles.card}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Visual details */}
              <div className={styles.cardGrain} />
              <div className={styles.cardAccent} />
              <div className={styles.cornerTL} />
              <div className={styles.cornerBR} />

              {/* Close */}
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close consultation overlay"
              >
                <X size={16} />
              </button>

              {/* Scrollable inner */}
              <div className={styles.cardInner}>
                {submitted ? (
                  /* ─── Success State ─── */
                  <motion.div
                    className={styles.successSection}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={styles.successIcon}>
                      <Check size={24} />
                    </div>
                    <h3 className={styles.successTitle}>Request Received</h3>
                    <p className={styles.successText}>
                      Thank you, {formData.name}. Our legal team will review your enquiry
                      and contact you within 24 hours to confirm your consultation.
                    </p>
                    <button className={styles.successClose} onClick={onClose}>
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Header */}
                    <motion.div
                      className={styles.header}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <span className={styles.eyebrow}>Book a Consultation</span>
                      <h2 className={styles.title}>
                        Schedule Your <em>Legal</em> Session
                      </h2>
                      <p className={styles.subtitle}>
                        30-minute consultation · No obligations
                      </p>
                    </motion.div>

                    {/* Step Indicator */}
                    <div className={styles.stepIndicator}>
                      {[1, 2, 3].map((s, i) => (
                        <span key={s} style={{ display: 'contents' }}>
                          <span
                            className={`${styles.stepDot} ${
                              s === step
                                ? styles.stepDotActive
                                : s < step
                                  ? styles.stepDotCompleted
                                  : ''
                            }`}
                          />
                          {i < 2 && (
                            <span
                              className={`${styles.stepLine} ${
                                s < step ? styles.stepLineActive : ''
                              }`}
                            />
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                      {step === 1 && (
                        <motion.div
                          key="step-1"
                          className={styles.formSection}
                          variants={sectionVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                        >
                          <span className={styles.sectionLabel}>Personal Information</span>

                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Full Name</label>
                            <input
                              type="text"
                              className={styles.fieldInput}
                              placeholder="e.g. Ahmed Raza"
                              value={formData.name}
                              onChange={(e) => updateField('name', e.target.value)}
                              autoFocus
                            />
                            {errors.name && (
                              <span className={styles.fieldError}>{errors.name}</span>
                            )}
                          </div>

                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Email Address</label>
                            <input
                              type="email"
                              className={styles.fieldInput}
                              placeholder="e.g. ahmed@example.com"
                              value={formData.email}
                              onChange={(e) => updateField('email', e.target.value)}
                            />
                            {errors.email && (
                              <span className={styles.fieldError}>{errors.email}</span>
                            )}
                          </div>

                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Phone Number</label>
                            <input
                              type="tel"
                              className={styles.fieldInput}
                              placeholder="e.g. +92 300 1234567"
                              value={formData.phone}
                              onChange={(e) => updateField('phone', e.target.value)}
                            />
                            {errors.phone && (
                              <span className={styles.fieldError}>{errors.phone}</span>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="step-2"
                          className={styles.formSection}
                          variants={sectionVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                        >
                          <span className={styles.sectionLabel}>Case Details</span>

                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Practice Area</label>
                            <select
                              className={styles.fieldSelect}
                              value={formData.practiceArea}
                              onChange={(e) => updateField('practiceArea', e.target.value)}
                            >
                              <option value="">Select a practice area…</option>
                              {PRACTICE_AREAS.map((area) => (
                                <option key={area} value={area}>
                                  {area}
                                </option>
                              ))}
                            </select>
                            {errors.practiceArea && (
                              <span className={styles.fieldError}>{errors.practiceArea}</span>
                            )}
                          </div>

                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                              Brief Description of Your Case
                            </label>
                            <textarea
                              className={styles.fieldTextarea}
                              placeholder="Provide a brief overview of your legal matter so our team can prepare for the consultation…"
                              value={formData.caseDescription}
                              onChange={(e) =>
                                updateField('caseDescription', e.target.value)
                              }
                              rows={5}
                            />
                            {errors.caseDescription && (
                              <span className={styles.fieldError}>
                                {errors.caseDescription}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div
                          key="step-3"
                          className={styles.formSection}
                          variants={sectionVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                        >
                          <span className={styles.sectionLabel}>
                            Select a Time Slot
                          </span>

                          <div className={styles.calSection}>
                            <CalComEmbed />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className={styles.navButtons}>
                      {step > 1 && (
                        <button className={styles.navButtonBack} onClick={goBack}>
                          <ArrowLeft size={14} />
                          <span>Back</span>
                        </button>
                      )}

                      {step < TOTAL_STEPS ? (
                        <button className={styles.navButtonNext} onClick={goNext}>
                          <span>Continue</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          className={styles.navButtonSubmit}
                          onClick={handleSubmit}
                        >
                          <span>Confirm Booking</span>
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────
   Cal.com Embed Sub-Component
   ─────────────────────────────────────────────
   Renders the Cal.com inline embed for scheduling.
   Replace CAL_LINK with your actual Cal.com username/event.
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
const CAL_LINK = 'arco-law/consultation' // <-- Replace with your actual Cal.com link

function CalComEmbed() {
  const [loaded, setLoaded] = useState(false)

  const initCalEmbed = useCallback(() => {
    setLoaded(true)
    if (typeof window !== 'undefined' && (window as any).Cal) {
      ;(window as any).Cal('init', {
        origin: 'https://app.cal.com',
      })
      ;(window as any).Cal('inline', {
        calLink: CAL_LINK,
        elementOrSelector: '#cal-inline-embed',
        layout: 'month_view',
        config: {
          theme: 'dark',
        },
      })
      ;(window as any).Cal('ui', {
        theme: 'dark',
        styles: {
          branding: { brandColor: '#D4AF37' },
        },
      })
    }
  }, [])

  useEffect(() => {
    // Load Cal.com embed script
    const existingScript = document.querySelector('script[data-cal-embed]')
    if (existingScript) {
      // Already loaded from a previous mount — defer to avoid sync setState in effect
      const raf = requestAnimationFrame(() => initCalEmbed())
      return () => cancelAnimationFrame(raf)
    }

    const script = document.createElement('script')
    script.setAttribute('data-cal-embed', 'true')
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    script.onload = () => {
      initCalEmbed()
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup is intentionally skipped to avoid re-loading on re-mount
    }
  }, [initCalEmbed])

  // Fallback placeholder while the embed loads or if Cal.com is not configured
  return (
    <div className={styles.calContainer}>
      <div
        id="cal-inline-embed"
        style={{ width: '100%', height: '100%', minHeight: '360px', overflow: 'auto' }}
      />
      {!loaded && (
        <div className={styles.calPlaceholder}>
          <div className={styles.calIcon}>
            <Calendar size={22} />
          </div>
          <h4 className={styles.calPlaceholderTitle}>Loading Available Slots</h4>
          <p className={styles.calPlaceholderText}>
            Connecting to our scheduling system. This will only take a moment.
          </p>
        </div>
      )}
    </div>
  )
}
