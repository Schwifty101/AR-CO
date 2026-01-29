import Header from "@/components/nav/Header"
import Footer from "@/components/footer/Footer"
import Button from "@/components/Button"
import Hero from "@/components/home/Hero"
import QuoteSection from "@/components/home/QuoteSection"
import PracticeAreasHorizontal from "@/components/home/PracticeAreasHorizontal"
import ScrollRevealText from "@/components/shared/animations/ScrollRevealText"
import CTASection from "@/components/home/CTASection"
import SmoothScroll from "@/components/SmoothScroll"

import Link from "next/link"
import styles from "./page.module.css"

export default function Home() {
  
  return (
    <>
      <Header />
      <SmoothScroll>
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
        <Footer />
      </SmoothScroll>
    </>
  )
}
