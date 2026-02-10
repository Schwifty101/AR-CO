'use client'

import { use, useState, useCallback } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { facilitationServices } from '@/components/data/facilitationServicesData'
import type { FormSection, FormField } from '@/components/data/facilitationServicesData'

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Slide animation variants */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

/** Step 4: Dynamic form */
export default function FacilitationServiceForm({ params }: PageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const service = facilitationServices.find((s) => s.slug === slug)
  if (!service) return notFound()

  const formSections = service.formSections
  const total = formSections.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const currentSection = formSections[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1

  // Use single column if section has 4 or fewer fields
  const useSingleColumn = currentSection.fields.length <= 4

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

  const handleFieldChange = useCallback((fieldLabel: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldLabel]: value,
    }))
  }, [])

  const renderField = (field: FormField, index: number) => {
    const fieldValue = formData[field.label] || ''

    return (
      <div key={`${field.label}-${index}`} className="space-y-2">
        <label
          className="block text-xs uppercase tracking-wider font-medium"
          style={{ color: 'rgba(249, 248, 246, 0.6)' }}
        >
          {field.label}
          {field.required && (
            <span style={{ color: 'var(--heritage-gold)' }}> *</span>
          )}
        </label>

        {field.type === 'textarea' ? (
          <textarea
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent transition-all duration-200 focus:outline-none focus:border-[var(--heritage-gold)] placeholder:text-[rgba(249,248,246,0.25)]"
            style={{
              color: 'var(--heritage-cream)',
              borderColor: 'rgba(249, 248, 246, 0.15)',
            }}
          />
        ) : field.type === 'select' ? (
          <select
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent transition-all duration-200 focus:outline-none focus:border-[var(--heritage-gold)]"
            style={{
              color: fieldValue ? 'var(--heritage-cream)' : 'rgba(249, 248, 246, 0.25)',
              borderColor: 'rgba(249, 248, 246, 0.15)',
            }}
          >
            <option value="" style={{ backgroundColor: 'var(--wood-espresso)', color: 'rgba(249, 248, 246, 0.25)' }}>Select an option</option>
            {field.options?.map((opt, idx) => (
              <option key={idx} value={opt} style={{ backgroundColor: 'var(--wood-espresso)', color: 'var(--heritage-cream)', padding: '8px' }}>
                {opt}
              </option>
            ))}
          </select>
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
                          handleFieldChange(field.label, newValues)
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
                      style={{ color: 'rgba(249, 248, 246, 0.6)' }}
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
                  onChange={(e) => handleFieldChange(field.label, e.target.checked)}
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
                style={{ color: 'rgba(249, 248, 246, 0.6)' }}
              >
                {field.placeholder || field.label}
              </span>
            </label>
          )
        ) : (
          <input
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent transition-all duration-200 focus:outline-none focus:border-[var(--heritage-gold)] placeholder:text-[rgba(249,248,246,0.25)]"
            style={{
              color: 'var(--heritage-cream)',
              borderColor: 'rgba(249, 248, 246, 0.15)',
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
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(249, 248, 246, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(201, 169, 106, 0.3);
          border-radius: 10px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 169, 106, 0.5);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(201, 169, 106, 0.3) rgba(249, 248, 246, 0.03);
        }
      `}</style>
      {/* Main container */}
      <div
        className="relative rounded-xl overflow-hidden border"
        style={{
          borderColor: 'rgba(249, 248, 246, 0.08)',
          boxShadow: '0 0 40px rgba(201, 169, 106, 0.12), 0 0 80px rgba(201, 169, 106, 0.06), 0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Progress bar at top */}
        <div className="relative h-[2px] w-full" style={{ background: 'rgba(249, 248, 246, 0.06)' }}>
          <motion.div
            className="absolute left-0 top-0 h-full"
            style={{ background: 'var(--heritage-gold)' }}
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>

        {/* Step counter */}
        <div className="px-6 md:px-12 pt-5 pb-2 flex items-center justify-between">
          <span
            className="text-xs uppercase tracking-[0.15em] font-medium"
            style={{ color: 'var(--heritage-gold)', opacity: 0.7 }}
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
              <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-2 pb-6 custom-scrollbar">
                {/* Section title */}
                <motion.h2
                  className="uppercase mb-8"
                  style={{
                    fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                    fontWeight: 100,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
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
              <div className="flex-shrink-0 px-6 md:px-12 py-4 border-t" style={{ borderColor: 'rgba(249, 248, 246, 0.08)' }}>
                <div className="flex items-center justify-between">
                  {/* Back button */}
                  <div>
                    {!isFirst && (
                      <button
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium transition-all duration-300 hover:gap-3"
                        style={{ color: 'rgba(249, 248, 246, 0.5)' }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Back
                      </button>
                    )}
                  </div>

                  {/* Next / Submit button */}
                  <button
                    onClick={isLast ? () => router.push(`/services/${slug}/faq`) : goNext}
                    className="inline-flex items-center gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 hover:gap-4"
                    style={{
                      background: 'var(--heritage-gold)',
                      color: 'var(--wood-espresso)',
                    }}
                  >
                    {isLast ? 'Submit' : 'Next'}
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
