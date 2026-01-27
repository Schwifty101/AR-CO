"use client"

import { useRef } from "react"
import ScrollRevealText from "@/components/shared/animations/ScrollRevealText"
import styles from "./QuoteSection.module.css"

export default function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section ref={sectionRef} className={styles.quoteSection} data-section="quote" id="quote-section">
      {/* Abstract Visual Elements */}
      <div className={styles.abstractElements}>
        {/* Flowing curved line - top right */}
        <svg className={styles.flowingLine} viewBox="0 0 400 200" preserveAspectRatio="none">
          <path
            d="M0,100 Q100,20 200,80 T400,60"
            fill="none"
            stroke="var(--wood-oak, #8B6F47)"
            strokeWidth="1"
            opacity="0.35"
          />
          <path
            d="M0,120 Q150,40 250,100 T400,80"
            fill="none"
            stroke="var(--wood-espresso, #3D2817)"
            strokeWidth="0.5"
            opacity="0.2"
          />
        </svg>
        
        {/* Geometric circle - subtle accent */}
        <div className={styles.geometricCircle} />
        
        {/* Small decorative dots cluster */}
        <div className={styles.dotsCluster}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        
        {/* Minimal corner accent */}
        <div className={styles.cornerAccent}>
          <div className={styles.cornerLine} />
          <div className={styles.cornerLineVertical} />
        </div>
        
        {/* Abstract floating shape */}
        <div className={styles.floatingShape} />
        
        {/* Subtle grid pattern overlay */}
        <div className={styles.gridPattern} />
      </div>
      
      {/* Quote mark decoration */}
      <div className={styles.quoteMarkDecor}>
        <span className={styles.quoteMark}>&ldquo;</span>
      </div>
      
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
          
          {/* Signature accent line */}
          <div className={styles.signatureAccent}>
            <span className={styles.accentLine} />
            <span className={styles.accentText}>AR&CO</span>
          </div>
        </div>
      </div>
      
      {/* Closing quote mark */}
      <div className={styles.quoteMarkDecorEnd}>
        <span className={styles.quoteMark}>&rdquo;</span>
      </div>
    </section>
  )
}
