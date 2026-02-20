import { useCallback, useEffect, useRef } from "react"
import { getSmoother } from "@/components/SmoothScroll"

/**
 * Ref-counted scroll lock manager.
 *
 * Multiple overlays can call lock/unlock independently.
 * Lenis only resumes when ALL locks are released (counter reaches 0).
 *
 * @example
 * ```tsx
 * const { lock, unlock } = useScrollLock()
 * useEffect(() => { if (isOpen) lock(); else unlock() }, [isOpen])
 * ```
 */

let lockCount = 0
let savedPaddingRight = ""

function applyLock() {
  if (lockCount === 1) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    savedPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = "hidden"
    document.body.style.paddingRight = `${scrollbarWidth}px`
    getSmoother()?.stop()
  }
}

function releaseLock() {
  if (lockCount === 0) {
    document.body.style.overflow = ""
    document.body.style.paddingRight = savedPaddingRight
    savedPaddingRight = ""
    getSmoother()?.start()
  }
}

export function useScrollLock() {
  const lockedByThis = useRef(false)

  const lock = useCallback(() => {
    if (lockedByThis.current) return
    lockedByThis.current = true
    lockCount++
    applyLock()
  }, [])

  const unlock = useCallback(() => {
    if (!lockedByThis.current) return
    lockedByThis.current = false
    lockCount--
    releaseLock()
  }, [])

  // Safety: always unlock on unmount
  useEffect(() => {
    return () => {
      if (lockedByThis.current) {
        lockedByThis.current = false
        lockCount--
        releaseLock()
      }
    }
  }, [])

  return { lock, unlock }
}
