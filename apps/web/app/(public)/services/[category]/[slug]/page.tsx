'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import {
  isValidCategory,
  findServiceBySlug,
  type CategoryType,
} from '@/lib/categoryDataMapper'
import styles from './services.module.css'

const MotionLink = motion.create(Link)

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

/** Step 1: Overview - title, tagline, whatWeDo */
export default function ServiceOverview({ params }: PageProps) {
  const { category, slug } = use(params)

  // Validate category
  if (!isValidCategory(category)) return notFound()

  // Find service
  const service = findServiceBySlug(category as CategoryType, slug)
  if (!service) return notFound()

  return (
    <div className={styles.containerNarrow} style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      {/* Title — Editorial Luxury */}
      <motion.h1
        className={styles.displayTitle}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {service.title}
      </motion.h1>

      {/* Tagline & CTA */}
      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <motion.p
          className={styles.bodyTextLarge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: '680px' }}
        >
          {service.tagline}
        </motion.p>

        <MotionLink
          href={`/services/${category}/${slug}/process`}
          className={styles.buttonPrimary}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ alignSelf: 'flex-start' }}
        >
          View Process
          <ArrowRight style={{ width: '14px', height: '14px' }} />
        </MotionLink>
      </div>

      {/* Gold Divider */}
      <motion.div
        className={styles.goldRule}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
        style={{ marginTop: '4rem', marginBottom: '3rem', transformOrigin: 'left' }}
      />

      {/* What We Do Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <span className={styles.eyebrow} style={{ marginBottom: '2rem', display: 'block' }}>
          What We Do
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          {service.whatWeDo.map((item, index) => (
            <motion.div
              key={index}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1.75rem 1.5rem',
              }}
            >
              <div className={styles.cardTopBand} />
              <CheckCircle2
                style={{
                  width: '18px',
                  height: '18px',
                  color: 'var(--heritage-gold)',
                  flexShrink: 0,
                  marginTop: '0.2rem',
                  opacity: 0.8,
                }}
              />
              <span className={styles.bodyText} style={{ color: 'rgba(249, 248, 246, 0.7)' }}>
                {item}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
