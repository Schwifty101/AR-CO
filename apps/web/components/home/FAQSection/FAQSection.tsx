'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import TextReveal from '@/components/shared/animations/TextReveal'
import styles from './FAQSection.module.css'

interface FAQ {
  question: string
  answer: string
}

const FAQS: FAQ[] = [
  {
    question: 'What areas of law does AR&CO specialise in?',
    answer:
      'AR&CO Law Associates specialises in corporate law, litigation and dispute resolution, intellectual property, energy and petroleum law, tax law, immigration law, real estate, and regulatory compliance. We serve individuals, businesses, and institutions across Pakistan.',
  },
  {
    question: 'Is AR&CO Law Associates based in Islamabad?',
    answer:
      'Yes, AR&CO Law Associates is headquartered in Islamabad, Pakistan. We serve clients across Pakistan including Rawalpindi, Lahore, and Karachi, and handle matters before courts and tribunals nationwide.',
  },
  {
    question: 'How do I book a legal consultation?',
    answer:
      'You can book a consultation by calling +92 51 2252144, sending a WhatsApp message to +92 306 0599916, emailing info@arco.law, or using the consultation form on our website. We respond within one business day.',
  },
  {
    question: 'Does AR&CO handle corporate and business legal matters?',
    answer:
      'Yes. Our corporate practice covers company incorporation, SECP compliance and registration, contract drafting and negotiation, mergers and acquisitions, joint ventures, shareholders agreements, and ongoing corporate advisory for businesses of all sizes.',
  },
  {
    question: 'Does AR&CO provide SECP registration and company incorporation services?',
    answer:
      'Yes. Our facilitation centre provides end-to-end services for SECP registration, NTN registration, company incorporation, trademark and patent registration, and other regulatory compliance requirements through a dedicated facilitation team.',
  },
  {
    question: 'Can AR&CO assist overseas Pakistanis with legal matters?',
    answer:
      'Yes, our Overseas Desk provides dedicated legal support to Pakistanis living abroad. Services include property verification, power of attorney, inheritance matters, and cross-border legal assistance handled by experienced attorneys.',
  },
]

/**
 * Accordion FAQ section for the homepage.
 * Content stays in the DOM (Framer Motion animated height) so Google reads all answers.
 *
 * @example
 * <FAQSection />
 */
export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className={styles.section} aria-label='Frequently asked questions'>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8 }}
      >
        {/* ── Header ── */}
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.eyebrow}>Common Questions</span>
          <TextReveal delay={80} duration={1.1}>
            <h2 className={styles.heading}>
              Frequently Asked <em>Questions</em>
            </h2>
          </TextReveal>
        </motion.header>

        {/* ── Accordion list ── */}
        <dl className={styles.list}>
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              className={`${styles.item} ${openIndex === i ? styles.itemOpen : ''}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <dt>
                <button
                  className={styles.question}
                  onClick={() => toggle(i)}
                  aria-expanded={openIndex === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span className={styles.questionNumber}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.questionText}>{faq.question}</span>
                  <span className={styles.icon} aria-hidden='true'>
                    {openIndex === i ? '−' : '+'}
                  </span>
                </button>
              </dt>

              {/* Answer stays in DOM — height animated so Google can always read it */}
              <motion.dd
                id={`faq-answer-${i}`}
                className={styles.answer}
                initial={false}
                animate={{
                  height: openIndex === i ? 'auto' : 0,
                  opacity: openIndex === i ? 1 : 0,
                }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <p className={styles.answerText}>{faq.answer}</p>
              </motion.dd>
            </motion.div>
          ))}
        </dl>
      </motion.div>
    </section>
  )
}
