"use client"

import { useEffect, useRef, ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"

// Register GSAP plugins - must be done before creating ScrollSmoother
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
}

// Global ScrollSmoother instance for dynamic speed control
let smootherInstance: ScrollSmoother | null = null

// Export function to get the ScrollSmoother instance
export const getSmoother = () => smootherInstance

// Export function to set scroll speed (1 = normal, lower = slower)
export const setScrollSpeed = (speed: number) => {
  if (smootherInstance) {
    gsap.to(smootherInstance, {
      speed: speed,
      duration: 0.3,
      ease: "power2.out"
    })
  }
}

// Preset: Slow scroll for frame sequences
export const setSlowScroll = () => setScrollSpeed(0.25)

// Preset: Normal scroll for rest of website
export const setNormalScroll = () => setScrollSpeed(1)

// Pause scrolling completely (used when frames need to catch up)
export const pauseScroll = () => {
  if (smootherInstance) {
    smootherInstance.paused(true)
  }
}

// Resume scrolling
export const resumeScroll = () => {
  if (smootherInstance) {
    smootherInstance.paused(false)
  }
}

// Scroll to a specific position (used to hold position while frames catch up)
export const scrollTo = (position: number) => {
  if (smootherInstance) {
    smootherInstance.scrollTo(position, false) // instant, no animation
  }
}

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return

    // Initialize ScrollSmoother
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.5,              // Smoothness factor (higher = smoother)
      effects: true,            // Enable data-speed and data-lag attributes
      smoothTouch: 0.1,         // Enable smooth scrolling on touch devices
      normalizeScroll: true,    // Normalize scroll behavior across browsers
      ignoreMobileResize: true, // Prevent issues with mobile address bar
      speed: 1,                 // Default scroll speed (1 = normal)
    })

    // Store globally for dynamic updates
    smootherInstance = smoother

    // Cleanup
    return () => {
      smoother.kill()
      smootherInstance = null
    }
  }, [])

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  )
}
