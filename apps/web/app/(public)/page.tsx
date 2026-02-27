'use client'

import { useEffect, useState, useCallback } from 'react'
import Hero from "@/components/home/hero/HeroV2"
import QuoteSection from "@/components/home/quote/QuoteSection"
import AboutSection from "@/components/home/about/AboutSection"
import Testimonials from "@/components/home/testimonials/Testimonials"
import ClientLogosCarousel from "@/components/home/ClientLogosCarousel"
import BannerSection from "@/components/home/banner/BannerSection"
import HomeLoadingScreen from "@/components/HomeLoadingScreen"
import { getSmoother } from '@/components/SmoothScroll'

import styles from "./page.module.css"

// ─── Page-level background text ───────────────────────────────────────────────
// Quotes and headlines scattered through non-hero sections.
// top uses vh units so items fall in the right section on any viewport.
// Parallax: translateY(calc(--global-sy * --depth * -1px)) — driven by scroll.

interface PageBgItem {
  text: string
  top: string
  left: string
  fontSize: string
  opacity: number
  depth: number
}

// ── Legal maxims — italic serif ────────────────────────────────────────────────

const PAGE_BG_QUOTES: PageBgItem[] = [
  // ── QuoteSection area (~100–170vh) ──────────────────────────────────────────
  { text: "Justice delayed is justice denied",           top: "105vh", left: "3%",  fontSize: "1.10rem", opacity: 0.085, depth: 0.45 },
  { text: "The rule of law governs all",                 top: "118vh", left: "62%", fontSize: "1.00rem", opacity: 0.068, depth: 0.30 },
  { text: "Audi alteram partem",                         top: "130vh", left: "28%", fontSize: "1.15rem", opacity: 0.085, depth: 0.55 },
  { text: "Ubi jus ibi remedium",                        top: "145vh", left: "72%", fontSize: "0.95rem", opacity: 0.068, depth: 0.40 },
  { text: "No man is above the law",                     top: "158vh", left: "5%",  fontSize: "1.05rem", opacity: 0.085, depth: 0.50 },
  { text: "Equal justice under law",                     top: "152vh", left: "50%", fontSize: "1.00rem", opacity: 0.068, depth: 0.35 },

  // ── AboutSection area (~180–360vh) ──────────────────────────────────────────
  { text: "Equal protection under law",                  top: "188vh", left: "70%", fontSize: "1.05rem", opacity: 0.085, depth: 0.55 },
  { text: "Due process of law",                          top: "208vh", left: "6%",  fontSize: "1.15rem", opacity: 0.085, depth: 0.40 },
  { text: "Truth is the foundation of justice",          top: "230vh", left: "55%", fontSize: "0.95rem", opacity: 0.068, depth: 0.60 },
  { text: "Presumption of innocence",                    top: "252vh", left: "22%", fontSize: "1.10rem", opacity: 0.085, depth: 0.35 },
  { text: "Liberty under law",                           top: "275vh", left: "68%", fontSize: "1.05rem", opacity: 0.068, depth: 0.50 },
  { text: "Justice must be seen to be done",             top: "295vh", left: "2%",  fontSize: "1.00rem", opacity: 0.068, depth: 0.45 },
  { text: "Stare decisis",                               top: "318vh", left: "74%", fontSize: "1.15rem", opacity: 0.085, depth: 0.30 },
  { text: "Habeas corpus",                               top: "340vh", left: "16%", fontSize: "1.20rem", opacity: 0.085, depth: 0.55 },
  { text: "The burden of proof",                         top: "356vh", left: "45%", fontSize: "1.00rem", opacity: 0.068, depth: 0.40 },

  // ── Testimonials area (~660–800vh) ──────────────────────────────────────────
  { text: "Fiat justitia ruat caelum",                   top: "668vh", left: "12%", fontSize: "1.05rem", opacity: 0.085, depth: 0.45 },
  { text: "Nemo judex in sua causa",                     top: "685vh", left: "60%", fontSize: "0.95rem", opacity: 0.068, depth: 0.35 },
  { text: "Pacta sunt servanda",                         top: "702vh", left: "8%",  fontSize: "1.10rem", opacity: 0.085, depth: 0.50 },
  { text: "Justice is the end of government",            top: "720vh", left: "52%", fontSize: "1.00rem", opacity: 0.068, depth: 0.40 },
  { text: "Res ipsa loquitur",                           top: "740vh", left: "25%", fontSize: "1.05rem", opacity: 0.085, depth: 0.55 },
  { text: "The rule of law",                             top: "758vh", left: "68%", fontSize: "1.15rem", opacity: 0.068, depth: 0.30 },
]

// ── Newspaper headlines — bold, uppercase, with rule ──────────────────────────

const PAGE_BG_HEADLINES: PageBgItem[] = [
  // ── QuoteSection area ───────────────────────────────────────────────────────
  { text: "HIGH COURT GRANTS INJUNCTION IN LANDMARK CASE",      top: "112vh", left: "42%", fontSize: "0.85rem", opacity: 0.068, depth: 0.50 },
  { text: "SUPREME COURT UPHOLDS CIVIL RIGHTS CHARTER",         top: "162vh", left: "18%", fontSize: "0.82rem", opacity: 0.051, depth: 0.35 },

  // ── AboutSection area ───────────────────────────────────────────────────────
  { text: "LANDMARK RULING RESHAPES CORPORATE LIABILITY",       top: "195vh", left: "2%",  fontSize: "0.85rem", opacity: 0.068, depth: 0.40 },
  { text: "JUDICIARY ANNOUNCES SWEEPING COURT REFORMS",         top: "238vh", left: "52%", fontSize: "0.82rem", opacity: 0.051, depth: 0.55 },
  { text: "APPELLATE DIVISION OVERTURNS LOWER COURT VERDICT",   top: "285vh", left: "32%", fontSize: "0.82rem", opacity: 0.068, depth: 0.45 },
  { text: "COMMERCIAL COURT RECORDS HISTORIC RULING",           top: "328vh", left: "58%", fontSize: "0.80rem", opacity: 0.051, depth: 0.30 },
  { text: "NEW COMPLIANCE FRAMEWORK FOR CORPORATE SECTOR",      top: "352vh", left: "4%",  fontSize: "0.82rem", opacity: 0.068, depth: 0.50 },

  // ── Testimonials area ───────────────────────────────────────────────────────
  { text: "COMMERCIAL COURTS SEE RECORD FILINGS THIS TERM",     top: "675vh", left: "48%", fontSize: "0.85rem", opacity: 0.068, depth: 0.40 },
  { text: "INTERNATIONAL ARBITRATION SEES RECORD GROWTH",       top: "712vh", left: "2%",  fontSize: "0.82rem", opacity: 0.051, depth: 0.50 },
  { text: "ATTORNEY GENERAL DEFENDS PUBLIC INTEREST",           top: "745vh", left: "58%", fontSize: "0.82rem", opacity: 0.068, depth: 0.35 },
]

// ─── Page component ───────────────────────────────────────────────────────────

export default function Home() {
  // ── Banner frame loading state ────────────────────────────────────────────
  const [bannerProgress, setBannerProgress] = useState(0)
  const [bannerLoaded, setBannerLoaded]     = useState(false)

  const handleBannerProgress = useCallback((pct: number) => setBannerProgress(pct), [])
  const handleBannerComplete = useCallback(() => setBannerLoaded(true), [])

  // ── Hash-based scroll navigation ─────────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#about') {
      const timer = setTimeout(() => {
        const aboutSection = document.getElementById('about')
        if (aboutSection) {
          const smoother = getSmoother()
          if (smoother) {
            smoother.scrollTo(aboutSection, { duration: 1.2 })
          } else {
            aboutSection.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  // ── Global scroll-parallax driver ────────────────────────────────────────
  // Sets --global-sy on :root. CSS formula used everywhere:
  // transform: translateY(calc(var(--global-sy, 0) * var(--depth, 0.3) * -1px))
  // Multiplier 0.35 gives strong, visible vertical drift between depth layers.
  // On mobile, native scroll fires very rapidly so we rAF-throttle the DOM
  // write to once per rendered frame instead of once per scroll event.
  useEffect(() => {
    let rafId: number | null = null
    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          '--global-sy',
          (window.scrollY * 0.35).toFixed(2),
        )
        rafId = null
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* ── Home loading screen — slides left once all banner frames are ready */}
      <HomeLoadingScreen progress={bannerProgress} isComplete={bannerLoaded} />

      <main className={`page-transition ${styles.homePage}`}>
        {/* Fixed espresso background + atmospheric gold glow */}
        <div className={styles.pageBackground} aria-hidden="true" />

        {/* ── Page-wide background text layer ──────────────────────────────── */}
        <div className={styles.pageBgLayer} aria-hidden="true">
          {PAGE_BG_QUOTES.map((q, i) => (
            <p
              key={`pq-${i}`}
              className={styles.pageBgQuote}
              style={{
                top:       q.top,
                left:      q.left,
                fontSize:  q.fontSize,
                opacity:   q.opacity,
                '--depth': String(q.depth),
              } as React.CSSProperties}
            >
              {q.text}
            </p>
          ))}
          {PAGE_BG_HEADLINES.map((h, i) => (
            <p
              key={`ph-${i}`}
              className={styles.pageBgHeadline}
              style={{
                top:       h.top,
                left:      h.left,
                fontSize:  h.fontSize,
                opacity:   h.opacity,
                '--depth': String(h.depth),
              } as React.CSSProperties}
            >
              {h.text}
            </p>
          ))}
        </div>

        {/* ── Page sections ────────────────────────────────────────────────── */}
        <Hero />
        <QuoteSection />
        <AboutSection />
        <BannerSection
          onProgress={handleBannerProgress}
          onComplete={handleBannerComplete}
        />
        <ClientLogosCarousel />
        <Testimonials />
      </main>
    </>
  )
}
