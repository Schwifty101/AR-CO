'use client'

import { useEffect, useRef, useState } from 'react'
import { CreditCard, Upload, Shield, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { uploadPaymentProof } from '@/lib/api/consultations'
import { getPaymentInstructions, type PaymentInstructions } from '@/lib/api/payments'
import styles from './ConsultationSteps.module.css'

/** Props for the ConsultationPaymentStep component. */
interface PaymentStepProps {
  /** UUID of the consultation booking */
  bookingId: string
  /** Human-readable reference number for the booking */
  referenceNumber: string
  /** Callback invoked once the screenshot is uploaded successfully */
  onUploaded: () => void
  /** Callback invoked when an upload error occurs */
  onError: (message: string) => void
}

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

/**
 * ConsultationPaymentStep — manual payment step of the consultation overlay.
 *
 * Shows the firm's bank-transfer details + booking reference, then lets the
 * guest upload a screenshot of their payment. On success, the booking moves to
 * `awaiting_confirmation` and the flow advances to scheduling. An admin verifies
 * the payment later.
 *
 * @example
 * ```tsx
 * <ConsultationPaymentStep
 *   bookingId={bookingId}
 *   referenceNumber="CON-2026-0009"
 *   onUploaded={() => setStep(4)}
 *   onError={(msg) => setApiError(msg)}
 * />
 * ```
 */
export default function ConsultationPaymentStep({
  bookingId,
  referenceNumber,
  onUploaded,
  onError,
}: PaymentStepProps) {
  const [instructions, setInstructions] = useState<PaymentInstructions | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getPaymentInstructions()
      .then(setInstructions)
      .catch(() => setInstructions(null))
  }, [])

  const handleSelect = (selected: File | null) => {
    setLocalError(null)
    if (!selected) return
    if (!ACCEPTED.includes(selected.type)) {
      setLocalError('Please upload a JPG, PNG, WEBP, or PDF file.')
      return
    }
    if (selected.size > MAX_FILE_BYTES) {
      setLocalError('File is too large (max 10 MB).')
      return
    }
    setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setLocalError(null)
    try {
      await uploadPaymentProof(bookingId, file)
      onUploaded()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload screenshot'
      setLocalError(msg)
      onError(msg)
    } finally {
      setUploading(false)
    }
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

      {/* Bank transfer instructions */}
      <div className={styles.bankDetails}>
        <p className={styles.bankDetailsTitle}>
          Transfer the fee to the account below, then upload your payment screenshot.
        </p>
        {instructions && (
          <dl className={styles.bankDetailsList}>
            <div><dt>Bank</dt><dd>{instructions.bankName}</dd></div>
            <div><dt>Account Title</dt><dd>{instructions.accountTitle}</dd></div>
            <div><dt>Account No.</dt><dd>{instructions.accountNumber}</dd></div>
            <div><dt>IBAN</dt><dd>{instructions.iban}</dd></div>
          </dl>
        )}
        <p className={styles.bankDetailsNote}>
          Please include your reference number <strong>{referenceNumber}</strong> in the
          transfer remarks where possible.
        </p>
      </div>

      {/* File upload */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        className={styles.fileSelectButton}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Upload size={16} />
        {file ? 'Change screenshot' : 'Select payment screenshot'}
      </button>

      {file && (
        <div className={styles.fileSelected}>
          <CheckCircle2 size={14} />
          <span>{file.name}</span>
        </div>
      )}

      {localError && (
        <div className={styles.paymentError}>
          <AlertCircle size={14} />
          <span>{localError}</span>
        </div>
      )}

      {/* Submit */}
      <div className={styles.paymentButtonContainer}>
        <button
          type="button"
          className={styles.payButton}
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <Loader2 size={16} className={styles.spinnerIcon} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} className={styles.payButtonIcon} />
              Submit Payment Proof
            </>
          )}
        </button>
      </div>

      {/* Note */}
      <div className={styles.paymentSecurityNote}>
        <Shield size={12} />
        <span>
          Your booking is confirmed once our team verifies your payment. You can
          schedule your slot in the next step.
        </span>
      </div>
    </div>
  )
}
