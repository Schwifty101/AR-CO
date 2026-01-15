import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Post" }]} />

          <article className={styles.article}>
            <div className={styles.header}>
              <span className={styles.category}>Corporate</span>
              <h1>Understanding Corporate Law Basics</h1>
              <div className={styles.meta}>
                <span>👨‍⚖️ By Mr. Shoaib</span>
                <span>📅 January 15, 2024</span>
                <span>⏱️ 5 min read</span>
              </div>
            </div>

            <div className={styles.featuredImage}>📄</div>

            <div className={styles.content}>
              <h2>Introduction</h2>
              <p>
                Corporate law is the body of law governing the creation and operation of corporations. It is a key area
                of practice for many law firms.
              </p>

              <h2>Key Principles</h2>
              <p>
                Understanding the basics of corporate law is essential for any business owner or entrepreneur. This
                includes knowledge of formation, governance, and compliance requirements.
              </p>

              <h3>Formation</h3>
              <p>
                The formation of a corporation involves filing articles of incorporation with the relevant government
                authority. This establishes the corporation as a separate legal entity.
              </p>

              <h3>Governance</h3>
              <p>
                Proper governance structure ensures that the corporation operates efficiently and in compliance with
                applicable laws and regulations.
              </p>

              <h2>Conclusion</h2>
              <p>
                Corporate law is a complex field, but understanding its basics is crucial for business success. We
                recommend consulting with a qualified attorney for your specific needs.
              </p>
            </div>

            <div className={styles.tags}>
              <span className={styles.tag}>#Corporate Law</span>
              <span className={styles.tag}>#Business</span>
              <span className={styles.tag}>#Legal Basics</span>
            </div>

            <div className={styles.share}>
              <p>Share this article:</p>
              <div className={styles.shareButtons}>
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
                <a href="#">Facebook</a>
              </div>
            </div>

            <div className={styles.cta}>
              <h3>Need Legal Advice?</h3>
              <p>Our experienced attorneys are ready to help. Contact us today for a consultation.</p>
              <a href="/contact" className={styles.ctaButton}>
                Get Legal Help
              </a>
            </div>
          </article>

          <section className={styles.related}>
            <h2>Related Posts</h2>
            <div className={styles.relatedGrid}>
              <div className={styles.relatedCard}>
                <div className={styles.relatedImage}>💰</div>
                <h4>Tax Planning for Startups</h4>
                <p>Effective strategies for new businesses</p>
              </div>
              <div className={styles.relatedCard}>
                <div className={styles.relatedImage}>📋</div>
                <h4>Contract Essentials</h4>
                <p>Key elements every contract should have</p>
              </div>
              <div className={styles.relatedCard}>
                <div className={styles.relatedImage}>⚖️</div>
                <h4>Dispute Resolution</h4>
                <p>Understanding your legal options</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
