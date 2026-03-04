'use client'

import { usePathname } from 'next/navigation'
import { use, useMemo } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  isValidCategory,
  findServiceBySlug,
  getCategoryDocuments,
  type CategoryType,
} from '@/lib/categoryDataMapper'
import styles from './services.module.css'
import overviewStyles from './overview.module.css'

/** Slugs of due-diligence services that also get a video placeholder */
const DUE_DILIGENCE_SERVICE_IDS = new Set([
  'immovable-property-due-diligence',
  'movable-property-due-diligence',
])

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ category: string; slug: string }>
}

export default function ServiceLayout({ children, params }: LayoutProps) {
  const { category, slug } = use(params)
  const pathname = usePathname()

  // Validate category and find service before useMemo (hooks must come before returns)
  const categoryValid = isValidCategory(category)
  const service = categoryValid ? findServiceBySlug(category as CategoryType, slug) : null
  const documents = categoryValid ? getCategoryDocuments(category as CategoryType) : []
  const hasDocuments = documents && documents.length > 0

  const basePath = `/services/${category}/${slug}`

  // Show full-screen video only on the overview page for IP / due-diligence / regulatory
  const isOverviewPage = pathname === basePath
  const showVideo =
    isOverviewPage &&
    (category === 'regulatory' ||
      (category === 'facilitation' && DUE_DILIGENCE_SERVICE_IDS.has(slug)))

  // Build dynamic steps based on whether documents exist
  const STEPS = useMemo(() => {
    const baseSteps = [
      { label: 'Overview', path: '' },
      { label: 'Process', path: '/process' },
    ]

    if (hasDocuments) {
      baseSteps.push({ label: 'Documents', path: '/documents' })
    }

    baseSteps.push(
      { label: 'Form', path: '/form' },
      { label: 'FAQ', path: '/faq' }
    )

    return baseSteps
  }, [hasDocuments])

  // Early returns after all hooks
  if (!categoryValid) return notFound()
  if (!service) return notFound()

  const currentStepIndex = STEPS.findIndex((step) => {
    const fullPath = `${basePath}${step.path}`
    return pathname === fullPath
  })

  return (
    <div className={styles.page}>
      {/* Fixed background — same as home page */}
      <div className={styles.pageBackground} aria-hidden="true" />

      {/* Full-screen video hero — rendered before breadcrumb so it sits at y=0,
          behind the fixed nav (which naturally overlays it) */}
      {showVideo && (
        <motion.div
          className={overviewStyles.videoSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Corner accents */}
          <div className={overviewStyles.videoCornerTL} />
          <div className={overviewStyles.videoCornerBR} />

          {/* Centered content — above gradient overlays */}
          <div className={overviewStyles.videoCenter}>
            <div className={overviewStyles.videoPlayRing}>
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
                <path d="M1 1L13 8L1 15V1Z" fill="rgba(212,175,55,0.55)" />
              </svg>
            </div>
            <p className={overviewStyles.videoLabel}>Video Walkthrough</p>
            <p className={overviewStyles.videoCaption}>Coming Soon</p>
          </div>

          {/* Gradient blends — dark at top and bottom */}
          <div className={overviewStyles.videoGradientTop} />
          <div className={overviewStyles.videoGradientBottom} />
        </motion.div>
      )}

      <div className={styles.pageContent}>
        {/* Breadcrumb Navigation — Editorial Style */}
        <div style={{ padding: 0 }}>
          <nav className={styles.breadcrumb}>
            {STEPS.map((step, index) => {
              const isActive = index === currentStepIndex
              const isPast = index < currentStepIndex

              return (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {index > 0 && (
                    <span className={styles.breadcrumbSeparator}>/</span>
                  )}
                  <Link
                    href={`${basePath}${step.path}`}
                    className={isActive ? styles.breadcrumbItemActive : styles.breadcrumbItem}
                    style={{
                      color: isActive
                        ? 'var(--heritage-gold)'
                        : isPast
                          ? 'rgba(249, 248, 246, 0.5)'
                          : 'rgba(249, 248, 246, 0.3)',
                    }}
                  >
                    {step.label}
                  </Link>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
