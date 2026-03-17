'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import TextReveal from '@/components/shared/animations/TextReveal'
import { getPublishedPosts } from '@/lib/api/content'
import type { ContentPostResponse } from '@repo/shared'
import { ContentType } from '@repo/shared'
import styles from './AboutSection.module.css'

export default function AboutSection() {
  const [blogs, setBlogs] = useState<ContentPostResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await getPublishedPosts({
          limit: 20,
          contentType: ContentType.BLOG,
        })

        // Filter blogs by Barrister Shaoib Razzaq
        const shoaibBlogs = res.posts.filter((post) =>
          post.authorName?.toLowerCase().includes('shoaib razzaq') ||
          post.authorName?.toLowerCase().includes('shoaib') ||
          post.authorName?.toLowerCase().includes('shaoib razzaq') ||
          post.authorName?.toLowerCase().includes('shaoib')
        )

        setBlogs(shoaibBlogs.slice(0, 3))
      } catch (error) {
        console.error('Failed to fetch blogs for About section:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <section id="about" className={styles.aboutSection}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerBlock}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={styles.sectionEyebrow}
          >
            Principal Attorney
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className={styles.headerDivider}
          />
        </div>

        <div className={styles.gridContainer}>
          {/* Box 1: Editorial Bio */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className={styles.bioContainer}
          >
            <TextReveal duration={1.2} delay={150}>
              <h3 className={styles.statement}>
                Relentless Advocacy.<br />
                Masterful Strategy.
                <span className={styles.highlight}>Barrister Shaoib Razzaq.</span>
              </h3>
            </TextReveal>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.8 }}
              className={styles.subStatement}
            >
              As the lead visionary, Barrister Shaoib Razzaq brings a commanding presence and uncompromising precision to high-stakes litigation, corporate advisory, and complex regulatory matters. His fearless approach secures decisive victories across multiple jurisdictions.
            </motion.p>
          </motion.div>

          {/* Box 2: Cinematic Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className={styles.pictureFrame}
          >
            <div className={styles.imageWrapper}>
              <Image
                src="/our_team/Shoaib_Razaq.webp"
                alt="Barrister Shaoib Razzaq"
                fill
                className={styles.profileImage}
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
            <div className={styles.pictureCaption}>
              <h3 className={styles.pictureName}>Barrister Shaoib Razzaq</h3>
              <p className={styles.pictureTitle}>Principal Attorney</p>
            </div>
          </motion.div>

          {/* Box 3: Insights Feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className={styles.insightsContainer}
          >
            <div className={styles.insightsHeader}>
              <h3 className={styles.insightsTitle}>Recent Insights</h3>
              <Link href="/blogs" className={styles.viewAllLink}>
                View Journal <ArrowUpRight className={styles.linkIcon} />
              </Link>
            </div>

            <div className={styles.blogsList}>
              {loading ? (
                <div className={styles.loadingPlaceholder}>Curating insights...</div>
              ) : blogs.length > 0 ? (
                blogs.map((post) => (
                  <Link key={post.id} href={`/blogs/${post.slug}`} className={styles.blogItem}>
                    <article className={styles.blogArticle}>
                      <span className={styles.blogDate}>{formatDate(post.publishedAt || post.createdAt)}</span>
                      <h4 className={styles.blogTitle}>{post.title}</h4>
                    </article>
                    <div className={styles.blogHoverLine} />
                  </Link>
                ))
              ) : (
                <div className={styles.loadingPlaceholder}>No recent insights available.</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
