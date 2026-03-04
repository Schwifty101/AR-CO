"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./HeroV2.module.css"

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroV2Props {
  /** Called with 0–100 as the hero video buffers */
  onProgress?: (pct: number) => void
  /** Called once when the video has enough data to play */
  onReady?: () => void
  /** Set to true to start video playback (triggered by loading-screen exit) */
  playing?: boolean
}

interface BgItem {
  text: string
  top: string
  left: string
  fontSize: string
  opacity: number
  /** Parallax depth — higher = more vertical drift on scroll */
  depth: number
}

// ─── Legal maxims — italic serif, scattered across hero background ────────────

const LEGAL_QUOTES: BgItem[] = [
  // Top zone
  { text: "Justice delayed is justice denied",   top: "4%",  left: "2%",  fontSize: "1.10rem", opacity: 0.16, depth: 0.60 },
  { text: "Fiat justitia ruat caelum",           top: "3%",  left: "52%", fontSize: "0.88rem", opacity: 0.13, depth: 0.50 },
  { text: "No man is above the law",             top: "8%",  left: "58%", fontSize: "0.95rem", opacity: 0.14, depth: 0.30 },
  { text: "The rule of law",                     top: "6%",  left: "37%", fontSize: "1.30rem", opacity: 0.14, depth: 0.25 },
  { text: "Innocent until proven guilty",        top: "14%", left: "24%", fontSize: "1.05rem", opacity: 0.15, depth: 0.50 },
  { text: "Law is order in society",             top: "11%", left: "82%", fontSize: "1.00rem", opacity: 0.13, depth: 0.35 },
  { text: "Audi alteram partem",                 top: "19%", left: "44%", fontSize: "1.15rem", opacity: 0.14, depth: 0.35 },
  { text: "Truth is the foundation of justice",  top: "17%", left: "54%", fontSize: "0.80rem", opacity: 0.12, depth: 0.45 },
  // Left band
  { text: "The burden of proof",                 top: "28%", left: "30%", fontSize: "1.00rem", opacity: 0.13, depth: 0.35 },
  { text: "Rights must be protected",            top: "30%", left: "2%",  fontSize: "1.00rem", opacity: 0.14, depth: 0.55 },
  { text: "Due process of law",                  top: "46%", left: "4%",  fontSize: "1.10rem", opacity: 0.15, depth: 0.40 },
  { text: "Presumption of innocence",            top: "51%", left: "8%",  fontSize: "0.92rem", opacity: 0.13, depth: 0.45 },
  // Right band
  { text: "Habeas corpus",                       top: "37%", left: "63%", fontSize: "1.10rem", opacity: 0.15, depth: 0.55 },
  { text: "Liberty under law",                   top: "33%", left: "65%", fontSize: "1.05rem", opacity: 0.14, depth: 0.30 },
  { text: "Stare decisis",                       top: "44%", left: "91%", fontSize: "1.00rem", opacity: 0.14, depth: 0.30 },
  // Bottom zone
  { text: "Justice without mercy is cruelty",    top: "57%", left: "3%",  fontSize: "1.10rem", opacity: 0.16, depth: 0.30 },
  { text: "Justice is the end of government",    top: "58%", left: "16%", fontSize: "0.90rem", opacity: 0.13, depth: 0.55 },
  { text: "Res ipsa loquitur",                   top: "60%", left: "82%", fontSize: "0.92rem", opacity: 0.13, depth: 0.50 },
  { text: "Equity demands fairness",             top: "66%", left: "60%", fontSize: "0.88rem", opacity: 0.13, depth: 0.50 },
  { text: "Mens rea",                            top: "70%", left: "8%",  fontSize: "1.05rem", opacity: 0.14, depth: 0.60 },
  { text: "Law is the guardian of liberty",      top: "73%", left: "20%", fontSize: "1.00rem", opacity: 0.14, depth: 0.40 },
  { text: "Uphold the dignity of the law",       top: "76%", left: "4%",  fontSize: "1.00rem", opacity: 0.15, depth: 0.45 },
  { text: "Volenti non fit injuria",             top: "78%", left: "55%", fontSize: "0.88rem", opacity: 0.13, depth: 0.45 },
  { text: "Pacta sunt servanda",                 top: "80%", left: "15%", fontSize: "0.85rem", opacity: 0.12, depth: 0.35 },
  { text: "Caveat emptor",                       top: "85%", left: "38%", fontSize: "0.92rem", opacity: 0.13, depth: 0.30 },
]

// ─── Newspaper headlines — bold, uppercase, with rule ─────────────────────────

const NEWSPAPER_HEADLINES: BgItem[] = [
  // Top zone
  { text: "SUPREME COURT UPHOLDS CONSTITUTIONAL RIGHTS",     top: "5%",  left: "29%", fontSize: "0.70rem", opacity: 0.12, depth: 0.35 },
  { text: "ATTORNEY GENERAL ANNOUNCES MAJOR LEGAL REFORMS",  top: "12%", left: "2%",  fontSize: "0.67rem", opacity: 0.11, depth: 0.40 },
  // Mid band
  { text: "HIGH COURT GRANTS INJUNCTION IN MAJOR DISPUTE",   top: "36%", left: "2%",  fontSize: "0.66rem", opacity: 0.12, depth: 0.50 },
  { text: "COMMERCIAL COURT RECORDS HISTORIC VERDICT",       top: "31%", left: "62%", fontSize: "0.66rem", opacity: 0.12, depth: 0.30 },
  // Bottom zone
  { text: "ATTORNEY GENERAL DEFENDS PUBLIC INTEREST",        top: "57%", left: "33%", fontSize: "0.68rem", opacity: 0.12, depth: 0.35 },
  { text: "PARLIAMENT PASSES LANDMARK CIVIL LIBERTIES BILL", top: "68%", left: "4%",  fontSize: "0.66rem", opacity: 0.12, depth: 0.50 },
  { text: "COURT OF APPEAL RULES ON CONTRACT DISPUTE",       top: "72%", left: "33%", fontSize: "0.66rem", opacity: 0.12, depth: 0.40 },
  { text: "JUDICIARY DEFENDS INDEPENDENCE OF COURTS",        top: "78%", left: "48%", fontSize: "0.66rem", opacity: 0.11, depth: 0.35 },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroV2({ onProgress, onReady, playing = false }: HeroV2Props) {
  const [mounted,    setMounted]    = useState(false)
  const [appLoaded,  setAppLoaded]  = useState(false)
  const videoRef      = useRef<HTMLVideoElement>(null)
  const onProgressRef = useRef(onProgress)
  const onReadyRef    = useRef(onReady)
  useEffect(() => { onProgressRef.current = onProgress }, [onProgress])
  useEffect(() => { onReadyRef.current    = onReady    }, [onReady])

  // Set mounted after brief delay (client-only)
  useEffect(() => {
    const mountId = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(mountId)
  }, [])

  // Watch for the app-loaded class added by HomeLoadingScreen when it begins
  // fading — this triggers the quote/headline fall-in entrance animation.
  useEffect(() => {
    const check = () => {
      if (document.body.classList.contains('app-loaded')) setAppLoaded(true)
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // ── Fetch entire video as blob → accurate progress, zero buffering ───
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let cancelled = false

    const fetchVideo = async () => {
      try {
        onProgressRef.current?.(2)

        const response = await fetch('/banner/hero-bg.mp4')
        const contentLength = response.headers.get('Content-Length')
        const total = contentLength ? parseInt(contentLength, 10) : 0

        if (!response.body) {
          // Fallback: no streaming support — just await the blob
          const blob = await response.blob()
          if (cancelled) return
          const url = URL.createObjectURL(blob)
          video.src = url
          onProgressRef.current?.(100)
          video.addEventListener('loadeddata', () => onReadyRef.current?.(), { once: true })
          return
        }

        const reader = response.body.getReader()
        const chunks: Uint8Array[] = []
        let loaded = 0

        for (;;) {
          const { done, value } = await reader.read()
          if (cancelled) return
          if (done) break
          chunks.push(value)
          loaded += value.length
          if (total > 0) {
            // Reserve 5–95 range for download, 95–100 for video element init
            const pct = Math.min(Math.floor((loaded / total) * 90) + 5, 95)
            onProgressRef.current?.(pct)
          }
        }

        if (cancelled) return

        const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        video.src = url
        onProgressRef.current?.(98)

        // Wait for the video element to be ready to play
        if (video.readyState >= 4) {
          onProgressRef.current?.(100)
          onReadyRef.current?.()
        } else {
          // Brief fallback — video is fully downloaded, element just needs to parse
          const parseFallback = setTimeout(() => {
            if (!cancelled) {
              onProgressRef.current?.(100)
              onReadyRef.current?.()
            }
          }, 3000)

          video.addEventListener('canplaythrough', () => {
            clearTimeout(parseFallback)
            if (!cancelled) {
              onProgressRef.current?.(100)
              onReadyRef.current?.()
            }
          }, { once: true })
        }
      } catch {
        // Network error fallback — let native video element try on its own
        if (!cancelled && video) {
          video.src = '/banner/hero-bg.mp4'
          onProgressRef.current?.(100)
          onReadyRef.current?.()
        }
      }
    }

    fetchVideo()

    return () => { cancelled = true }
  }, [])

  // ── Start playback when loading screen exits ───────────────────────────
  useEffect(() => {
    if (playing && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [playing])

  return (
    <section className={styles.hero} data-hero-section="true">

      {/* ── Background video — plays once, holds last frame ─────────────── */}
      <video
        ref={videoRef}
        className={`${styles.videoBg} ${playing ? styles.videoBgVisible : ''}`}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className={styles.videoOverlay} aria-hidden="true" />

      {/* ── Legal maxims — italic serif ────────────────────────────────────── */}
      {mounted && LEGAL_QUOTES.map((q, i) => (
        <div
          key={`q-${i}`}
          className={`${styles.bgItemWrapper} ${appLoaded ? styles.bgItemVisible : ''}`}
          aria-hidden="true"
          style={{
            top:  q.top,
            left: q.left,
            '--entrance-delay': `${i * 10}ms`,
          } as React.CSSProperties}
        >
          <p
            className={styles.parallaxQuote}
            style={{
              fontSize:  q.fontSize,
              opacity:   q.opacity,
              '--depth': String(q.depth),
            } as React.CSSProperties}
          >
            {q.text}
          </p>
        </div>
      ))}

      {/* ── Newspaper headlines — bold uppercase with rule ─────────────────── */}
      {mounted && NEWSPAPER_HEADLINES.map((h, i) => (
        <div
          key={`n-${i}`}
          className={`${styles.bgItemWrapper} ${appLoaded ? styles.bgItemVisible : ''}`}
          aria-hidden="true"
          style={{
            top:  h.top,
            left: h.left,
            '--entrance-delay': `${(LEGAL_QUOTES.length + i) * 10}ms`,
          } as React.CSSProperties}
        >
          <p
            className={styles.parallaxHeadline}
            style={{
              fontSize:  h.fontSize,
              opacity:   h.opacity,
              '--depth': String(h.depth),
            } as React.CSSProperties}
          >
            {h.text}
          </p>
        </div>
      ))}

      {/* ── Centre: AR&CO above tagline ────────────────────────────────────── */}
      {mounted && (
        <div className={styles.centerWrapper}>
          <p className={styles.centerBrand} aria-hidden="true">AR&amp;CO</p>
          <p className={styles.centerLabel}  aria-hidden="true">Top Law Associates</p>
        </div>
      )}

      {/* ── Full-width brand name — flush with viewport bottom ─────────────── */}
      <div className={styles.brandBottom}>

        {/* Desktop: single line */}


        {/* Mobile: two stacked lines */}


      </div>
    </section>
  )
}
