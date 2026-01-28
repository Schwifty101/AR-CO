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
  const practiceAreas = [
    {
      title: "Corporate Law",
      description: "Expert guidance for business entities",
      icon: "🏢",
      link: "/practice/corporate-law",
    },
    { title: "Tax Law", description: "Strategic tax planning and compliance", icon: "📊", link: "/practice/tax-law" },
    {
      title: "Immigration",
      description: "Professional immigration services",
      icon: "🌍",
      link: "/practice/immigration",
    },
    { title: "Labour Law", description: "Employment and labour relations", icon: "👥", link: "/practice/labor-law" },
    {
      title: "Intellectual Property",
      description: "Protection of IP rights",
      icon: "💡",
      link: "/practice/intellectual-property",
    },
    {
      title: "Real Estate",
      description: "Property and real estate matters",
      icon: "🏠",
      link: "/practice/real-estate",
    },
    { title: "Litigation", description: "Comprehensive legal representation", icon: "⚖️", link: "/practice/litigation" },
    { title: "Contracts", description: "Contract drafting and review", icon: "📝", link: "/practice/contracts" },
  ]

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
          <CTASection />

          <div className={styles.footerSpacer} id="footer-trigger" />
        </main>
        <div className={styles.footerWrapper}>
          <Footer />
        </div>
      </SmoothScroll>
    </>
  )
}
