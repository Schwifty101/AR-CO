'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import styles from './AboutSection.module.css'

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section id="about" ref={sectionRef} className={styles.aboutSection}>
      {/* Background decorative elements */}
      <div className={styles.backgroundDecor}>
        <div className={styles.decorCircle} />
        <div className={styles.decorLine} />
        <div className={styles.decorDots} />
      </div>

      <motion.div 
        className={styles.contentWrapper}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        viewport={{ once: true }}
      >
        <div className={styles.container}>
          {/* Left side - Header with decorative element */}
          <div className={styles.headerSection}>
            <motion.div
              className={styles.decorativeBar}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
              viewport={{ once: true }}
            />
            <motion.h2
              className={styles.heading}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
              viewport={{ once: true }}
            >
              About
              <span className={styles.headingAccent}>AR & Co.</span>
            </motion.h2>
            <motion.p
              className={styles.subheading}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              viewport={{ once: true }}
            >
              Fearless Advocacy. Strategic Excellence.
            </motion.p>
          </div>

          {/* Right side - Content with staggered animation */}
          <div className={styles.contentSection}>
            <motion.div
              className={styles.contentBlock}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
              viewport={{ once: true }}
            >
              <p className={styles.paragraph}>
                AR & Co. is a distinguished full-service law firm headed by{' '}
                <span className={styles.highlight}>Barrister Shoaib Razzaq</span>, known for 
                its fearless advocacy and strategic legal excellence. The firm provides 
                comprehensive legal services in litigation, corporate advisory, regulatory 
                compliance, and public authority matters.
              </p>
            </motion.div>

            <motion.div
              className={styles.contentBlock}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
              viewport={{ once: true }}
            >
              <p className={styles.paragraph}>
                With extensive experience before the Superior Courts of Pakistan, AR & Co. 
                has built a reputation for handling complex and high-profile cases with 
                precision and confidence. Our valued clients include leading corporate entities, 
                financial institutions, media groups, government bodies, and prominent public 
                figures across Pakistan.
              </p>
            </motion.div>

            <motion.div
              className={styles.contentBlock}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
              viewport={{ once: true }}
            >
              <p className={styles.paragraph}>
                We combine deep legal expertise with practical insight to deliver result-driven 
                solutions tailored to each client's needs.
              </p>
            </motion.div>

            <motion.div
              className={styles.divider}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
              viewport={{ once: true }}
            />

            <motion.div
              className={styles.contentBlock}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.32, 0.72, 0, 1] }}
              viewport={{ once: true }}
            >
              <p className={styles.paragraph}>
                Originally recognized for our strong litigation practice and courtroom 
                representation, we have now expanded our vision beyond the courts. With the 
                launch of our online{' '}
                <span className={styles.highlight}>Facilitation Center</span>, clients can 
                seamlessly register and access a wide range of legal and regulatory services 
                through a secure, efficient, and client-focused digital platform.
              </p>
            </motion.div>

            <motion.div
              className={styles.contentBlock}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.32, 0.72, 0, 1] }}
              viewport={{ once: true }}
            >
              <p className={`${styles.paragraph} ${styles.closing}`}>
                At AR & Co., professionalism, integrity, discretion, and unwavering commitment 
                remain the foundation of everything we do.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
