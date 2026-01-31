'use client'

import ScrollRevealText from '@/components/shared/animations/ScrollRevealText'
import styles from './CTASection.module.css'

interface Testimonial {
  id: number
  quote: string
  author: string
  role: string
  rating: number
  position: 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right'
  rotation: number
  parallaxSpeed: number
  scale: number
  depth: number
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Transformed our entire digital presence. The attention to detail was extraordinary.",
    author: "Sarah Chen",
    role: "CEO, Axiom Ventures",
    rating: 5,
    position: 'top-left',
    rotation: -5,
    parallaxSpeed: 0.15,
    scale: 0.85,
    depth: 40,
  },
  {
    id: 2,
    quote: "Working with them felt like having a creative partner who truly understood our vision.",
    author: "Marcus Webb",
    role: "Founder, Stellar Labs",
    rating: 5,
    position: 'bottom-left',
    rotation: 3,
    parallaxSpeed: 0.25,
    scale: 1.05,
    depth: -20,
  },
  {
    id: 3,
    quote: "The results exceeded every expectation. Our conversion rate tripled within weeks.",
    author: "Elena Rodriguez",
    role: "Director, Pulse Digital",
    rating: 5,
    position: 'top-right',
    rotation: 4,
    parallaxSpeed: 0.3,
    scale: 0.9,
    depth: 30,
  },
  {
    id: 4,
    quote: "Rare combination of technical excellence and genuine artistic vision.",
    author: "James Park",
    role: "CTO, Momentum Inc",
    rating: 5,
    position: 'bottom-right',
    rotation: -3,
    parallaxSpeed: 0.2,
    scale: 1.1,
    depth: -10,
  },
]

export default function CTASection() {
  // All animations removed for simpler, static presentation
  // Individual section animations (ScrollRevealText) remain intact

  return (
    <section className={styles.ctaSection}>
      {/* Massive background text */}


      {/* Flowing lines - more visible and parallel */}
      <svg className={styles.flowingLines} viewBox="0 0 1000 800" preserveAspectRatio="none">
        <path
          d="M-50,150 L1100,200"
          fill="none"
          stroke="rgba(139, 111, 71, 0.18)"
          strokeWidth="1.5"
        />
        <path
          d="M-50,300 L1100,340"
          fill="none"
          stroke="rgba(160, 130, 109, 0.15)"
          strokeWidth="1"
        />
        <path
          d="M-50,450 L1100,480"
          fill="none"
          stroke="rgba(212, 175, 55, 0.2)"
          strokeWidth="1.5"
        />
        <path
          d="M-50,600 L1100,620"
          fill="none"
          stroke="rgba(139, 111, 71, 0.12)"
          strokeWidth="1"
        />
        <path
          d="M-50,720 L1100,750"
          fill="none"
          stroke="rgba(160, 130, 109, 0.1)"
          strokeWidth="1"
        />
      </svg>

      {/* Floating testimonials layer */}
      <div className={styles.testimonialsLayer}>
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className={`${styles.testimonialCard} ${styles[testimonial.position]}`}
          >
            <div className={styles.quoteIcon}>
              <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                <path
                  d="M10.5 9.5C10.5 8.67157 9.82843 8 9 8H3C2.17157 8 1.5 8.67157 1.5 9.5V15.5C1.5 16.3284 2.17157 17 3 17H9C9.82843 17 10.5 16.3284 10.5 15.5V12.5C10.5 11.6716 9.82843 11 9 11H6C6 8.79086 7.79086 7 10 7H10.5M22.5 9.5C22.5 8.67157 21.8284 8 21 8H15C14.1716 8 13.5 8.67157 13.5 9.5V15.5C13.5 16.3284 14.1716 17 15 17H21C21.8284 17 22.5 16.3284 22.5 15.5V12.5C22.5 11.6716 21.8284 11 21 11H18C18 8.79086 19.7909 7 22 7H22.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className={styles.stars}>
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M7 0l1.796 5.528h5.814l-4.703 3.416 1.796 5.528L7 11.056l-4.703 3.416 1.796-5.528L-.61 5.528h5.814z" />
                </svg>
              ))}
            </div>

            <p className={styles.testimonialText}>{testimonial.quote}</p>

            <div className={styles.author}>
              <span className={styles.authorName}>{testimonial.author}</span>
              <span className={styles.authorRole}>{testimonial.role}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Central CTA Content */}
      <div className={styles.ctaCard}>
        <div className={styles.headingContainer}>
          <ScrollRevealText as="span" className={styles.headingLine} delay={0}>
            Where
          </ScrollRevealText>
          <ScrollRevealText as="span" className={styles.headingLine} delay={100}>
            law meets
          </ScrollRevealText>
          <ScrollRevealText as="span" className={styles.headingLine} delay={200}>
            Technology
          </ScrollRevealText>
        </div>

        <button className={styles.ctaButton}>
          Book Consultation
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10h12m0 0l-4-4m4 4l-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <span className={styles.subtext}>
          30-minute call · No obligations · Free brand audit included
        </span>
      </div>
    </section>
  )
}
