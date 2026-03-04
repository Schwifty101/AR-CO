/**
 * Shared Lenis instance reference.
 * Separated from SmoothScroll.tsx so that consumers can import getSmoother()
 * without pulling GSAP / Lenis into the initial bundle.
 */

import type Lenis from "lenis"

let lenisInstance: Lenis | null = null

/** Set the active Lenis instance (called by SmoothScroll on init). */
export const setSmootherInstance = (instance: Lenis | null) => {
  lenisInstance = instance
}

/** Get the current Lenis instance, or null if not yet initialised. */
export const getSmoother = (): Lenis | null => lenisInstance
