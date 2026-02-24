'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useScrollLock } from '@/lib/hooks/useScrollLock'
import styles from './AboutOverlay.module.css'

interface AboutOverlayProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * AboutOverlay Component
 *
 * Full-screen overlay with About Us content.
 * Displays company information, philosophy, and values.
 */
export default function AboutOverlay({ isOpen, onClose }: AboutOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  const { lock, unlock } = useScrollLock()

  useEffect(() => {
    if (isOpen) {
      lock()
      window.addEventListener('keydown', handleKeyDown)
    } else {
      unlock()
    }

    return () => {
      unlock()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown, lock, unlock])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-[9999] ${styles.overlayScroll}`}
          data-lenis-prevent
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: 'radial-gradient(ellipse 75% 55% at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 65%), radial-gradient(ellipse 65% 45% at 20% 30%, rgba(212,175,55,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 55% at 80% 70%, rgba(212,175,55,0.03) 0%, transparent 70%), #0d0906',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            height: '100dvh',
            width: '100vw',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close about overlay"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="px-6 md:px-12 lg:px-20 pt-16 md:pt-20 pb-12 md:pb-16 max-w-[1400px] mx-auto">
            {/* Header - Smaller and Top-aligned */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8 md:mb-12"
            >
              <span
                className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] mb-3 block"
                style={{
                  color: 'var(--heritage-gold)',
                  opacity: 0.8,
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              >
                Who We Are
              </span>
              <h1
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                  fontWeight: 300,
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                  color: 'var(--heritage-cream)',
                  fontStyle: 'italic',
                }}
              >
                About <span style={{ color: 'var(--heritage-gold)' }}>AR & Co.</span>
              </h1>
              <p
                className="mt-4 text-base md:text-lg"
                style={{
                  color: 'var(--heritage-cream)',
                  opacity: 0.8,
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontStyle: 'italic',
                }}
              >
                Fearless Advocacy. Strategic Excellence.
              </p>
            </motion.div>

            {/* Decorative line below header */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
              className="h-px origin-left mb-8 md:mb-12"
              style={{ background: 'rgba(212, 175, 55, 0.3)' }}
            />

            {/* Content Sections */}
            <div className="space-y-6 md:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                <p className={styles.paragraph}>
                  AR & Co. is a distinguished full-service law firm headed by{' '}
                  <span className={styles.highlight}>Barrister Shoaib Razzaq</span>, known for 
                  its fearless advocacy and strategic legal excellence. The firm provides 
                  comprehensive legal services in litigation, corporate advisory, regulatory 
                  compliance, and public authority matters.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.32, 0.72, 0, 1] }}
              >
                <p className={styles.paragraph}>
                  With extensive experience before the Superior Courts of Pakistan, AR & Co. 
                  has built a reputation for handling complex and high-profile cases with 
                  precision and confidence. Our valued clients include leading corporate entities, 
                  financial institutions, media groups, government bodies, and prominent public 
                  figures across Pakistan.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.32, 0.72, 0, 1] }}
              >
                <p className={styles.paragraph}>
                  We combine deep legal expertise with practical insight to deliver result-driven 
                  solutions tailored to each client&apos;s needs.
                </p>
              </motion.div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.9, ease: [0.32, 0.72, 0, 1] }}
                className="h-px my-8 md:my-10"
                style={{ background: 'rgba(212, 175, 55, 0.2)' }}
              />

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0, ease: [0.32, 0.72, 0, 1] }}
              >
                <p className={styles.paragraph}>
                  Originally recognized for our strong litigation practice and courtroom 
                  representation, we have now expanded our vision beyond the courts. With the 
                  launch of our online{' '}
                  <span className={styles.highlight}>Facilitation Center</span>, clients can 
                  seamlessly register and access a wide range of legal and regulatory services 
                  through a secure, efficient, and client-focused digital platform.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1, ease: [0.32, 0.72, 0, 1] }}
              >
                <p className={`${styles.paragraph} ${styles.closing}`}>
                  At AR & Co., professionalism, integrity, discretion, and unwavering commitment 
                  remain the foundation of everything we do.
                </p>
              </motion.div>
            </div>

            {/* Bottom decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-10 md:mt-14 h-px origin-left"
              style={{ background: 'var(--heritage-gold)', opacity: 0.4 }}
            />

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="mt-4 text-xs tracking-[0.1em] uppercase"
              style={{
                color: 'rgba(249, 248, 246, 0.25)',
                fontFamily: "'Georgia', 'Times New Roman', serif",
              }}
            >
              AR&CO — Excellence in Legal Practice
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
