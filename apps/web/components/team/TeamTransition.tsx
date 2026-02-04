'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface TeamTransitionProps {
    label?: string
}

export default function TeamTransition({ label = "The Collective" }: TeamTransitionProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
    const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])

    return (
        <section ref={containerRef} className="relative w-full flex flex-col items-center justify-center py-32 z-20 overflow-hidden pointer-events-none">
            {/* Thread Container */}
            <div className="absolute inset-0 flex justify-center">
                <div className="h-full w-[1px] bg-heritage-walnut/5 relative">
                    <motion.div
                        className="absolute top-0 w-full bg-heritage-gold shadow-[0_0_15px_rgba(212,175,55,0.6)]"
                        style={{ height, opacity }}
                    />
                </div>
            </div>

            {/* Connecting Node */}
            <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="w-16 h-1 bg-heritage-gold/20 mb-4" />
                <span className="text-heritage-gold text-[10px] uppercase tracking-[0.5em] font-medium bg-heritage-charcoal/50 backdrop-blur-sm px-4 py-2 border border-heritage-gold/20 rounded-full">
                    {label}
                </span>
                <div className="w-16 h-1 bg-heritage-gold/20 mt-4" />
            </motion.div>
        </section>
    )
}
