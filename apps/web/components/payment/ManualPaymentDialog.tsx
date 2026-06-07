'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Upload, CheckCircle2, Loader2, AlertCircle, Shield } from 'lucide-react'
import { uploadServicePaymentProof } from '@/lib/api/service-registrations'
import { getPaymentInstructions, type PaymentInstructions } from '@/lib/api/payments'

/** Props for {@link ManualPaymentDialog}. */
interface ManualPaymentDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** UUID of the service registration to attach the proof to */
  registrationId: string
  /** Human-readable reference number */
  referenceNumber: string
  /** Total amount due in PKR (for display). Pass 0 if unknown. */
  amountPkr: number
  /** Called when the dialog is dismissed without completing */
  onClose: () => void
  /** Called after the screenshot is uploaded successfully */
  onComplete: () => void
}

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const GOLD = 'var(--heritage-gold, #D4AF37)'

/**
 * ManualPaymentDialog — modal for the manual (bank-transfer) payment flow of a
 * service registration. Shows the firm's bank details + reference number, then
 * lets the guest upload a payment screenshot. On success the registration moves
 * to `awaiting_confirmation` and `onComplete` fires.
 *
 * @example
 * ```tsx
 * <ManualPaymentDialog
 *   open={!!pending}
 *   registrationId={pending.id}
 *   referenceNumber={pending.ref}
 *   amountPkr={pending.amount}
 *   onClose={() => setPending(null)}
 *   onComplete={() => router.push(faqPath)}
 * />
 * ```
 */
export default function ManualPaymentDialog({
  open,
  registrationId,
  referenceNumber,
  amountPkr,
  onClose,
  onComplete,
}: ManualPaymentDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [instructions, setInstructions] = useState<PaymentInstructions | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) {
      getPaymentInstructions().then(setInstructions).catch(() => setInstructions(null))
    }
  }, [open])

  if (!open || !mounted) return null

  const handleSelect = (selected: File | null) => {
    setError(null)
    if (!selected) return
    if (!ACCEPTED.includes(selected.type)) {
      setError('Please upload a JPG, PNG, WEBP, or PDF file.')
      return
    }
    if (selected.size > MAX_FILE_BYTES) {
      setError('File is too large (max 10 MB).')
      return
    }
    setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      await uploadServicePaymentProof(registrationId, file)
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload screenshot')
    } finally {
      setUploading(false)
    }
  }

  const row = (label: string, value: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem' }}>
      <span style={{ color: 'rgba(20,20,20,0.5)' }}>{label}</span>
      <span style={{ color: 'rgba(20,20,20,0.9)', textAlign: 'right', letterSpacing: '0.02em' }}>{value}</span>
    </div>
  )

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
          background: '#faf9f7', borderRadius: 8, padding: '1.75rem',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 14, right: 14, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(20,20,20,0.5)' }}
        >
          <X size={18} />
        </button>

        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', color: 'rgba(20,20,20,0.9)' }}>Complete Your Payment</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: 'rgba(20,20,20,0.55)', lineHeight: 1.5 }}>
          Transfer{' '}
          <strong>{amountPkr > 0 ? `PKR ${amountPkr.toLocaleString()}` : 'the registration fee'}</strong>{' '}
          to the account below, then upload your payment screenshot. Reference:{' '}
          <strong>{referenceNumber}</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.9rem 1rem', border: '1px solid rgba(20,20,20,0.1)', borderRadius: 6, background: '#fff', marginBottom: '1rem' }}>
          {instructions ? (
            <>
              {row('Bank', instructions.bankName)}
              {row('Account Title', instructions.accountTitle)}
              {row('Account No.', instructions.accountNumber)}
              {row('IBAN', instructions.iban)}
            </>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'rgba(20,20,20,0.4)' }}>Loading bank details…</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            width: '100%', padding: '0.7rem 1rem', marginBottom: '0.75rem',
            fontFamily: 'inherit', fontSize: '0.85rem', color: 'rgba(20,20,20,0.8)',
            background: 'transparent', border: '1px dashed rgba(20,20,20,0.25)', borderRadius: 6,
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          <Upload size={16} />
          {file ? 'Change screenshot' : 'Select payment screenshot'}
        </button>

        {file && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: GOLD, marginBottom: '0.75rem', wordBreak: 'break-all' }}>
            <CheckCircle2 size={14} /> <span>{file.name}</span>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#b3261e', marginBottom: '0.75rem' }}>
            <AlertCircle size={14} /> <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            width: '100%', padding: '0.8rem 1rem', fontFamily: 'inherit', fontSize: '0.9rem',
            color: '#1a1a1a', fontWeight: 600, border: 'none', borderRadius: 6,
            background: !file || uploading ? 'rgba(212,175,55,0.5)' : GOLD,
            cursor: !file || uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? (<><Loader2 size={16} className="animate-spin" /> Uploading…</>) : (<><Upload size={16} /> Submit Payment Proof</>)}
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.7rem', color: 'rgba(20,20,20,0.4)', marginTop: '0.85rem', lineHeight: 1.5 }}>
          <Shield size={12} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>Your registration is processed once our team verifies your payment.</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
