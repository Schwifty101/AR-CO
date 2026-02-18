"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getSmoother } from "./SmoothScroll"

/**
 * ScrollRestoration Component
 *
 * Handles scroll position and speed reset on route changes.
 *
 * Features:
 * - Scrolls to top on page navigation
 * - Resets scroll speed to normal (fixes slow scroll persisting from Hero)
 * - Smart handling: doesn't reset speed on home page (Hero manages it)
 * - Uses Next.js App Router pathname detection
 *
 * Usage:
 * Add to root layout inside SmoothScroll wrapper
 */
export default function ScrollRestoration() {
  const pathname = usePathname()

  useEffect(() => {
    // Reset scroll position on every route change
    const smoother = getSmoother()

    if (smoother) {
      // Scroll to top instantly
      smoother.scrollTo(0, { immediate: true })
    } else {
      // Fallback for non-smooth scroll pages
      window.scrollTo(0, 0)
    }

  }, [pathname])

  return null
}
