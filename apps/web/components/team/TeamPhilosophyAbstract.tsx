'use client'

import React, { useRef } from 'react'
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

    const y = useTransform(scrollYProgress, [0, 1], [0, -100])
    const opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1])

    return (
        <section ref={containerRef} className={`relative py-32 px-4 md:px-8 lg:px-16 max-w-[1900px] mx-auto min-h-screen flex flex-col justify-center ${className}`}>

            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-heritage-walnut/10 via-transparent to-transparent" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Visual Side (Left) - Overlapping Images */}
                <div className="lg:col-span-5 h-full min-h-[600px] relative hidden lg:block">
                    {/* Image 1 - Main Portrait */}
                    {images[0] && (
                        <motion.div
                            style={{ y }}
                            className="absolute top-0 left-0 w-[70%] aspect-[3/4] z-10"
                        >
                            <div className="relative w-full h-full overflow-hidden shadow-2xl shadow-heritage-walnut/20">
                                <Image
                                    src={images[0].src}
                                    alt={images[0].alt}
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Image 2 - Supporting Detail */}
                    {images[1] && (
                        <div className="absolute bottom-20 right-0 w-[55%] aspect-square z-20">
                            <div className="relative w-full h-full overflow-hidden border-4 border-heritage-cream shadow-xl">
                                <Image
                                    src={images[1].src}
                                    alt={images[1].alt}
                                    fill
                                    className="object-cover contrast-125"
                                />
                            </div>
                        </div>
                    )}

                    {/* Decorative Elements */}
                    <div className="absolute top-1/2 left-1/4 w-[1px] h-32 bg-heritage-gold/30" />
                    <div className="absolute bottom-10 right-1/3 w-32 h-[1px] bg-heritage-gold/30" />
                </div>

                {/* Content Side (Right) - Editorial Text */}
                <div className="lg:col-span-1 lg:col-start-7 lg:col-end-13 flex flex-col justify-center relative">
                    {/* Section Label */}
                    <motion.div
                        className="mb-8 flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="h-[1px] w-12 bg-heritage-gold" />
                        <span className="text-xs font-medium uppercase tracking-widest text-heritage-gold" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '0.4em' }}>
                            {title}
                        </span>
                    </motion.div>

                    {/* Main Statement */}
                    <motion.h2
                        className="text-4xl md:text-5xl lg:text-7xl font-light leading-tight mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ fontFamily: "'Lora', Georgia, serif", letterSpacing: '-0.04em', color: 'var(--heritage-cream)' }}
                    >
                        {statement.split(',').map((part, i) => (
                            <span key={i} className="block mb-2">
                                {part}{i < statement.split(',').length - 1 ? ',' : ''}
                            </span>
                        ))}
                    </motion.h2>

                    {/* Supporting Text/Detail */}
                    <motion.div
                        className="pl-8 border-l border-heritage-gold/20"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <p className="text-lg leading-relaxed font-light max-w-xl" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: 'var(--heritage-cream)', opacity: 0.6 }}>
                            Our practice is built on the understanding that true legal excellence requires more than just knowledge—it demands creativity, empathy, and an unwavering commitment to the human element of law.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Mobile Image Stack */}
            <div className="lg:hidden grid grid-cols-2 gap-4 mt-16 px-4">
                {images.slice(0, 2).map((img, i) => (
                    <div key={i} className={`relative aspect-[3/4] w-full ${i === 1 ? 'mt-12' : ''}`}>
                        <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-cover grayscale"
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}
