"use client"

import { useEffect, useState, useCallback } from "react"
import { pauseScroll, resumeScroll } from "./SmoothScroll"
import styles from "./LoadingScreen.module.css"

interface LoadingScreenProps {
  progress: number
  isComplete: boolean
}

export default function LoadingScreen({ progress, isComplete }: LoadingScreenProps) {
  const [isHidden, setIsHidden] = useState(false)

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
    if (isComplete) {
      // Add class to body to show header
      document.body.classList.add('app-loaded')

      // Remove scroll lock
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.documentElement.classList.remove('loading-active')

      // Remove event listeners
      window.removeEventListener('scroll', preventScroll, true)
      window.removeEventListener('wheel', preventWheel, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchmove', preventTouchMove, { capture: true } as EventListenerOptions)
      window.removeEventListener('keydown', preventKeyScroll, true)

      // Resume ScrollSmoother
      resumeScroll()

      // Hide loading screen after animation
      const timer = setTimeout(() => {
        setIsHidden(true)
      }, 1500)

      return () => clearTimeout(timer)
    } else {
      // Lock scroll on both html and body
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.documentElement.classList.add('loading-active')

      // Add event listeners to prevent any scroll
      window.addEventListener('scroll', preventScroll, { capture: true, passive: false })
      window.addEventListener('wheel', preventWheel, { capture: true, passive: false })
      window.addEventListener('touchmove', preventTouchMove, { capture: true, passive: false })
      window.addEventListener('keydown', preventKeyScroll, { capture: true })

      // Try to pause ScrollSmoother (might not exist yet)
      pauseScroll()

      // Retry pausing ScrollSmoother after it might be initialized
      const retryPause = setTimeout(() => {
        pauseScroll()
      }, 100)

      return () => {
        clearTimeout(retryPause)
        window.removeEventListener('scroll', preventScroll, true)
        window.removeEventListener('wheel', preventWheel, { capture: true } as EventListenerOptions)
        window.removeEventListener('touchmove', preventTouchMove, { capture: true } as EventListenerOptions)
        window.removeEventListener('keydown', preventKeyScroll, true)
      }
    }
  }, [isComplete, preventScroll, preventWheel, preventTouchMove, preventKeyScroll])

  if (isHidden) return null

  return (
    <div className={`${styles.loadingScreen} ${isComplete ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          AR&CO
          <span className={styles.titleSub}>Law Associates</span>
        </h1>
      </div>

      <div className={styles.counter}>
        <span className={styles.number}>{progress}</span>
        <span className={styles.percent}>%</span>
      </div>
    </div>
  )
}
