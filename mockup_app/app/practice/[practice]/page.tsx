import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import Button from "@/components/Button"
import styles from "./page.module.css"
import Link from "next/link"

export default function PracticePage({ params }: { params: { practice: string } }) {
  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Practice Areas", href: "/" },
              { label: decodeURIComponent(params.practice) },
            ]}
          />

          <div className={styles.content}>
            {/* Left Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.attorneyCard}>
                <div className={styles.attorneyImage}>👨‍⚖️</div>
                <h3>Mr. Shoaib</h3>
                <p className={styles.title}>Lead Attorney</p>
                <p className={styles.bio}>
                  Specialist in {decodeURIComponent(params.practice).replace(/-/g, " ")} with 20+ years of experience.
                </p>
                <Button>Contact Attorney</Button>
              </div>
            </aside>

            {/* Main Content */}
            <div className={styles.mainContent}>
              <h1>{decodeURIComponent(params.practice).replace(/-/g, " ")}</h1>

              <section className={styles.section}>
                <h2>Service Overview</h2>
                <p>
                  We provide comprehensive {decodeURIComponent(params.practice).replace(/-/g, " ")} services tailored to
                  meet your specific business needs. Our experienced team has successfully handled numerous cases and
                  transactions in this practice area.
                </p>
              </section>

              <section className={styles.section}>
                <h2>What We Do</h2>
                <ul className={styles.servicesList}>
                  <li>Expert legal consultation and advice</li>
                  <li>Document preparation and review</li>
                  <li>Representation in negotiations</li>
                  <li>Contract drafting and enforcement</li>
                  <li>Dispute resolution and litigation</li>
                  <li>Compliance and regulatory guidance</li>
                </ul>
              </section>

              <section className={styles.section}>
                <h2>Notable Cases</h2>
                <div className={styles.caseGrid}>
                  <div className={styles.caseCard}>
                    <h3>Case Title 1</h3>
                    <p>Successfully resolved complex matter with favorable outcome</p>
                  </div>
                  <div className={styles.caseCard}>
                    <h3>Case Title 2</h3>
                    <p>Landmark decision establishing important precedent</p>
                  </div>
                  <div className={styles.caseCard}>
                    <h3>Case Title 3</h3>
                    <p>Major transaction completed for multinational corporation</p>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h2>Key Clients</h2>
                <div className={styles.clientGrid}>
                  <div className={styles.clientLogo}>Client Logo 1</div>
                  <div className={styles.clientLogo}>Client Logo 2</div>
                  <div className={styles.clientLogo}>Client Logo 3</div>
                  <div className={styles.clientLogo}>Client Logo 4</div>
                </div>
              </section>

              <section className={styles.cta}>
                <h2>Ready to Get Legal Help?</h2>
                <p>Schedule a consultation with our experienced team</p>
                <Link href="/contact">
                  <Button>Schedule Consultation</Button>
                </Link>
              </section>

              <section className={styles.section}>
                <h2>Related Services</h2>
                <div className={styles.relatedServices}>
                  <Link href="/practice/contracts" className={styles.serviceLink}>
                    <div className={styles.relatedCard}>
                      <h3>Contract Services</h3>
                      <p>Comprehensive contract solutions</p>
                    </div>
                  </Link>
                  <Link href="/practice/compliance" className={styles.serviceLink}>
                    <div className={styles.relatedCard}>
                      <h3>Compliance</h3>
                      <p>Regulatory compliance guidance</p>
                    </div>
                  </Link>
                  <Link href="/practice/dispute-resolution" className={styles.serviceLink}>
                    <div className={styles.relatedCard}>
                      <h3>Dispute Resolution</h3>
                      <p>Efficient dispute settlement</p>
                    </div>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
