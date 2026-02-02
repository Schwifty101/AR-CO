import Hero from "@/components/home/Hero"
import QuoteSection from "@/components/home/QuoteSection"
import PracticeAreasHorizontal from "@/components/home/PracticeAreasHorizontal"
import CTASection from "@/components/home/CTASection"

import styles from "./page.module.css"

export default function Home() {
    return (
        <main className="page-transition">
            {/* Hero Section with Integrated Logo Carousel */}
            <Hero />
            <QuoteSection />

            {/* Practice Areas Horizontal Scroll with Abstract Layout */}
            <PracticeAreasHorizontal />
            {/* CTA Section */}
            <div className={styles.ctaWrapper}>
                <CTASection />
            </div>
        </main>
    )
}
