'use client'

import { usePathname } from 'next/navigation'
import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { facilitationServices } from '@/components/data/facilitationServicesData'

const STEPS = [
  { label: 'Overview', path: '' },
  { label: 'Process', path: '/process' },
  { label: 'Documents', path: '/documents' },
  { label: 'Form', path: '/form' },
  { label: 'FAQ', path: '/faq' },
]

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default function FacilitationServiceLayout({ children, params }: LayoutProps) {
  const { slug } = use(params)
  const pathname = usePathname()

  const service = facilitationServices.find((s) => s.slug === slug)
  if (!service) return notFound()

  const basePath = `/services/${slug}`
  const currentStepIndex = STEPS.findIndex((step) => {
    const fullPath = `${basePath}${step.path}`
    return pathname === fullPath
  })

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--wood-espresso)' }}
    >
      {/* Step Indicator - minimal, pushed closer to content */}
      <div className="px-6 md:px-12 lg:px-20 pt-8 md:pt-12 pb-2">
        <div className="flex items-center gap-2 text-sm overflow-x-auto">
          {STEPS.map((step, index) => {
            const isActive = index === currentStepIndex
            const isPast = index < currentStepIndex

            return (
              <div key={step.label} className="flex items-center gap-2 shrink-0">
                {index > 0 && (
                  <span className="text-[var(--heritage-cream)] opacity-20">/</span>
                )}
                <Link
                  href={`${basePath}${step.path}`}
                  className="transition-colors"
                  style={{
                    color: isActive
                      ? 'var(--heritage-gold)'
                      : isPast
                        ? 'var(--heritage-cream)'
                        : 'rgba(249, 248, 246, 0.3)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {step.label}
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  )
}
