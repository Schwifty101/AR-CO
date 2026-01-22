"use client"

import { useEffect, ReactNode } from "react"
import Lenis from "lenis"

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 2.8, // Even slower, more luxurious scroll
      easing: (t) => 1 - Math.pow(1 - t, 5), // Quintic ease-out for ultra flowy feel
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 0.7, // Even slower wheel response
      lerp: 0.06, // Lower lerp = more floaty/inertia feel
    })

    // Animation frame loop
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Cleanup
    return () => {
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
