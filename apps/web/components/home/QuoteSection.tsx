"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import ScrollRevealText from "@/components/shared/animations/ScrollRevealText"
import { setSlowScroll, setNormalScroll, setMediumScroll } from "@/components/SmoothScroll"
import styles from "./QuoteSection.module.css"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null)
  
  // Create smooth layered stacking entrance - quote advances faster than hero exits
  useGSAP(() => {
    if (!sectionRef.current) return
    
    // Animate the quote section smoothly sliding up and overlapping the hero
    // Quote moves faster relative to scroll, creating layered parallax effect
    gsap.fromTo(
      sectionRef.current,
      {
        y: 250, // Start well below for smooth long travel
        opacity: 0.85,
        scale: 0.96,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        ease: "power2.out", // Smooth ease-out for natural deceleration
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 120%", // Start earlier - when quote is still below viewport
          end: "top 20%", // Longer travel distance for smooth overlap
          scrub: 1.25, // Faster scrub for quote advancing quicker than hero
          // markers: true,
        }
      }
    )
    
    // Scroll speed control for quote section - slow down during overlap transition
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom", // When quote starts entering viewport
      end: "bottom 70%", // Until quote is mostly scrolled through
      // markers: true,
      onEnter: () => setMediumScroll(), // Medium speed during quote section
      onEnterBack: () => setMediumScroll(),
      onLeave: () => setNormalScroll(), // Normal speed after quote
      onLeaveBack: () => setSlowScroll(), // Back to slow for hero
    })
  }, [])
  
  return (
    <section ref={sectionRef} className={styles.quoteSection}>
      {/* Abstract Visual Elements */}
      <div className={styles.abstractElements}>
        {/* Flowing curved line - top right */}
        <svg className={styles.flowingLine} viewBox="0 0 400 200" preserveAspectRatio="none">
          <path 
            d="M0,100 Q100,20 200,80 T400,60" 
            fill="none" 
            stroke="var(--heritage-gold, #D4AF37)" 
            strokeWidth="1"
            opacity="0.3"
          />
          <path 
            d="M0,120 Q150,40 250,100 T400,80" 
            fill="none" 
            stroke="var(--heritage-walnut, #4E342E)" 
            strokeWidth="0.5"
            opacity="0.15"
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
