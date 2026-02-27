'use client'

import { motion } from 'framer-motion'
import TextReveal from '@/components/shared/animations/TextReveal'
import styles from './AboutSection.module.css'

export default function AboutSection() {
  return (
    <section id="about" className={styles.aboutSection}>
      {/* Background decorative elements */}
      <div className={styles.backgroundDecor}>
        <div className={styles.decorCircle} />
        <div className={styles.decorLine} />
        <div className={styles.decorDots} />
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.rule} aria-hidden="true" />

        {/*
          motion.div owns the fade (opacity 0 → 1).
          amount: 0.65 waits until ~65 % of the element is visible —
          i.e. the section has almost fully entered the frame — before firing.
          TextReveal delay is matched so the slide-up starts simultaneously.
        */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <TextReveal duration={1.2} delay={150}>
            <p className={styles.statement}>
              AR &amp; Co. is a distinguished full-service law firm headed by{' '}
              <span className={styles.highlight}>Barrister Shoaib Razzaq</span>, known for
              its fearless advocacy and strategic legal excellence. The firm provides
              comprehensive legal services in litigation, corporate advisory, regulatory
              compliance, and public authority matters.
            </p>
          </TextReveal>
        </motion.div>

        <div className={styles.rule} aria-hidden="true" />
      </div>
    </section>
  )
}
