'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getSmoother } from '@/components/SmoothScroll'
import { createConsultation, initiatePayment } from '@/lib/api/consultations'
import type { ConsultationPaymentInitResponse, CreateConsultationData } from '@repo/shared'
import { PersonalInfoStep, CaseDetailsStep, INITIAL_FORM_DATA } from './ConsultationFormSteps'
import type { ConsultationFormData } from './ConsultationFormSteps'
import ConsultationPaymentStep from './ConsultationPaymentStep'
import ConsultationSchedulingStep from './ConsultationSchedulingStep'
import styles from './ConsultationOverlay.module.css'

/* ─── Types ─── */

/** Props for the ConsultationOverlay component */
interface ConsultationOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const TOTAL_STEPS = 4

/* ─── Framer Variants (static, defined outside component) ─── */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: 0.15, duration: 0.3 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: '-60%', scaleY: 0.6, scaleX: 0.95 },
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
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { opacity: 0, x: -30, transition: { duration: 0.25 } },
}

/**
 * ConsultationOverlay
 *
 * Four-step booking overlay for scheduling a paid legal consultation:
 *   1. Personal info (name, email, phone)
 *   2. Case details (practice area, description, urgency, optional fields)
 *      On submit: creates consultation booking + initiates payment
 *   3. Payment (Safepay embedded checkout)
 *      On success: confirms payment, advances to scheduling
 *   4. Cal.com scheduling (gated behind payment confirmation)
 *
 * Unfolds from top with backdrop blur. Dark luxury aesthetic.
 *
 * @example
 * ```tsx
 * <ConsultationOverlay isOpen={isOpen} onClose={() => setOpen(false)} />
 * ```
 */
export default function ConsultationOverlay({ isOpen, onClose }: ConsultationOverlayProps) {
  /* ─── Form State ─── */
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ConsultationFormData, string>>>({})
  const [formData, setFormData] = useState<ConsultationFormData>(INITIAL_FORM_DATA)

  /* ─── Booking & Payment State ─── */
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null)
  const [paymentCredentials, setPaymentCredentials] =
    useState<ConsultationPaymentInitResponse | null>(null)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  /* ─── API State ─── */
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

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
      setTimeout(() => {
        setStep(1)
        setSubmitted(false)
        setErrors({})
        setFormData(INITIAL_FORM_DATA)
        setBookingId(null)
        setReferenceNumber(null)
        setPaymentCredentials(null)
        setPaymentConfirmed(false)
        setIsSubmitting(false)
        setApiError(null)
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
  const updateField = (field: keyof ConsultationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    if (apiError) setApiError(null)
  }

  /* ─── Validation ─── */
  const validateStep = (s: number): boolean => {
    const errs: Partial<Record<keyof ConsultationFormData, string>> = {}

    if (s === 1) {
      if (!formData.name.trim()) errs.name = 'Name is required'
      if (!formData.email.trim()) {
        errs.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errs.email = 'Enter a valid email address'
      }
      if (!formData.phone.trim()) errs.phone = 'Phone number is required'
    }

    if (s === 2) {
      if (!formData.practiceArea) errs.practiceArea = 'Please select a practice area'
      if (!formData.caseDescription.trim()) {
        errs.caseDescription = 'Please describe your case briefly'
      } else if (formData.caseDescription.trim().length < 20) {
        errs.caseDescription = 'Please provide at least 20 characters describing your case'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ─── Step 2 Submit: Create Booking + Initiate Payment ─── */
  const handleStep2Submit = async () => {
    if (!validateStep(2)) return
    setIsSubmitting(true)
    setApiError(null)
    try {
      const consultationData: CreateConsultationData = {
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        practiceArea: formData.practiceArea,
        urgency: (formData.urgency || 'medium') as CreateConsultationData['urgency'],
        issueSummary: formData.caseDescription,
        relevantDates: formData.relevantDates || undefined,
        opposingParty: formData.opposingParty || undefined,
        additionalNotes: formData.additionalNotes || undefined,
      }

      const booking = await createConsultation(consultationData)
      setBookingId(booking.id)
      setReferenceNumber(booking.referenceNumber)

      const creds = await initiatePayment(booking.id)
      setPaymentCredentials(creds)
      setStep(3)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setApiError(msg)
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ─── Navigation ─── */
  const goNext = () => {
    if (step === 2) {
      void handleStep2Submit()
      return
    }
    if (!validateStep(step)) return
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  const goBack = () => {
    if (step > 1 && step <= 2) setStep(step - 1)
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
                    <h3 className={styles.successTitle}>Booking Confirmed</h3>
                    <p className={styles.successText}>
                      Thank you, {formData.name}. Your consultation has been
                      {paymentConfirmed ? ' paid and' : ''} booked successfully.
                      {referenceNumber && (
                        <>
                          {' '}Your reference number is{' '}
                          <strong>{referenceNumber}</strong>.
                        </>
                      )}
                      {' '}Our legal team will send you a confirmation email shortly.
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
                        30-minute consultation &middot; No obligations
                      </p>
                    </motion.div>

                    {/* Step Indicator — 4 dots, 3 lines */}
                    <div className={styles.stepIndicator}>
                      {[1, 2, 3, 4].map((s, i) => (
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
                          {i < 3 && (
                            <span
                              className={`${styles.stepLine} ${
                                s < step ? styles.stepLineActive : ''
                              }`}
                            />
                          )}
                        </span>
                      ))}
                    </div>

                    {/* API Error Banner */}
                    {apiError && step <= 2 && (
                      <div className={styles.apiError}>
                        <AlertCircle size={14} />
                        <span>{apiError}</span>
                      </div>
                    )}

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
                          <PersonalInfoStep
                            formData={formData}
                            errors={errors}
                            onFieldChange={updateField}
                          />
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
                          <CaseDetailsStep
                            formData={formData}
                            errors={errors}
                            onFieldChange={updateField}
                          />
                        </motion.div>
                      )}

                      {step === 3 && paymentCredentials && bookingId && referenceNumber && (
                        <motion.div
                          key="step-3"
                          className={styles.formSection}
                          variants={sectionVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                        >
                          <span className={styles.sectionLabel}>Secure Payment</span>
                          <ConsultationPaymentStep
                            paymentCredentials={paymentCredentials}
                            bookingId={bookingId}
                            referenceNumber={referenceNumber}
                            onPaymentConfirmed={() => {
                              setPaymentConfirmed(true)
                              setStep(4)
                            }}
                            onError={(msg) => setApiError(msg)}
                          />
                        </motion.div>
                      )}

                      {step === 4 && referenceNumber && (
                        <motion.div
                          key="step-4"
                          className={styles.formSection}
                          variants={sectionVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                        >
                          <span className={styles.sectionLabel}>Select a Time Slot</span>
                          <ConsultationSchedulingStep
                            guestName={formData.name}
                            guestEmail={formData.email}
                            referenceNumber={referenceNumber}
                            onBookingComplete={() => setSubmitted(true)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation — only for steps 1 and 2 */}
                    {step <= 2 && (
                      <div className={styles.navButtons}>
                        {step > 1 && (
                          <button
                            className={styles.navButtonBack}
                            onClick={goBack}
                            disabled={isSubmitting}
                          >
                            <ArrowLeft size={14} />
                            <span>Back</span>
                          </button>
                        )}

                        <button
                          className={styles.navButtonNext}
                          onClick={goNext}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={14} className={styles.spinnerIcon} />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span>Continue</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
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
