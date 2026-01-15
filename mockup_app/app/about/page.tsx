import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

          <h1>About AR&CO Law Firm</h1>

          <section className={styles.content}>
            <h2>Our History</h2>
            <p>
              With over 20 years of experience, AR&CO Law Firm has established itself as a trusted legal partner for
              businesses and individuals seeking expert legal counsel.
            </p>

            <h2>Our Mission</h2>
            <p>
              To provide comprehensive legal solutions with integrity, professionalism, and excellence, ensuring our
              clients achieve their objectives through strategic legal guidance.
            </p>

            <h2>Our Values</h2>
            <ul className={styles.valuesList}>
              <li>Integrity and transparency in all dealings</li>
              <li>Excellence in legal practice and client service</li>
              <li>Professional commitment to each case</li>
              <li>Innovation in legal solutions</li>
              <li>Client-centric approach</li>
            </ul>

            <h2>Why Choose Us</h2>
            <ul className={styles.valuesList}>
              <li>Experienced and dedicated legal team</li>
              <li>Personalized legal strategies</li>
              <li>Track record of successful cases</li>
              <li>Transparent communication</li>
              <li>Competitive pricing</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
