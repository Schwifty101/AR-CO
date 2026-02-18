'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Hero from "@/components/home/hero/HeroV2"
import QuoteSection from "@/components/home/quote/QuoteSection"
import AboutSection from "@/components/home/about/AboutSection"
import Testimonials from "@/components/home/testimonials/Testimonials"
import { getSmoother } from '@/components/SmoothScroll'


import styles from "./page.module.css"

export default function Home() {
    useEffect(() => {
        // Check if there's a hash in the URL
        const hash = window.location.hash
        if (hash === '#about') {
            // Wait for the page to fully load and smooth scroller to initialize
            const timer = setTimeout(() => {
                const aboutSection = document.getElementById('about')
                if (aboutSection) {
                    const smoother = getSmoother()
                    if (smoother) {
                        smoother.scrollTo(aboutSection, { duration: 1.2 })
                    } else {
                        aboutSection.scrollIntoView({ behavior: 'smooth' })
                    }
                }
            }, 1500) // Delay to allow loading screen and smooth scroller to initialize

            return () => clearTimeout(timer)
        }
    }, [])

    return (
        <main className={`page-transition ${styles.homePage}`}>
            {/* Fixed espresso background + atmospheric gold glow — shared by all sections */}
            <div className={styles.pageBackground} aria-hidden="true" />

            {/* Hero Section with Integrated Logo Carousel */}
            <Hero />
            <QuoteSection />

            {/* About Section */}
            <AboutSection />

            {/* Practice Areas Horizontal Scroll with Abstract Layout */}
          
            {/* Testimonials Section */}
            <Testimonials />
        </main>
    )
}
