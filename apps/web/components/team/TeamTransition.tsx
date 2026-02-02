'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function TeamTransition() {
    return (
        <section className="relative w-full flex flex-col items-center justify-center py-24 z-20">
            {/* Vertical Line Thread */}
            <motion.div
                className="w-[1px] bg-heritage-gold/30 origin-top"
                initial={{ height: 0 }}
                whileInView={{ height: '100px' }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Connecting Circle/Node */}
            <motion.div
                className="w-2 h-2 rounded-full bg-heritage-gold mt-2 mb-8"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.5 }}
            />

            {/* Introductory Text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.4, duration: 0.8 }}
            >
                <span className="text-heritage-gold/80 text-[10px] uppercase tracking-[0.3em] font-medium">
                    The Collective
                </span>
            </motion.div>
        </section>
    )
}
