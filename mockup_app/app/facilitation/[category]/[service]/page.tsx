import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import Button from "@/components/Button"
import styles from "./page.module.css"
import Link from "next/link"

export default function ServiceDetailPage({ params }: { params: { category: string; service: string } }) {
  const serviceDetails = {
    title: "Business Incorporation",
    price: "PKR 25,000",
    timeline: "5 days",
    description:
      "Complete business incorporation service including company registration, documentation, and government filings.",
    features: [
      "Company name verification",
      "Document preparation",
      "Government filings",
      "Registration certificate",
      "Compliance guidelines",
    ],
    requirements: [
      "Identification documents",
      "Proof of address",
      "Business plan (optional)",
      "Shareholder information",
    ],
    faqs: [
      { q: "How long does registration take?", a: "Typically 5 business days" },
      { q: "What documents do I need?", a: "ID, address proof, and business details" },
      { q: "Can I change the company name later?", a: "Yes, with additional processing" },
    ],
  }

  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Facilitation", href: "/facilitation" },
              { label: decodeURIComponent(params.category), href: `/facilitation/${params.category}` },
              { label: decodeURIComponent(params.service) },
            ]}
          />

          <div className={styles.content}>
            <div className={styles.mainContent}>
              <h1>{serviceDetails.title}</h1>
              <p className={styles.description}>{serviceDetails.description}</p>

              <section className={styles.section}>
                <h2>What's Included</h2>
                <ul className={styles.featureList}>
                  {serviceDetails.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.section}>
                <h2>What You'll Need</h2>
                <ul className={styles.requirementsList}>
                  {serviceDetails.requirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.section}>
                <h2>Frequently Asked Questions</h2>
                <div className={styles.faqList}>
                  {serviceDetails.faqs.map((faq) => (
                    <div key={faq.q} className={styles.faqItem}>
                      <h3>{faq.q}</h3>
                      <p>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.priceCard}>
                <h3>Service Details</h3>
                <div className={styles.priceRow}>
                  <span>Price</span>
                  <span className={styles.price}>{serviceDetails.price}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Timeline</span>
                  <span>{serviceDetails.timeline}</span>
                </div>
                <Link href={`/facilitation/checkout/${params.service}`}>
                  <Button variant="primary">Proceed to Checkout</Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
