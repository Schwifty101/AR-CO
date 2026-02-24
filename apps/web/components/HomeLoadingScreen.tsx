'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import styles from './HomeLoadingScreen.module.css'

interface HomeLoadingScreenProps {
  /** 0–100 loading progress */
  progress: number
  /** When true the screen slides left and unmounts */
  isComplete: boolean
}

const SLIDE_DURATION = 0.75 // seconds — matches PageTransition feel

/**
 * HomeLoadingScreen
 *
 * Full-screen loading overlay for the home page.
 * Visually identical to PageTransition: espresso background + pulsing logo.
 * Adds a thin gold progress bar pinned to the top edge.
 * Dismisses by sliding left (x: 0 → -100%) once `isComplete` is true.
 */
export default function HomeLoadingScreen({ progress, isComplete }: HomeLoadingScreenProps) {
  const [visible, setVisible]             = useState(true)
  const [displayProgress, setDisplayProgress] = useState(0)
  const maxRef = useRef(0)

  // Progress only ever moves forward
  useEffect(() => {
    const clamped = Math.max(maxRef.current, progress)
    maxRef.current = clamped
    setDisplayProgress(clamped)
  }, [progress])

  // Snap to 100 when declared complete
  useEffect(() => {
    if (isComplete) {
      maxRef.current = 100
      setDisplayProgress(100)
    }
  }, [isComplete])

  // ── Scroll lock ────────────────────────────────────────────────────────────
  const preventWheel = useCallback((e: WheelEvent) => { e.preventDefault() }, [])
  const preventTouch = useCallback((e: TouchEvent) => { e.preventDefault() }, [])
  const preventKey   = useCallback((e: KeyboardEvent) => {
    const scroll = ['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End']
    if (scroll.includes(e.code)) e.preventDefault()
  }, [])

  useEffect(() => {
    if (!visible) return

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    window.addEventListener('wheel',     preventWheel, { capture: true, passive: false })
    window.addEventListener('touchmove', preventTouch, { capture: true, passive: false })
    window.addEventListener('keydown',   preventKey,   { capture: true })

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      window.removeEventListener('wheel',     preventWheel, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchmove', preventTouch, { capture: true } as EventListenerOptions)
      window.removeEventListener('keydown',   preventKey,   { capture: true })
    }
  }, [visible, preventWheel, preventTouch, preventKey])

  if (!visible) return null

  return (
    <motion.div
      className={styles.screen}
      // Already on screen — no entrance animation
      initial={{ x: 0 }}
      animate={isComplete ? { x: '-100%' } : { x: 0 }}
      transition={
        isComplete
          ? { duration: SLIDE_DURATION, ease: [0.32, 0.72, 0, 1] }
          : { duration: 0 }
      }
      onAnimationComplete={() => {
        if (isComplete) {
          document.body.classList.add('app-loaded')
          setVisible(false)
        }
      }}
    >
      {/* ── Top-edge progress bar ─────────────────────────────────────────── */}
      <div className={styles.progressTrack}>
        <motion.div
          className={styles.progressFill}
          initial={{ width: '0%' }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* ── Centred pulsing logo ──────────────────────────────────────────── */}
      <div className={styles.center}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className={styles.logoWrapper}
        >
          <Image
            src="/assets/logos/main-logo.png"
            alt="AR&CO"
            width={50}
            height={80}
            priority
            className={styles.logo}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
