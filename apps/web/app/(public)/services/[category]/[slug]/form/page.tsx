'use client'

import { use, useState, useRef, useEffect, Fragment } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getEmojiFlag, getCountryDataList } from 'countries-list'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { Command } from 'cmdk'
import * as Popover from '@radix-ui/react-popover'
import {
  isValidCategory,
  findServiceBySlug,
  getCategoryForm,
  getCategoryDocuments,
  type CategoryType,
} from '@/lib/categoryDataMapper'
import type { FormField } from '@/components/data/facilitationCenterData'

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

/** Slide animation variants */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

/** Form field value type */
type FormFieldValue = string | boolean | string[] | FileList | null

/** Maximum word count for textarea fields */
const TEXTAREA_MAX_WORDS = 300

/** Amber threshold for word count warning */
const TEXTAREA_WARN_WORDS = 280

/** All countries from library — sorted with Pakistan first for default UX */
const ALL_COUNTRIES = getCountryDataList().sort((a, b) => {
  if (a.iso2 === 'PK') return -1
  if (b.iso2 === 'PK') return 1
  return a.name.localeCompare(b.name)
})

/**
 * Checks whether a select field should render as a country name selector.
 * Detection: field type is 'select' AND (id includes 'country' but NOT 'country_code'/'countryCode'
 * OR label lowercased includes 'country' but not 'country code').
 *
 * @param field - The FormField to test
 */
function isCountryField(field: FormField): boolean {
  if (field.type !== 'select') return false
  const idLower = field.id.toLowerCase()
  const labelLower = field.label.toLowerCase()
  return idLower.includes('country') || labelLower.includes('country')
}

/**
 * Counts words in a string for textarea word-limit enforcement.
 *
 * @param value - The text to count words in
 * @returns Integer word count (0 for empty/whitespace-only strings)
 */
function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0
}

/**
 * Trims a string to at most maxWords words, preserving natural spacing.
 *
 * @param value - The text to trim
 * @param maxWords - Maximum number of words to allow
 * @returns Trimmed string
 */
function trimToWordLimit(value: string, maxWords: number): string {
  if (!value.trim()) return value
  const words = value.trim().split(/\s+/)
  if (words.length <= maxWords) return value
  return words.slice(0, maxWords).join(' ')
}

/**
 * Validates an email address format.
 *
 * @param email - Email string to validate
 * @returns true if the format is valid
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validates a full phone number (country code + local number) using libphonenumber.
 * Falls back to a digit-count check if the library throws.
 *
 * @param cc - Dial code string e.g. '+92'
 * @param local - Local number digits entered by the user
 * @returns true if the number is considered valid
 */
function isValidPhone(cc: string, local: string): boolean {
  try {
    return isValidPhoneNumber(cc + local.replace(/^0+/, ''))
  } catch {
    return local.replace(/\D/g, '').length >= 7
  }
}

/** Shared select element styles for country and country-code selectors */
const sharedSelectStyle: React.CSSProperties = {
  padding: '0.85rem 1rem',
  background: 'rgba(249, 248, 246, 0.03)',
  border: '1px solid rgba(249, 248, 246, 0.08)',
  borderRadius: '100px',
  fontFamily: "'Georgia', 'Times New Roman', serif",
  fontSize: '0.88rem',
  letterSpacing: '0.01em',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='rgba(249,248,246,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  width: '100%',
  cursor: 'pointer',
  transition: 'all 300ms',
}

/**
 * Looks up the dial code (e.g. '+92') for a given ISO2 country code.
 * Falls back to '+92' (Pakistan) if the code is not found.
 */
function getDialCode(iso2: string): string {
  const country = ALL_COUNTRIES.find((c) => c.iso2 === iso2)
  return country ? `+${country.phone[0]}` : '+92'
}

/**
 * Searchable combobox for country / dial-code selection.
 * Rendered in a Radix Popover portal so flag emoji display correctly on all
 * platforms. Uses cmdk for instant client-side filtering as the user types.
 *
 * Items carry a `searchLabel` string (plain text) that cmdk filters against,
 * while `display` holds the full React node shown in the list and trigger.
 */
function FormCombobox({
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  items,
  hasError,
  triggerWidth,
  contentMinWidth,
}: {
  value: string
  onValueChange: (v: string) => void
  placeholder?: string
  searchPlaceholder?: string
  items: { value: string; display: React.ReactNode; searchLabel: string }[]
  hasError?: boolean
  triggerWidth?: string
  contentMinWidth?: string
}) {
  const [open, setOpen] = useState(false)
  const selectedItem = items.find((item) => item.value === value)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.4rem',
            padding: '0.85rem 1rem',
            width: triggerWidth || '100%',
            flexShrink: triggerWidth ? 0 : undefined,
            background: open ? 'rgba(212, 175, 55, 0.02)' : 'rgba(249, 248, 246, 0.03)',
            border: `1px solid ${hasError ? 'rgba(201, 116, 83, 0.5)' : open ? 'rgba(212, 175, 55, 0.35)' : 'rgba(249, 248, 246, 0.08)'}`,
            borderRadius: '100px',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: '0.88rem',
            color: 'var(--heritage-cream)',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color 300ms, background 300ms',
            userSelect: 'none',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, overflow: 'hidden' }}>
            {selectedItem
              ? selectedItem.display
              : <span style={{ color: 'rgba(249, 248, 246, 0.3)', fontStyle: 'italic' }}>{placeholder || 'Select…'}</span>
            }
          </span>
          <svg
            width="12" height="8" viewBox="0 0 12 8" fill="none"
            style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
          >
            <path d="M1 1.5L6 6.5L11 1.5" stroke="rgba(249,248,246,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          data-lenis-prevent
          style={{
            background: '#110b06',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            zIndex: 9999,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            width: contentMinWidth || 'var(--radix-popover-trigger-width)',
            minWidth: triggerWidth ? (contentMinWidth || '200px') : 'var(--radix-popover-trigger-width)',
          }}
        >
          <Command>
            {/* Search input */}
            <div style={{ padding: '0.5rem 0.5rem 0.35rem', borderBottom: '1px solid rgba(212, 175, 55, 0.08)' }}>
              <Command.Input
                placeholder={searchPlaceholder || 'Search…'}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                  color: 'var(--heritage-cream)',
                  padding: '0.25rem 0.4rem',
                  letterSpacing: '0.01em',
                }}
              />
            </div>

            {/* Scrollable results list */}
            <Command.List className="combobox-list" style={{ maxHeight: '240px', overflowY: 'auto', padding: '0.25rem' }}>
              <Command.Empty
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: '0.8rem',
                  fontStyle: 'italic',
                  color: 'rgba(249, 248, 246, 0.3)',
                }}
              >
                No results found
              </Command.Empty>

              {items.map((item) => (
                <Command.Item
                  key={item.value}
                  value={item.searchLabel}
                  onSelect={() => {
                    onValueChange(item.value)
                    setOpen(false)
                  }}
                  className="combobox-item"
                  style={{
                    padding: '0.45rem 0.65rem',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: '0.85rem',
                    color: 'rgba(249, 248, 246, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '0.4rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {item.display}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

/** Step 4: Dynamic category-specific form */
export default function ServiceForm({ params }: PageProps) {
  const { category, slug } = use(params)
  const router = useRouter()

  // All hooks must be called before any conditional returns
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [formData, setFormData] = useState<Record<string, FormFieldValue>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const formWrapperRef = useRef<HTMLDivElement>(null)

  // Validate category and find service
  const categoryValid = isValidCategory(category)
  const service = categoryValid ? findServiceBySlug(category as CategoryType, slug) : null
  const formSections = categoryValid ? getCategoryForm(category as CategoryType) : []
  const total = formSections.length

  const currentSection = total > 0 ? formSections[currentIndex] : null
  const isFirst = currentIndex === 0
  const isLast = total > 0 ? currentIndex === total - 1 : true

  // Use single column if section has 4 or fewer fields
  const useSingleColumn = currentSection ? currentSection.fields.length <= 4 : false

  // Handle mouse wheel scrolling (intercept before GSAP ScrollSmoother)
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const handleWheel = (e: WheelEvent) => {
      // ALWAYS prevent default to stop page scroll
      e.preventDefault()
      // Stop all propagation to prevent GSAP ScrollSmoother
      e.stopPropagation()
      e.stopImmediatePropagation()

      // Get the scroll container's current scroll position and dimensions
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer

      // Check if we can scroll in the direction of the wheel
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 1 // -1 for rounding
      const canScrollUp = scrollTop > 1 // +1 for rounding

      // Scroll the container if we can
      if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
        scrollContainer.scrollTop += e.deltaY
      }
    }

    // Add wheel event at CAPTURE phase with { passive: false } to intercept early
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    return () => scrollContainer.removeEventListener('wheel', handleWheel, { capture: true })
  }, [currentIndex])

  // Handle touch scrolling for mobile devices
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      // Stop propagation to prevent GSAP from handling
      e.stopPropagation()
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const canScrollDown = scrollTop < scrollHeight - clientHeight
      const canScrollUp = scrollTop > 0

      // Only prevent default if we can scroll in the touch direction
      if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) {
        e.stopPropagation()
      }
    }

    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true })
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      scrollContainer.removeEventListener('touchstart', handleTouchStart)
      scrollContainer.removeEventListener('touchmove', handleTouchMove)
    }
  }, [currentIndex])

  // Handle keyboard scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the active element is an input or textarea
      const activeElement = document.activeElement
      if (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.tagName === 'SELECT'
      ) {
        return // Don't handle arrow keys when typing in form fields
      }

      const scrollAmount = 40
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          scrollContainer.scrollTop += scrollAmount
          break
        case 'ArrowUp':
          e.preventDefault()
          scrollContainer.scrollTop -= scrollAmount
          break
        case 'PageDown':
          e.preventDefault()
          scrollContainer.scrollTop += scrollContainer.clientHeight
          break
        case 'PageUp':
          e.preventDefault()
          scrollContainer.scrollTop -= scrollContainer.clientHeight
          break
        case 'Home':
          if (e.ctrlKey) {
            e.preventDefault()
            scrollContainer.scrollTop = 0
          }
          break
        case 'End':
          if (e.ctrlKey) {
            e.preventDefault()
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }
          break
      }
    }

    scrollContainer.addEventListener('keydown', handleKeyDown)
    return () => scrollContainer.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  // Auto-focus scroll container when section changes
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.focus()
      scrollContainer.scrollTop = 0 // Reset scroll to top when changing sections
    }
  }, [currentIndex])

  // Prevent any wheel events from escaping the form wrapper
  useEffect(() => {
    const formWrapper = formWrapperRef.current
    if (!formWrapper) return

    const preventWheelEscape = (e: WheelEvent) => {
      // Stop all propagation at the wrapper level
      e.stopPropagation()
      e.stopImmediatePropagation()
    }

    // Add at capture phase to intercept early
    formWrapper.addEventListener('wheel', preventWheelEscape, { passive: true, capture: true })

    return () => formWrapper.removeEventListener('wheel', preventWheelEscape, { capture: true })
  }, [])

  // Guard: redirect to /documents if required docs haven't been uploaded yet
  useEffect(() => {
    if (!categoryValid) return
    const docs = getCategoryDocuments(category as CategoryType)
    const hasRequired = docs.some((d) => d.required)
    if (!hasRequired) return
    const flag = sessionStorage.getItem(`docs_completed_${category}_${slug}`)
    if (!flag) {
      router.replace(`/services/${category}/${slug}/documents`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Clears the validation error for a single field.
   * Called on every onChange event to give immediate feedback.
   *
   * @param fieldId - The id of the field whose error should be cleared
   */
  const clearFieldError = (fieldId: string) => {
    setValidationErrors((prev) => {
      if (!(fieldId in prev)) return prev
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }

  /**
   * Validates all required fields in a given section.
   * Returns an errors map; empty map means section is valid.
   *
   * @param fields - Array of FormField objects for the section
   * @param data - Current form data record
   * @returns Record mapping field.id to error message string
   */
  const validateSection = (
    fields: FormField[],
    data: Record<string, FormFieldValue>
  ): Record<string, string> => {
    const errors: Record<string, string> = {}

    for (const field of fields) {
      const value = data[field.id]

      if (field.required) {
        let isEmpty = false
        if (value === undefined || value === null || value === '') {
          isEmpty = true
        } else if (Array.isArray(value) && value.length === 0) {
          isEmpty = true
        } else if (value === false) {
          // Required single checkbox must be checked
          isEmpty = true
        }
        if (isEmpty) {
          errors[field.id] = 'This field is required'
          continue
        }
      }

      // Format validation for non-empty values
      if (field.type === 'email' && value && typeof value === 'string' && value.trim() !== '') {
        if (!isValidEmail(value.trim())) {
          errors[field.id] = 'Please enter a valid email address'
        }
      }

      if (field.type === 'tel' && value && typeof value === 'string' && value.trim() !== '') {
        const cc = getDialCode((data[field.id + '__cc'] as string) || 'PK')
        if (!isValidPhone(cc, value)) {
          errors[field.id] = 'Please enter a valid phone number'
        }
      }
    }

    return errors
  }

  const goNext = () => {
    if (isLast || !currentSection) return

    const errors = validateSection(currentSection.fields, formData)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      // Scroll to top so user sees the first error
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0
      }
      return
    }

    setValidationErrors({})
    setDirection(1)
    setCurrentIndex((i) => i + 1)
  }

  const goBack = () => {
    if (isFirst) return
    setDirection(-1)
    setCurrentIndex((i) => i - 1)
  }

  const handleFieldChange = (fieldId: string, value: FormFieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
    clearFieldError(fieldId)
  }

  // Early returns after all hooks
  if (!categoryValid) return notFound()
  if (!service) return notFound()
  if (!currentSection) return notFound()

  /**
   * Renders a validation error message below a field.
   *
   * @param fieldId - The field id to look up in validationErrors
   */
  const renderFieldError = (fieldId: string) => {
    const error = validationErrors[fieldId]
    if (!error) return null
    return (
      <p
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: '0.7rem',
          fontStyle: 'italic',
          color: 'rgba(201, 116, 83, 1)',
          marginTop: '0.35rem',
          marginLeft: '0.25rem',
        }}
        role="alert"
      >
        {error}
      </p>
    )
  }

  /** Renders a searchable country name combobox using all 249 countries from countries-list. */
  const renderCountrySelect = (field: FormField, stringValue: string) => (
    <FormCombobox
      value={stringValue}
      onValueChange={(v) => handleFieldChange(field.id, v)}
      placeholder={field.placeholder || 'Select country'}
      searchPlaceholder="Type to search country…"
      hasError={Boolean(validationErrors[field.id])}
      items={ALL_COUNTRIES.map((c) => ({
        value: c.name,
        display: <>{getEmojiFlag(c.iso2)} {c.name}</>,
        searchLabel: c.name,
      }))}
    />
  )

  /**
   * Renders a single form field based on its type, including:
   * - Validation error display
   * - Country code / country name selectors with flags
   * - Textarea with word count enforcement
   * - Standard inputs with blur-time format validation
   *
   * @param field - FormField definition
   * @param index - Position index for React key
   */
  const renderField = (field: FormField, index: number) => {
    const fieldValue = formData[field.id] ?? ''
    const stringValue = typeof fieldValue === 'string' ? fieldValue : ''
    const hasError = Boolean(validationErrors[field.id])

    return (
      <div key={`${field.id}-${index}`} className="space-y-2">
        {!(field.type === 'checkbox' && (!field.options || field.options.length === 0)) && (
          <div className="flex items-center justify-between gap-4 mb-2">
            <label
              className="text-xs uppercase tracking-wider font-medium"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                color: 'rgba(249, 248, 246, 0.4)',
              }}
            >
              {field.label}
              {field.required && <span style={{ color: 'var(--heritage-gold)' }}> *</span>}
            </label>
            {field.hint && (
              <span
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: '0.6rem',
                  fontStyle: 'italic',
                  color: 'rgba(249, 248, 246, 0.25)',
                  letterSpacing: '0.01em',
                  textAlign: 'right',
                }}
              >
                {field.hint}
              </span>
            )}
          </div>
        )}

        {field.type === 'textarea' ? (
          (() => {
            const wordCount = countWords(stringValue)
            const isOverLimit = wordCount >= TEXTAREA_MAX_WORDS
            const isNearLimit = wordCount >= TEXTAREA_WARN_WORDS

            let wordCountColor = 'rgba(212, 175, 55, 0.5)'
            if (isOverLimit) {
              wordCountColor = 'rgba(201, 116, 83, 0.8)'
            } else if (isNearLimit) {
              wordCountColor = 'rgba(212, 140, 55, 0.75)'
            }

            return (
              <>
                <textarea
                  value={stringValue}
                  onChange={(e) => {
                    const newVal = e.target.value
                    const trimmed = trimToWordLimit(newVal, TEXTAREA_MAX_WORDS)
                    handleFieldChange(field.id, trimmed)
                  }}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  className="w-full transition-all duration-300 focus:outline-none placeholder:italic"
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(249, 248, 246, 0.03)',
                    border: `1px solid ${hasError ? 'rgba(201, 116, 83, 0.5)' : 'rgba(249, 248, 246, 0.08)'}`,
                    borderRadius: '1rem',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: '0.88rem',
                    color: 'var(--heritage-cream)',
                    letterSpacing: '0.01em',
                    resize: 'vertical',
                    minHeight: '120px',
                    lineHeight: 1.6,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(212, 175, 55, 0.35)'
                    e.target.style.background = 'rgba(212, 175, 55, 0.02)'
                    e.target.style.boxShadow = '0 0 0 1px rgba(212, 175, 55, 0.08)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = hasError
                      ? 'rgba(201, 116, 83, 0.5)'
                      : 'rgba(249, 248, 246, 0.08)'
                    e.target.style.background = 'rgba(249, 248, 246, 0.03)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: '0.65rem',
                      color: wordCountColor,
                      letterSpacing: '0.02em',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {wordCount} / {TEXTAREA_MAX_WORDS} words
                  </span>
                </div>
                {renderFieldError(field.id)}
              </>
            )
          })()
        ) : field.type === 'select' ? (
          <>
            {isCountryField(field)
              ? renderCountrySelect(field, stringValue)
              : (
                <select
                  value={stringValue}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-full transition-all duration-300 focus:outline-none cursor-pointer"
                  style={{
                    ...sharedSelectStyle,
                    color: stringValue ? 'var(--heritage-cream)' : 'rgba(249, 248, 246, 0.18)',
                    border: `1px solid ${hasError ? 'rgba(201, 116, 83, 0.5)' : 'rgba(249, 248, 246, 0.08)'}`,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(212, 175, 55, 0.35)'
                    e.target.style.background = 'rgba(212, 175, 55, 0.02)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = hasError
                      ? 'rgba(201, 116, 83, 0.5)'
                      : 'rgba(249, 248, 246, 0.08)'
                    e.target.style.background = 'rgba(249, 248, 246, 0.03)'
                  }}
                >
                  <option
                    value=""
                    style={{ background: '#1a110a', color: 'rgba(249, 248, 246, 0.18)' }}
                  >
                    {field.placeholder || 'Select an option'}
                  </option>
                  {field.options?.map((opt, idx) => (
                    <option
                      key={idx}
                      value={opt}
                      style={{ background: '#1a110a', color: 'var(--heritage-cream)' }}
                    >
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            {renderFieldError(field.id)}
          </>
        ) : field.type === 'radio' ? (
          <>
            <div className="space-y-3 w-full">
              {field.options?.map((option, optIdx) => {
                const isChecked = stringValue === option
                return (
                  <label
                    key={optIdx}
                    className="flex items-start gap-3 cursor-pointer group w-full"
                  >
                    <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                      <input
                        type="radio"
                        name={field.id}
                        value={option}
                        checked={isChecked}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="peer sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded-full border-2 transition-all duration-200 peer-checked:border-[var(--heritage-gold)] flex items-center justify-center"
                        style={{
                          borderColor: isChecked
                            ? 'var(--heritage-gold)'
                            : 'rgba(249, 248, 246, 0.2)',
                        }}
                      >
                        {isChecked && (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: 'var(--heritage-gold)' }}
                          />
                        )}
                      </div>
                    </div>
                    <span
                      className="leading-relaxed flex-1"
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: '0.85rem',
                        color: 'rgba(249, 248, 246, 0.6)',
                      }}
                    >
                      {option}
                    </span>
                  </label>
                )
              })}
            </div>
            {renderFieldError(field.id)}
          </>
        ) : field.type === 'checkbox' ? (
          field.options && field.options.length > 0 ? (
            // Multiple checkbox options
            <>
              <div className="space-y-3 w-full">
                {field.options.map((option, optIdx) => {
                  const isChecked = Array.isArray(fieldValue) && fieldValue.includes(option)
                  return (
                    <label
                      key={optIdx}
                      className="flex items-start gap-3 cursor-pointer group w-full"
                    >
                      <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentValues = Array.isArray(fieldValue) ? fieldValue : []
                            const newValues = e.target.checked
                              ? [...currentValues, option]
                              : currentValues.filter((v) => v !== option)
                            handleFieldChange(field.id, newValues)
                          }}
                          className="peer sr-only"
                        />
                        <div
                          className="w-5 h-5 rounded-full border-2 transition-all duration-200 peer-checked:border-[var(--heritage-gold)] peer-checked:bg-[var(--heritage-gold)] flex items-center justify-center"
                          style={{
                            borderColor: isChecked
                              ? 'var(--heritage-gold)'
                              : 'rgba(249, 248, 246, 0.2)',
                            backgroundColor: isChecked ? 'var(--heritage-gold)' : 'transparent',
                          }}
                        >
                          {isChecked && (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                              style={{ color: 'var(--wood-espresso)' }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span
                        className="text-xs leading-relaxed flex-1"
                        style={{
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          color: 'rgba(249, 248, 246, 0.6)',
                        }}
                      >
                        {option}
                      </span>
                    </label>
                  )
                })}
              </div>
              {renderFieldError(field.id)}
            </>
          ) : (
            // Single checkbox
            <>
              <label className="flex items-start gap-3 cursor-pointer group w-full">
                <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={fieldValue === true}
                    onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                    className="peer sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded-full border-2 transition-all duration-200 peer-checked:border-[var(--heritage-gold)] peer-checked:bg-[var(--heritage-gold)] flex items-center justify-center"
                    style={{
                      borderColor: hasError
                        ? 'rgba(201, 116, 83, 0.7)'
                        : 'rgba(249, 248, 246, 0.2)',
                    }}
                  >
                    {fieldValue === true && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        style={{ color: 'var(--wood-espresso)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span
                  className="leading-relaxed flex-1"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: '0.85rem',
                    color: 'rgba(249, 248, 246, 0.6)',
                  }}
                >
                  {field.label}
                </span>
              </label>
              {renderFieldError(field.id)}
            </>
          )
        ) : field.type === 'tel' ? (
          // Tel: country-code selector + phone number input side-by-side
          <>
            <div className="flex gap-2">
              {/* Country code dropdown with flag + dial code — keyed by iso2 to avoid duplicate values */}
              <FormCombobox
                value={(formData[field.id + '__cc'] as string) || 'PK'}
                onValueChange={(v) => handleFieldChange(field.id + '__cc', v)}
                triggerWidth="130px"
                contentMinWidth="220px"
                searchPlaceholder="Search country or code…"
                items={ALL_COUNTRIES.map((c) => ({
                  value: c.iso2,
                  display: <>{getEmojiFlag(c.iso2)} +{c.phone[0]}</>,
                  searchLabel: `${c.name} +${c.phone[0]}`,
                }))}
              />

              {/* Phone number input */}
              <input
                type="tel"
                value={stringValue}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder || 'Phone number'}
                required={field.required}
                className="flex-1 transition-all duration-300 focus:outline-none placeholder:italic"
                style={{
                  padding: '0.85rem 1rem',
                  background: 'rgba(249, 248, 246, 0.03)',
                  border: `1px solid ${hasError ? 'rgba(201, 116, 83, 0.5)' : 'rgba(249, 248, 246, 0.08)'}`,
                  borderRadius: '100px',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: '0.88rem',
                  color: 'var(--heritage-cream)',
                  letterSpacing: '0.01em',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.35)'
                  e.target.style.background = 'rgba(212, 175, 55, 0.02)'
                  e.target.style.boxShadow = '0 0 0 1px rgba(212, 175, 55, 0.08)'
                }}
                onBlur={(e) => {
                  const currentVal = e.target.value
                  const cc = getDialCode((formData[field.id + '__cc'] as string) || 'PK')
                  if (currentVal.trim() !== '' && !isValidPhone(cc, currentVal)) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      [field.id]: 'Please enter a valid phone number',
                    }))
                    e.target.style.borderColor = 'rgba(201, 116, 83, 0.5)'
                    e.target.style.background = 'rgba(249, 248, 246, 0.03)'
                    e.target.style.boxShadow = 'none'
                    return
                  }
                  const stillHasError = Boolean(validationErrors[field.id])
                  e.target.style.borderColor = stillHasError
                    ? 'rgba(201, 116, 83, 0.5)'
                    : 'rgba(249, 248, 246, 0.08)'
                  e.target.style.background = 'rgba(249, 248, 246, 0.03)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
            {renderFieldError(field.id)}
          </>
        ) : field.type === 'file' ? (
          <>
            <input
              type="file"
              onChange={(e) => handleFieldChange(field.id, e.target.files)}
              className="w-full transition-all duration-300 focus:outline-none"
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(249, 248, 246, 0.03)',
                border: `1px solid ${hasError ? 'rgba(201, 116, 83, 0.5)' : 'rgba(249, 248, 246, 0.08)'}`,
                borderRadius: '100px',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '0.88rem',
                color: 'var(--heritage-cream)',
                letterSpacing: '0.01em',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(212, 175, 55, 0.35)'
                e.target.style.background = 'rgba(212, 175, 55, 0.02)'
                e.target.style.boxShadow = '0 0 0 1px rgba(212, 175, 55, 0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = hasError
                  ? 'rgba(201, 116, 83, 0.5)'
                  : 'rgba(249, 248, 246, 0.08)'
                e.target.style.background = 'rgba(249, 248, 246, 0.03)'
                e.target.style.boxShadow = 'none'
              }}
            />
            {renderFieldError(field.id)}
          </>
        ) : (
          // Default: text, email, number, date, etc.
          <>
            <input
              type={field.type}
              value={stringValue}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full transition-all duration-300 focus:outline-none placeholder:italic"
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(249, 248, 246, 0.03)',
                border: `1px solid ${hasError ? 'rgba(201, 116, 83, 0.5)' : 'rgba(249, 248, 246, 0.08)'}`,
                borderRadius: '100px',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '0.88rem',
                color: 'var(--heritage-cream)',
                letterSpacing: '0.01em',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(212, 175, 55, 0.35)'
                e.target.style.background = 'rgba(212, 175, 55, 0.02)'
                e.target.style.boxShadow = '0 0 0 1px rgba(212, 175, 55, 0.08)'
              }}
              onBlur={(e) => {
                const currentVal = e.target.value
                if (field.type === 'email' && currentVal.trim() !== '') {
                  if (!isValidEmail(currentVal.trim())) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      [field.id]: 'Please enter a valid email address',
                    }))
                    e.target.style.borderColor = 'rgba(201, 116, 83, 0.5)'
                    e.target.style.background = 'rgba(249, 248, 246, 0.03)'
                    e.target.style.boxShadow = 'none'
                    return
                  }
                }
                const stillHasError = Boolean(validationErrors[field.id])
                e.target.style.borderColor = stillHasError
                  ? 'rgba(201, 116, 83, 0.5)'
                  : 'rgba(249, 248, 246, 0.08)'
                e.target.style.background = 'rgba(249, 248, 246, 0.03)'
                e.target.style.boxShadow = 'none'
              }}
            />
            {renderFieldError(field.id)}
          </>
        )}
      </div>
    )
  }

  return (
    <div
      className="form-page-outer flex flex-col px-6 md:px-16"
      style={{ minHeight: '600px' }}
    >
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.15);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.25);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.15) transparent;
        }
        @media (min-width: 768px) {
          .form-page-outer {
            height: calc(100vh - 4.5rem);
            overflow: hidden;
          }
        }
        .combobox-item[data-selected='true'] {
          background: rgba(212, 175, 55, 0.08);
          color: var(--heritage-cream);
        }
        .combobox-list::-webkit-scrollbar {
          width: 4px;
        }
        .combobox-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .combobox-list::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 2px;
        }
      `}</style>

      {/* Step Indicator — ConsultationOverlay dots + lines style */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{ padding: '1.25rem 0' }}
      >
        {formSections.map((_, i) => (
          <Fragment key={i}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: `1px solid ${
                  i === currentIndex
                    ? 'var(--heritage-gold)'
                    : i < currentIndex
                    ? 'rgba(212, 175, 55, 0.5)'
                    : 'rgba(249, 248, 246, 0.15)'
                }`,
                background:
                  i === currentIndex
                    ? 'var(--heritage-gold)'
                    : i < currentIndex
                    ? 'rgba(212, 175, 55, 0.4)'
                    : 'transparent',
                boxShadow:
                  i === currentIndex ? '0 0 8px rgba(212, 175, 55, 0.3)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
                flexShrink: 0,
              }}
            />
            {i < total - 1 && (
              <span
                style={{
                  display: 'inline-block',
                  width: '48px',
                  height: '1px',
                  background:
                    i < currentIndex
                      ? 'rgba(212, 175, 55, 0.3)'
                      : 'rgba(249, 248, 246, 0.08)',
                  transition: 'background 0.4s ease',
                  flexShrink: 0,
                }}
              />
            )}
          </Fragment>
        ))}
      </div>

      {/* Split layout */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>

        {/* Left panel — current section title, desktop only */}
        <div
          className="hidden md:flex items-center justify-center shrink-0"
          style={{ width: '50%', padding: '2rem 3rem 10rem' }}
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: 'var(--heritage-cream)',
                textAlign: 'center',
                textTransform: 'none',
                margin: 0,
              }}
            >
              {currentSection.title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Vertical divider — desktop only, centered */}
        <div
          className="hidden md:block shrink-0"
          style={{ width: '1px', background: 'rgba(212, 175, 55, 0.12)' }}
        />

        {/* Right panel — scrollable form */}
        <div
          ref={formWrapperRef}
          data-lenis-prevent
          className="flex-1 flex flex-col overflow-hidden"
          style={{ padding: '0 1rem 0 2.5rem' }}
        >
          {/* Mobile title — visible on mobile only */}
          <div className="md:hidden shrink-0" style={{ padding: '0.25rem 0 1rem' }}>
            <h1
              style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: 'clamp(1.6rem, 6vw, 2.2rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'var(--heritage-cream)',
                margin: 0,
              }}
            >
              {currentSection.title}
            </h1>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col h-full"
            >
              {/* Scrollable content */}
              <div
                ref={scrollContainerRef}
                tabIndex={0}
                className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar focus:outline-none"
                style={{ padding: '1.5rem 1rem 1rem 0.5rem' }}
              >
                {/* Form fields */}
                <motion.div
                  className={`grid gap-6 ${
                    useSingleColumn ? 'max-w-md' : 'grid-cols-1 md:grid-cols-2'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
                >
                  {currentSection.fields.map((field, idx) => renderField(field, idx))}
                </motion.div>
              </div>

              {/* Navigation buttons */}
              <div
                className="shrink-0 flex items-center justify-between"
                style={{
                  padding: '1rem 1rem 1.5rem 0.5rem',
                  borderTop: '1px solid rgba(212, 175, 55, 0.12)',
                }}
              >
                <div>
                  {!isFirst && (
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 transition-all duration-300"
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: 'none',
                        border: '1px solid rgba(249, 248, 246, 0.1)',
                        borderRadius: '100px',
                        color: 'rgba(249, 248, 246, 0.5)',
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(249, 248, 246, 0.25)'
                        e.currentTarget.style.color = 'rgba(249, 248, 246, 0.75)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(249, 248, 246, 0.1)'
                        e.currentTarget.style.color = 'rgba(249, 248, 246, 0.5)'
                      }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16l-4-4m0 0l4-4m-4 4h18"
                        />
                      </svg>
                      <span>Back</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={
                    isLast
                      ? () => router.push(`/services/${category}/${slug}/faq`)
                      : goNext
                  }
                  className="inline-flex items-center gap-2 transition-all duration-300"
                  style={{
                    padding: '0.7rem 1.5rem',
                    background: 'var(--heritage-gold)',
                    border: 'none',
                    borderRadius: '100px',
                    color: 'var(--wood-espresso)',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#c9a430'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--heritage-gold)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span>{isLast ? 'Submit' : 'Continue'}</span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
