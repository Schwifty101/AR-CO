"use client"

import { useEffect, ReactNode } from "react"
import { setSmootherInstance } from "./smoothScrollInstance"

export { getSmoother } from "./smoothScrollInstance"

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    let cancelled = false
    let teardown: (() => void) | null = null

    const init = async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ])

      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)

      const lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: false,
      })

      setSmootherInstance(lenis)

      lenis.on("scroll", ScrollTrigger.update)

      const tickerCallback = (time: number) => {
        lenis.raf(time * 1000)
      }
      gsap.ticker.add(tickerCallback)
      gsap.ticker.lagSmoothing(0)

      window.dispatchEvent(
        new CustomEvent("scroll-smoother-ready", { detail: lenis }),
      )

      teardown = () => {
        gsap.ticker.remove(tickerCallback)
        lenis.destroy()
        setSmootherInstance(null)
      }
    }

    init()

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [])

  return <>{children}</>
}
