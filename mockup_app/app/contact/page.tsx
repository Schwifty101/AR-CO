import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

          <h1>Contact Us</h1>

          <div className={styles.content}>
            {/* Left Column - Form */}
            <div className={styles.formSection}>
              <h2>Send us a Message</h2>
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" placeholder="Your full name" required />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder="your@email.com" required />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input type="tel" id="phone" placeholder="+92-XXX-XXXXX" required />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="service">Service Interest</label>
                  <select id="service" required>
                    <option>Select a service</option>
                    <option>Corporate Law</option>
                    <option>Tax Law</option>
                    <option>Immigration</option>
                    <option>Document Drafting</option>
                    <option>Legal Consultation</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea id="message" placeholder="Your message" rows={5} required></textarea>
                </div>

                <Button type="submit">Send Message</Button>
              </form>
            </div>

            {/* Right Column - Info */}
            <div className={styles.infoSection}>
              <div className={styles.infoCard}>
                <h3>Office Address</h3>
                <p>
                  123 Legal Street
                  <br />
                  Business District
                  <br />
                  City, Country
                </p>
              </div>

              <div className={styles.infoCard}>
                <h3>Contact Details</h3>
                <p>
                  Phone: <a href="tel:+92">+92-XXX-XXXXX</a>
                </p>
                <p>
                  Email: <a href="mailto:info@arco.law">info@arco.law</a>
                </p>
              </div>

              <div className={styles.infoCard}>
                <h3>Business Hours</h3>
                <p>
                  Monday - Friday: 9:00 AM - 6:00 PM
                  <br />
                  Saturday: 10:00 AM - 2:00 PM
                  <br />
                  Sunday: Closed
                </p>
              </div>

              <div className={styles.whatsappButton}>
                <Button>Start WhatsApp Chat</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
