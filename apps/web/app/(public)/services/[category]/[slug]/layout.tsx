'use client'

import { usePathname } from 'next/navigation'
import { use, useMemo } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  isValidCategory,
  findServiceBySlug,
  getCategoryDocuments,
  type CategoryType,
} from '@/lib/categoryDataMapper'
import styles from './services.module.css'

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

  const basePath = `/services/${category}/${slug}`
  const currentStepIndex = STEPS.findIndex((step) => {
    const fullPath = `${basePath}${step.path}`
    return pathname === fullPath
  })

  return (
    <div className={styles.page}>
      {/* Atmospheric overlays */}
      <div className={styles.pageGrain} />
      <div className={styles.pageGlow} />

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
