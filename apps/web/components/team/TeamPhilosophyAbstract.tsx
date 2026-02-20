'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { ITeamPhilosophyProps } from './types/teamInterfaces'

export default function TeamPhilosophyAbstract({
    title,
    statement,
    images,
    className = ''
}: ITeamPhilosophyProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    // Parallax values for images (using more subtle movements to reduce paint area)
    const y1 = useTransform(scrollYProgress, [0, 1], [50, -50])
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
    const y3 = useTransform(scrollYProgress, [0, 1], [-50, 80])

    return (
        <section
            ref={containerRef}
            className={`relative py-32 md:py-48 px-4 md:px-8 lg:px-16 mx-auto min-h-[120vh] flex flex-col justify-center overflow-hidden w-full ${className}`}
        >
            {/* Darker Ambient Gradient (Simplified) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-gradient-to-b from-heritage-walnut/20 to-wood-espresso" />

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
                    <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.5em] text-heritage-gold/80" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                        {title}
                    </span>
                    <div className="h-[1px] w-12 md:w-24 bg-heritage-gold/40" />
                </motion.div>

                {/* Massive Statement (Animated as a single block for performance) */}
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-4xl md:text-5xl lg:text-[6rem] xl:text-[7.5rem] font-light leading-[1.05] text-heritage-cream mb-16 z-30 max-w-6xl drop-shadow-lg"
                    style={{
                        fontFamily: "'Boska', 'Lora', Georgia, serif",
                        letterSpacing: '-0.02em',
                        willChange: 'opacity, transform'
                    }}
                >
                    {statement}
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
                <motion.div
                    style={{ y: y1 }}
                    className="absolute top-[5%] left-[-10%] md:left-[2%] lg:left-[5%] w-[70%] md:w-[35%] lg:w-[25%] aspect-[3/4] z-10 hidden sm:block opacity-60 hover:opacity-100 transition-opacity duration-700"
                >
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
                </motion.div>
            )}

            {/* Image 2: Bottom Right - Dynamic Detail */}
            {images[1] && (
                <motion.div
                    style={{ y: y2 }}
                    className="absolute bottom-[-5%] right-[-5%] md:right-[5%] lg:right-[8%] w-[60%] md:w-[30%] lg:w-[22%] aspect-[4/5] z-10 hidden sm:block opacity-60 hover:opacity-100 transition-opacity duration-700"
                >
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
                </motion.div>
            )}

            {/* Image 3: Top Right - Abstract / Accent */}
            {images[2] && (
                <motion.div
                    style={{ y: y3 }}
                    className="absolute top-[25%] lg:top-[15%] right-[2%] lg:right-[22%] w-[40%] md:w-[25%] lg:w-[16%] aspect-square z-0 hidden lg:block opacity-40 hover:opacity-100 transition-opacity duration-700"
                >
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
                </motion.div>
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
                <span className="text-[30vw] whitespace-nowrap font-black uppercase text-heritage-cream" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    PHILOSOPHY
                </span>
            </div>

        </section>
    )
}
