'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Hero from '@/components/home/hero/HeroV2'
import HomeLoadingScreen from '@/components/HomeLoadingScreen'
import { getSmoother } from '@/components/smoothScrollInstance'

import styles from './page.module.css'

// ─── Lazy-load below-fold sections ──────────────────────────────────────────
// These import GSAP / Framer Motion and are not visible until after the loading
// screen dismisses.  Code-splitting them keeps the initial bundle small so the
// hero video fetch starts sooner.
const LegalServices = dynamic(() => import('@/components/home/LegalServices/LegalServices'), { ssr: false })
const AboutSection = dynamic(() => import('@/components/home/about/AboutSection'), { ssr: false })
const ClientLogosCarousel = dynamic(() => import('@/components/home/ClientLogosCarousel'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/home/testimonials/Testimonials'), { ssr: false })
const ConsultationCTA = dynamic(() => import('@/components/home/ConsultationCTA/ConsultationCTA'), { ssr: false })
const FAQSection = dynamic(() => import('@/components/home/FAQSection/FAQSection'), { ssr: false })
const TrustStats = dynamic(() => import('@/components/home/TrustStats/TrustStats'), { ssr: false })

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
    { text: 'Justice delayed is justice denied', top: '105vh', left: '3%', fontSize: '1.10rem', opacity: 0.12, depth: 0.45 },
    { text: 'Audi alteram partem', top: '130vh', left: '28%', fontSize: '1.15rem', opacity: 0.12, depth: 0.55 },
    { text: 'No man is above the law', top: '158vh', left: '5%', fontSize: '1.05rem', opacity: 0.12, depth: 0.5 },

    // ── AboutSection area (~180–360vh) ──────────────────────────────────────────
    { text: 'Due process of law', top: '208vh', left: '6%', fontSize: '1.15rem', opacity: 0.12, depth: 0.4 },
    { text: 'Presumption of innocence', top: '252vh', left: '22%', fontSize: '1.10rem', opacity: 0.12, depth: 0.35 },
    { text: 'Liberty under law', top: '275vh', left: '68%', fontSize: '1.05rem', opacity: 0.1, depth: 0.5 },
    { text: 'Stare decisis', top: '318vh', left: '74%', fontSize: '1.15rem', opacity: 0.12, depth: 0.3 },
    { text: 'Habeas corpus', top: '340vh', left: '16%', fontSize: '1.20rem', opacity: 0.12, depth: 0.55 },

    // ── Testimonials area (~660–800vh) ──────────────────────────────────────────
    { text: 'Fiat justitia ruat caelum', top: '668vh', left: '12%', fontSize: '1.05rem', opacity: 0.12, depth: 0.45 },
    { text: 'Pacta sunt servanda', top: '702vh', left: '8%', fontSize: '1.10rem', opacity: 0.12, depth: 0.5 },
    { text: 'Res ipsa loquitur', top: '740vh', left: '25%', fontSize: '1.05rem', opacity: 0.12, depth: 0.55 },
]

// ── Newspaper headlines — bold, uppercase, with rule ──────────────────────────

const PAGE_BG_HEADLINES: PageBgItem[] = [
    // ── QuoteSection area ───────────────────────────────────────────────────────
    { text: 'HIGH COURT GRANTS INJUNCTION IN LANDMARK CASE', top: '112vh', left: '42%', fontSize: '0.85rem', opacity: 0.11, depth: 0.5 },

    // ── AboutSection area ───────────────────────────────────────────────────────
    { text: 'LANDMARK RULING RESHAPES CORPORATE LIABILITY', top: '195vh', left: '2%', fontSize: '0.85rem', opacity: 0.11, depth: 0.4 },
    { text: 'APPELLATE DIVISION OVERTURNS LOWER COURT VERDICT', top: '285vh', left: '32%', fontSize: '0.82rem', opacity: 0.11, depth: 0.45 },
    { text: 'COMMERCIAL COURT RECORDS HISTORIC RULING', top: '328vh', left: '58%', fontSize: '0.80rem', opacity: 0.1, depth: 0.3 },

    // ── Testimonials area ───────────────────────────────────────────────────────
    { text: 'COMMERCIAL COURTS SEE RECORD FILINGS THIS TERM', top: '675vh', left: '48%', fontSize: '0.85rem', opacity: 0.11, depth: 0.4 },
    { text: 'ATTORNEY GENERAL DEFENDS PUBLIC INTEREST', top: '745vh', left: '58%', fontSize: '0.82rem', opacity: 0.11, depth: 0.35 },
]

export default function HomePageClient() {
    // ── Hero video loading state — drives the loading screen ─────────────────
    const [videoProgress, setVideoProgress] = useState(0)
    const [videoReady, setVideoReady] = useState(false)

    const handleVideoProgress = useCallback((pct: number) => setVideoProgress(pct), [])
    const handleVideoReady = useCallback(() => setVideoReady(true), [])

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
        // Parallax is desktop-only — skip entirely on mobile to avoid per-frame
        // style recalculations that cause scroll jank on low-powered devices.
        if (window.matchMedia('(max-width: 768px)').matches) return

        let rafId: number | null = null
        const handleScroll = () => {
            if (rafId !== null) return
            rafId = requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--global-sy', (window.scrollY * 0.35).toFixed(2))
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
            {/* ── Home loading screen — waits for hero video to buffer ────────── */}
            <HomeLoadingScreen progress={videoProgress} isComplete={videoReady} />

            <main className={`page-transition ${styles.homePage}`}>
                {/* Fixed espresso background + atmospheric gold glow */}
                <div className={styles.pageBackground} aria-hidden='true' />

                {/* ── Page-wide background text layer ──────────────────────────────── */}
                <div className={styles.pageBgLayer} aria-hidden='true'>
                    {PAGE_BG_QUOTES.map((q, i) => (
                        <p
                            key={`pq-${i}`}
                            className={styles.pageBgQuote}
                            style={{
                                top: q.top,
                                left: q.left,
                                fontSize: q.fontSize,
                                opacity: q.opacity,
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
                                top: h.top,
                                left: h.left,
                                fontSize: h.fontSize,
                                opacity: h.opacity,
                                '--depth': String(h.depth),
                            } as React.CSSProperties}
                        >
                            {h.text}
                        </p>
                    ))}
                </div>

                {/* ── Page sections ────────────────────────────────────────────────── */}
                <Hero onProgress={handleVideoProgress} onReady={handleVideoReady} playing={videoReady} />
                <TrustStats />

                {/* ── SEO intro — adds H1-keyword body text + word count ────────── */}
                <div className={styles.introSection}>
                    <div className={styles.introDivider} aria-hidden='true' />
                    <p className={styles.introText}>
                        As a law firm rooted in Islamabad, AR&amp;CO Law Associates serves businesses
                        and individuals across Pakistan with principled, results-driven legal counsel.
                        Our practice spans corporate advisory, civil litigation, intellectual property
                        protection, and regulatory compliance — grounded in decades of courtroom experience.
                    </p>
                    <p className={styles.introText}>
                        Whether you are safeguarding a commercial venture or resolving a personal
                        legal matter, our attorneys bring the strategic clarity and tenacity that
                        complex matters demand. We stand by our clients at every stage — from
                        consultation through final resolution.
                    </p>
                </div>

                <AboutSection />
                <LegalServices />
                
                <ClientLogosCarousel />
                <Testimonials />
                <FAQSection />
                <ConsultationCTA />
            </main>
        </>
    )
}