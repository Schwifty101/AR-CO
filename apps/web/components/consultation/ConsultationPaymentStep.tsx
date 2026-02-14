'use client'

import { useState } from 'react'
import { CreditCard, AlertCircle, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { confirmPayment } from '@/lib/api/consultations'
import type { ConsultationPaymentInitResponse } from '@repo/shared'
import styles from './ConsultationSteps.module.css'

/**
 * Dynamically import SafepayButton to avoid SSR issues.
 * The Safepay checkout-components zoid driver relies on browser APIs
 * (window, DOM) that are not available during server-side rendering.
 */
const SafepayButton = dynamic(() => import('@/lib/safepay/safepay-button'), {
  ssr: false,
  loading: () => (
    <div className={styles.paymentButtonLoading}>
      <Loader2 size={20} className={styles.spinnerIcon} />
      <span>Loading payment gateway...</span>
    </div>
  ),
})

/* ─── Props ─── */

/**
 * Props for the ConsultationPaymentStep component.
 *
 * @example
 * ```tsx
 * <ConsultationPaymentStep
 *   paymentCredentials={credentials}
 *   bookingId="uuid-here"
 *   referenceNumber="CON-2026-0001"
 *   onPaymentConfirmed={() => setStep(4)}
 *   onError={(msg) => setApiError(msg)}
 * />
 * ```
 */
interface PaymentStepProps {
  /** Safepay credentials returned from initiatePayment API */
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
 * ConsultationPaymentStep
 *
 * Step 3 of the consultation booking overlay. Displays a consultation fee
 * summary and renders the SafepayButton for embedded payment processing.
 * On successful payment, calls the confirmPayment API and advances to
 * the scheduling step.
 *
 * @example
 * ```tsx
 * <ConsultationPaymentStep
 *   paymentCredentials={creds}
 *   bookingId={bookingId}
 *   referenceNumber={referenceNumber}
 *   onPaymentConfirmed={() => setStep(4)}
 *   onError={(msg) => setApiError(msg)}
 * />
 * ```
 */
export default function ConsultationPaymentStep({
  paymentCredentials,
  bookingId,
  referenceNumber,
  onPaymentConfirmed,
  onError,
}: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  /** Format amount with thousands separators for display */
  const formattedAmount = new Intl.NumberFormat('en-PK').format(
    paymentCredentials.amount,
  )

  /**
   * Handle successful payment callback from SafepayButton.
   * Calls confirmPayment API to verify the transaction server-side.
   */
  const handlePayment = async (data: { payment: Record<string, unknown> }) => {
    setIsProcessing(true)
    setPaymentError(null)
    try {
      const tracker =
        (data.payment?.tracker as string) || paymentCredentials.trackerToken
      await confirmPayment(bookingId, tracker)
      toast.success('Payment confirmed successfully!')
      onPaymentConfirmed()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Payment confirmation failed'
      setPaymentError(msg)
      onError(msg)
      toast.error('Payment confirmation failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  /** Handle payment cancellation from SafepayButton */
  const handleCancel = () => {
    setPaymentError('Payment was cancelled. You can try again below.')
    toast.error('Payment cancelled')
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
          <span className={styles.paymentSummaryAmount}>
            {paymentCredentials.currency} {formattedAmount}
          </span>
        </div>
        <span className={styles.paymentSummaryRef}>Ref: {referenceNumber}</span>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className={styles.paymentProcessing}>
          <Loader2 size={28} className={styles.spinnerIcon} />
          <span>Confirming your payment...</span>
        </div>
      )}

      {/* Error State */}
      {paymentError && (
        <div className={styles.paymentError}>
          <AlertCircle size={14} />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Safepay Button */}
      {!isProcessing && (
        <div className={styles.paymentButtonContainer}>
          <SafepayButton
            env={paymentCredentials.environment}
            client={{
              [paymentCredentials.environment]: paymentCredentials.merchantKey,
            }}
            style={{ mode: 'dark', size: 'large' }}
            orderId={paymentCredentials.orderId}
            source="consultation_booking"
            payment={{
              currency: paymentCredentials.currency,
              amount: paymentCredentials.amount,
            }}
            onPayment={handlePayment}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Security Note */}
      <div className={styles.paymentSecurityNote}>
        <Shield size={12} />
        <span>
          Payments are processed securely through Safepay. Your financial
          information is never stored on our servers.
        </span>
      </div>
    </div>
  )
}
