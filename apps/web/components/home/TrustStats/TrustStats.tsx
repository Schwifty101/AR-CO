'use client'

import { motion } from 'framer-motion'
import styles from './TrustStats.module.css'

const STATS = [
  { value: '25+', label: 'Years of Legal Excellence', detail: 'Serving clients since 1999' },
  { value: '15', label: 'Practice Areas', detail: 'From IP to energy law' },
  { value: '500+', label: 'Cases Resolved', detail: 'Across courts and tribunals' },
  { value: 'Pan-Pakistan', label: 'Legal Reach', detail: 'Islamabad, Lahore & beyond' },
]

/**
 * Trust signals strip — appears between Hero and AboutSection.
 * Provides credential + authority signals for commercial search intent.
 *
 * @example
 * <TrustStats />
 */
export default function TrustStats() {
  return (
    <section className={styles.section} aria-label='Firm credentials and reach'>
      <div className={styles.inner}>
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={styles.item}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
            <span className={styles.detail}>{stat.detail}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
