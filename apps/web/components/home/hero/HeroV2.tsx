"use client"

import { useEffect, useRef, useState } from "react"
import TextReveal from "@/components/shared/animations/TextReveal"
import styles from "./HeroV2.module.css"

interface QuoteItem {
  text: string
  top: string
  left: string
  fontSize: string
  /** alpha 0–1 */
  opacity: number
  /** parallax depth multiplier — higher = more mouse drift */
  depth: number
}

/**
 * English legal phrases distributed across the hero background.
 * Positions avoid the central square (≈ left 43-57%, top 27-52%)
 * and the AR&CO text band at the bottom (top > 78%).
 * Only font-size varies — no rotation.
 */
const PARALLAX_QUOTES: QuoteItem[] = [
  // ── Top zone (top 3-26%) ────────────────────────────────────────────────
  { text: "Justice delayed is justice denied",   top: "4%",  left: "2%",  fontSize: "1.10rem", opacity: 0.12, depth: 0.60 },
  { text: "No man is above the law",             top: "8%",  left: "58%", fontSize: "0.95rem", opacity: 0.10, depth: 0.30 },
  { text: "Innocent until proven guilty",        top: "14%", left: "24%", fontSize: "1.05rem", opacity: 0.11, depth: 0.50 },
  { text: "Equal justice under law",             top: "20%", left: "70%", fontSize: "0.90rem", opacity: 0.09, depth: 0.40 },
  { text: "The rule of law",                     top: "6%",  left: "37%", fontSize: "1.30rem", opacity: 0.10, depth: 0.25 },
  { text: "Justice is blind",                    top: "23%", left: "5%",  fontSize: "1.20rem", opacity: 0.12, depth: 0.65 },
  { text: "Truth is the foundation of justice",  top: "17%", left: "54%", fontSize: "0.80rem", opacity: 0.08, depth: 0.45 },
  { text: "Law is order in society",             top: "11%", left: "82%", fontSize: "1.00rem", opacity: 0.09, depth: 0.35 },
  { text: "Fiat justitia ruat caelum",           top: "3%",  left: "52%", fontSize: "0.88rem", opacity: 0.09, depth: 0.50 },
  { text: "Ignorantia juris non excusat",        top: "10%", left: "16%", fontSize: "0.92rem", opacity: 0.08, depth: 0.40 },
  { text: "Audi alteram partem",                 top: "19%", left: "44%", fontSize: "1.15rem", opacity: 0.10, depth: 0.35 },
  { text: "Nemo judex in sua causa",             top: "25%", left: "62%", fontSize: "0.85rem", opacity: 0.08, depth: 0.55 },
  { text: "Ubi jus ibi remedium",                top: "7%",  left: "73%", fontSize: "0.90rem", opacity: 0.09, depth: 0.30 },
  { text: "The law protects those who are just", top: "22%", left: "30%", fontSize: "0.82rem", opacity: 0.08, depth: 0.60 },
  { text: "Actus non facit reum",                top: "15%", left: "88%", fontSize: "0.88rem", opacity: 0.08, depth: 0.45 },
  { text: "Let the facts speak for themselves",  top: "26%", left: "14%", fontSize: "0.80rem", opacity: 0.08, depth: 0.50 },

  // ── Left side (top 27-52%, left 0-38%) ──────────────────────────────────
  { text: "Rights must be protected",            top: "30%", left: "2%",  fontSize: "1.00rem", opacity: 0.10, depth: 0.55 },
  { text: "Due process of law",                  top: "46%", left: "4%",  fontSize: "1.10rem", opacity: 0.11, depth: 0.40 },
  { text: "The law must be fair",                top: "38%", left: "12%", fontSize: "0.85rem", opacity: 0.09, depth: 0.70 },
  { text: "Justice must be seen to be done",     top: "34%", left: "20%", fontSize: "0.82rem", opacity: 0.08, depth: 0.50 },
  { text: "Presumption of innocence",            top: "51%", left: "8%",  fontSize: "0.92rem", opacity: 0.09, depth: 0.45 },
  { text: "No punishment without law",           top: "43%", left: "1%",  fontSize: "0.88rem", opacity: 0.08, depth: 0.60 },
  { text: "The burden of proof",                 top: "28%", left: "30%", fontSize: "1.00rem", opacity: 0.09, depth: 0.35 },

  // ── Right side (top 27-52%, left 62-95%) ────────────────────────────────
  { text: "Liberty under law",                   top: "33%", left: "65%", fontSize: "1.05rem", opacity: 0.10, depth: 0.30 },
  { text: "All are equal before the law",        top: "49%", left: "72%", fontSize: "0.90rem", opacity: 0.09, depth: 0.50 },
  { text: "Seek truth, defend justice",          top: "41%", left: "81%", fontSize: "0.82rem", opacity: 0.08, depth: 0.60 },
  { text: "Equal protection under law",          top: "29%", left: "68%", fontSize: "0.88rem", opacity: 0.09, depth: 0.40 },
  { text: "Stare decisis",                       top: "44%", left: "91%", fontSize: "1.00rem", opacity: 0.10, depth: 0.30 },
  { text: "Habeas corpus",                       top: "37%", left: "63%", fontSize: "1.10rem", opacity: 0.11, depth: 0.55 },
  { text: "Per curiam",                          top: "52%", left: "78%", fontSize: "0.90rem", opacity: 0.08, depth: 0.45 },

  // ── Bottom zone (top 54-76%) ─────────────────────────────────────────────
  { text: "Justice without mercy is cruelty",   top: "57%", left: "3%",  fontSize: "1.10rem", opacity: 0.12, depth: 0.30 },
  { text: "Equity demands fairness",             top: "66%", left: "60%", fontSize: "0.88rem", opacity: 0.09, depth: 0.50 },
  { text: "Law is the guardian of liberty",      top: "73%", left: "20%", fontSize: "1.00rem", opacity: 0.10, depth: 0.40 },
  { text: "The scales must be balanced",         top: "61%", left: "38%", fontSize: "0.82rem", opacity: 0.08, depth: 0.60 },
  { text: "Fairness is the essence of law",      top: "69%", left: "76%", fontSize: "0.88rem", opacity: 0.09, depth: 0.35 },
  { text: "Uphold the dignity of the law",       top: "76%", left: "4%",  fontSize: "1.00rem", opacity: 0.11, depth: 0.45 },
  { text: "Every right deserves a defense",      top: "63%", left: "22%", fontSize: "0.85rem", opacity: 0.08, depth: 0.55 },
  { text: "Power must be held accountable",      top: "71%", left: "55%", fontSize: "0.90rem", opacity: 0.09, depth: 0.30 },
  { text: "Let the punishment fit the crime",    top: "55%", left: "48%", fontSize: "0.85rem", opacity: 0.08, depth: 0.50 },
  { text: "Truth, the daughter of time",         top: "74%", left: "68%", fontSize: "0.82rem", opacity: 0.08, depth: 0.40 },
  { text: "Justice is the end of government",    top: "58%", left: "16%", fontSize: "0.90rem", opacity: 0.09, depth: 0.55 },
  { text: "The law is reason free from passion", top: "67%", left: "40%", fontSize: "0.85rem", opacity: 0.08, depth: 0.35 },
  { text: "No one is exempt from the law",       top: "75%", left: "45%", fontSize: "0.88rem", opacity: 0.09, depth: 0.45 },
  { text: "Res ipsa loquitur",                   top: "60%", left: "82%", fontSize: "0.92rem", opacity: 0.09, depth: 0.50 },
  { text: "Mens rea",                            top: "70%", left: "8%",  fontSize: "1.05rem", opacity: 0.10, depth: 0.60 },
  { text: "Ex post facto",                       top: "64%", left: "67%", fontSize: "0.85rem", opacity: 0.08, depth: 0.35 },
]

/**
 * HeroV2 — alternative hero section for the AR&CO homepage.
 *
 * Layout:
 *  - Deep espresso-brown full-viewport background
 *  - Low-opacity Latin legal maxims scattered at different parallax depths
 *    that drift with mouse movement for a subtle 3-D feel
 *  - A muted cedar-brown square anchors the visual centre; legal terms
 *    slide through it horizontally, one at a time
 *  - "AR&CO" in Lora Bold gold fills the full viewport width at the bottom
 */
export default function HeroV2() {
  const heroRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const mountId = setTimeout(() => setMounted(true), 80)

    // Signal to Navigation that the loading phase is complete (no LoadingScreen here)
    const navId = setTimeout(() => {
      document.body.classList.add("app-loaded")
    }, 100)

    // ── Mouse-parallax ──────────────────────────────────────────────────────
    const hero = heroRef.current
    const mouse  = { x: 0, y: 0 }   // raw normalised position (–1 to 1)
    const smooth = { x: 0, y: 0 }   // lerped position
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      if (!hero) return
      const { left, top, width, height } = hero.getBoundingClientRect()
      mouse.x = (e.clientX - left - width  / 2) / (width  / 2)
      mouse.y = (e.clientY - top  - height / 2) / (height / 2)
    }

    const tick = () => {
      // Lerp factor 0.06 → smooth, slightly lagging parallax
      smooth.x += (mouse.x - smooth.x) * 0.06
      smooth.y += (mouse.y - smooth.y) * 0.06

      if (hero) {
        // --px / --py are unitless numbers read by each quote's CSS calc()
        hero.style.setProperty("--px", (smooth.x * 60).toFixed(3))
        hero.style.setProperty("--py", (smooth.y * 45).toFixed(3))
      }
      rafId = requestAnimationFrame(tick)
    }

    if (hero) hero.addEventListener("mousemove", onMouseMove)
    rafId = requestAnimationFrame(tick)

    return () => {
      clearTimeout(mountId)
      clearTimeout(navId)
      if (hero) hero.removeEventListener("mousemove", onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      data-hero-section="true"
    >
      {/* ── Parallax law maxims ───────────────────────────────────────────── */}
      {mounted && PARALLAX_QUOTES.map((q, i) => (
        <p
          key={i}
          className={styles.parallaxQuote}
          aria-hidden="true"
          style={{
            top:      q.top,
            left:     q.left,
            fontSize: q.fontSize,
            opacity:  q.opacity,
            // CSS custom props read by .parallaxQuote transform
            "--depth": String(q.depth),
          } as React.CSSProperties}
        >
          {q.text}
        </p>
      ))}

      {/* ── Centre stage: decorative square ───────────────────────────────── */}
      <div className={styles.centerStage}>
        <div className={`${styles.square} ${mounted ? styles.squareVisible : ""}`}>
          <div className={styles.squareHighlight} />
          <div className={styles.cornerTL} />
          <div className={styles.cornerBR} />
        </div>
      </div>

      {/* ── Dim base marquee — very low opacity across full width ────────────── */}
     

      {/* ── Lit window — full opacity, clipped to square bounds ───────────────
          The inner track has the same animation so it stays pixel-perfect in
          sync with the base track. A negative left offset aligns it so the
          text appears at the same screen position as the base layer.         */}
     

      {/* ── Full-width brand name at viewport bottom ───────────────────────── */}
      <div className={styles.brandBottom}>
        <div className={styles.brandDesktop}>
          <TextReveal delay={480} duration={1.3} eager>
            <h1 className={styles.brandTitle}>AR&amp;CO</h1>
          </TextReveal>
        </div>

        <div className={styles.brandMobile}>
          <TextReveal delay={480} duration={1.2} eager>
            <h1 className={styles.brandTitle}>AR &amp;</h1>
          </TextReveal>
          <TextReveal delay={630} duration={1.2} eager>
            <h1 className={styles.brandTitle}>CO</h1>
          </TextReveal>
        </div>
      </div>
    </section>
  )
}
