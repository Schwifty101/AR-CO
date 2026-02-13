'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight, Clock, Calendar, ChevronRight, Scale, Filter } from 'lucide-react'
import { blogPosts, blogCategories } from '@/components/data/blogData'
import type { BlogPost } from '@/components/data/blogData'
import { caseStudies, caseStudyAreas } from '@/components/data/caseStudyData'
import type { CaseStudy } from '@/components/data/caseStudyData'
import styles from './page.module.css'

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
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
}

// ─── Active Tab Type ───
type ActiveTab = 'insights' | 'case-studies'

export default function BlogsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('insights')
  const [blogFilter, setBlogFilter] = useState<string>('All')
  const [caseFilter, setCaseFilter] = useState<string>('All')

  // Filtered data
  const filteredBlogs = useMemo(
    () =>
      blogFilter === 'All'
        ? blogPosts
        : blogPosts.filter((p) => p.category === blogFilter),
    [blogFilter]
  )

  const filteredCases = useMemo(
    () =>
      caseFilter === 'All'
        ? caseStudies
        : caseStudies.filter((c) => c.practiceArea === caseFilter),
    [caseFilter]
  )

  const featuredPosts = blogPosts.filter((p) => p.featured)

  return (
    <div className={styles.page}>
      {/* ═══════════════════════════════════════════
          Hero
          ═══════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroGrain} />
        <div className={styles.heroGlow} />

        {/* Vertical accent line */}
        <div className={styles.heroVerticalLine} />

        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroContent}
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.span className={styles.heroEyebrow} variants={fadeUp}>
              Knowledge &amp; Experience
            </motion.span>

            <motion.h1 className={styles.heroTitle} variants={fadeUp}>
              Insights <em>&amp;</em> Case Studies
            </motion.h1>

            <motion.p className={styles.heroSubtitle} variants={fadeUp}>
              Legal analysis, thought leadership, and landmark outcomes from the
              practice of AR&amp;CO.
            </motion.p>
          </motion.div>

          {/* Tab switcher */}
          <motion.div
            className={styles.tabBar}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <button
              className={`${styles.tab} ${activeTab === 'insights' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              <span>Insights &amp; Articles</span>
              <span className={styles.tabCount}>{blogPosts.length}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'case-studies' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('case-studies')}
            >
              <span>Case Studies</span>
              <span className={styles.tabCount}>{caseStudies.length}</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          Content Area
          ═══════════════════════════════════════════ */}
      <section className={styles.content}>
        <AnimatePresence mode="wait">
          {activeTab === 'insights' ? (
            <InsightsSection
              key="insights"
              featured={featuredPosts}
              posts={filteredBlogs}
              categories={blogCategories}
              activeFilter={blogFilter}
              onFilter={setBlogFilter}
            />
          ) : (
            <CaseStudiesSection
              key="case-studies"
              studies={filteredCases}
              areas={caseStudyAreas}
              activeFilter={caseFilter}
              onFilter={setCaseFilter}
            />
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Insights / Blog Section
   ═══════════════════════════════════════════════════ */

interface InsightsProps {
  featured: BlogPost[]
  posts: BlogPost[]
  categories: string[]
  activeFilter: string
  onFilter: (cat: string) => void
}

function InsightsSection({
  featured,
  posts,
  categories,
  activeFilter,
  onFilter,
}: InsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={styles.sectionWrap}
    >
      {/* Featured row */}
      {featured.length > 0 && (
        <div className={styles.featuredRow}>
          <span className={styles.sectionEyebrow}>Featured</span>
          <div className={styles.featuredGrid}>
            {featured.map((post, idx) => (
              <Link
                key={post.id}
                href={`/blogs/${post.slug}`}
                className={styles.featuredLink}
              >
                <motion.article
                  className={styles.featuredCard}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {/* Colour band */}
                  <div className={styles.featuredBand} />

                  <div className={styles.featuredBody}>
                    <span className={styles.postCategory}>{post.category}</span>
                    <h3 className={styles.featuredTitle}>{post.title}</h3>
                    <p className={styles.featuredExcerpt}>{post.excerpt}</p>

                    <div className={styles.postMeta}>
                      <span className={styles.metaItem}>
                        <Calendar className={styles.metaIcon} />
                        {formatDate(post.date)}
                      </span>
                      <span className={styles.metaItem}>
                        <Clock className={styles.metaIcon} />
                        {post.readTime}
                      </span>
                    </div>

                    <div className={styles.postAuthorRow}>
                      <span className={styles.authorName}>{post.author}</span>
                      <span className={styles.authorRole}>{post.authorRole}</span>
                    </div>
                  </div>

                  <span className={styles.cardArrow}>
                    <ArrowUpRight />
                  </span>
                </motion.article>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div className={styles.filterBar}>
        <Filter className={styles.filterIcon} />
        <button
          className={`${styles.pill} ${activeFilter === 'All' ? styles.pillActive : ''}`}
          onClick={() => onFilter('All')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.pill} ${activeFilter === cat ? styles.pillActive : ''}`}
            onClick={() => onFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog list — editorial rows */}
      <motion.div
        className={styles.blogList}
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blogs/${post.slug}`}
            className={styles.blogRowLink}
          >
            <motion.article
              className={styles.blogRow}
              variants={fadeUp}
            >
              <span className={styles.blogRowDate}>
                {formatDate(post.date)}
              </span>

              <div className={styles.blogRowBody}>
                <span className={styles.postCategory}>{post.category}</span>
                <h3 className={styles.blogRowTitle}>{post.title}</h3>
                <p className={styles.blogRowExcerpt}>{post.excerpt}</p>
                <div className={styles.postMeta}>
                  <span className={styles.metaItem}>
                    <Clock className={styles.metaIcon} />
                    {post.readTime}
                  </span>
                  <span className={styles.authorNameSmall}>
                    {post.author}
                  </span>
                </div>
              </div>

              <span className={styles.blogRowArrow}>
                <ChevronRight />
              </span>
            </motion.article>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   Case Studies Section
   ═══════════════════════════════════════════════════ */
interface CaseStudiesProps {
  studies: CaseStudy[]
  areas: string[]
  activeFilter: string
  onFilter: (area: string) => void
}

function CaseStudiesSection({
  studies,
  areas,
  activeFilter,
  onFilter,
}: CaseStudiesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={styles.sectionWrap}
    >
      {/* Filter pills */}
      <div className={styles.filterBar}>
        <Scale className={styles.filterIcon} />
        <button
          className={`${styles.pill} ${activeFilter === 'All' ? styles.pillActive : ''}`}
          onClick={() => onFilter('All')}
        >
          All
        </button>
        {areas.map((area) => (
          <button
            key={area}
            className={`${styles.pill} ${activeFilter === area ? styles.pillActive : ''}`}
            onClick={() => onFilter(area)}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Case study accordion rows */}
      <motion.div
        className={styles.caseList}
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {studies.map((study) => {
          const isOpen = expandedId === study.id
          return (
            <motion.article
              key={study.id}
              className={`${styles.caseRow} ${isOpen ? styles.caseRowOpen : ''}`}
              variants={fadeUp}
            >
              {/* Header — clickable */}
              <div
                className={styles.caseHeader}
                onClick={() => setExpandedId(isOpen ? null : study.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setExpandedId(isOpen ? null : study.id)
                  }
                }}
              >
                <span className={styles.caseYear}>{study.year}</span>

                <div className={styles.caseTitleGroup}>
                  <h3 className={styles.caseTitle}>{study.title}</h3>
                  <span className={styles.caseArea}>{study.practiceArea}</span>
                </div>

                <span className={`${styles.caseToggle} ${isOpen ? styles.caseToggleOpen : ''}`}>
                  <ChevronRight />
                </span>
              </div>

              {/* Expanded detail */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className={styles.caseDetail}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
                      opacity: { duration: 0.3, delay: 0.08 },
                    }}
                  >
                    <div className={styles.caseDetailInner}>
                      {/* Meta row */}
                      <div className={styles.caseMetaRow}>
                        <div className={styles.caseMeta}>
                          <span className={styles.caseMetaLabel}>Client</span>
                          <span className={styles.caseMetaValue}>{study.client}</span>
                        </div>
                        <div className={styles.caseMeta}>
                          <span className={styles.caseMetaLabel}>Duration</span>
                          <span className={styles.caseMetaValue}>{study.duration}</span>
                        </div>
                        <div className={styles.caseMeta}>
                          <span className={styles.caseMetaLabel}>Practice Area</span>
                          <span className={styles.caseMetaValue}>{study.practiceArea}</span>
                        </div>
                      </div>

                      {/* Summary & Outcome */}
                      <div className={styles.caseCols}>
                        <div>
                          <h4 className={styles.caseSubhead}>Background</h4>
                          <p className={styles.caseParagraph}>{study.summary}</p>
                        </div>
                        <div>
                          <h4 className={styles.caseSubhead}>Outcome</h4>
                          <p className={styles.caseParagraph}>{study.outcome}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className={styles.caseTags}>
                        {study.tags.map((tag) => (
                          <span key={tag} className={styles.caseTag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          )
        })}
      </motion.div>
    </motion.div>
  )
}