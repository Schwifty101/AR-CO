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

// Export function to set smoothness value dynamically
export const setSmoothness = (smoothValue: number) => {
  if (smootherInstance) {
    smootherInstance.smooth(smoothValue)
  }
}

// Preset: Slow scroll for frame sequences (e.g., hero animation)
export const setSlowScroll = () => {
  setScrollSpeed(0.3)    // 30% of normal speed for frame playback
  setSmoothness(10)      // Higher smoothness to dampen scroll velocity variations
}

// Preset: Medium scroll for transition sections (hero → quote overlap)
export const setMediumScroll = () => {
  setScrollSpeed(0.5) // Half speed for smooth transition
  setSmoothness(6) // Medium-high smoothness
}

// Preset: Overlap scroll for Hero → QuoteSection parallax transition
export const setOverlapScroll = () => {
  setScrollSpeed(0.6)    // Medium-slow for smooth overlap effect
  setSmoothness(4)       // Medium smoothness for natural parallax feel
}

// Preset: Normal scroll for rest of website (matches base SmoothScroll config)
export const setNormalScroll = () => {
  setScrollSpeed(0.6)   // Matches base speed
  setSmoothness(4)       // Matches base smooth value
}

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

    // Initialize ScrollSmoother with damped, flowy scrolling
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 2,                // Lower value for less aggressive, more organic easing
      effects: true,            // Enable data-speed and data-lag attributes
      smoothTouch: 0.15,        // Slightly higher for better mobile feel
      normalizeScroll: true,    // CRITICAL: Normalizes scroll behavior, prevents acceleration spikes
      ignoreMobileResize: true, // Prevent issues with mobile address bar
      speed: 0.85,              // Slightly faster to prevent sluggishness while staying smooth
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
