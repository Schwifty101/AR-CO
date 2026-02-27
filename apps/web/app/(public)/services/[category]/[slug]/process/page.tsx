'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  isValidCategory,
  findServiceBySlug,
  getCategoryDocuments,
  type CategoryType,
} from '@/lib/categoryDataMapper'
import styles from './process.module.css'

const MotionLink = motion.create(Link)

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

/** Step 2: Process timeline with editorial luxury aesthetic */
export default function ServiceProcess({ params }: PageProps) {
  const { category, slug } = use(params)

  // Validate category
  if (!isValidCategory(category)) return notFound()

  // Find service
  const service = findServiceBySlug(category as CategoryType, slug)
  if (!service) return notFound()

  const steps = service.processSteps

  // Check if documents exist for this category to determine next step
  const documents = getCategoryDocuments(category as CategoryType)
  const hasDocuments = documents && documents.length > 0
  const nextPath = hasDocuments ? `/services/${category}/${slug}/documents` : `/services/${category}/${slug}/form`

  return (
    <div className={styles.container}>
      {/* Title */}
      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <em>Our Process</em>
      </motion.h1>

      {/* Timeline */}
      <div className={styles.timeline}>
        {/* Horizontal gold line - desktop */}
        <motion.div
          className={styles.timelineLine}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
          style={{ transformOrigin: 'left' }}
        />

        {/* Start button - desktop */}
        <MotionLink
          href={nextPath}
          className={styles.startButton}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
        >
          Start Process
          <ArrowRight className={styles.startButtonIcon} />
        </MotionLink>

        {/* Desktop Timeline Grid */}
        <div className={styles.timelineGrid}>
          {/* Top row - even indices */}
          <div className={styles.timelineRowTop}>
            {steps.map((step, index) => {
              if (index % 2 !== 0) return <div key={index} style={{ flex: 1 }} />
              return (
                <motion.div
                  key={step.title}
                  className={`${styles.step} ${styles.stepTop}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.7 + index * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                  <span className={styles.stepDuration}>{step.duration}</span>
                  <motion.div
                    className={styles.stepDot}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.15 }}
                  />
                </motion.div>
              )
            })}
          </div>

          {/* Bottom row - odd indices */}
          <div className={styles.timelineRowBottom}>
            {steps.map((step, index) => {
              if (index % 2 === 0) return <div key={index} style={{ flex: 1 }} />
              return (
                <motion.div
                  key={step.title}
                  className={`${styles.step} ${styles.stepBottom}`}
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.7 + index * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <motion.div
                    className={`${styles.stepDot} ${styles.stepDotBottom}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.15 }}
                  />
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                  <span className={styles.stepDuration}>{step.duration}</span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className={styles.timelineMobile}>
          <motion.div
            className={styles.timelineLineMobile}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: 'top' }}
          />

          <div className={styles.mobileStepsList}>
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className={styles.mobileStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.5 + index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div
                  className={styles.mobileDot}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.65 + index * 0.12 }}
                />
                <h3 className={styles.mobileStepTitle}>{step.title}</h3>
                <p className={styles.mobileStepDescription}>{step.description}</p>
                <span className={styles.mobileStepDuration}>{step.duration}</span>
              </motion.div>
            ))}

            {/* Mobile start button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.8 + steps.length * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <motion.div
                className={styles.mobileDot}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.95 + steps.length * 0.12 }}
              />
              <Link href={nextPath} className={styles.mobileStartButton}>
                Start Process
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
