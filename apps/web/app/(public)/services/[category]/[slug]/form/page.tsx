'use client'

import { use, useState, useCallback, useRef, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  isValidCategory,
  findServiceBySlug,
  getCategoryForm,
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

/** Step 4: Dynamic category-specific form */
export default function ServiceForm({ params }: PageProps) {
  const { category, slug } = use(params)
  const router = useRouter()

  // Validate category
  if (!isValidCategory(category)) return notFound()

  // Find service
  const service = findServiceBySlug(category as CategoryType, slug)
  if (!service) return notFound()

  // Get category-specific form sections
  const formSections = getCategoryForm(category as CategoryType)
  const total = formSections.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const formWrapperRef = useRef<HTMLDivElement>(null)

  const currentSection = formSections[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1

  // Use single column if section has 4 or fewer fields
  const useSingleColumn = currentSection.fields.length <= 4

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
      if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'SELECT') {
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

  const goNext = useCallback(() => {
    if (isLast) return
    setDirection(1)
    setCurrentIndex((i) => i + 1)
  }, [isLast])

  const goBack = useCallback(() => {
    if (isFirst) return
    setDirection(-1)
    setCurrentIndex((i) => i - 1)
  }, [isFirst])

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }, [])

  const renderField = (field: FormField, index: number) => {
    const fieldValue = formData[field.id] || ''

    return (
      <div key={`${field.id}-${index}`} className="space-y-2">
        <div className="flex items-center justify-between gap-4 mb-2">
          <label
            className="text-xs uppercase tracking-wider font-medium"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              color: 'rgba(249, 248, 246, 0.4)'
            }}
          >
            {field.label}
            {field.required && (
              <span style={{ color: 'var(--heritage-gold)' }}> *</span>
            )}
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

        {field.type === 'textarea' ? (
          <textarea
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full transition-all duration-300 focus:outline-none placeholder:italic"
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(249, 248, 246, 0.03)',
              border: '1px solid rgba(249, 248, 246, 0.08)',
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
              e.target.style.borderColor = 'rgba(249, 248, 246, 0.08)'
              e.target.style.background = 'rgba(249, 248, 246, 0.03)'
              e.target.style.boxShadow = 'none'
            }}
          />
        ) : field.type === 'select' ? (
          <select
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="w-full transition-all duration-300 focus:outline-none cursor-pointer"
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(249, 248, 246, 0.03)',
              border: '1px solid rgba(249, 248, 246, 0.08)',
              borderRadius: '100px',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '0.88rem',
              color: fieldValue ? 'var(--heritage-cream)' : 'rgba(249, 248, 246, 0.18)',
              letterSpacing: '0.01em',
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='rgba(249,248,246,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.35)'
              e.target.style.background = 'rgba(212, 175, 55, 0.02)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(249, 248, 246, 0.08)'
              e.target.style.background = 'rgba(249, 248, 246, 0.03)'
            }}
          >
            <option value="" style={{ background: '#1a110a', color: 'rgba(249, 248, 246, 0.18)' }}>
              {field.placeholder || 'Select an option'}
            </option>
            {field.options?.map((opt, idx) => (
              <option key={idx} value={opt} style={{ background: '#1a110a', color: 'var(--heritage-cream)' }}>
                {opt}
              </option>
            ))}
          </select>
        ) : field.type === 'radio' ? (
          <div className="space-y-3 w-full">
            {field.options?.map((option, optIdx) => {
              const isChecked = fieldValue === option
              return (
                <label key={optIdx} className="flex items-start gap-3 cursor-pointer group w-full">
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
                        borderColor: isChecked ? 'var(--heritage-gold)' : 'rgba(249, 248, 246, 0.2)',
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
                    className="text-xs leading-relaxed flex-1"
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      color: 'rgba(249, 248, 246, 0.6)'
                    }}
                  >
                    {option}
                  </span>
                </label>
              )
            })}
          </div>
        ) : field.type === 'checkbox' ? (
          field.options && field.options.length > 0 ? (
            // Multiple checkbox options
            <div className="space-y-3 w-full">
              {field.options.map((option, optIdx) => {
                const isChecked = Array.isArray(fieldValue) && fieldValue.includes(option)
                return (
                  <label key={optIdx} className="flex items-start gap-3 cursor-pointer group w-full">
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
                          borderColor: isChecked ? 'var(--heritage-gold)' : 'rgba(249, 248, 246, 0.2)',
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-xs leading-relaxed flex-1"
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        color: 'rgba(249, 248, 246, 0.6)'
                      }}
                    >
                      {option}
                    </span>
                  </label>
                )
              })}
            </div>
          ) : (
            // Single checkbox
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
                    borderColor: 'rgba(249, 248, 246, 0.2)',
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
                className="text-xs leading-relaxed flex-1"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  color: 'rgba(249, 248, 246, 0.6)'
                }}
              >
                {field.label}
              </span>
            </label>
          )
        ) : field.type === 'file' ? (
          <input
            type="file"
            onChange={(e) => handleFieldChange(field.id, e.target.files)}
            className="w-full transition-all duration-300 focus:outline-none"
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(249, 248, 246, 0.03)',
              border: '1px solid rgba(249, 248, 246, 0.08)',
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
              e.target.style.borderColor = 'rgba(249, 248, 246, 0.08)'
              e.target.style.background = 'rgba(249, 248, 246, 0.03)'
              e.target.style.boxShadow = 'none'
            }}
          />
        ) : (
          <input
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full transition-all duration-300 focus:outline-none placeholder:italic"
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(249, 248, 246, 0.03)',
              border: '1px solid rgba(249, 248, 246, 0.08)',
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
              e.target.style.borderColor = 'rgba(249, 248, 246, 0.08)'
              e.target.style.background = 'rgba(249, 248, 246, 0.03)'
              e.target.style.boxShadow = 'none'
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="px-4 md:px-12 lg:px-20 pt-2 md:pt-4 pb-16 md:pb-24">
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
      `}</style>
      {/* Main container */}
      <div
        ref={formWrapperRef}
        className="relative rounded-xl overflow-hidden border"
        style={{
          background: 'transparent',
          borderColor: 'rgba(212, 175, 55, 0.25)',
          boxShadow: 'none',
        }}
      >
        {/* Grain texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.3,
            pointerEvents: 'none',
            zIndex: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />
        {/* Corner decorations */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            width: '24px',
            height: '24px',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            width: '24px',
            height: '24px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            borderRight: '1px solid rgba(212, 175, 55, 0.2)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        {/* Progress bar */}
        <div className="relative h-[2px] w-full" style={{ background: 'rgba(212, 175, 55, 0.15)', zIndex: 2 }}>
          <motion.div
            className="absolute left-0 top-0 h-full"
            style={{ background: 'var(--heritage-gold)' }}
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>

        {/* Step counter */}
        <div className="px-6 md:px-12 pt-5 pb-2 flex items-center justify-between" style={{ position: 'relative', zIndex: 2 }}>
          <span
            className="text-xs uppercase tracking-[0.15em] font-medium"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '0.6rem',
              letterSpacing: '0.3em',
              color: 'var(--heritage-gold)',
              opacity: 0.55
            }}
          >
            Section {currentIndex + 1} of {total}
          </span>
        </div>

        {/* Animated content area */}
        <div className="relative overflow-hidden" style={{ height: '480px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Scrollable content area */}
              <div
                ref={scrollContainerRef}
                tabIndex={0}
                className="flex-1 overflow-y-auto px-6 md:px-12 pt-2 pb-6 custom-scrollbar focus:outline-none"
                style={{ position: 'relative', zIndex: 2 }}
              >
                {/* Section title */}
                <motion.h2
                  className="uppercase mb-8"
                  style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                    fontWeight: 300,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    color: 'var(--heritage-cream)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                >
                  {currentSection.title}
                </motion.h2>

                {/* Form fields - two column or single column based on field count */}
                <motion.div
                  className={`grid gap-6 ${
                    useSingleColumn
                      ? 'max-w-md mx-auto'
                      : 'grid-cols-1 md:grid-cols-2'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
                >
                  {currentSection.fields.map((field, idx) => renderField(field, idx))}
                </motion.div>
              </div>

              {/* Fixed Navigation buttons at bottom */}
              <div className="flex-shrink-0 px-6 md:px-12 py-4 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.2)', position: 'relative', zIndex: 2 }}>
                <div className="flex items-center justify-between">
                  {/* Back button */}
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
                          fontSize: '0.72rem',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
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
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        <span>Back</span>
                      </button>
                    )}
                  </div>

                  {/* Next / Submit button */}
                  <button
                    onClick={isLast ? () => router.push(`/services/${category}/${slug}/faq`) : goNext}
                    className="inline-flex items-center gap-2 transition-all duration-300"
                    style={{
                      padding: '0.7rem 1.5rem',
                      background: 'var(--heritage-gold)',
                      border: 'none',
                      borderRadius: '100px',
                      color: 'var(--wood-espresso)',
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      marginLeft: 'auto',
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
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
