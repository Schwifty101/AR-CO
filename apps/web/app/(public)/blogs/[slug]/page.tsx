import type { Metadata } from 'next'
import type { ContentPostResponse } from '@repo/shared'
import BlogPostContent from './blog-post-content'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

const API_BASE = process.env.API_BACKEND_URL || 'http://localhost:4000'

/**
 * Server-side fetch for blog post metadata.
 * Returns null if post not found.
 */
async function fetchPostBySlug(slug: string): Promise<ContentPostResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/content/posts/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return (await res.json()) as ContentPostResponse
  } catch {
    return null
  }
}

/**
 * Generate SEO metadata for blog post pages.
 * Fetches post data server-side to populate title, description, and OG tags.
 *
 * @example
 * ```
 * // Generates metadata like:
 * // <title>Post Title | AR&CO Law</title>
 * // <meta property="og:type" content="article" />
 * ```
 */
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found | AR&CO Law',
      description: 'The requested blog post could not be found.',
    }
  }

  const title = post.metaTitle || `${post.title} | AR&CO Law`
  const description = post.metaDescription || post.excerpt || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      authors: post.authorName ? [post.authorName] : undefined,
      ...(post.featuredImage && { images: [{ url: post.featuredImage }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(post.featuredImage && { images: [post.featuredImage] }),
    },
  }
}

/**
 * Blog post detail page (server component wrapper).
 * Provides SEO metadata via generateMetadata, JSON-LD structured data,
 * and renders the client component for interactive content.
 *
 * @example
 * ```
 * // Accessible at /blogs/personal-injury-claims-guide
 * ```
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.metaDescription || post.excerpt || '',
        author: {
          '@type': 'Person',
          name: post.authorName || 'AR&CO',
        },
        publisher: {
          '@type': 'Organization',
          name: 'AR&CO Law',
        },
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        ...(post.featuredImage && { image: post.featuredImage }),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogPostContent slug={slug} />
    </>
  )
}
