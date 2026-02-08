'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

const MotionLink = motion.create(Link)
import { facilitationServices } from '@/components/data/facilitationServicesData'

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Step 1: Overview - title, tagline, deliverables */
export default function FacilitationServiceHome({ params }: PageProps) {
  const { slug } = use(params)
  const service = facilitationServices.find((s) => s.slug === slug)
  if (!service) return notFound()

  return (
    <div className="px-6 md:px-12 lg:px-20 pt-4 md:pt-6 pb-16 md:pb-24">
      {/* Title & Tagline - animate from left */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
       
        <h1
          className="uppercase"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 100,
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            color: 'var(--heritage-cream)',
          }}
        >
          {service.title}
        </h1>
      </motion.div>

      <div className="mt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <motion.p
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="text-lg md:text-xl max-w-2xl"
          style={{ color: 'var(--heritage-cream)', opacity: 0.6 }}
        >
          {service.tagline}
        </motion.p>

        <MotionLink
          href={`/facilitation-service/${slug}/process`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="shrink-0 inline-flex items-center gap-3 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider rounded-full transition-all duration-300 hover:gap-5"
          style={{
            background: 'var(--heritage-gold)',
            color: 'var(--wood-espresso)',
          }}
        >
          Process
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </MotionLink>
      </div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-12 mb-10 h-px origin-left"
        style={{ background: 'rgba(249, 248, 246, 0.12)' }}
      />

      {/* Deliverables Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h2
            className="text-xs md:text-sm font-medium uppercase tracking-[0.15em]"
            style={{ color: 'var(--heritage-gold)', opacity: 0.8 }}
          >
            What You Get
          </h2>
          <span
            className="text-xs"
            style={{ color: 'rgba(249, 248, 246, 0.35)' }}
          >
            Est. {service.timeline}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {service.deliverables.map((deliverable, index) => (
            <motion.div
              key={deliverable}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.55 + index * 0.07,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="rounded-lg p-5 flex items-start gap-3 border transition-colors hover:border-[var(--heritage-gold)]"
              style={{
                background: 'rgba(249, 248, 246, 0.03)',
                borderColor: 'rgba(249, 248, 246, 0.08)',
              }}
            >
              <CheckCircle2
                className="w-5 h-5 shrink-0 mt-0.5"
                style={{ color: 'var(--heritage-gold)' }}
              />
              <span
                className="text-sm md:text-base"
                style={{ color: 'var(--heritage-cream)', opacity: 0.85 }}
              >
                {deliverable}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
