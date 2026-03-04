'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from '../../[category]/[slug]/services.module.css'
import overviewStyles from '../../[category]/[slug]/overview.module.css'
import ipStyles from './ip-services.module.css'

const IP_SERVICES = [
  { label: 'Trademark Registration', href: '/services/facilitation/trademark-registration' },
  { label: 'IP Objection Handling', href: '/services/facilitation/ip-objection-handling' },
  { label: 'Patent Filing', href: '/services/facilitation/patent-filing' },
  { label: 'Objections', href: '/services/facilitation/objections' },
  { label: 'Copyright Registration', href: '/services/facilitation/copyright-registration' },
]

export default function IPServicesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageBackground} aria-hidden="true" />

      {/* Video placeholder */}
      <motion.div
        className={overviewStyles.videoSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={overviewStyles.videoCornerTL} />
        <div className={overviewStyles.videoCornerBR} />
        <div className={overviewStyles.videoCenter}>
          <div className={overviewStyles.videoPlayRing}>
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
              <path d="M1 1L13 8L1 15V1Z" fill="rgba(212,175,55,0.55)" />
            </svg>
          </div>
          <p className={overviewStyles.videoLabel}>Video Walkthrough</p>
          <p className={overviewStyles.videoCaption}>Coming Soon</p>
        </div>
        <div className={overviewStyles.videoGradientTop} />
        <div className={overviewStyles.videoGradientBottom} />
      </motion.div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <section className={overviewStyles.section}>
          <span className={overviewStyles.sideText}>IP Services</span>

          <div className={overviewStyles.container}>
            {/* Heading */}
            <motion.header
              className={overviewStyles.titleBlock}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className={overviewStyles.serviceTitle}>
                <em>IP Services</em>
              </h1>
            </motion.header>

            {/* Gold rule */}
            <motion.div
              className={overviewStyles.goldRuleAnimated}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.32, 0.72, 0, 1] }}
            />

            {/* Tagline */}
            <motion.div
              className={overviewStyles.whatWeDoBlock}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.55 }}
            >
              <span className={overviewStyles.eyebrow}>Intellectual Property</span>
              <motion.p
                className={overviewStyles.tagline}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                20 years, 3,000+ IP successful outcomes — AR&amp;CO is Pakistan&apos;s trusted name in patents, trademarks, and copyrights!
              </motion.p>
            </motion.div>

            {/* Services list */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Label above list */}
              <span className={ipStyles.servicesLabel}>Our Services</span>

              <ol className={ipStyles.servicesList}>
                {IP_SERVICES.map((service, idx) => (
                  <motion.li
                    key={service.href}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.07,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link href={service.href} className={ipStyles.serviceItem}>
                      <span className={ipStyles.stepNumber}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className={ipStyles.serviceName}>{service.label}</span>
                      <ArrowRight className={ipStyles.arrow} />
                    </Link>
                  </motion.li>
                ))}
              </ol>
            </motion.div>

            {/* Footer */}
            <motion.div
              className={overviewStyles.bottomArea}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <div className={overviewStyles.bottomRule} />
              <p className={overviewStyles.firmStamp}>AR&amp;CO — Trusted Legal Partners</p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
