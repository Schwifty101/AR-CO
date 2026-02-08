'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { facilitationServices } from '@/components/data/facilitationServicesData'

const MotionLink = motion.create(Link)

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Step 2: Process steps with alternating timeline */
export default function FacilitationServiceProcess({ params }: PageProps) {
  const { slug } = use(params)
  const service = facilitationServices.find((s) => s.slug === slug)
  if (!service) return notFound()

  const steps = service.processSteps

  return (
    <div className="px-6 md:px-12 lg:px-20 pt-4 md:pt-6 pb-16 md:pb-24">
      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="uppercase text-center"
        style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 100,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          color: 'var(--heritage-cream)',
        }}
      >
        Process
      </motion.h1>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="block text-center uppercase tracking-wider font-medium mt-1"
        style={{ fontSize: '0.6rem', color: 'var(--heritage-gold)', opacity: 0.7 }}
      >
        Est. {service.timeline}
      </motion.span>

      {/* Timeline */}
      <div className="relative mt-8 md:mt-12">
        {/* Center gold line - stops before the button */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="absolute left-0 top-1/2 h-px origin-left hidden md:block"
          style={{ background: 'var(--heritage-gold)', opacity: 0.6, right: '120px' }}
        />

        {/* Start button on the line - desktop */}
        <MotionLink
          href={`/facilitation-service/${slug}/documents`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: [0.32, 0.72, 0, 1] }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:inline-flex items-center gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 hover:gap-4"
          style={{
            background: 'var(--heritage-gold)',
            color: 'var(--wood-espresso)',
          }}
        >
          Start
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </MotionLink>

        {/* Mobile vertical line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="absolute left-4 top-0 bottom-0 w-px origin-top md:hidden"
          style={{ background: 'var(--heritage-gold)', opacity: 0.6 }}
        />

        {/* Steps - alternating above/below on desktop, stacked on mobile */}
        <div className="hidden md:grid md:grid-cols-1 relative">
          {/* Top row - even-index steps (above the line) */}
          <div className="flex justify-around pb-8">
            {steps.map((step, index) => {
              if (index % 2 !== 0) return <div key={index} className="flex-1" />
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.6 + index * 0.2,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="flex-1 flex flex-col items-center justify-end px-3"
                  style={{ height: '140px' }}
                >
                  <h3
                    className="font-light uppercase tracking-wider text-left w-full max-w-[180px] overflow-hidden"
                    style={{ fontSize: '0.75rem', color: 'var(--heritage-cream)', height: '32px', lineHeight: '16px' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="leading-snug max-w-[180px] text-left w-full overflow-hidden"
                    style={{ fontSize: '0.65rem', color: 'rgba(249, 248, 246, 0.4)', height: '48px', lineHeight: '16px' }}
                  >
                    {step.description}
                  </p>
                  <span
                    className="uppercase tracking-wider font-medium text-center w-full max-w-[180px] mt-1"
                    style={{ fontSize: '0.6rem', color: 'var(--heritage-gold)', opacity: 0.7, height: '14px' }}
                  >
                    {step.duration}
                  </span>
                  {/* Connector dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.2 }}
                    className="mt-3 w-2 h-2 rounded-full shrink-0"
                    style={{ background: 'var(--heritage-gold)' }}
                  />
                </motion.div>
              )
            })}
          </div>

          {/* Gold line sits here visually (already absolutely positioned) */}

          {/* Bottom row - odd-index steps (below the line) */}
          <div className="flex justify-around pt-8">
            {steps.map((step, index) => {
              if (index % 2 === 0) return <div key={index} className="flex-1" />
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.6 + index * 0.2,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="flex-1 flex flex-col items-center justify-start px-3"
                  style={{ height: '140px' }}
                >
                  {/* Connector dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.2 }}
                    className="mb-3 w-2 h-2 rounded-full shrink-0"
                    style={{ background: 'var(--heritage-gold)' }}
                  />
                  <h3
                    className="font-light uppercase tracking-wider text-left w-full max-w-[180px] overflow-hidden"
                    style={{ fontSize: '0.75rem', color: 'var(--heritage-cream)', height: '32px', lineHeight: '16px' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="leading-snug max-w-[180px] text-left w-full overflow-hidden"
                    style={{ fontSize: '0.65rem', color: 'rgba(249, 248, 246, 0.4)', height: '48px', lineHeight: '16px' }}
                  >
                    {step.description}
                  </p>
                  <span
                    className="uppercase tracking-wider font-medium text-center w-full max-w-[180px] mt-1"
                    style={{ fontSize: '0.6rem', color: 'var(--heritage-gold)', opacity: 0.7, height: '14px' }}
                  >
                    {step.duration}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Mobile layout - vertical timeline */}
        <div className="md:hidden space-y-8 pl-10">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.5 + index * 0.15,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="relative"
            >
              {/* Dot on the vertical line */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.15 }}
                className="absolute -left-[26.5px] top-1 w-2 h-2 rounded-full"
                style={{ background: 'var(--heritage-gold)' }}
              />
              <h3
                className="font-light uppercase tracking-wider mb-0.5"
                style={{ fontSize: '9px', color: 'var(--heritage-cream)' }}
              >
                {step.title}
              </h3>
              <p
                className="leading-snug mb-1"
                style={{ fontSize: '8px', color: 'rgba(249, 248, 246, 0.4)' }}
              >
                {step.description}
              </p>
              <span
                className="uppercase tracking-wider font-medium"
                style={{ fontSize: '8px', color: 'var(--heritage-gold)', opacity: 0.7 }}
              >
                {step.duration}
              </span>
            </motion.div>
          ))}

          {/* Start button on the vertical line - mobile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 + steps.length * 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="relative"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.9 + steps.length * 0.15 }}
              className="absolute -left-[26.5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{ background: 'var(--heritage-gold)' }}
            />
            <Link
              href={`/facilitation-service/${slug}/documents`}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 hover:gap-4"
              style={{
                background: 'var(--heritage-gold)',
                color: 'var(--wood-espresso)',
              }}
            >
              Start
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
