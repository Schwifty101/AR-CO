'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight, Upload, Check, X, ChevronDown, CreditCard, Loader2, AlertCircle, Shield } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import styles from './form.module.css'
import { submitComplaint, uploadComplaintPaymentProof } from '@/lib/api/complaints'
import { getPaymentInstructions, type PaymentInstructions } from '@/lib/api/payments'

/** Flat complaint filing fee shown to the user */
const COMPLAINT_FEE_LABEL = 'PKR 1,000'
const MAX_PROOF_BYTES = 10 * 1024 * 1024
const ACCEPTED_PROOF = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

// ─── CustomSelect ─────────────────────────────────────────────────────────────

interface CustomSelectProps {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  error?: string
}

function CustomSelect({ value, onChange, options, placeholder = 'Select…', error }: CustomSelectProps) {
  const [open, setOpen] = useState(false)

  const triggerBorder = error
    ? 'rgba(201, 116, 83, 0.5)'
    : open
    ? 'rgba(212, 175, 55, 0.5)'
    : 'rgba(249, 248, 246, 0.08)'

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          style={{
            width: '100%',
            padding: '0.85rem 1.1rem',
            background: open ? 'rgba(212, 175, 55, 0.04)' : 'rgba(249, 248, 246, 0.03)',
            border: `1px solid ${triggerBorder}`,
            borderRadius: '100px',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: '0.88rem',
            color: value ? 'var(--heritage-cream)' : 'rgba(249,248,246,0.3)',
            letterSpacing: '0.01em',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            transition: 'border-color 300ms, background 300ms',
            boxSizing: 'border-box',
            outline: 'none',
            userSelect: 'none',
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {value || placeholder}
          </span>
          <ChevronDown
            style={{
              width: 14, height: 14, flexShrink: 0,
              color: 'rgba(212,175,55,0.5)',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms',
            }}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          data-lenis-prevent
          style={{
            background: '#120e0b',
            border: '1px solid rgba(212,175,55,0.18)',
            borderRadius: '0.75rem',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            width: 'var(--radix-popover-trigger-width)',
            zIndex: 9999,
          }}
        >
          <div style={{ overflowY: 'auto', maxHeight: 260, padding: '0.35rem', scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.2) transparent' }}>
            {options.map((opt) => {
              const selected = opt === value
              return (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => { onChange(opt); setOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    background: selected ? 'rgba(212,175,55,0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: '0.85rem',
                    color: selected ? 'var(--heritage-gold)' : 'rgba(249,248,246,0.65)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    letterSpacing: '0.01em',
                    transition: 'all 0.15s',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.06)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = selected ? 'var(--heritage-gold)' : 'rgba(249,248,246,0.9)'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color = selected ? 'var(--heritage-gold)' : 'rgba(249,248,246,0.65)'
                  }}
                >
                  <span style={{ flex: 1 }}>{opt}</span>
                  {selected && <Check style={{ width: 13, height: 13, flexShrink: 0, color: 'var(--heritage-gold)' }} />}
                </button>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldValue = string | boolean | File[] | null

interface FormData {
  // §01 Complainant
  fullName: string
  cnic: string
  email: string
  phone: string
  city: string
  address: string
  // §02 Institution
  institution: string
  department: string
  incidentDate: string
  referenceNumber: string
  issueType: string
  // §03 Complaint
  subject: string
  description: string
  desiredOutcome: string
  priorAttempts: string
  priorReference: string
  // §04 Declaration
  documents: File[]
  declarationTrue: boolean
  declarationTerms: boolean
}

interface FieldError {
  [key: string]: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INSTITUTIONS = [
  'CDA — Capital Development Authority',
  'HEC — Higher Education Commission',
  'NADRA — National Database & Registration Authority',
  'PEMRA — Pakistan Electronic Media Regulatory Authority',
  'FBR — Federal Board of Revenue',
  'SECP — Securities & Exchange Commission of Pakistan',
  'PTA — Pakistan Telecommunication Authority',
  'OGRA — Oil & Gas Regulatory Authority',
  'NEPRA — National Electric Power Regulatory Authority',
  'SBP — State Bank of Pakistan',
  'PPRA — Public Procurement Regulatory Authority',
  'Other — Specify in description',
]

const ISSUE_TYPES = [
  'Unlawful Regulatory Decision',
  'Denial of Service',
  'Harassment by Officials',
  'Unlawful Tax Assessment',
  'Rights Violation / Discrimination',
  'University / Education Dispute',
  'Property / Land Rights Violation',
  'Consumer Protection Complaint',
  'Financial Dispute',
  'Other',
]

const SECTIONS = [
  { number: '§ 01', title: 'Complainant', subtitle: 'Your personal information' },
  { number: '§ 02', title: 'Institution', subtitle: 'The organisation & incident' },
  { number: '§ 03', title: 'Complaint', subtitle: 'The details of your case' },
  { number: '§ 04', title: 'Declaration', subtitle: 'Documents & confirmation' },
  { number: '§ 05', title: 'Payment', subtitle: `Filing fee — ${COMPLAINT_FEE_LABEL}` },
]

/** Index of the payment step (after the four intake sections) */
const PAYMENT_STEP = 4

const WORD_LIMIT = 300
const OUTCOME_LIMIT = 150

const countWords = (text: string) =>
  text.trim() === '' ? 0 : text.trim().split(/\s+/).length

// ─── Input styles (inline, matching project convention) ───────────────────────

const inputStyle = (error?: string): React.CSSProperties => ({
  width: '100%',
  padding: '0.85rem 1.1rem',
  background: 'rgba(249, 248, 246, 0.03)',
  border: `1px solid ${error ? 'rgba(201, 116, 83, 0.5)' : 'rgba(249, 248, 246, 0.08)'}`,
  borderRadius: '100px',
  fontFamily: "'Georgia', 'Times New Roman', serif",
  fontSize: '0.88rem',
  color: 'var(--heritage-cream)',
  letterSpacing: '0.01em',
  outline: 'none',
  transition: 'all 300ms',
  boxSizing: 'border-box',
})

const textareaStyle = (error?: string): React.CSSProperties => ({
  ...inputStyle(error),
  borderRadius: '0.75rem',
  resize: 'vertical' as const,
  minHeight: '120px',
  lineHeight: 1.6,
})


const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Georgia', 'Times New Roman', serif",
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: 'rgba(249, 248, 246, 0.45)',
  marginBottom: '0.5rem',
}

const errorStyle: React.CSSProperties = {
  fontFamily: "'Lora', Georgia, serif",
  fontSize: '0.72rem',
  fontStyle: 'italic',
  color: 'rgba(201, 116, 83, 0.9)',
  marginTop: '0.35rem',
  display: 'block',
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateSection(step: number, data: FormData): FieldError {
  const errors: FieldError = {}

  if (step === 0) {
    if (!data.fullName.trim()) errors.fullName = 'Full name is required'
    if (!data.cnic.trim()) errors.cnic = 'CNIC or passport number is required'
    if (!data.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!data.phone.trim()) errors.phone = 'Phone number is required'
    if (!data.city.trim()) errors.city = 'City is required'
    if (!data.address.trim()) errors.address = 'Address is required'
  }

  if (step === 1) {
    if (!data.institution) errors.institution = 'Please select an institution'
    if (!data.incidentDate) errors.incidentDate = 'Incident date is required'
    if (!data.issueType) errors.issueType = 'Please select the type of issue'
  }

  if (step === 2) {
    if (!data.subject.trim()) {
      errors.subject = 'A subject is required'
    } else if (data.subject.trim().length < 5) {
      errors.subject = 'Subject must be at least 5 characters'
    }
    if (!data.description.trim()) {
      errors.description = 'Please describe your complaint'
    } else if (data.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters'
    } else if (countWords(data.description) > WORD_LIMIT) {
      errors.description = `Maximum ${WORD_LIMIT} words allowed`
    }
    if (!data.desiredOutcome.trim()) errors.desiredOutcome = 'Please describe the outcome you seek'
    if (!data.priorAttempts) errors.priorAttempts = 'Please indicate if you have made prior attempts'
  }

  if (step === 3) {
    if (!data.declarationTrue) errors.declarationTrue = 'You must confirm the information is accurate'
    if (!data.declarationTerms) errors.declarationTerms = 'You must agree to the terms of service'
  }

  return errors
}

// ─── Word count color ─────────────────────────────────────────────────────────

function wordCountColor(count: number, limit: number) {
  const warn = limit - 20
  if (count > limit) return 'rgba(201, 116, 83, 0.9)'
  if (count > warn) return 'rgba(212, 140, 55, 0.9)'
  return 'rgba(212, 175, 55, 0.5)'
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] } },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
  }),
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ComplaintFormPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Submission + payment state
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [complaintId, setComplaintId] = useState<string | null>(null)
  const [complaintNumber, setComplaintNumber] = useState<string | null>(null)
  const [instructions, setInstructions] = useState<PaymentInstructions | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const proofInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getPaymentInstructions()
      .then(setInstructions)
      .catch(() => setInstructions(null))
  }, [])

  const [form, setForm] = useState<FormData>({
    fullName: '', cnic: '', email: '', phone: '', city: '', address: '',
    institution: '', department: '', incidentDate: '', referenceNumber: '', issueType: '',
    subject: '', description: '', desiredOutcome: '', priorAttempts: '', priorReference: '',
    documents: [], declarationTrue: false, declarationTerms: false,
  })

  const set = useCallback((field: keyof FormData, value: FieldValue) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
  }, [])

  const focusStyle = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)'
    e.target.style.background = 'rgba(212, 175, 55, 0.04)'
    e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.06)'
  }, [])

  const blurStyle = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, errorKey: string) => {
    e.target.style.background = 'rgba(249, 248, 246, 0.03)'
    e.target.style.boxShadow = 'none'
    e.target.style.borderColor = errors[errorKey]
      ? 'rgba(201, 116, 83, 0.5)'
      : 'rgba(249, 248, 246, 0.08)'
  }, [errors])

  /** Maps the form state onto the backend CreateComplaintData shape */
  const buildComplaintPayload = () => ({
    title: form.subject.trim(),
    description: form.description.trim(),
    targetOrganization: form.institution,
    location: form.city || undefined,
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phoneNumber: form.phone.trim(),
    cnic: form.cnic || undefined,
    city: form.city || undefined,
    address: form.address || undefined,
    department: form.department || undefined,
    institutionReference: form.referenceNumber || undefined,
    issueType: form.issueType || undefined,
    incidentDate: form.incidentDate || undefined,
    desiredOutcome: form.desiredOutcome || undefined,
    priorAttempts: form.priorAttempts ? form.priorAttempts === 'Yes' : undefined,
    priorAttemptReference: form.priorReference || undefined,
    declarationTruthful: form.declarationTrue,
    declarationTerms: form.declarationTerms,
  })

  const goNext = async () => {
    const errs = validateSection(step, form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    // Steps before the declaration simply advance
    if (step < SECTIONS.length - 2) {
      setDirection(1)
      setStep((s) => s + 1)
      return
    }

    // Declaration step → create the complaint, then move to payment
    if (step === SECTIONS.length - 2) {
      setApiError(null)
      setSubmitting(true)
      try {
        const complaint = await submitComplaint(buildComplaintPayload())
        setComplaintId(complaint.id)
        setComplaintNumber(complaint.complaintNumber)
        setDirection(1)
        setStep(PAYMENT_STEP)
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Failed to submit complaint')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => s - 1)
    setErrors({})
  }

  const handleProofSelect = (selected: File | null) => {
    setApiError(null)
    if (!selected) return
    if (!ACCEPTED_PROOF.includes(selected.type)) {
      setApiError('Please upload a JPG, PNG, WEBP, or PDF file.')
      return
    }
    if (selected.size > MAX_PROOF_BYTES) {
      setApiError('File is too large (max 10 MB).')
      return
    }
    setProofFile(selected)
  }

  const handleProofUpload = async () => {
    if (!proofFile || !complaintId) return
    setUploading(true)
    setApiError(null)
    try {
      await uploadComplaintPaymentProof(complaintId, proofFile)
      setSubmitted(true)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to upload payment screenshot')
    } finally {
      setUploading(false)
    }
  }

  const descWords = countWords(form.description)
  const outcomeWords = countWords(form.desiredOutcome)

  return (
    <main className={styles.main}>
      {/* ── Confirmation Modal ───────────────────────────────── */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.modalIcon}>
                <Check strokeWidth={1.5} />
              </div>
              <span className={styles.modalEyebrow}>Complaint Received</span>
              <h2 className={styles.modalTitle}>
                Your dossier has been<br /><em>submitted.</em>
              </h2>
              {complaintNumber && (
                <p className={styles.modalBody} style={{ marginBottom: '0.75rem' }}>
                  Your complaint number is <strong>{complaintNumber}</strong>. Keep it to
                  track your case.
                </p>
              )}
              <p className={styles.modalBody}>
                We have received your payment screenshot. Our team will verify it and your
                complaint will be reviewed by our legal team. Questions?{' '}
                {instructions?.whatsappNumber
                  ? <>WhatsApp <strong>{instructions.whatsappNumber}</strong> or </>
                  : null}
                email{' '}
                <strong>{instructions?.contactEmail ?? 'info@arandcolaw.com'}</strong>.
              </p>
              <button
                type="button"
                className={styles.modalBtn}
                onClick={() => router.push('/complaint-section')}
              >
                <span>Understood</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.layout}>
        {/* ══ Left — Dossier sidebar ══════════════════════════════ */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            {/* Header */}
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarEyebrow}>Legal Intake Form</span>
              <h1 className={styles.sidebarTitle}>
                File a<br /><em>Complaint</em>
              </h1>
              <p className={styles.sidebarSub}>
                Complete all five steps. Your information is handled with
                strict legal confidentiality.
              </p>
            </div>

            {/* Step indicators */}
            <nav className={styles.stepNav} aria-label="Form sections">
              {SECTIONS.map((s, i) => (
                <div
                  key={s.number}
                  className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}
                >
                  <div className={styles.stepDotWrap}>
                    <div className={styles.stepDot}>
                      {i < step ? <Check style={{ width: 10, height: 10 }} /> : null}
                    </div>
                    {i < SECTIONS.length - 1 && <div className={styles.stepLine} />}
                  </div>
                  <div className={styles.stepLabel}>
                    <span className={styles.stepNumber}>{s.number}</span>
                    <span className={styles.stepTitle}>{s.title}</span>
                    <span className={styles.stepSubtitle}>{s.subtitle}</span>
                  </div>
                </div>
              ))}
            </nav>

          </div>
        </aside>

        {/* ══ Right — Form panel ══════════════════════════════════ */}
        <div className={styles.formPanel}>
          {/* Section heading */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`heading-${step}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={styles.sectionHeading}
            >
              <span className={styles.sectionNumber}>{SECTIONS[step].number}</span>
              <h2 className={styles.sectionTitle}>{SECTIONS[step].title}</h2>
              <p className={styles.sectionSubtitle}>{SECTIONS[step].subtitle}</p>
            </motion.div>
          </AnimatePresence>

          {/* Form fields */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`fields-${step}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={styles.fieldsWrap}
            >

              {/* ── §01 Complainant ─────────────────────────────── */}
              {step === 0 && (
                <div className={styles.fieldsGrid}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="As per CNIC / Passport"
                      value={form.fullName}
                      onChange={(e) => set('fullName', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'fullName')}
                      style={inputStyle(errors.fullName)}
                    />
                    {errors.fullName && <span style={errorStyle} role="alert">{errors.fullName}</span>}
                  </div>

                  <div>
                    <label style={labelStyle}>CNIC / Passport No. *</label>
                    <input
                      type="text"
                      placeholder="e.g. 61101-1234567-1"
                      value={form.cnic}
                      onChange={(e) => set('cnic', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'cnic')}
                      style={inputStyle(errors.cnic)}
                    />
                    {errors.cnic && <span style={errorStyle} role="alert">{errors.cnic}</span>}
                  </div>

                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+92 300 0000000"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'phone')}
                      style={inputStyle(errors.phone)}
                    />
                    {errors.phone && <span style={errorStyle} role="alert">{errors.phone}</span>}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'email')}
                      style={inputStyle(errors.email)}
                    />
                    {errors.email && <span style={errorStyle} role="alert">{errors.email}</span>}
                  </div>

                  <div>
                    <label style={labelStyle}>City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Islamabad"
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'city')}
                      style={inputStyle(errors.city)}
                    />
                    {errors.city && <span style={errorStyle} role="alert">{errors.city}</span>}
                  </div>

                  <div>
                    <label style={labelStyle}>Residential Address *</label>
                    <input
                      type="text"
                      placeholder="Street, Sector, Area"
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'address')}
                      style={inputStyle(errors.address)}
                    />
                    {errors.address && <span style={errorStyle} role="alert">{errors.address}</span>}
                  </div>
                </div>
              )}

              {/* ── §02 Institution ──────────────────────────────── */}
              {step === 1 && (
                <div className={styles.fieldsGrid}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Institution / Organisation *</label>
                    <CustomSelect
                      value={form.institution}
                      onChange={(v) => set('institution', v)}
                      options={INSTITUTIONS}
                      placeholder="Select institution…"
                      error={errors.institution}
                    />
                    {errors.institution && <span style={errorStyle} role="alert">{errors.institution}</span>}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Department / Division <span style={{ opacity: 0.5 }}>(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Enforcement Division"
                      value={form.department}
                      onChange={(e) => set('department', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'department')}
                      style={inputStyle()}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Date of Incident *</label>
                    <input
                      type="date"
                      value={form.incidentDate}
                      onChange={(e) => set('incidentDate', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'incidentDate')}
                      style={{ ...inputStyle(errors.incidentDate), colorScheme: 'dark' }}
                    />
                    {errors.incidentDate && <span style={errorStyle} role="alert">{errors.incidentDate}</span>}
                  </div>

                  <div>
                    <label style={labelStyle}>Reference / File No. <span style={{ opacity: 0.5 }}>(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. CDA-2024-00123"
                      value={form.referenceNumber}
                      onChange={(e) => set('referenceNumber', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'referenceNumber')}
                      style={inputStyle()}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Nature of Issue *</label>
                    <CustomSelect
                      value={form.issueType}
                      onChange={(v) => set('issueType', v)}
                      options={ISSUE_TYPES}
                      placeholder="Select issue type…"
                      error={errors.issueType}
                    />
                    {errors.issueType && <span style={errorStyle} role="alert">{errors.issueType}</span>}
                  </div>
                </div>
              )}

              {/* ── §03 Complaint ────────────────────────────────── */}
              {step === 2 && (
                <div className={styles.fieldsGrid}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Subject / Title *</label>
                    <input
                      type="text"
                      placeholder="Brief subject of your complaint"
                      value={form.subject}
                      onChange={(e) => set('subject', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'subject')}
                      style={inputStyle(errors.subject)}
                    />
                    {errors.subject && <span style={errorStyle} role="alert">{errors.subject}</span>}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Full Description *</label>
                      <span style={{ fontFamily: "'Georgia', serif", fontSize: '0.68rem', color: wordCountColor(descWords, WORD_LIMIT) }}>
                        {descWords} / {WORD_LIMIT} words
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      placeholder="Describe the incident, the authority's actions, and how it has affected you…"
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'description')}
                      style={textareaStyle(errors.description)}
                    />
                    {errors.description && <span style={errorStyle} role="alert">{errors.description}</span>}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Desired Outcome *</label>
                      <span style={{ fontFamily: "'Georgia', serif", fontSize: '0.68rem', color: wordCountColor(outcomeWords, OUTCOME_LIMIT) }}>
                        {outcomeWords} / {OUTCOME_LIMIT} words
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="What resolution are you seeking from this complaint?"
                      value={form.desiredOutcome}
                      onChange={(e) => set('desiredOutcome', e.target.value)}
                      onFocus={focusStyle}
                      onBlur={(e) => blurStyle(e, 'desiredOutcome')}
                      style={textareaStyle(errors.desiredOutcome)}
                    />
                    {errors.desiredOutcome && <span style={errorStyle} role="alert">{errors.desiredOutcome}</span>}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Have you made prior attempts to resolve this? *</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontFamily: "'Georgia', serif", fontSize: '0.88rem', color: 'var(--heritage-cream)' }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${form.priorAttempts === opt ? 'var(--heritage-gold)' : 'rgba(249,248,246,0.15)'}`,
                            background: form.priorAttempts === opt ? 'rgba(212,175,55,0.15)' : 'transparent',
                            transition: 'all 0.2s',
                          }}>
                            {form.priorAttempts === opt && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--heritage-gold)' }} />}
                          </span>
                          <input type="radio" value={opt} checked={form.priorAttempts === opt} onChange={() => set('priorAttempts', opt)} style={{ display: 'none' }} />
                          {opt}
                        </label>
                      ))}
                    </div>
                    {errors.priorAttempts && <span style={errorStyle} role="alert">{errors.priorAttempts}</span>}
                  </div>

                  {form.priorAttempts === 'Yes' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Previous Complaint Reference <span style={{ opacity: 0.5 }}>(optional)</span></label>
                      <input
                        type="text"
                        placeholder="Reference number of prior attempt"
                        value={form.priorReference}
                        onChange={(e) => set('priorReference', e.target.value)}
                        onFocus={focusStyle}
                        onBlur={(e) => blurStyle(e, 'priorReference')}
                        style={inputStyle()}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ── §04 Declaration ──────────────────────────────── */}
              {step === 3 && (
                <div className={styles.fieldsGrid}>
                  {/* File upload */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Supporting Documents <span style={{ opacity: 0.5 }}>(optional)</span></label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '100%', padding: '1.5rem', border: '1px dashed rgba(212, 175, 55, 0.25)',
                        borderRadius: '0.75rem', background: 'rgba(212, 175, 55, 0.03)', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212, 175, 55, 0.5)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212, 175, 55, 0.06)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212, 175, 55, 0.25)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212, 175, 55, 0.03)' }}
                    >
                      <Upload style={{ width: 20, height: 20, color: 'rgba(212, 175, 55, 0.6)' }} />
                      <span style={{ fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(249, 248, 246, 0.5)' }}>
                        Click to upload files
                      </span>
                      <span style={{ fontFamily: "'Georgia', serif", fontSize: '0.7rem', color: 'rgba(249, 248, 246, 0.25)', letterSpacing: '0.1em' }}>
                        PDF, JPG, PNG · Max 10MB each
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? [])
                        set('documents', [...form.documents, ...files])
                      }}
                    />

                    {form.documents.length > 0 && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {form.documents.map((file, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(212, 175, 55, 0.06)', borderRadius: '100px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                            <span style={{ fontFamily: "'Georgia', serif", fontSize: '0.78rem', color: 'rgba(249, 248, 246, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{file.name}</span>
                            <button type="button" onClick={() => set('documents', form.documents.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(249, 248, 246, 0.3)', padding: '0 0.25rem', display: 'flex' }}>
                              <X style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Declaration notice */}
                  <div style={{ gridColumn: '1 / -1', padding: '1.5rem', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '0.75rem', background: 'rgba(212, 175, 55, 0.04)' }}>
                    <p style={{ fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(249, 248, 246, 0.6)', margin: 0 }}>
                      By submitting this complaint, you acknowledge that AR&CO will review your case and contact you for an initial consultation. This submission does not constitute a legal retainer or guarantee of representation. All information is handled under strict attorney-client confidentiality principles.
                    </p>
                  </div>

                  {/* Checkboxes */}
                  {[
                    { key: 'declarationTrue' as const, text: 'I declare that all information provided in this complaint is true and accurate to the best of my knowledge.' },
                    { key: 'declarationTerms' as const, text: 'I agree to the terms of service and privacy policy of AR&CO Law Associates.' },
                  ].map(({ key, text }) => (
                    <div key={key} style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', cursor: 'pointer' }}>
                        <span
                          onClick={() => set(key, !form[key])}
                          style={{
                            width: 20, height: 20, borderRadius: '4px', flexShrink: 0, marginTop: '0.1rem',
                            border: `1px solid ${form[key] ? 'var(--heritage-gold)' : errors[key] ? 'rgba(201, 116, 83, 0.5)' : 'rgba(249,248,246,0.15)'}`,
                            background: form[key] ? 'rgba(212,175,55,0.2)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', cursor: 'pointer',
                          }}
                        >
                          {form[key] && <Check style={{ width: 12, height: 12, color: 'var(--heritage-gold)' }} />}
                        </span>
                        <span style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '0.84rem', lineHeight: 1.6, color: 'rgba(249, 248, 246, 0.6)' }}>
                          {text}
                        </span>
                      </label>
                      {errors[key] && <span style={{ ...errorStyle, marginTop: '0.4rem' }} role="alert">{errors[key]}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* ── §05 Payment ──────────────────────────────────── */}
              {step === PAYMENT_STEP && (
                <div className={styles.fieldsGrid}>
                  {/* Fee summary */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '0.75rem', background: 'rgba(212, 175, 55, 0.05)' }}>
                    <CreditCard style={{ width: 20, height: 20, color: 'var(--heritage-gold)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: "'Georgia', serif", fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(249,248,246,0.45)' }}>Complaint Filing Fee</span>
                      <span style={{ display: 'block', fontFamily: "'Georgia', serif", fontSize: '1.15rem', color: 'var(--heritage-cream)' }}>{COMPLAINT_FEE_LABEL}</span>
                    </div>
                    {complaintNumber && (
                      <span style={{ fontFamily: "'Georgia', serif", fontSize: '0.75rem', color: 'rgba(212,175,55,0.7)' }}>{complaintNumber}</span>
                    )}
                  </div>

                  {/* Bank details */}
                  <div style={{ gridColumn: '1 / -1', padding: '1.25rem', border: '1px solid rgba(249,248,246,0.08)', borderRadius: '0.75rem', background: 'rgba(249,248,246,0.02)' }}>
                    <p style={{ fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(249,248,246,0.6)', marginTop: 0, marginBottom: '0.9rem' }}>
                      Transfer the fee to the account below, then upload your payment screenshot to complete your submission.
                    </p>
                    {instructions ? (
                      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: '0.4rem', columnGap: '1rem', margin: 0, fontFamily: "'Georgia', serif", fontSize: '0.84rem' }}>
                        <dt style={{ color: 'rgba(249,248,246,0.4)' }}>Bank</dt><dd style={{ margin: 0, color: 'var(--heritage-cream)' }}>{instructions.bankName}</dd>
                        <dt style={{ color: 'rgba(249,248,246,0.4)' }}>Account Title</dt><dd style={{ margin: 0, color: 'var(--heritage-cream)' }}>{instructions.accountTitle}</dd>
                        <dt style={{ color: 'rgba(249,248,246,0.4)' }}>Account No.</dt><dd style={{ margin: 0, color: 'var(--heritage-cream)' }}>{instructions.accountNumber}</dd>
                        <dt style={{ color: 'rgba(249,248,246,0.4)' }}>IBAN</dt><dd style={{ margin: 0, color: 'var(--heritage-cream)' }}>{instructions.iban}</dd>
                      </dl>
                    ) : (
                      <p style={{ fontFamily: "'Georgia', serif", fontSize: '0.8rem', color: 'rgba(249,248,246,0.4)', margin: 0 }}>Loading payment details…</p>
                    )}
                  </div>

                  {/* Screenshot upload */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Payment Screenshot *</label>
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      disabled={uploading}
                      style={{
                        width: '100%', padding: '1.5rem', border: '1px dashed rgba(212, 175, 55, 0.25)',
                        borderRadius: '0.75rem', background: 'rgba(212, 175, 55, 0.03)', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s',
                      }}
                    >
                      <Upload style={{ width: 20, height: 20, color: 'rgba(212, 175, 55, 0.6)' }} />
                      <span style={{ fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(249, 248, 246, 0.5)' }}>
                        {proofFile ? 'Change screenshot' : 'Click to upload your payment screenshot'}
                      </span>
                      <span style={{ fontFamily: "'Georgia', serif", fontSize: '0.7rem', color: 'rgba(249, 248, 246, 0.25)', letterSpacing: '0.1em' }}>
                        JPG, PNG, WEBP, PDF · Max 10MB
                      </span>
                    </button>
                    <input
                      ref={proofInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleProofSelect(e.target.files?.[0] ?? null)}
                    />
                    {proofFile && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(212, 175, 55, 0.06)', borderRadius: '100px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                        <Check style={{ width: 14, height: 14, color: 'var(--heritage-gold)', flexShrink: 0 }} />
                        <span style={{ fontFamily: "'Georgia', serif", fontSize: '0.78rem', color: 'rgba(249, 248, 246, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proofFile.name}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield style={{ width: 13, height: 13, color: 'rgba(249,248,246,0.35)', flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Georgia', serif", fontSize: '0.74rem', color: 'rgba(249,248,246,0.4)' }}>
                      Your complaint is reviewed once our team verifies your payment.
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {apiError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.65rem 0.9rem', border: '1px solid rgba(201, 116, 83, 0.4)', borderRadius: '0.5rem', background: 'rgba(201, 116, 83, 0.08)' }} role="alert">
              <AlertCircle style={{ width: 14, height: 14, color: 'rgba(201, 116, 83, 0.9)', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Georgia', serif", fontSize: '0.8rem', color: 'rgba(201, 116, 83, 0.9)' }}>{apiError}</span>
            </div>
          )}

          {/* ── Navigation buttons ──────────────────────────────── */}
          {step === PAYMENT_STEP ? (
            <div className={styles.formNav} style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleProofUpload}
                disabled={!proofFile || uploading}
                className={styles.btnNext}
              >
                {uploading ? (
                  <><Loader2 style={{ width: 14, height: 14 }} className={styles.spinner} /><span>Uploading…</span></>
                ) : (
                  <><span>Submit Payment Proof</span><ArrowUpRight style={{ width: 14, height: 14 }} /></>
                )}
              </button>
            </div>
          ) : (
            <div className={styles.formNav}>
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0 || submitting}
                className={styles.btnBack}
              >
                <ArrowLeft style={{ width: 14, height: 14 }} />
                Back
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className={styles.btnNext}
              >
                {step < SECTIONS.length - 2 ? (
                  <><span>Continue</span><ArrowRight style={{ width: 14, height: 14 }} /></>
                ) : submitting ? (
                  <><Loader2 style={{ width: 14, height: 14 }} className={styles.spinner} /><span>Submitting…</span></>
                ) : (
                  <><span>Continue to Payment</span><ArrowUpRight style={{ width: 14, height: 14 }} /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
