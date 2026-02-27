'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import styles from './HomeLoadingScreen.module.css'

interface HomeLoadingScreenProps {
  /** 0–100 loading progress */
  progress: number
  /** When true the screen fades out and unmounts */
  isComplete: boolean
}

const FADE_DURATION = 0.85 // seconds

/**
 * HomeLoadingScreen
 *
 * Full-screen loading overlay for the home page.
 * Shows AR&CO + "Top Law Associates" at the exact position they occupy in HeroV2,
 * so when the screen fades the texts appear to remain in place while the hero
 * background (quotes, headlines) falls in underneath.
 * Dismisses by fading to opacity 0 once `isComplete` is true.
 * Adds `app-loaded` to <body> at the START of the fade so the hero quotes
 * begin their entrance animation simultaneously.
 */
export default function HomeLoadingScreen({ progress, isComplete }: HomeLoadingScreenProps) {
  const [visible, setVisible]                   = useState(true)
  const [displayProgress, setDisplayProgress]   = useState(0)
  const maxRef                                   = useRef(0)

  // Progress only ever moves forward
  useEffect(() => {
    const clamped = Math.max(maxRef.current, progress)
    maxRef.current = clamped
    setDisplayProgress(clamped)
  }, [progress])

  // Snap to 100 and signal app-loaded at the START of the exit animation
  // so the hero quotes begin falling in simultaneously with our fade-out.
  useEffect(() => {
    if (isComplete) {
      maxRef.current = 100
      setDisplayProgress(100)
      document.body.classList.add('app-loaded')
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
      initial={{ opacity: 1 }}
      animate={isComplete ? { opacity: 0 } : { opacity: 1 }}
      transition={
        isComplete
          ? { duration: FADE_DURATION, ease: [0.32, 0.72, 0, 1] }
          : { duration: 0 }
      }
      onAnimationComplete={() => {
        if (isComplete) setVisible(false)
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

      {/* ── Centred texts — same position as HeroV2's centerWrapper ─────── */}
      <div className={styles.textCenter}>
        <p className={styles.brandName}>AR&amp;CO</p>
        <p className={styles.tagline}>Top Law Associates</p>
      </div>
    </motion.div>
  )
}
