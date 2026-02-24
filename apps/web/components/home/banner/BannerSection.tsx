"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import styles from "./BannerSection.module.css"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// ─── Frame config ─────────────────────────────────────────────────────────────

const TOTAL_FRAMES = 201
// Frames to treat as high priority (covers ~first 30% of scroll).
// Loaded first and decoded immediately (no idle deferral).
const HIGH_PRIORITY_CUTOFF = 60
// Max simultaneous HTTP requests. Matches typical browser stream limits
// and prevents all 201 requests from competing for bandwidth at once.
const MAX_CONCURRENT = 8

const getFramePath = (index: number): string => {
  const n = index + 1
  const padded = String(n).padStart(5, "0")
  return `/banner/frames/Sequence_${padded}.webp`
}

// ─── Row reveal thresholds (scroll progress 0–1) ──────────────────────────────

const ROW1_THRESHOLD = 0.14
const ROW2_THRESHOLD = 0.42
const ROW3_THRESHOLD = 0.70

// ─── Props ────────────────────────────────────────────────────────────────────

interface BannerSectionProps {
  /** Called with 0–100 as each frame finishes loading + decoding */
  onProgress?: (percent: number) => void
  /** Called once when every frame is downloaded AND GPU-decoded */
  onComplete?: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number
) => {
  const ia = img.width / img.height
  const ca = cw / ch
  let dw: number, dh: number, ox: number, oy: number
  if (ia > ca) {
    dh = ch;  dw = img.width * (ch / img.height)
    ox = (cw - dw) / 2; oy = 0
  } else {
    dw = cw;  dh = img.height * (cw / img.width)
    ox = 0;   oy = (ch - dh) / 2
  }
  ctx.drawImage(img, ox, oy, dw, dh)
}

/**
 * Returns the nearest already-loaded frame to `target`.
 * Prevents blank canvas gaps when the exact frame isn't decoded yet.
 */
const findNearestLoadedFrame = (
  target: number,
  imgs: HTMLImageElement[]
): HTMLImageElement | null => {
  if (imgs[target]) return imgs[target]
  for (let d = 1; d < imgs.length; d++) {
    if (target - d >= 0 && imgs[target - d]) return imgs[target - d]
    if (target + d < imgs.length && imgs[target + d]) return imgs[target + d]
  }
  return null
}

/**
 * Runs `tasks` with at most `maxConcurrent` running at the same time.
 * Prevents all 201 image requests from firing simultaneously.
 */
const runWithConcurrency = (
  tasks: (() => Promise<void>)[],
  maxConcurrent: number
): void => {
  let running = 0
  let index = 0

  const next = () => {
    while (running < maxConcurrent && index < tasks.length) {
      running++
      tasks[index++]().finally(() => { running--; next() })
    }
  }

  next()
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BannerSection({ onProgress, onComplete }: BannerSectionProps) {
  const sectionRef      = useRef<HTMLElement>(null)
  const stickyRef       = useRef<HTMLDivElement>(null)
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const imagesRef       = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)

  // Prevent React Strict Mode from running the load effect twice.
  const loadInitiatedRef = useRef(false)

  // Keep latest callbacks without re-running the load effect
  const onProgressRef = useRef(onProgress)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onProgressRef.current = onProgress }, [onProgress])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  const [loaded, setLoaded] = useState(false)
  const [row1, setRow1]     = useState(false)
  const [row2, setRow2]     = useState(false)
  const [row3, setRow3]     = useState(false)

  // ── Preload + pre-decode all frames ────────────────────────────────────────
  // Loading strategy:
  //   1. Frame 0 — fires immediately, unthrottled (needed before any scroll)
  //   2. Frames 1–59 — high priority, concurrency-capped, decoded right away
  //   3. Frames 60–200 — lower priority, concurrency-capped, decoded during
  //      idle time so they don't block the main thread while the user scrolls
  useEffect(() => {
    if (loadInitiatedRef.current) return
    loadInitiatedRef.current = true

    const imgs: HTMLImageElement[] = new Array(TOTAL_FRAMES)
    imagesRef.current = imgs
    let readyCount = 0

    const markReady = (i: number, img: HTMLImageElement) => {
      imgs[i] = img
      readyCount++

      const pct = Math.floor((readyCount / TOTAL_FRAMES) * 100)
      onProgressRef.current?.(pct)

      if (readyCount === TOTAL_FRAMES) {
        onCompleteRef.current?.()
      }

      // Frame 0 ready — paint first frame and allow ScrollTrigger setup
      if (i === 0) {
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext("2d")
          canvas.width  = window.innerWidth
          canvas.height = window.innerHeight
          if (ctx) drawImageCover(ctx, img, canvas.width, canvas.height)
        }
        setLoaded(true)
      }
    }

    const loadFrame = (i: number, highPriority: boolean): Promise<void> => {
      return new Promise((resolve) => {
        const img = new window.Image()

        // Hint to the browser to prioritise the network request for early frames
        if (highPriority) {
          (img as HTMLImageElement & { fetchPriority: string }).fetchPriority = "high"
        }

        img.onload = () => {
          const decode = () =>
            img.decode()
              .then(() => { markReady(i, img); resolve() })
              .catch(() => { markReady(i, img); resolve() })

          if (highPriority || !("requestIdleCallback" in window)) {
            // Decode immediately — these frames are needed early in the scroll
            decode()
          } else {
            // Yield to idle time so late-scroll frames don't compete with
            // the main thread while the user is actively scrolling early frames
            requestIdleCallback(() => decode(), { timeout: 3000 })
          }
        }

        img.onerror = () => {
          readyCount++
          const pct = Math.floor((readyCount / TOTAL_FRAMES) * 100)
          onProgressRef.current?.(pct)
          if (readyCount === TOTAL_FRAMES) onCompleteRef.current?.()
          resolve()
        }

        img.src = getFramePath(i)
      })
    }

    // Frame 0: unthrottled, needed immediately
    loadFrame(0, true)

    // Frames 1–(HIGH_PRIORITY_CUTOFF-1): high priority batch
    const highPriorityTasks = Array.from(
      { length: HIGH_PRIORITY_CUTOFF - 1 },
      (_, i) => () => loadFrame(i + 1, true)
    )
    runWithConcurrency(highPriorityTasks, MAX_CONCURRENT)

    // Frames HIGH_PRIORITY_CUTOFF–200: lower priority batch
    const lowPriorityTasks = Array.from(
      { length: TOTAL_FRAMES - HIGH_PRIORITY_CUTOFF },
      (_, i) => () => loadFrame(i + HIGH_PRIORITY_CUTOFF, false)
    )
    runWithConcurrency(lowPriorityTasks, MAX_CONCURRENT)
  }, [])

  // ── ScrollTrigger — frame scrub + row reveals ───────────────────────────────
  useGSAP(() => {
    if (!loaded || !sectionRef.current) return
    const canvas = canvasRef.current
    const ctx    = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start:   "top top",
      end:     "bottom bottom",
      pin:     stickyRef.current,
      pinSpacing:          true,
      pinReparent:         true,
      invalidateOnRefresh: true,
      scrub:               0.2,

      onUpdate: (self) => {
        const p     = self.progress
        const frame = Math.min(Math.floor(p * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1)

        // Always redraw — skipping same-frame draws risks a stale/blank canvas
        // if the context was cleared by a resize reflow during loading.
        const img = findNearestLoadedFrame(frame, imagesRef.current)
        if (img) {
          currentFrameRef.current = frame
          drawImageCover(ctx, img, canvas.width, canvas.height)
        }

        if (p >= ROW1_THRESHOLD) setRow1(true)
        if (p >= ROW2_THRESHOLD) setRow2(true)
        if (p >= ROW3_THRESHOLD) setRow3(true)
      },
    })

    return () => st.kill()
  }, [loaded])

  // ── Resize — redraw current frame at new dimensions ─────────────────────────
  useEffect(() => {
    if (!loaded) return
    const onResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      const ctx = canvas.getContext("2d")
      const img = findNearestLoadedFrame(currentFrameRef.current, imagesRef.current)
      if (ctx && img) drawImageCover(ctx, img, canvas.width, canvas.height)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [loaded])

  return (
    <section ref={sectionRef} className={styles.banner}>
      <div ref={stickyRef} className={styles.sticky}>

        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />

        <div className={styles.textLayer}>
          <div className={styles.row}>
            <h2 className={`${styles.rowInner} ${row1 ? styles.rowVisible : ""}`}>
              JUSTICE
            </h2>
          </div>
          <div className={styles.row}>
            <h2 className={`${styles.rowInner} ${row2 ? styles.rowVisible : ""}`}>
              WILL BE
            </h2>
          </div>
          <div className={styles.row}>
            <h2 className={`${styles.rowInner} ${row3 ? styles.rowVisible : ""}`}>
              SERVED
            </h2>
          </div>
        </div>

      </div>
    </section>
  )
}
