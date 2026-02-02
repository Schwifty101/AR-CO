'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ITeamMemberExtended } from './types/teamInterfaces'
import Image from 'next/image'

interface TeamInteractiveListProps {
    members: ITeamMemberExtended[]
}

export default function TeamInteractiveList({ members }: TeamInteractiveListProps) {
    const [activeMemberId, setActiveMemberId] = useState<number | null>(null)
    const [hoveredY, setHoveredY] = useState<number>(0)
    const listRef = React.useRef<HTMLDivElement>(null)

    const handleMouseEnter = (id: number, e: React.MouseEvent<HTMLDivElement>) => {
        setActiveMemberId(id)
        if (listRef.current) {
            const listRect = listRef.current.getBoundingClientRect()
            const itemRect = e.currentTarget.getBoundingClientRect()
            // Track relative Y position
            setHoveredY(itemRect.top - listRect.top)
        }
    }

    const activeMember = members.find((m) => m.id === activeMemberId)

    return (
        <section className="px-4 md:px-8 lg:px-16 mb-24 max-w-[1800px] mx-auto w-full relative">
            <div
                className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 relative"
                ref={listRef}
                onMouseLeave={() => setActiveMemberId(null)}
            >

                {/* LEFT & CENTER COLUMNS: Roles & Names List */}
                <div className="lg:col-span-8 flex flex-col">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="group flex flex-row items-baseline cursor-pointer py-6 md:py-8 transition-all duration-500 ease-out border-b border-heritage-gold/10 hover:border-heritage-gold/30"
                            onMouseEnter={(e) => handleMouseEnter(member.id, e)}
                        >
                            {/* Column 1: Role (Abstract - Hidden until hover) */}
                            <div className="w-[30%] md:w-[35%] pr-6 md:pr-12 flex justify-end overflow-hidden">
                                <span
                                    className={`text-[10px] md:text-sm font-medium text-right transition-all duration-500 transform ${activeMemberId === member.id
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-full'
                                        }`}
                                    style={{ color: activeMemberId === member.id ? 'var(--heritage-gold)' : 'rgba(249, 248, 246, 0.3)' }}
                                >
                                    {member.role.split(',')[0]}
                                </span>
                            </div>

                            {/* Column 2: Name (Left Aligned, Big) */}
                            <div className="flex-1 overflow-hidden relative z-10">
                                <h2
                                    className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.85] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeMemberId === member.id
                                        ? 'opacity-100 translate-x-4'
                                        : activeMemberId !== null
                                            ? 'opacity-20 blur-[2px]'
                                            : 'opacity-100'
                                        }`}
                                    style={{
                                        fontFamily: 'var(--font-cabinet-grotesk, sans-serif)',
                                        color: activeMemberId === member.id ? 'var(--heritage-gold)' : 'var(--heritage-cream)'
                                    }}
                                >
                                    {member.name}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT COLUMN: Floating Image */}
                <div className="hidden lg:block lg:col-span-4 relative pointer-events-none">
                    {/* 
                        Use absolute positioning within the relative container to track Y.
                        We add a transition to 'top' or 'transform' for smooth following.
                     */}
                    <div
                        className="absolute right-0 w-full max-w-sm transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        style={{
                            top: 0,
                            transform: `translateY(${hoveredY}px) translateY(-25%)` // -25% to align better with text baseline
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {activeMember && (
                                <motion.div
                                    key={activeMember.id}
                                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                                >
                                    {/* Image Card */}
                                    <div className="aspect-[3/4] w-full overflow-hidden mb-6 bg-heritage-walnut/20 relative rounded-sm shadow-2xl shadow-black/20">
                                        <Image
                                            src={activeMember.image}
                                            alt={activeMember.name}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 400px"
                                            className="object-cover"
                                            priority={true}
                                        />
                                    </div>

                                    {/* Sidebar Details - Only show on hover */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1, duration: 0.4 }}
                                        className="space-y-4"
                                    >
                                        {activeMember.education && (
                                            <div className="text-sm text-heritage-cream/70 space-y-1">
                                                {activeMember.education.map((edu, i) => (
                                                    <p key={i} className="leading-snug">{edu}</p>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </section>
    )
}
