'use client'

import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  isValidCategory,
  findServiceBySlug,
  type CategoryType,
} from '@/lib/categoryDataMapper'
import { useAuth } from '@/lib/auth/use-auth'
import styles from '../services.module.css'

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

/** Step 5: Frequently Asked Questions */
export default function ServiceFAQ({ params }: PageProps) {
  const { category, slug } = use(params)

  // All hooks must be called before any conditional returns
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { isAuthenticated } = useAuth()
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)

  useEffect(() => {
    const flag = sessionStorage.getItem(`submitted_${category}_${slug}`)
    setSubmittedRef(flag)
  }, [category, slug])

  // Validate category
  const categoryValid = isValidCategory(category)
  const service = categoryValid ? findServiceBySlug(category as CategoryType, slug) : null

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // Early returns after all hooks
  if (!categoryValid) return notFound()
  if (!service) return notFound()

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

      {/* Track Progress CTA — shown only after form submission */}
      {submittedRef && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: '4rem',
            padding: '2rem',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '0.75rem',
            background: 'rgba(212, 175, 55, 0.04)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '0.75rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--heritage-gold)',
              opacity: 0.7,
              marginBottom: '0.75rem',
            }}
          >
            Application Submitted
          </p>
          <p
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--heritage-cream)',
              marginBottom: '0.5rem',
              lineHeight: 1.3,
            }}
          >
            Your reference: <span style={{ color: 'var(--heritage-gold)' }}>{submittedRef}</span>
          </p>
          <p
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '0.82rem',
              color: 'rgba(249, 248, 246, 0.45)',
              marginBottom: '1.75rem',
              lineHeight: 1.6,
            }}
          >
            {isAuthenticated
              ? 'View the status of your application in your client portal.'
              : 'Create an account or log in to track the progress of your application in your client portal.'}
          </p>

          {isAuthenticated ? (
            <Link
              href="/client/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.75rem',
                background: 'var(--heritage-gold)',
                borderRadius: '100px',
                color: 'var(--wood-espresso)',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '0.88rem',
                fontStyle: 'italic',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textDecoration: 'none',
              }}
            >
              Track your application
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ) : (
            <Link
              href={`/auth/signin?redirect=/client/services`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.75rem',
                background: 'var(--heritage-gold)',
                borderRadius: '100px',
                color: 'var(--wood-espresso)',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '0.88rem',
                fontStyle: 'italic',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textDecoration: 'none',
              }}
            >
              Log in to track progress
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
        </motion.div>
      )}
    </div>
  )
}
