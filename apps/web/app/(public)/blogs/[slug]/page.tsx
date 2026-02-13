'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { blogPosts } from '@/components/data/blogData'
import styles from './page.module.css'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Format an ISO date string into a human-readable form.
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Stagger entrance variants */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
}

/**
 * Individual blog post page.
 * Finds the post by slug and renders full article content.
 */
export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params)
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <div className={styles.page}>
      {/* ── Back link ── */}
      <div className={styles.backRow}>
        <Link href="/blogs" className={styles.backLink}>
          <ArrowLeft className={styles.backIcon} />
          <span>All Articles</span>
        </Link>
      </div>

      {/* ── Article Header ── */}
      <motion.header
        className={styles.header}
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <motion.span className={styles.category} variants={fadeUp}>
          {post.category}
        </motion.span>

        <motion.h1 className={styles.title} variants={fadeUp}>
          {post.title}
        </motion.h1>

        <motion.div className={styles.meta} variants={fadeUp}>
          <span className={styles.metaItem}>
            <User className={styles.metaIcon} />
            {post.author}
          </span>
          <span className={styles.metaDivider} />
          <span className={styles.metaItem}>
            <Calendar className={styles.metaIcon} />
            {formatDate(post.date)}
          </span>
          <span className={styles.metaDivider} />
          <span className={styles.metaItem}>
            <Clock className={styles.metaIcon} />
            {post.readTime}
          </span>
        </motion.div>

        {/* Gold horizontal rule */}
        <motion.div className={styles.headerRule} variants={fadeUp} />
      </motion.header>

      {/* ── Article Body ── */}
      <motion.article
        className={styles.body}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        variants={stagger}
      >
        {post.content && post.content.length > 0 ? (
          post.content.map((paragraph, idx) => (
            <motion.p key={idx} className={styles.paragraph} variants={fadeUp}>
              {paragraph}
            </motion.p>
          ))
        ) : (
          <motion.p className={styles.paragraph} variants={fadeUp}>
            {post.excerpt}
          </motion.p>
        )}
      </motion.article>

      {/* ── Footer CTA ── */}
      <div className={styles.articleFooter}>
        <div className={styles.footerRule} />
        <div className={styles.footerContent}>
          <div className={styles.authorCard}>
            <span className={styles.authorCardLabel}>Written by</span>
            <span className={styles.authorCardName}>{post.author}</span>
            <span className={styles.authorCardRole}>{post.authorRole}</span>
          </div>
          <Link href="/blogs" className={styles.footerLink}>
            <ArrowLeft className={styles.footerLinkIcon} />
            Back to all articles
          </Link>
        </div>
      </div>
    </div>
  )
}
