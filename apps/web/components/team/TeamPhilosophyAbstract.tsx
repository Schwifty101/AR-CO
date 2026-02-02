'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import TeamSectionHeader from './teamSectionHeader'
import type { ITeamPhilosophyProps } from './types/teamInterfaces'

export default function TeamPhilosophyAbstract({
    title,
    statement,
    images,
    className = ''
}: ITeamPhilosophyProps) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
    const y2 = useTransform(scrollYProgress, [0, 1], [50, -50])
    const y3 = useTransform(scrollYProgress, [0, 1], [0, 50])

    return (
        <section ref={containerRef} className={`py-40 px-4 md:px-8 lg:px-16 max-w-[1800px] mx-auto overflow-hidden ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 auto-rows-min">

                {/* 1. Header Area (Top Left) - Spanning more columns */}
                <div className="md:col-span-8 lg:col-span-6 mb-16 md:mb-0 relative z-10">
                    <TeamSectionHeader
                        text={title}
                        size="small"
                        className="mb-8"
                    />
                    <motion.h2
                        className="text-3xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight"
                        style={{ color: 'var(--heritage-cream)' }}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        {statement}
                    </motion.h2>
                </div>

                {/* 2. Decorative/Placeholder Block (Top Right) */}
                <div className="hidden md:block md:col-span-4 lg:col-span-6 relative mt-12">
                    <motion.div
                        className="w-full h-full border-l pl-8 flex flex-col justify-end pb-8"
                        style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-xs uppercase tracking-widest max-w-[200px]" style={{ color: 'rgba(212, 175, 55, 0.4)' }}>
                            [ Future Perspective ]
                        </p>
                    </motion.div>
                </div>

                {/* 3. Image 1 - Large Portrait (Left aligned, slightly offset) */}
                {images[0] && (
                    <motion.div
                        style={{ y: y1 }}
                        className="md:col-span-5 lg:col-span-4 md:row-start-2 pt-20"
                    >
                        <div className="relative aspect-[3/4] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                            <Image
                                src={images[0].src}
                                alt={images[0].alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-white/50 bg-black/20 backdrop-blur-sm px-2 py-1">
                                01. Leadership
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 4. Text/Placeholder Block (Center) */}
                <motion.div
                    className="md:col-span-7 lg:col-span-4 md:row-start-2 flex items-center p-8 lg:p-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="border p-8 w-full h-full min-h-[300px] flex items-center justify-center relative group" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                        <div className="absolute inset-0 scale-0 group-hover:scale-100 transition-transform duration-500 ease-out origin-center" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)' }} />
                        <p className="text-center font-light italic relative z-10" style={{ color: 'rgba(249, 248, 246, 0.6)' }}>
                            "Innovation is not just about technology, but about the human connection in legal practice."
                        </p>

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t" style={{ borderColor: 'var(--heritage-gold)' }} />
                        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t" style={{ borderColor: 'var(--heritage-gold)' }} />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b" style={{ borderColor: 'var(--heritage-gold)' }} />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b" style={{ borderColor: 'var(--heritage-gold)' }} />
                    </div>
                </motion.div>

                {/* 5. Image 2 - Square (Right aligned) */}
                {images[1] && (
                    <motion.div
                        style={{ y: y2 }}
                        className="md:col-span-4 lg:col-span-4 md:row-start-2 w-full flex flex-col justify-end"
                    >
                        <div className="relative aspect-square w-full max-w-[300px] ml-auto overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 mt-12 md:mt-0">
                            <Image
                                src={images[1].src}
                                alt={images[1].alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 25vw"
                            />
                        </div>
                    </motion.div>
                )}

                {/* 6. Placeholder for Content (Bottom Left) */}
                <div className="md:col-span-3 lg:col-span-3 md:row-start-3 h-full min-h-[200px] relative mt-12 md:mt-0 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
                    <div className="absolute top-4 left-0 text-[10px]" style={{ color: 'rgba(249, 248, 246, 0.2)' }}>
                        + ADD CONTENT
                    </div>
                </div>

                {/* 7. Image 3 - Landscape (Bottom Right spanning) */}
                {images[2] && (
                    <motion.div
                        style={{ y: y3 }}
                        className="md:col-span-7 lg:col-span-6 md:col-start-6 md:row-start-3 pt-12"
                    >
                        <div className="relative aspect-[16/9] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                            <Image
                                src={images[2].src}
                                alt={images[2].alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <p className="mt-4 text-xs text-right" style={{ color: 'rgba(249, 248, 246, 0.4)' }}>
                            Collaborative Excellence &mdash; 2024
                        </p>
                    </motion.div>
                )}
            </div>
        </section>
    )
}
