'use client'

import { useState } from 'react'
import { CreditCard, ExternalLink, Shield } from 'lucide-react'
import type { ConsultationPaymentInitResponse } from '@repo/shared'
import styles from './ConsultationSteps.module.css'

/** Props for the ConsultationPaymentStep component. */
interface PaymentStepProps {
  /** Payment data returned from initiatePayment API (checkoutUrl) */
  paymentCredentials: ConsultationPaymentInitResponse
  /** UUID of the consultation booking */
  bookingId: string
  /** Human-readable reference number for the booking */
  referenceNumber: string
  /** Callback invoked when payment is confirmed successfully */
  onPaymentConfirmed: () => void
  /** Callback invoked when a payment error occurs */
  onError: (message: string) => void
}

/**
 * ConsultationPaymentStep — Step 3 of consultation booking overlay.
 *
 * Redirects the user to the LemonSqueezy hosted checkout page to complete
 * the consultation fee payment (PKR 50,000). Payment confirmation is handled
 * server-side via webhook (Task 10H will implement the full return-page flow).
 *
 * @example
 * ```tsx
 * <ConsultationPaymentStep
 *   paymentCredentials={paymentData}
 *   bookingId={bookingId}
 *   referenceNumber="CON-2026-0009"
 *   onPaymentConfirmed={() => setStep(4)}
 *   onError={(msg) => console.error(msg)}
 * />
 * ```
 */
export default function ConsultationPaymentStep({
  paymentCredentials,
  referenceNumber,
}: PaymentStepProps) {
  const [redirecting, setRedirecting] = useState(false)

  const handlePayClick = () => {
    setRedirecting(true)
    window.location.href = paymentCredentials.checkoutUrl
  }

  return (
    <div className={styles.paymentSection}>
      {/* Fee Summary Card */}
      <div className={styles.paymentSummary}>
        <div className={styles.paymentSummaryIcon}>
          <CreditCard size={18} />
        </div>
        <div className={styles.paymentSummaryDetails}>
          <span className={styles.paymentSummaryLabel}>Consultation Fee</span>
          <span className={styles.paymentSummaryAmount}>PKR 50,000</span>
        </div>
        <span className={styles.paymentSummaryRef}>Ref: {referenceNumber}</span>
      </div>

      {/* Pay Button */}
      <div className={styles.paymentButtonContainer}>
        <button
          type="button"
          className={styles.payButton}
          onClick={handlePayClick}
          disabled={redirecting}
        >
          <ExternalLink size={16} className={styles.payButtonIcon} />
          {redirecting ? 'Redirecting...' : 'Pay Now'}
        </button>
      </div>

      {/* Security Note */}
      <div className={styles.paymentSecurityNote}>
        <Shield size={12} />
        <span>
          Payments are processed securely through LemonSqueezy. Your financial
          information is never stored on our servers.
        </span>
      </div>
    </div>
  )
}
