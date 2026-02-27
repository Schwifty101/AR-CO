'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import styles from './PageTransition.module.css'

/**
 * Get the base section of a path to determine if transition should play.
 * Pages within the same section won't trigger a transition.
 */
function getBaseSection(path: string): string {
  if (!path || path === '/') return 'home'

  const segments = path.split('/').filter(Boolean)

  // Auth section – group all auth pages together
  if (segments[0] === 'auth') return 'auth'

  // Services section – group by category/slug (sub-tabs share a section)
  if (segments[0] === 'services' && segments.length >= 3) {
    return `services/${segments[1]}/${segments[2]}`
  }

  // Admin / Client dashboards
  if (segments[0] === 'admin' || segments[0] === 'client') return segments[0]

  return segments[0] || 'home'
}

/** Check whether navigation between two paths should show a transition */
function shouldTransition(from: string, to: string): boolean {
  if (to === '/') return false                    // never transition TO home
  if (from === to) return false                    // same page
  if (getBaseSection(from) === getBaseSection(to)) return false // same section
  return true
}

const SLIDE_IN = 600   // ms – slide-in duration
const HOLD = 1000  // ms – minimum logo display time
const SLIDE_OUT = 600   // ms – slide-out duration
// If a page dispatches 'page-transition-hold' on mount, we wait up to this
// long beyond HOLD for a matching 'page-content-ready' event before forcing exit.
const MAX_HOLD = 3000  // ms – absolute ceiling for the hold phase

/**
 * PageTransition Component
 *
 * Intercepts internal `<a>` clicks globally.
 * If the destination requires a transition the overlay slides in from the
 * right **before** Next.js navigates, then slides out to the left once done.
 *
 * This eliminates the flash of the destination page that occurred when
 * reacting to pathname changes via useEffect.
 */
export default function PageTransition() {
  const pathname = usePathname()
  const router = useRouter()

  const [phase, setPhase] = useState<'idle' | 'entering' | 'holding' | 'exiting'>('idle')
  const phaseRef = useRef(phase)
  useEffect(() => { phaseRef.current = phase }, [phase])
  const pathnameRef = useRef(pathname)
  useEffect(() => { pathnameRef.current = pathname }, [pathname])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingHref = useRef<string | null>(null)

  /** Safely clear any running timer */
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [])

  /**
   * Global click handler – intercepts internal navigation links so we can
   * show the transition *before* the page changes.
   */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Ignore modified clicks (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return

      // Walk up from the event target to find the nearest <a>
      let anchor: HTMLAnchorElement | null = null
      let el = e.target as HTMLElement | null
      while (el) {
        if (el.tagName === 'A') { anchor = el as HTMLAnchorElement; break }
        el = el.parentElement
      }
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Only intercept internal, same-origin links
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (anchor.target === '_blank') return

      // Check whether this navigation warrants a transition
      if (!shouldTransition(pathnameRef.current, href)) return

      // If we're already transitioning, ignore
      if (phaseRef.current !== 'idle') return

      // Prevent default navigation but let the click bubble so overlay
      // onClick={onClose} handlers can still fire and close the overlay.
      e.preventDefault()

      // Notify any open overlays that a page transition is about to start
      // so they can close themselves immediately.
      window.dispatchEvent(new CustomEvent('page-transition-start'))

      // Store where we need to go
      pendingHref.current = href

      // Phase 1 – slide in
      setPhase('entering')

      // After slide-in completes, navigate and hold
      timerRef.current = setTimeout(() => {
        // Perform the actual navigation while the overlay covers the screen
        if (pendingHref.current) router.push(pendingHref.current)

        // Phase 2 – hold
        setPhase('holding')

        // Closure state for the content-ready handshake.
        // If the incoming page dispatches 'page-transition-hold' on mount we
        // delay exit until it dispatches 'page-content-ready' (or MAX_HOLD).
        let holdRequested = false
        let minHoldDone   = false
        let contentDone   = false

        const startExit = () => {
          setPhase('exiting')
          timerRef.current = setTimeout(() => {
            setPhase('idle')
            pendingHref.current = null
          }, SLIDE_OUT)
        }

        const tryExit = () => {
          if (!minHoldDone) return
          if (holdRequested && !contentDone) return
          startExit()
        }

        const onContentReady = () => {
          contentDone = true
          window.removeEventListener('page-content-ready', onContentReady)
          tryExit()
        }

        // Listen for the incoming page signalling it needs more time
        window.addEventListener('page-transition-hold', () => {
          holdRequested = true
        }, { once: true })

        window.addEventListener('page-content-ready', onContentReady)

        // Minimum hold – exit immediately if no wait was requested
        timerRef.current = setTimeout(() => {
          minHoldDone = true
          tryExit()

          // Absolute safety valve: never block longer than MAX_HOLD
          timerRef.current = setTimeout(() => {
            window.removeEventListener('page-content-ready', onContentReady)
            if (phaseRef.current === 'holding') startExit()
          }, MAX_HOLD)
        }, HOLD)
      }, SLIDE_IN)
    }

    document.addEventListener('click', handleClick, true) // capture phase
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [router, clearTimer])

  /* Cleanup on unmount */
  useEffect(() => clearTimer, [clearTimer])

  const isVisible = phase !== 'idle'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="page-transition"
          className={styles.transition}
          initial={{ x: '100%' }}
          animate={
            phase === 'entering'
              ? { x: 0 }
              : phase === 'holding'
                ? { x: 0 }
                : { x: '-100%' }
          }
          transition={{ duration: phase === 'exiting' ? SLIDE_OUT / 1000 : SLIDE_IN / 1000, ease: [0.32, 0.72, 0, 1] }}
          onAnimationComplete={() => {
            // Framer may fire this – no-op; timers drive the phases
          }}
        >
          <div className={styles.logoContainer}>
            <motion.div
              className={styles.logoWrapper}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
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
      )}
    </AnimatePresence>
  )
}
