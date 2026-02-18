"use client"

import { useEffect, ReactNode } from "react"
import Lenis from "lenis"

// Global Lenis instance
let lenisInstance: Lenis | null = null

// Export function to get the Lenis instance (drop-in for getSmoother)
export const getSmoother = () => lenisInstance

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      touchMultiplier: 0.5,
    })

    lenisInstance = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    window.dispatchEvent(new CustomEvent("scroll-smoother-ready", { detail: lenis }))

    return () => {
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  return <>{children}</>
}
