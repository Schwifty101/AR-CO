'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { ITeamMemberExtended } from './types/teamInterfaces'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

interface TeamInteractiveListProps {
    members: ITeamMemberExtended[]
}

export default function TeamInteractiveList({ members }: TeamInteractiveListProps) {
    const [activeMemberId, setActiveMemberId] = useState<number | null>(null)
    const [hoveredY, setHoveredY] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // Smooth mouse follow for the image
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Handle mouse move for parallax effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            x.set(e.clientX - centerX)
            y.set(e.clientY - centerY)
        }
    }

    const handleMouseEnter = (id: number, e: React.MouseEvent<HTMLDivElement>) => {
        setActiveMemberId(id)
        const rect = e.currentTarget.getBoundingClientRect()
        const containerRect = containerRef.current?.getBoundingClientRect()

        if (containerRect) {
            // Calculate relative Y position for the image to follow, centered on the row
            const relativeY = rect.top - containerRect.top + (rect.height / 2)
            setHoveredY(relativeY)
        }
    }

    const activeMember = members.find((m) => m.id === activeMemberId)

    return (
        <section
            ref={containerRef}
            className="py-32 px-4 md:px-8 lg:px-16 max-w-[1900px] mx-auto w-full relative min-h-screen mb-16"
            onMouseLeave={() => setActiveMemberId(null)}
            onMouseMove={handleMouseMove}
        >
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-x-12">

                {/* Mobile View - Full Profile Cards (Showcase Style) */}
                <div className="lg:hidden col-span-1 space-y-24 mb-20">
                    {members.map((member) => (
                        <div key={member.id} className="flex flex-col">
                            {/* Image Container */}
                            <div className="relative w-full aspect-[3/4] mb-8 overflow-hidden rounded-sm bg-heritage-walnut">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover object-top filter grayscale-[20%]"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-wood-espresso/90 via-transparent to-transparent opacity-40" />
                            </div>

                            {/* Text Content */}
                            <div>
                                {/* Name */}
                                <h2 className="text-5xl font-medium mb-3" style={{
                                    fontFamily: "'Lora', Georgia, serif",
                                    letterSpacing: '-0.02em',
                                    lineHeight: 0.9,
                                    color: 'var(--heritage-cream)',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    {member.name}
                                </h2>
                                {/* Role */}
                                <p className="text-lg text-heritage-gold/90 mb-6 italic" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                                    {member.role}
                                </p>
                                {/* Bio */}
                                <p className="text-sm leading-relaxed text-heritage-cream/80 mb-8 border-l border-heritage-gold/20 pl-4" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                                    {member.bio}
                                </p>

                                {/* Education */}
                                {member.education && (
                                    <div className="mb-6">
                                        <h4 className="text-[10px] uppercase tracking-widest text-heritage-gold mb-2 opacity-70" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>Education</h4>
                                        <ul className="space-y-1">
                                            {member.education.map((edu, i) => (
                                                <li key={i} className="text-xs text-heritage-cream/70 font-light">{edu}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Expertise */}
                                {member.expertise && (
                                    <div className="flex flex-wrap gap-2">
                                        {member.expertise.map((exp, i) => (
                                            <span key={i} className="text-[10px] uppercase tracking-wider border border-heritage-cream/10 px-3 py-1.5 rounded-full text-heritage-cream/60">
                                                {exp}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* List Column (Desktop/Interactive) */}
                <div className="hidden lg:flex lg:col-span-8 flex-col space-y-0 cursor-pointer">
                    {members.map((member, index) => (
                        <div
                            key={member.id}
                            className="group relative border-t border-heritage-walnut/10 hover:border-heritage-gold/50 transition-colors duration-500"
                            onMouseEnter={(e) => handleMouseEnter(member.id, e)}
                        >
                            <div className="relative py-12 md:py-16 flex flex-col md:flex-row md:items-baseline justify-between transition-all duration-500">

                                {/* Index Number - Abstract Decoration */}
                                <div className="hidden md:block absolute left-0 top-16 -translate-x-12 opacity-0 group-hover:opacity-100 transition-all duration-500 text-xs text-heritage-gold" style={{ fontFamily: "'Lora', Georgia, serif", letterSpacing: '0.12em' }}>
                                    {(index + 1).toString().padStart(2, '0')}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 z-10 w-full">
                                    <div className="flex items-baseline justify-between w-full group overflow-hidden">
                                        <h2
                                            className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter transition-all duration-500 ease-out origin-left group-hover:text-heritage-walnut"
                                            style={{
                                                fontFamily: "'Lora', Georgia, serif",
                                                letterSpacing: '-0.04em',
                                                color: activeMemberId === member.id ? 'var(--heritage-gold)' : 'var(--heritage-walnut)'
                                            }}
                                        >
                                            <span className="inline-block transition-transform duration-500 group-hover:translate-x-4">
                                                {member.name}
                                            </span>
                                        </h2>

                                        {/* Abstract Arrow */}
                                        <span className={`hidden md:block text-4xl transition-all duration-500 transform ${activeMemberId === member.id ? 'opacity-100 translate-x-0 rotate-45' : 'opacity-0 -translate-x-8 rotate-0'} text-heritage-gold`}>
                                            <ArrowUpRight size={48} strokeWidth={1} />
                                        </span>
                                    </div>

                                    {/* Role - Always visible but enhanced on hover */}
                                    <p className={`mt-4 text-sm md:text-base font-medium tracking-widest uppercase transition-all duration-500 ${activeMemberId === member.id ? 'text-heritage-walnut translate-x-4' : 'text-heritage-walnut/40'}`} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                                        {member.role}
                                    </p>

                                    {/* Expanded Details - Animate Height */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: activeMemberId === member.id ? 'auto' : 0,
                                            opacity: activeMemberId === member.id ? 1 : 0
                                        }}
                                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-8 pb-4 pl-4 border-l border-[var(--heritage-gold)]/20 ml-2 space-y-8">
                                            {/* Bio - Added on Hover */}
                                            {member.bio && (
                                                <div className="max-w-2xl">
                                                    <h4 className="text-xs uppercase tracking-widest text-[var(--heritage-gold)] mb-3 font-medium" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '0.35em' }}>About</h4>
                                                    <p className="text-base text-[var(--heritage-cream)] leading-relaxed font-light" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                                                        {member.bio}
                                                    </p>
                                                </div>
                                            )}



                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                                {/* Education */}
                                                {member.education && (
                                                    <div>
                                                        <h4 className="text-xs uppercase tracking-widest text-heritage-gold mb-3 font-medium" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '0.35em' }}>Education</h4>
                                                        <ul className="space-y-1">
                                                            {member.education.map((edu, i) => (
                                                                <li key={i} className="text-sm text-[var(--heritage-cream)] leading-relaxed font-light">{edu}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Expertise */}
                                                {member.expertise && (
                                                    <div>
                                                        <h4 className="text-xs uppercase tracking-widest text-heritage-gold mb-3 font-medium" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '0.35em' }}>Expertise</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {member.expertise.map((exp, i) => (
                                                                <span key={i} className="text-xs border border-[var(--heritage-cream)]/10 px-2 py-1 rounded-full text-[var(--heritage-cream)] bg-[var(--heritage-cream)]/5">
                                                                    {exp}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating Image Column - Fixed/Sticky behavior handled via absolute positioning + translate */}
                <div className="hidden lg:block lg:col-span-4 relative pointer-events-none">
                    {/* CORRECTED IMAGE CONTAINER */}
                    <div
                        className="absolute top-0 right-0 w-full h-full pointer-events-none hidden lg:block"
                        style={{ height: '100%' }}
                    >
                        <motion.div
                            className="absolute right-0 w-[400px] aspect-[3/4]"
                            animate={{
                                top: hoveredY,
                                translateY: "-50%"
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
                        >
                            {members.map((member) => {
                                const isActive = activeMemberId === member.id
                                return (
                                    <motion.div
                                        key={member.id}
                                        initial={false}
                                        animate={{
                                            opacity: isActive ? 1 : 0,
                                            scale: isActive ? 1 : 0.9,
                                            rotate: isActive ? 0 : -2,
                                            filter: isActive ? 'blur(0px)' : 'blur(10px)',
                                            zIndex: isActive ? 10 : 0
                                        }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        <div className="absolute inset-0 bg-heritage-gold/10 transform translate-x-4 translate-y-4" />
                                        <div className="relative w-full h-full overflow-hidden shadow-2xl bg-heritage-walnut">
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                className="object-cover transition-all duration-700"
                                                sizes="(max-width: 768px) 100vw, 400px"
                                                priority={true}
                                            />

                                            {/* Artistic Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-heritage-walnut/80 via-transparent to-transparent opacity-60" />

                                            {/* Name Overlay on Image */}
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <div className="h-[1px] w-12 bg-heritage-gold mb-4" />
                                                <p className="text-heritage-cream text-2xl font-light italic leading-tight" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                                                    {member.role.split('&')[0]}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Background Texture/Grain could be added here globally or per section */}
        </section>
    )
}
