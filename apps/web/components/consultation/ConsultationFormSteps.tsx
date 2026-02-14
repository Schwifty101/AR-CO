'use client'

import styles from './ConsultationOverlay.module.css'

/* ─── Constants ─── */

/** Available practice areas for consultation booking */
export const PRACTICE_AREAS = [
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

/** Urgency levels with human-readable labels */
export const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low \u2014 General enquiry' },
  { value: 'medium', label: 'Medium \u2014 Needs attention soon' },
  { value: 'high', label: 'High \u2014 Time-sensitive matter' },
  { value: 'urgent', label: 'Urgent \u2014 Immediate assistance needed' },
]

/* ─── Types ─── */

/** Form data collected across steps 1 and 2 */
export interface ConsultationFormData {
  name: string
  email: string
  phone: string
  practiceArea: string
  caseDescription: string
  urgency: string
  relevantDates: string
  opposingParty: string
  additionalNotes: string
}

/** Initial empty form state */
export const INITIAL_FORM_DATA: ConsultationFormData = {
  name: '',
  email: '',
  phone: '',
  practiceArea: '',
  caseDescription: '',
  urgency: 'medium',
  relevantDates: '',
  opposingParty: '',
  additionalNotes: '',
}

/** Shared props for step form components */
interface StepFormProps {
  formData: ConsultationFormData
  errors: Partial<Record<keyof ConsultationFormData, string>>
  onFieldChange: (field: keyof ConsultationFormData, value: string) => void
}

/* ─── Step 1: Personal Information ─── */

/**
 * PersonalInfoStep
 *
 * Renders the personal information fields for step 1:
 * full name, email address, and phone number.
 *
 * @example
 * ```tsx
 * <PersonalInfoStep
 *   formData={formData}
 *   errors={errors}
 *   onFieldChange={updateField}
 * />
 * ```
 */
export function PersonalInfoStep({ formData, errors, onFieldChange }: StepFormProps) {
  return (
    <>
      <span className={styles.sectionLabel}>Personal Information</span>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Full Name</label>
        <input
          type="text"
          className={styles.fieldInput}
          placeholder="e.g. Ahmed Raza"
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
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
          onChange={(e) => onFieldChange('email', e.target.value)}
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
          onChange={(e) => onFieldChange('phone', e.target.value)}
        />
        {errors.phone && (
          <span className={styles.fieldError}>{errors.phone}</span>
        )}
      </div>
    </>
  )
}

/* ─── Step 2: Case Details ─── */

/**
 * CaseDetailsStep
 *
 * Renders the case details fields for step 2: practice area, case description,
 * urgency level, and optional fields (relevant dates, opposing party,
 * additional notes).
 *
 * @example
 * ```tsx
 * <CaseDetailsStep
 *   formData={formData}
 *   errors={errors}
 *   onFieldChange={updateField}
 * />
 * ```
 */
export function CaseDetailsStep({ formData, errors, onFieldChange }: StepFormProps) {
  return (
    <>
      <span className={styles.sectionLabel}>Case Details</span>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Practice Area</label>
        <select
          className={styles.fieldSelect}
          value={formData.practiceArea}
          onChange={(e) => onFieldChange('practiceArea', e.target.value)}
        >
          <option value="">Select a practice area...</option>
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
        <label className={styles.fieldLabel}>Brief Description of Your Case</label>
        <textarea
          className={styles.fieldTextarea}
          placeholder="Provide a brief overview of your legal matter so our team can prepare for the consultation (minimum 20 characters)..."
          value={formData.caseDescription}
          onChange={(e) => onFieldChange('caseDescription', e.target.value)}
          rows={4}
        />
        {errors.caseDescription && (
          <span className={styles.fieldError}>{errors.caseDescription}</span>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Urgency Level</label>
        <select
          className={styles.fieldSelect}
          value={formData.urgency}
          onChange={(e) => onFieldChange('urgency', e.target.value)}
        >
          {URGENCY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Relevant Dates{' '}
          <span className={styles.fieldOptional}>(optional)</span>
        </label>
        <input
          type="text"
          className={styles.fieldInput}
          placeholder="e.g. Court hearing on 15 March, deadline 30 April..."
          value={formData.relevantDates}
          onChange={(e) => onFieldChange('relevantDates', e.target.value)}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Opposing Party{' '}
          <span className={styles.fieldOptional}>(optional)</span>
        </label>
        <input
          type="text"
          className={styles.fieldInput}
          placeholder="e.g. XYZ Corporation, Government Agency..."
          value={formData.opposingParty}
          onChange={(e) => onFieldChange('opposingParty', e.target.value)}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Additional Notes{' '}
          <span className={styles.fieldOptional}>(optional)</span>
        </label>
        <textarea
          className={styles.fieldTextarea}
          placeholder="Any additional information that may help our attorneys prepare..."
          value={formData.additionalNotes}
          onChange={(e) => onFieldChange('additionalNotes', e.target.value)}
          rows={3}
        />
      </div>
    </>
  )
}
