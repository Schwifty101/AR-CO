'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, CalendarCheck } from 'lucide-react'
import { useConsultationOverlay } from '@/components/consultation'
import { trackCTAClick } from '@/lib/analytics'
import styles from './ConsultationCTA.module.css'

/**
 * Full-width conversion section — repeatable in the homepage flow.
 * Drives call/WhatsApp/consult CTA clicks and fires analytics events.
 *
 * @example
 * <ConsultationCTA />
 */
export default function ConsultationCTA() {
  const { openOverlay } = useConsultationOverlay()

  return (
    <section className={styles.section} aria-label='Book a legal consultation'>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top rule */}
        <div className={styles.rule} aria-hidden='true' />

        <span className={styles.eyebrow}>Legal Consultation</span>

        <h2 className={styles.heading}>
          Get Expert Legal Advice —{' '}
          <em>Book a Consultation</em> Today
        </h2>

        <p className={styles.subtext}>
          Trusted by individuals and businesses across Pakistan. Our Islamabad-based
          team is ready to assist you with any legal matter.
        </p>

        <div className={styles.ctaRow}>
          <motion.button
            className={styles.primaryCta}
            onClick={() => {
              openOverlay()
              trackCTAClick('consult', 'cta-section')
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <CalendarCheck className={styles.ctaIcon} aria-hidden='true' />
            <span>Book Consultation</span>
          </motion.button>

          <a
            href='tel:+925122521444'
            className={styles.secondaryCta}
            onClick={() => trackCTAClick('call', 'cta-section')}
            aria-label='Call AR&CO: +92 51 2252144'
          >
            <Phone className={styles.ctaIcon} aria-hidden='true' />
            <span>+92 51 2252144</span>
          </a>

          <a
            href='https://wa.me/923060599916'
            target='_blank'
            rel='noopener noreferrer'
            className={styles.secondaryCta}
            onClick={() => trackCTAClick('whatsapp', 'cta-section')}
            aria-label='WhatsApp AR&CO'
          >
            <MessageCircle className={styles.ctaIcon} aria-hidden='true' />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Static crawlable link to /team — always in DOM for Google */}
        <Link href='/team' className={styles.teamLink}>
          Meet our legal team →
        </Link>

        {/* Bottom rule */}
        <div className={styles.rule} aria-hidden='true' />
      </motion.div>
    </section>
  )
}
