"use client"

import { useEffect, ReactNode } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

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
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.04,
    })

    lenisInstance = lenis

    // Connect Lenis scroll events to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update)

    // Use GSAP ticker as the single animation heartbeat
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000) // GSAP ticker uses seconds, Lenis expects ms
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    window.dispatchEvent(new CustomEvent("scroll-smoother-ready", { detail: lenis }))

    return () => {
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  return <>{children}</>
}
