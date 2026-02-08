'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { facilitationServices } from '@/components/data/facilitationServicesData'

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Step 5: Frequently Asked Questions */
export default function FacilitationServiceFAQ({ params }: PageProps) {
  const { slug } = use(params)
  const service = facilitationServices.find((s) => s.slug === slug)
  if (!service) return notFound()

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="px-4 md:px-12 lg:px-20 pt-2 md:pt-4 pb-16 md:pb-24">
      {/* Header */}
      <div className="mb-8">
        <h2
          className="uppercase"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: 100,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'var(--heritage-cream)',
            marginTop: '2rem',
          }}
        >
          Frequently Asked Questions
        </h2>
      </div>

      {/* FAQ List */}
      <div>
        {service.faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* FAQ Item */}
            <div className="py-6">
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start justify-between gap-4 text-left group"
                >
                  <h3
                    className="text-lg md:text-xl font-light transition-colors duration-200 group-hover:text-[var(--heritage-gold)]"
                    style={{
                      color: openIndex === index ? 'var(--heritage-gold)' : 'var(--heritage-cream)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="flex-shrink-0 mt-1"
                  >
                    <svg
                      className="w-5 h-5 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      style={{
                        color: openIndex === index ? 'var(--heritage-gold)' : 'rgba(249, 248, 246, 0.4)',
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <p
                        className="text-sm md:text-base leading-relaxed pt-4 max-w-3xl"
                        style={{
                          color: 'rgba(249, 248, 246, 0.6)',
                          fontWeight: 300,
                        }}
                      >
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              {index < service.faqs.length - 1 && (
                <div
                  className="h-px w-full"
                  style={{ background: 'rgba(249, 248, 246, 0.08)' }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

