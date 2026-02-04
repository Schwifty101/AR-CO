'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ITeamMemberExtended } from './types/teamInterfaces'

interface TeamLeaderShowcaseProps {
    leader: ITeamMemberExtended
}

export default function TeamLeaderShowcase({ leader }: TeamLeaderShowcaseProps) {
    const sectionRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    // Parallax effects
    const yImage = useTransform(scrollYProgress, [0, 1], [50, -50])
    const yText = useTransform(scrollYProgress, [0, 1], [100, -100])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <section ref={sectionRef} className="relative w-full py-32 px-4 md:px-8 lg:px-16 max-w-[1800px] mx-auto overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-heritage-gold/5 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center relative z-10">

                {/* LEFT COLUMN: Text Content - Editorial Style */}
                <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
                    <motion.div style={{ y: yText, opacity }}>
                        {/* Decorative Label */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-[1px] w-12 bg-heritage-gold"></div>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-heritage-gold">
                                Principal Counsel
                            </span>
                        </div>

                        {/* Name - Massive Typography */}
                        <h1
                            className="text-5xl md:text-7xl font-bold mb-6 leading-[0.9]"
                            style={{
                                fontFamily: 'var(--font-cabinet-grotesk, sans-serif)',
                                color: 'var(--heritage-cream)'
                            }}
                        >
                            {leader.name.split(' ').map((word, i) => (
                                <span key={i} className="block">{word}</span>
                            ))}
                        </h1>

                        {/* Role */}
                        <p className="text-xl md:text-2xl font-light text-heritage-gold/80 mb-10 italic font-serif">
                            {leader.role}
                        </p>

                        {/* Bio */}
                        <p className="text-sm md:text-base leading-relaxed text-heritage-cream/70 mb-12 max-w-lg border-l border-heritage-gold/20 pl-6">
                            {leader.bio}
                        </p>

                        {/* Expertise / Keywords */}
                        {leader.expertise && (
                            <div className="flex flex-wrap gap-3">
                                {leader.expertise.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 text-[10px] uppercase tracking-wider border border-heritage-gold/30 text-heritage-gold rounded-full hover:bg-heritage-gold hover:text-wood-espresso transition-colors duration-300 cursor-default"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Additional Info Block */}
                        <div className="mt-12 pt-8 border-t border-heritage-gold/10 grid grid-cols-2 gap-8">
                            <div>
                                <span className="block text-[10px] uppercase tracking-widest text-heritage-cream/40 mb-2">Experience</span>
                                <span className="text-2xl font-bold" style={{
                                    fontFamily: 'var(--font-cabinet-grotesk, sans-serif)',
                                    color: 'var(--heritage-cream)'
                                }}>
                                    {leader.yearsOfExperience}+ Years
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-widest text-heritage-cream/40 mb-2">Education</span>
                                <div className="text-sm text-heritage-cream/80">
                                    {leader.education?.map((edu, i) => (
                                        <div key={i}>{edu}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Image - Abstract Composition */}
                <div className="lg:col-span-7 relative h-[600px] lg:h-[800px] order-1 lg:order-2">
                    <motion.div style={{ y: yImage }} className="relative w-full h-full">
                        {/* Main Image Container with Abstract Mask/Shape */}
                        <div className="absolute inset-0 z-10 overflow-hidden rounded-sm">
                            <Image
                                src={leader.image}
                                alt={leader.name}
                                fill
                                className="object-cover object-top grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 hover:scale-100"
                                priority
                                sizes="(max-width: 1024px) 100vw, 60vw"
                            />
                            {/* Overlay Gradient for Text Integration */}
                            <div className="absolute inset-0 bg-gradient-to-t from-wood-espresso/80 via-transparent to-transparent opacity-60 lg:opacity-0" />
                        </div>

                        {/* Decorative Frames/Elements behind */}
                        <div className="absolute -top-12 -right-12 w-full h-full border border-heritage-gold/20 z-0 hidden lg:block" />
                        <div className="absolute -bottom-12 -left-12 w-2/3 h-2/3 bg-heritage-walnut/10 z-0 hidden lg:block backdrop-blur-sm" />

                        {/* Floating Badge */}
                        <div className="absolute bottom-8 right-8 z-20 bg-heritage-gold/90 text-wood-espresso p-6 backdrop-blur-md shadow-xl rounded-sm max-w-[200px] hidden lg:block">
                            <span className="block text-4xl font-bold mb-1">“</span>
                            <p className="text-xs font-medium leading-normal">
                                Justice is not just a profession, it is a covenant with society.
                            </p>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    )
}
