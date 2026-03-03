'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Shield, Scale, FileText, Users, Building2, CheckCircle2 } from 'lucide-react'
import styles from './complaint.module.css'
import { useAuth } from '@/lib/auth/use-auth'
import { getMySubscription } from '@/lib/api/subscriptions'

const INSTITUTIONS = [
  { code: 'CDA', name: 'Capital Development Authority' },
  { code: 'HEC', name: 'Higher Education Commission' },
  { code: 'NADRA', name: 'Nat. Database & Registration Authority' },
  { code: 'PEMRA', name: 'Pakistan Electronic Media Regulator' },
  { code: 'FBR', name: 'Federal Board of Revenue' },
  { code: 'SECP', name: 'Securities & Exchange Commission' },
  { code: 'PTA', name: 'Pakistan Telecom Authority' },
  { code: 'OGRA', name: 'Oil & Gas Regulatory Authority' },
  { code: 'NEPRA', name: 'National Electric Power Regulatory' },
  { code: 'PESCO', name: 'Electricity Distribution Companies' },
  { code: 'SBP', name: 'State Bank of Pakistan' },
  { code: 'PPRA', name: 'Public Procurement Regulatory Authority' },
]

const SERVICES = [
  {
    icon: Scale,
    title: 'Regulatory Challenges',
    description:
      'Contest unlawful decisions, fines, or penalties imposed by federal and provincial regulators.',
  },
  {
    icon: Shield,
    title: 'Rights Violations',
    description:
      'Address denial of services, discrimination, or harassment by public-sector institutions.',
  },
  {
    icon: FileText,
    title: 'Formal Legal Complaints',
    description:
      'Draft and file formal representations, writ petitions, and constitutional challenges.',
  },
  {
    icon: Building2,
    title: 'Government Disputes',
    description:
      'Resolve contractor disputes, land acquisition conflicts, and unlawful tax assessments.',
  },
  {
    icon: Users,
    title: 'Consumer Protection',
    description:
      'Pursue redress against regulated utility providers and government monopolies.',
  },
  {
    icon: CheckCircle2,
    title: 'University & Education',
    description:
      'Challenge disciplinary actions, degree attestation refusals, and HEC non-recognition.',
  },
]

const PROCESS = [
  {
    step: '01',
    title: 'Initial Consultation',
    description: 'We assess your situation, the institution involved, and the strength of your legal grounds.',
  },
  {
    step: '02',
    title: 'Case Evaluation',
    description: 'Our team identifies the applicable law, precedents, and the most effective legal avenue.',
  },
  {
    step: '03',
    title: 'Complaint Preparation',
    description: 'We draft a thorough, well-evidenced formal complaint or petition on your behalf.',
  },
  {
    step: '04',
    title: 'Filing & Representation',
    description: 'We file before the competent authority and represent you throughout the process.',
  },
  {
    step: '05',
    title: 'Resolution & Follow-up',
    description: 'We pursue resolution, escalate if needed, and keep you informed at every stage.',
  },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

export default function ComplaintSectionPage() {
  const { user, isLoading } = useAuth()
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      setHasSubscription(false)
      return
    }
    getMySubscription()
      .then(sub => setHasSubscription(sub?.status === 'active'))
      .catch(() => setHasSubscription(false))
  }, [user, isLoading])

  const ctaHref = hasSubscription ? '/complaint-section/form' : '/subscribe'

  return (
    <main className={styles.main}>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Premium Legal Service
          </motion.span>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            Hold Institutions
            <br />
            <em>Accountable.</em>
          </motion.h1>

          <motion.p
            className={styles.heroSub}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            AR&CO represents clients in formal legal complaints against government
            regulators and public institutions — from unlawful rulings to denial
            of rights. We translate your grievance into enforceable legal action.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className={styles.heroCtas}
          >
            <Link href={ctaHref} className={styles.ctaPrimary}>
              <span>File a Complaint</span>
              <ArrowUpRight className={styles.ctaIcon} />
            </Link>
            <span className={styles.ctaNote}>Premium clients · Priority access</span>
          </motion.div>
        </motion.div>

        {/* Decorative column labels */}
        <span className={styles.heroSideLabel}>Complaint Section</span>
      </section>

      {/* ── Divider ───────────────────────────────────────────── */}
      <motion.div
        className={styles.fullRule}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
      />

      {/* ── Institutions Grid ─────────────────────────────────── */}
      <section className={styles.institutionsSection}>
        <motion.header
          className={styles.sectionHeader}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionEyebrow}>Who We Handle</span>
          <h2 className={styles.sectionTitle}>
            Complaints Against <em>Any</em> Institution
          </h2>
          <p className={styles.sectionSub}>
            We have successfully challenged decisions made by the following authorities,
            and more.
          </p>
        </motion.header>

        <motion.div
          className={styles.institutionsGrid}
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {INSTITUTIONS.map((inst) => (
            <motion.div key={inst.code} className={styles.institutionCard} variants={fadeUp}>
              <span className={styles.instCode}>{inst.code}</span>
              <span className={styles.instName}>{inst.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Services ──────────────────────────────────────────── */}
      <section className={styles.servicesSection}>
        <motion.div
          className={styles.fullRule}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />

        <motion.header
          className={styles.sectionHeader}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionEyebrow}>What We Do</span>
          <h2 className={styles.sectionTitle}>
            Every Form of <em>Legal Redress</em>
          </h2>
        </motion.header>

        <motion.div
          className={styles.servicesGrid}
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {SERVICES.map((svc) => {
            const Icon = svc.icon
            return (
              <motion.div key={svc.title} className={styles.serviceCard} variants={fadeUp}>
                <div className={styles.serviceIconWrap}>
                  <Icon className={styles.serviceIcon} />
                </div>
                <h3 className={styles.serviceCardTitle}>{svc.title}</h3>
                <p className={styles.serviceCardDesc}>{svc.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ── Process ───────────────────────────────────────────── */}
      <section className={styles.processSection}>
        <motion.div
          className={styles.fullRule}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />

        <motion.header
          className={styles.sectionHeader}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionEyebrow}>How It Works</span>
          <h2 className={styles.sectionTitle}>
            Our <em>Process</em>
          </h2>
        </motion.header>

        <motion.ol
          className={styles.processList}
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {PROCESS.map((item) => (
            <motion.li key={item.step} className={styles.processItem} variants={fadeUp}>
              <span className={styles.processStep}>{item.step}</span>
              <div className={styles.processContent}>
                <h3 className={styles.processTitle}>{item.title}</h3>
                <p className={styles.processDesc}>{item.description}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <motion.div
          className={styles.fullRule}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />

        <motion.div
          className={styles.ctaBanner}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.ctaBannerText}>
            <span className={styles.ctaBannerEyebrow}>Premium Access Required</span>
            <h2 className={styles.ctaBannerTitle}>
              Ready to file your <em>complaint?</em>
            </h2>
            <p className={styles.ctaBannerSub}>
              The Complaint Section is available to AR&CO premium subscribers. Subscribe
              to gain immediate access to our legal complaint team and begin your case.
            </p>
          </div>

          <div className={styles.ctaBannerActions}>
            <Link href={ctaHref} className={styles.ctaPrimary}>
              <span>{hasSubscription ? 'File a Complaint' : 'Subscribe — Get Access'}</span>
              <ArrowUpRight className={styles.ctaIcon} />
            </Link>
            <p className={styles.ctaBannerDisclaimer}>
              All subscriptions include a free initial consultation
            </p>
          </div>
        </motion.div>

        <motion.div
          className={styles.fullRule}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />
      </section>
    </main>
  )
}
