'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CreditCard, AlertCircle, Loader2, Shield, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { confirmPayment } from '@/lib/api/consultations'
import type { ConsultationPaymentInitResponse } from '@repo/shared'
import styles from './ConsultationSteps.module.css'

/** Props for the ConsultationPaymentStep component. */
interface PaymentStepProps {
  /** Payment data returned from initiatePayment API (checkoutUrl, amount, currency, orderId) */
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
 * Displays consultation fee summary and a "Pay with Safepay" button.
 * Opens the Safepay hosted checkout in a popup window. Listens for
 * postMessage from the payment callback page, then confirms payment
 * server-side before advancing to Step 4 (Cal.com scheduling).
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
  bookingId,
  referenceNumber,
  onPaymentConfirmed,
  onError,
}: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const popupRef = useRef<Window | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const formattedAmount = new Intl.NumberFormat('en-PK').format(
    paymentCredentials.amount,
  )

  /** Clean up popup polling interval */
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  /** Handle postMessage from payment callback page */
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      const data = event.data as { type?: string; tracker?: string }

      if (data.type === 'safepay-payment-success' && data.tracker) {
        stopPolling()
        setIsProcessing(true)
        setPaymentError(null)
        try {
          await confirmPayment(bookingId, data.tracker)
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

      if (data.type === 'safepay-payment-cancelled') {
        stopPolling()
        setPaymentError('Payment was cancelled. You can try again below.')
        toast.error('Payment cancelled')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [bookingId, onPaymentConfirmed, onError, stopPolling])

  /** Clean up on unmount */
  useEffect(() => {
    return () => {
      stopPolling()
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close()
      }
    }
  }, [stopPolling])

  /** Open Safepay checkout in a centered popup */
  const handlePayClick = () => {
    setPaymentError(null)
    setPopupBlocked(false)

    // Center the popup on screen
    const width = 500
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      paymentCredentials.checkoutUrl,
      'safepay-checkout',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
    )

    if (!popup) {
      setPopupBlocked(true)
      toast.error('Popup blocked. Please allow popups for this site.')
      return
    }

    popupRef.current = popup

    // Poll for popup close (user closed manually without completing payment)
    pollRef.current = setInterval(() => {
      if (popup.closed) {
        stopPolling()
        // Only show message if not already processing (postMessage wasn't received)
        if (!isProcessing) {
          setPaymentError('Payment window was closed. Click below to try again.')
        }
      }
    }, 500)
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

      {/* Popup Blocked Warning */}
      {popupBlocked && (
        <div className={styles.popupBlockedWarning}>
          <AlertCircle size={14} />
          <span>
            Popups are blocked. Please allow popups for this site in your
            browser settings, then try again.
          </span>
        </div>
      )}

      {/* Pay Button */}
      {!isProcessing && (
        <div className={styles.paymentButtonContainer}>
          <button
            type="button"
            className={styles.payButton}
            onClick={handlePayClick}
            disabled={isProcessing}
          >
            <ExternalLink size={16} className={styles.payButtonIcon} />
            Pay with Safepay
          </button>
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
