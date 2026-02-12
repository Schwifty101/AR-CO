'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  isValidCategory,
  findServiceBySlug,
  type CategoryType,
} from '@/lib/categoryDataMapper'
import styles from '../services.module.css'

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

/** Step 5: Frequently Asked Questions */
export default function ServiceFAQ({ params }: PageProps) {
  const { category, slug } = use(params)

  // Validate category
  if (!isValidCategory(category)) return notFound()

  // Find service
  const service = findServiceBySlug(category as CategoryType, slug)
  if (!service) return notFound()

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={styles.containerNarrow} style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: '3.5rem' }}
      >
        <h2 className={styles.sectionTitle}>
          Frequently Asked Questions
        </h2>
      </motion.div>

      {/* FAQ List */}
      <div>
        {service.faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* FAQ Item */}
            <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <h3
                  className={styles.subsectionTitle}
                  style={{
                    color: openIndex === index ? 'var(--heritage-gold)' : 'var(--heritage-cream)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  style={{ flexShrink: 0, marginTop: '0.3rem' }}
                >
                  <svg
                    style={{
                      width: '20px',
                      height: '20px',
                      color: openIndex === index ? 'var(--heritage-gold)' : 'rgba(249, 248, 246, 0.3)',
                      transition: 'color 0.3s ease',
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
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
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p
                      className={styles.bodyText}
                      style={{
                        paddingTop: '1.5rem',
                        maxWidth: '720px',
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
              <div className={styles.subtleRule} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
