'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'
import { motion } from 'framer-motion'
import { practiceAreas } from '../practiceAreasData'
import styles from './practiceArea.module.css'

interface PracticeAreaPageProps {
  params: Promise<{ slug: string }>
}

/** Stagger animation container */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

/** Stagger for list items with slightly longer delay */
const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
}

/** Fade-up animation variant */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
}

/** Fade-up for individual list/grid items */
const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export default function PracticeAreaPage({ params }: PracticeAreaPageProps) {
  const { slug } = use(params)
  const practiceArea = practiceAreas.find((pa) => pa.slug === slug)

  if (!practiceArea) {
    notFound()
  }

  return (
    <main className={styles.page}>
      {/* Atmospheric layers */}
      <div className={styles.grain} />
      <div className={styles.glow} />
      <div className={styles.verticalLine} />

      {/* Hero */}
      <motion.section
        className={styles.hero}
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <div className={styles.heroInner}>
          <motion.span className={styles.heroEyebrow} variants={fadeUp}>
            Practice Area
          </motion.span>
          <motion.h1 className={styles.heroTitle} variants={fadeUp}>
            {practiceArea.title}
          </motion.h1>
          <motion.p className={styles.heroSubtitle} variants={fadeUp}>
            {practiceArea.overview}
          </motion.p>
          <motion.div className={styles.heroDivider} variants={fadeUp} />
        </div>
      </motion.section>

      {/* Content */}
      <div className={styles.content}>
        {/* Description */}
        {practiceArea.description && (
          <motion.div
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.span className={styles.sectionEyebrow} variants={fadeUp}>
              Overview
            </motion.span>
            <motion.p className={styles.descriptionText} variants={fadeUp}>
              {practiceArea.description}
            </motion.p>
          </motion.div>
        )}

        {/* Services */}
        {practiceArea.services && practiceArea.services.length > 0 && (
          <motion.div
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.span className={styles.sectionEyebrow} variants={fadeUp}>
              Services & Expertise
            </motion.span>
            <motion.div
              className={styles.listGrid}
              variants={listStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              {practiceArea.services.map((service, index) => (
                <motion.div key={index} className={styles.listItem} variants={itemFadeUp}>
                  <span className={styles.listNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.listText}>{service}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Past Cases */}
        {practiceArea.pastCases && practiceArea.pastCases.length > 0 && (
          <motion.div
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.span className={styles.sectionEyebrow} variants={fadeUp}>
              Notable Cases & Client Work
            </motion.span>
            <motion.div
              className={styles.listGrid}
              variants={listStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              {practiceArea.pastCases.map((caseItem, index) => (
                <motion.div key={index} className={styles.listItem} variants={itemFadeUp}>
                  <span className={styles.listNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.listText}>{caseItem}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Client Portfolio */}
        {practiceArea.clientPortfolio && practiceArea.clientPortfolio.length > 0 && (
          <motion.div
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.span className={styles.sectionEyebrow} variants={fadeUp}>
              Client Portfolio
            </motion.span>
            <motion.div
              className={styles.tagGrid}
              variants={listStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              {practiceArea.clientPortfolio.map((client, index) => (
                <motion.span key={index} className={styles.tag} variants={itemFadeUp}>
                  {client}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Key Personnel */}
        {practiceArea.keyPersonnel && practiceArea.keyPersonnel.length > 0 && (
          <motion.div
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.span className={styles.sectionEyebrow} variants={fadeUp}>
              Key Personnel
            </motion.span>
            <motion.div
              className={styles.personnelList}
              variants={listStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              {practiceArea.keyPersonnel.map((person, index) => (
                <motion.div key={index} className={styles.personnelRow} variants={itemFadeUp}>
                  <div>
                    <h3 className={styles.personnelName}>{person.name}</h3>
                    <span className={styles.personnelRole}>{person.role}</span>
                  </div>
                  <p className={styles.personnelExpertise}>{person.expertise}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
