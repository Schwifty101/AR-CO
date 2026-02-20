"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import styles from "./LoadingScreen.module.css"

const BASE_WORDS = ["Justice", "Integrity", "Advocacy", "Equity", "Resolution"]
const CHAR_DURATION = 0.2
const CHAR_STAGGER = 0.03
const DISPLAY_HOLD = 400 // ms each word stays fully visible before exiting

function shuffleArray(arr: string[]): string[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface LoadingScreenProps {
  progress: number
  isComplete: boolean
}

export default function LoadingScreen({ progress, isComplete }: LoadingScreenProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [words] = useState(() => shuffleArray(BASE_WORDS))
  const [wordIndex, setWordIndex] = useState(-1)
  const [readyToDismiss, setReadyToDismiss] = useState(false)
  const [displayProgress, setDisplayProgress] = useState(0)
  const maxProgressRef = useRef(0)

  // Ensure progress only moves forward, never backward
  useEffect(() => {
    const clamped = Math.max(maxProgressRef.current, progress)
    maxProgressRef.current = clamped
    setDisplayProgress(clamped)
  }, [progress])

  // When complete, snap to 100% first, then wait 2s before dismissing
  useEffect(() => {
    if (!isComplete) return
    maxProgressRef.current = 100
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: syncing derived state from prop
    setDisplayProgress(100)
    const timer = setTimeout(() => setReadyToDismiss(true), 2000)
    return () => clearTimeout(timer)
  }, [isComplete])

  const isFirstWordRef = useRef(true)
  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Start first word immediately
  useEffect(() => {
    if (readyToDismiss) return
    isFirstWordRef.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: initializing word animation cycle
    setWordIndex(0)
    return () => {
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current)
    }
  }, [readyToDismiss])

  // Cycle words with consistent timing
  useEffect(() => {
    if (wordIndex < 0 || readyToDismiss) return

    const word = words[wordIndex]
    if (!word) return

    // Time for all characters to finish entering
    const enterDuration = ((word.length - 1) * CHAR_STAGGER + CHAR_DURATION) * 1000

    // For subsequent words, account for exit animation of previous word (AnimatePresence mode="wait")
    let exitDuration = 0
    if (!isFirstWordRef.current) {
      const prevIndex = (wordIndex - 1 + words.length) % words.length
      const prevWord = words[prevIndex]
      if (prevWord) {
        exitDuration = ((prevWord.length - 1) * CHAR_STAGGER + CHAR_DURATION) * 1000
      }
    }
    isFirstWordRef.current = false

    wordTimerRef.current = setTimeout(() => {
      setWordIndex((prev) => (prev + 1) % words.length)
    }, exitDuration + enterDuration + DISPLAY_HOLD)

    return () => {
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current)
    }
  }, [wordIndex, readyToDismiss, words])

  // Prevent all scroll events
  const preventScroll = useCallback((e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }, [])

  // Prevent wheel events
  const preventWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }, [])

  // Prevent touch move
  const preventTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }, [])

  // Prevent keyboard scroll
  const preventKeyScroll = useCallback((e: KeyboardEvent) => {
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End']
    if (scrollKeys.includes(e.code)) {
      e.preventDefault()
      return false
    }
  }, [])

  useEffect(() => {
    if (readyToDismiss) {
      document.body.classList.add('app-loaded')
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.documentElement.classList.remove('loading-active')

      window.removeEventListener('scroll', preventScroll, true)
      window.removeEventListener('wheel', preventWheel, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchmove', preventTouchMove, { capture: true } as EventListenerOptions)
      window.removeEventListener('keydown', preventKeyScroll, true)

      const timer = setTimeout(() => {
        setIsHidden(true)
      }, 1500)

      return () => clearTimeout(timer)
    } else {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.documentElement.classList.add('loading-active')

      window.addEventListener('scroll', preventScroll, { capture: true, passive: false })
      window.addEventListener('wheel', preventWheel, { capture: true, passive: false })
      window.addEventListener('touchmove', preventTouchMove, { capture: true, passive: false })
      window.addEventListener('keydown', preventKeyScroll, { capture: true })

      return () => {
        window.removeEventListener('scroll', preventScroll, true)
        window.removeEventListener('wheel', preventWheel, { capture: true } as EventListenerOptions)
        window.removeEventListener('touchmove', preventTouchMove, { capture: true } as EventListenerOptions)
        window.removeEventListener('keydown', preventKeyScroll, true)
      }
    }
  }, [readyToDismiss, preventScroll, preventWheel, preventTouchMove, preventKeyScroll])

  if (isHidden) return null

  return (
    <div className={`${styles.loadingScreen} ${readyToDismiss ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <div className={styles.wordContainer}>
          <AnimatePresence mode="wait">
            {wordIndex >= 0 && (
            <motion.span
              key={wordIndex}
              className={styles.word}
            >
              {words[wordIndex]?.split("").map((char, i) => (
                <span key={i} className={styles.charWrapper}>
                  <motion.span
                    className={styles.char}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{
                      duration: CHAR_DURATION,
                      delay: i * CHAR_STAGGER,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
            </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${displayProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  )
}
