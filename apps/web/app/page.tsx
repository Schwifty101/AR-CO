import Header from "@/components/nav/Header"
import Footer from "@/components/footer/Footer"
import Button from "@/components/Button"
import Hero from "@/components/home/Hero"
import PracticeAreasScroll from "@/components/home/PracticeAreasScroll"
import ScrollRevealText from "@/components/shared/animations/ScrollRevealText"
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
      <main className="page-transition">
        {/* Hero Section with Integrated Logo Carousel */}
        <Hero />

        {/* Section Header for Practice Areas */}
        <section className={styles.practiceAreasHeader}>
          <div className={styles.container}>
            <ScrollRevealText as="h2" delay={100}>Our Practice Areas</ScrollRevealText>
          </div>
        </section>

        {/* Premium Practice Areas Horizontal Scroll Section */}
        <PracticeAreasScroll />

        {/* Portal Access Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2>Access Your Portal</h2>
            <div className={styles.portalGrid}>
              <Link href="/portal/login" className={styles.portalCard}>
                <h3>Client Portal</h3>
                <p>Manage your cases, appointments, and documents</p>
                <Button variant="secondary">Enter Portal</Button>
              </Link>
              <Link href="/admin/login" className={styles.portalCard}>
                <h3>Admin Panel</h3>
                <p>Manage clients, inquiries, and appointments</p>
                <Button variant="secondary">Enter Admin</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.container}>
            <div className={styles.statCard}>
              <h3>20+</h3>
              <p>Years Experience</p>
            </div>
            <div className={styles.statCard}>
              <h3>500+</h3>
              <p>Clients Served</p>
            </div>
            <div className={styles.statCard}>
              <h3>95%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2>What Our Clients Say</h2>
            <div className={styles.testimonials}>
              <div className={styles.testimonial}>
                <p>"Exceptional service and expertise. Highly recommended!"</p>
                <p className={styles.author}>- Client Name</p>
              </div>
              <div className={styles.testimonial}>
                <p>"Professional team with deep legal knowledge."</p>
                <p className={styles.author}>- Client Name</p>
              </div>
              <div className={styles.testimonial}>
                <p>"Reliable and trustworthy legal partner."</p>
                <p className={styles.author}>- Client Name</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className={styles.newsletter}>
          <div className={styles.container}>
            <h2>Subscribe to Our Newsletter</h2>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Enter your email" required />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
