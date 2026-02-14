'use client'

import { useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Calendar, Loader2 } from 'lucide-react'
import styles from './ConsultationSteps.module.css'

/* ─── Cal.com Placeholder ─── */

/**
 * CalPlaceholder
 *
 * Loading placeholder displayed while the Cal.com embed-react component
 * is being dynamically loaded. Provides visual feedback to the user.
 */
function CalPlaceholder() {
  return (
    <div className={styles.calPlaceholder}>
      <div className={styles.calIcon}>
        <Loader2 size={22} className={styles.spinnerIcon} />
      </div>
      <h4 className={styles.calPlaceholderTitle}>Loading Available Slots</h4>
      <p className={styles.calPlaceholderText}>
        Connecting to our scheduling system. This will only take a moment.
      </p>
    </div>
  )
}

/**
 * Dynamically import the Cal.com embed-react component.
 * The embed relies on browser APIs, so SSR must be disabled.
 */
const Cal = dynamic(
  () => import('@calcom/embed-react').then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => <CalPlaceholder />,
  },
)

/* ─── Props ─── */

/**
 * Props for the ConsultationSchedulingStep component.
 *
 * @example
 * ```tsx
 * <ConsultationSchedulingStep
 *   guestName="Ahmed Raza"
 *   guestEmail="ahmed@example.com"
 *   referenceNumber="CON-2026-0001"
 *   onBookingComplete={() => setSubmitted(true)}
 * />
 * ```
 */
interface SchedulingStepProps {
  /** Guest's full name to pre-fill in Cal.com booking form */
  guestName: string
  /** Guest's email address to pre-fill in Cal.com booking form */
  guestEmail: string
  /** Consultation reference number to include in booking notes */
  referenceNumber: string
  /** Callback invoked when the user has completed a Cal.com booking */
  onBookingComplete: () => void
}

/**
 * ConsultationSchedulingStep
 *
 * Step 4 of the consultation booking overlay. Renders the Cal.com
 * embed-react component to allow the user to pick a consultation time
 * slot. This step is gated behind successful payment confirmation.
 *
 * Pre-fills guest name, email, and reference number into the Cal.com
 * booking form to reduce friction.
 *
 * @example
 * ```tsx
 * <ConsultationSchedulingStep
 *   guestName={formData.name}
 *   guestEmail={formData.email}
 *   referenceNumber="CON-2026-0001"
 *   onBookingComplete={() => setSubmitted(true)}
 * />
 * ```
 */
export default function ConsultationSchedulingStep({
  guestName,
  guestEmail,
  referenceNumber,
  onBookingComplete,
}: SchedulingStepProps) {
  const calLink = process.env.NEXT_PUBLIC_CALCOM_LINK || 'soban-ahmad/30min'

  /** Stable reference to avoid re-subscribing on every render */
  const stableOnComplete = useCallback(onBookingComplete, [onBookingComplete])

  /**
   * Subscribe to Cal.com `bookingSuccessful` event so the overlay
   * automatically advances once the guest finishes booking a slot.
   */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cal = await (
          await import('@calcom/embed-react')
        ).getCalApi({ namespace: 'consultation' })
        if (cancelled) return
        cal('on', {
          action: 'bookingSuccessful',
          callback: () => {
            stableOnComplete()
          },
        })
      } catch {
        // Cal API may not be ready yet — non-critical
      }
    })()
    return () => {
      cancelled = true
    }
  }, [stableOnComplete])

  return (
    <div className={styles.calSection}>
      <div className={styles.schedulingHeader}>
        <Calendar size={16} />
        <span>Payment confirmed — select your preferred time slot</span>
      </div>

      <div className={styles.calContainer}>
        <Cal
          namespace="consultation"
          calLink={calLink}
          config={{
            theme: 'dark' as const,
            layout: 'month_view',
            name: guestName,
            email: guestEmail,
            notes: `Consultation Reference: ${referenceNumber}`,
          }}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '380px',
            overflow: 'auto',
          }}
        />
      </div>

      <button
        className={styles.schedulingSkipButton}
        onClick={onBookingComplete}
        type="button"
      >
        I&apos;ll schedule later — finish booking
      </button>
    </div>
  )
}
