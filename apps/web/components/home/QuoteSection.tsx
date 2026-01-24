"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import ScrollRevealText from "@/components/shared/animations/ScrollRevealText"
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
  }, [])
  
  return (
    <section ref={sectionRef} className={styles.quoteSection}>
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
