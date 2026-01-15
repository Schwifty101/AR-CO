import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"
import Link from "next/link"

export default function FacilitationPage() {
  const categories = [
    { title: "Document Drafting", count: 5, link: "/facilitation/document-drafting", icon: "📝" },
    { title: "Legal Consultation", count: 3, link: "/facilitation/legal-consultation", icon: "💬" },
    { title: "Contract Review", count: 4, link: "/facilitation/contract-review", icon: "✓" },
    { title: "Compliance Audit", count: 2, link: "/facilitation/compliance-audit", icon: "📋" },
    { title: "Mediation Services", count: 3, link: "/facilitation/mediation", icon: "🤝" },
  ]

  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Facilitation Centre" }]} />

          <h1>Facilitation Centre</h1>
          <p className={styles.description}>Convenient legal services designed to meet your specific needs</p>

          <div className={styles.search}>
            <input type="text" placeholder="Search for a service..." />
          </div>

          <h2>Service Categories</h2>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link key={cat.title} href={cat.link}>
                <div className={styles.categoryCard}>
                  <div className={styles.icon}>{cat.icon}</div>
                  <h3>{cat.title}</h3>
                  <p>{cat.count} Services</p>
                </div>
              </Link>
            ))}
          </div>

          <section className={styles.howItWorks}>
            <h2>How It Works</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <h3>Browse Services</h3>
                <p>Explore our range of legal services</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <h3>Choose & Inquire</h3>
                <p>Select your service and submit an inquiry</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <h3>Get Confirmation</h3>
                <p>Receive confirmation and timeline</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
