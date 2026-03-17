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
            Who is Barrister Shaoib Razzaq
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
          {/* Picture Box */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
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

          {/* Blogs */}
          {!loading ? (
            <>
              {blogs[0] && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className={`${styles.blogCard} ${styles.blog1}`}
                >
                  <Link href={`/blogs/${blogs[0].slug}`} className={styles.blogLink}>
                    <div className={styles.blogMeta}>
                      <span className={styles.blogDate}>{formatDate(blogs[0].publishedAt || blogs[0].createdAt)}</span>
                      <ArrowUpRight className={styles.blogIcon} />
                    </div>
                    <div className={styles.blogContentBottom}>
                      <span className={styles.blogEyebrow}>Recent Insights</span>
                      <h4 className={styles.blogTitle}>{blogs[0].title}</h4>
                    </div>
                  </Link>
                  <div className={styles.blogHoverLine} />
                </motion.div>
              )}

              {blogs[1] && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className={`${styles.blogCard} ${styles.blog2}`}
                >
                  <Link href={`/blogs/${blogs[1].slug}`} className={styles.blogLink}>
                    <div className={styles.blogMeta}>
                      <span className={styles.blogDate}>{formatDate(blogs[1].publishedAt || blogs[1].createdAt)}</span>
                      <ArrowUpRight className={styles.blogIcon} />
                    </div>
                    <div className={styles.blogContentBottom}>
                      <span className={styles.blogEyebrow}>Recent Insights</span>
                      <h4 className={styles.blogTitle}>{blogs[1].title}</h4>
                    </div>
                  </Link>
                  <div className={styles.blogHoverLine} />
                </motion.div>
              )}

              {blogs[2] && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  className={`${styles.blogCard} ${styles.blog3}`}
                >
                  <Link href={`/blogs/${blogs[2].slug}`} className={styles.blogLink}>
                    <div className={styles.blogMeta}>
                      <span className={styles.blogDate}>{formatDate(blogs[2].publishedAt || blogs[2].createdAt)}</span>
                      <ArrowUpRight className={styles.blogIcon} />
                    </div>
                    <div className={styles.blogContentBottom}>
                      <h4 className={styles.blogTitleTall}>{blogs[2].title}</h4>
                      <div className={styles.blogAbstract}>Read full insight to discover more about our approach and legal victories.</div>
                    </div>
                  </Link>
                  <div className={styles.blogHoverLine} />
                </motion.div>
              )}
            </>
          ) : (
            <div className={styles.loadingPlaceholder}>Curating insights...</div>
          )}

          {/* Written Bio Box at Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className={styles.bioContainer}
          >
            <div className={styles.bioLeft}>
              <TextReveal duration={1.2} delay={150}>
                <h3 className={styles.statement}>
                  Relentless Advocacy.<br />
                  Masterful Strategy.
                  <span className={styles.highlight}>Barrister Shaoib Razzaq.</span>
                </h3>
              </TextReveal>
            </div>
            <div className={styles.bioRight}>
              <p className={styles.subStatement}>
                As the lead visionary, Barrister Shaoib Razzaq brings a commanding presence and uncompromising precision to high-stakes litigation, corporate advisory, and complex regulatory matters. His fearless approach secures decisive victories across multiple jurisdictions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
