'use client'

import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getSmoother } from '../SmoothScroll'

gsap.registerPlugin(ScrollTrigger)

interface TeamTransitionProps {
    label?: string
}

export default function TeamTransition({ label = "The Collective" }: TeamTransitionProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const threadRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let ctx: gsap.Context | undefined

        const initScrollTrigger = () => {
            if (ctx) return
            if (!containerRef.current || !threadRef.current) return

            ctx = gsap.context(() => {
                const triggerConfig = {
                    trigger: containerRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                }

                gsap.fromTo(
                    threadRef.current,
                    { scaleY: 0, opacity: 0 },
                    {
                        scaleY: 1,
                        opacity: 1,
                        ease: 'none',
                        scrollTrigger: triggerConfig,
                    },
                )
            }, containerRef)

            ScrollTrigger.refresh()
        }

        let onSmootherReady: (() => void) | undefined
        let fallbackTimer: ReturnType<typeof setTimeout> | undefined

        if (getSmoother()) {
            initScrollTrigger()
        } else {
            onSmootherReady = () => {
                initScrollTrigger()
                window.removeEventListener('scroll-smoother-ready', onSmootherReady!)
            }
            window.addEventListener('scroll-smoother-ready', onSmootherReady)
            fallbackTimer = setTimeout(() => {
                if (!ctx) initScrollTrigger()
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
        <section ref={containerRef} className="relative w-full flex flex-col items-center justify-center py-32 z-20 overflow-hidden pointer-events-none">
            {/* Thread Container */}
            <div className="absolute inset-0 flex justify-center">
                <div className="h-full w-[1px] bg-heritage-walnut/5 relative">
                    <div
                        ref={threadRef}
                        className="absolute top-0 w-full h-full bg-heritage-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] will-change-transform"
                        style={{ transformOrigin: 'top', transform: 'scaleY(0)', opacity: 0 }}
                    />
                </div>
            </div>

            {/* Connecting Node - whileInView entrance animation (no scroll dependency) */}
            <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="w-16 h-1 bg-heritage-gold/20 mb-4" />
                <span className="text-heritage-gold text-[10px] uppercase tracking-[0.5em] font-medium bg-[var(--wood-espresso)] px-4 py-2 border border-heritage-gold/20 rounded-full" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                    {label}
                </span>
                <div className="w-16 h-1 bg-heritage-gold/20 mt-4" />
            </motion.div>
        </section>
    )
}
