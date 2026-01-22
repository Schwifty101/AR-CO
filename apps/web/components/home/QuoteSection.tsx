import ScrollRevealText from "@/components/shared/animations/ScrollRevealText"
import styles from "./QuoteSection.module.css"

export default function QuoteSection() {
  return (
    <section className={styles.quoteSection}>
      <div className={styles.container}>
        <div className={styles.quoteContent}>
          <ScrollRevealText 
            as="h1"
            className={`${styles.quoteLine} ${styles.medium}`}
            delay={0}
          >
            Where <span className={styles.italic}>expertise</span> meets
          </ScrollRevealText>
          
          <ScrollRevealText 
            as="h1"
            className={`${styles.quoteLine} ${styles.bold}`}
            delay={150}
          >
            dedication, 
          </ScrollRevealText>
          
          <ScrollRevealText 
            as="h1"
            className={`${styles.quoteLine} ${styles.medium}`}
            delay={300}
          >
             <span className={styles.bold}> every case</span>
          </ScrollRevealText>
          
          <ScrollRevealText 
            as="h1"
            className={`${styles.quoteLine} ${styles.italic}`}
            delay={450}
          >
            becomes a story
          </ScrollRevealText>
          
          <ScrollRevealText 
            as="h1"
            className={`${styles.quoteLine} ${styles.medium}`}
            delay={600}
          >
            of <span className={styles.bold}>justice</span> <span className={styles.italic}>delivered.</span>
          </ScrollRevealText>
        </div>
      </div>
    </section>
  )
}
