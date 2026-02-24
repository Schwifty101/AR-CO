'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getSmoother } from '../SmoothScroll'
import { ITeamPhilosophyProps } from './types/teamInterfaces'

gsap.registerPlugin(ScrollTrigger)

export default function TeamPhilosophyAbstract({
    title,
    statement,
    images,
    className = ''
}: ITeamPhilosophyProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Refs for GSAP parallax — each targets the outer image wrapper div
    const img1Ref = useRef<HTMLDivElement>(null)
    const img2Ref = useRef<HTMLDivElement>(null)
    const img3Ref = useRef<HTMLDivElement>(null)

    // GSAP parallax using Lenis-synced ScrollTrigger.
    // Framer Motion's useScroll reads native scroll position while Lenis virtualizes it,
    // producing jitter. GSAP ScrollTrigger is ticked via lenis.on("scroll", ScrollTrigger.update)
    // in SmoothScroll.tsx, so it stays perfectly in sync.
    useEffect(() => {
        let ctx: gsap.Context | undefined

        const initParallax = () => {
            if (ctx) return
            if (!containerRef.current) return

            ctx = gsap.context(() => {
                // Shared trigger configuration — scrub:1 creates a 1-second lag for
                // organic feel rather than a mechanical 1:1 lock to scroll position
                const triggerConfig = {
                    trigger: containerRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                }

                // Image 1: top-left pillar — subtle upward float (+50 → -50px)
                if (img1Ref.current) {
                    gsap.fromTo(
                        img1Ref.current,
                        { y: 50 },
                        { y: -50, ease: 'none', scrollTrigger: triggerConfig },
                    )
                }

                // Image 2: bottom-right detail — deeper upward pull (0 → -100px)
                if (img2Ref.current) {
                    gsap.fromTo(
                        img2Ref.current,
                        { y: 0 },
                        { y: -100, ease: 'none', scrollTrigger: { ...triggerConfig } },
                    )
                }

                // Image 3: top-right accent — counter-direction drift (-50 → +80px)
                if (img3Ref.current) {
                    gsap.fromTo(
                        img3Ref.current,
                        { y: -50 },
                        { y: 80, ease: 'none', scrollTrigger: { ...triggerConfig } },
                    )
                }
            }, containerRef)

            ScrollTrigger.refresh()
        }

        // If Lenis is already running, init immediately; otherwise wait for the
        // scroll-smoother-ready event (or fall back after 1s for edge cases)
        let onSmootherReady: (() => void) | undefined
        let fallbackTimer: ReturnType<typeof setTimeout> | undefined

        if (getSmoother()) {
            initParallax()
        } else {
            onSmootherReady = () => {
                initParallax()
                window.removeEventListener('scroll-smoother-ready', onSmootherReady!)
            }
            window.addEventListener('scroll-smoother-ready', onSmootherReady)
            fallbackTimer = setTimeout(() => {
                if (!ctx) initParallax()
                window.removeEventListener('scroll-smoother-ready', onSmootherReady!)
            }, 1000)
        }

        return () => {
            ctx?.revert()
            if (onSmootherReady) {
                window.removeEventListener('scroll-smoother-ready', onSmootherReady)
            }
            if (fallbackTimer) {
                clearTimeout(fallbackTimer)
            }
        }
    }, [])

    return (
        <section
            ref={containerRef}
            className={`relative py-32 md:py-48 px-4 md:px-8 lg:px-16 mx-auto min-h-[120vh] flex flex-col justify-center overflow-hidden w-full ${className}`}
        >
            {/* Central Typography Container */}
            <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col items-center text-center px-4">

                {/* Minimalist Section Label */}
                <motion.div
                    className="mb-16 flex items-center justify-center gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="h-[1px] w-12 md:w-24 bg-heritage-gold/40" />
                    <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.5em] text-heritage-gold/80" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                        {title}
                    </span>
                    <div className="h-[1px] w-12 md:w-24 bg-heritage-gold/40" />
                </motion.div>

                {/* Statement — refined, italic, tastefully sized */}
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light leading-[1.4] text-heritage-cream/90 mb-16 z-30 max-w-3xl drop-shadow-lg italic"
                    style={{
                        fontFamily: "'Lora', Georgia, serif",
                        letterSpacing: '-0.01em',
                        willChange: 'opacity, transform'
                    }}
                >
                    &ldquo;{statement}&rdquo;
                </motion.h2>

                {/* Refined Detail Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="max-w-xl mx-auto"
                >
                    <p className="text-sm md:text-lg leading-relaxed font-light text-heritage-cream/60" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                        Our practice is built on the understanding that true legal excellence requires more than just knowledge—it demands creativity, empathy, and an unwavering commitment to the human element of law.
                    </p>
                </motion.div>
            </div>

            {/* Asymmetrical Floating Images (Using simple opacity/transform reveals instead of clip-path) */}

            {/* Image 1: Top Left - Structural Pillar */}
            {images[0] && (
                // Outer div: GSAP-driven parallax target (replaces motion.div style={{ y: y1 }})
                <div
                    ref={img1Ref}
                    className="absolute top-[5%] left-[-10%] md:left-[2%] lg:left-[5%] w-[70%] md:w-[35%] lg:w-[25%] aspect-[3/4] z-10 hidden sm:block opacity-60 hover:opacity-100 transition-opacity duration-700 will-change-transform"
                >
                    {/* Inner motion.div: whileInView reveal — unchanged */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "100px" }}
                        transition={{ duration: 1 }}
                        className="relative w-full h-full overflow-hidden shadow-2xl"
                        style={{ willChange: 'opacity, transform' }}
                    >
                        <Image
                            src={images[0].src}
                            alt={images[0].alt}
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-[1.5s]"
                        />
                        <div className="absolute inset-0 bg-wood-espresso/30 mix-blend-multiply pointer-events-none" />
                    </motion.div>
                </div>
            )}

            {/* Image 2: Bottom Right - Dynamic Detail */}
            {images[1] && (
                // Outer div: GSAP-driven parallax target (replaces motion.div style={{ y: y2 }})
                <div
                    ref={img2Ref}
                    className="absolute bottom-[-5%] right-[-5%] md:right-[5%] lg:right-[8%] w-[60%] md:w-[30%] lg:w-[22%] aspect-[4/5] z-10 hidden sm:block opacity-60 hover:opacity-100 transition-opacity duration-700 will-change-transform"
                >
                    {/* Inner motion.div: whileInView reveal — unchanged */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "100px" }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="relative w-full h-full overflow-hidden shadow-2xl"
                        style={{ willChange: 'opacity, transform' }}
                    >
                        <Image
                            src={images[1].src}
                            alt={images[1].alt}
                            fill
                            className="object-cover sepia-[.4] hover:sepia-0 transition-all duration-[1.5s]"
                        />
                        <div className="absolute inset-0 bg-heritage-gold/5 mix-blend-overlay pointer-events-none" />
                    </motion.div>
                </div>
            )}

            {/* Image 3: Top Right - Abstract / Accent */}
            {images[2] && (
                // Outer div: GSAP-driven parallax target (replaces motion.div style={{ y: y3 }})
                <div
                    ref={img3Ref}
                    className="absolute top-[25%] lg:top-[15%] right-[2%] lg:right-[22%] w-[40%] md:w-[25%] lg:w-[16%] aspect-square z-0 hidden lg:block opacity-40 hover:opacity-100 transition-opacity duration-700 will-change-transform"
                >
                    {/* Inner motion.div: whileInView reveal — unchanged */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "100px" }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="relative w-full h-full overflow-hidden rounded-full shadow-2xl border border-heritage-gold/20"
                        style={{ willChange: 'opacity, transform' }}
                    >
                        <Image
                            src={images[2].src}
                            alt={images[2].alt}
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-[1.5s]"
                        />
                    </motion.div>
                </div>
            )}

            {/* Mobile Visual Stack (Fallback for small screens) */}
            <div className="sm:hidden mt-24 grid grid-cols-2 gap-4 relative z-10 w-full px-4">
                {images.slice(0, 2).map((img, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.15 }}
                        className={`relative aspect-[3/4] w-full ${i === 1 ? 'mt-16' : ''}`}
                    >
                        <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-cover grayscale"
                        />
                        <div className="absolute inset-0 bg-wood-espresso/40 mix-blend-multiply pointer-events-none" />
                    </motion.div>
                ))}
            </div>

            {/* Background Typography Watermark Overlay (Optimized) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] text-center pointer-events-none -z-10 opacity-[0.02] overflow-hidden select-none">
                <span className="text-[30vw] whitespace-nowrap font-black uppercase text-heritage-cream" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                    PHILOSOPHY
                </span>
            </div>

        </section>
    )
}
