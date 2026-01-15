import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import Button from "@/components/Button"
import styles from "./page.module.css"
import Link from "next/link"

export default function ConfirmationPage({ params }: { params: { service: string } }) {
  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Facilitation", href: "/facilitation" },
              { label: "Confirmation" },
            ]}
          />

          <div className={styles.confirmationBox}>
            <div className={styles.successIcon}>✓</div>
            <h1>Order Confirmed!</h1>
            <p className={styles.message}>
              Thank you for using our facilitation services. Your request has been received and is being processed.
            </p>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Order ID</span>
                <span className={styles.value}>FAC-2024-001234</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Service</span>
                <span className={styles.value}>{decodeURIComponent(params.service).replace(/-/g, " ")}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Amount Paid</span>
                <span className={styles.value}>PKR 25,500</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Expected Completion</span>
                <span className={styles.value}>5 business days</span>
              </div>
            </div>

            <div className={styles.nextSteps}>
              <h2>What Happens Next</h2>
              <ol>
                <li>You will receive a confirmation email shortly</li>
                <li>Our team will review your documents within 24 hours</li>
                <li>You will be contacted if any additional information is needed</li>
                <li>You can track your request progress in your account dashboard</li>
              </ol>
            </div>

            <div className={styles.actions}>
              <Link href="/portal/login">
                <Button variant="primary">Go to Portal</Button>
              </Link>
              <Link href="/facilitation">
                <Button variant="secondary">Browse More Services</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
