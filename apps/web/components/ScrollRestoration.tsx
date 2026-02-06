"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { setNormalScroll, getSmoother } from "./SmoothScroll"

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
      smoother.scrollTo(0, false)
    } else {
      // Fallback for non-smooth scroll pages
      window.scrollTo(0, 0)
    }

    // Reset scroll speed to normal for non-home pages
    // Home page (/) has Hero which manages its own slow scroll
    // This fixes the issue where Hero's slow scroll (0.3 speed, 10 smoothness)
    // persists when navigating to other pages like /practice-areas or /team
    if (pathname !== "/") {
      setNormalScroll()
    }
  }, [pathname])

  return null
}
