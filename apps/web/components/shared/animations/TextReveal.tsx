"use client"

import { useEffect, useRef, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import styles from "./TextReveal.module.css"

interface TextRevealProps {
  /** Content to animate into view */
  children: ReactNode
  /**
   * Milliseconds to wait before the reveal starts.
   * In eager mode this is a JS setTimeout delay;
   * in intersection mode it becomes a CSS transition-delay.
   */
  delay?: number
  /** Duration of the reveal animation in seconds (default: 0.85) */
  duration?: number
  /** Additional CSS class applied to the inner sliding element */
  className?: string
  /** Whether to reset + re-animate each time the element leaves/re-enters the viewport (default: true = animate once) */
  once?: boolean
  /**
   * When true the animation fires on mount (setTimeout delay) instead of waiting
   * for the element to enter the viewport via IntersectionObserver.
   * Useful for above-the-fold sections that are always visible.
   */
  eager?: boolean
}

/**
 * TextReveal — slides content upward from behind an overflow:hidden clip.
 *
 * Wrap any inline or block content. The element starts clipped below its
 * container and rises into view via a cubic-bezier ease-out transition
 * when the viewport trigger fires.
 *
 * @example
 * // Intersection-triggered (default)
 * <TextReveal delay={200} duration={0.9}>
 *   <h2>Excellence in Law</h2>
 * </TextReveal>
 *
 * @example
 * // Eager (fires on mount — for hero sections)
 * <TextReveal eager delay={400} duration={1.1}>
 *   <h1 className={styles.brandTitle}>AR&amp;CO</h1>
 * </TextReveal>
 */
export default function TextReveal({
  children,
  delay = 0,
  duration = 0.85,
  className = "",
  once = true,
  eager = false,
}: TextRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (eager) {
      const timer = setTimeout(() => setRevealed(true), delay)
      return () => clearTimeout(timer)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setRevealed(false)
        }
      },
      { threshold: 0.1 }
    )

    const el = wrapperRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [delay, once, eager])

  const innerStyle: CSSProperties = {
    transitionDuration: `${duration}s`,
    // Eager mode uses JS delay so no CSS delay needed;
    // intersection mode staggers via CSS transition-delay
    transitionDelay: eager ? "0s" : `${delay}ms`,
  }

  return (
    <div ref={wrapperRef} className={styles.revealWrapper}>
      <div
        className={`${styles.revealInner} ${revealed ? styles.revealed : ""} ${className}`}
        style={innerStyle}
      >
        {children}
      </div>
    </div>
  )
}
