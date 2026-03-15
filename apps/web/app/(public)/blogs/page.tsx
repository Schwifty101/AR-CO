import { ContentType } from '@repo/shared'
import type { ContentPostResponse, CategoryResponse, PaginatedContentPostsResponse } from '@repo/shared'
import BlogsClient from './blogs-client'

const API_BASE = process.env.API_BACKEND_URL || 'http://localhost:4000'

/**
 * Server-side fetch for published content posts.
 *
 * @example
 * ```typescript
 * const blogs = await fetchPublishedPosts(ContentType.BLOG)
 * ```
 */
async function fetchPublishedPosts(contentType: string): Promise<ContentPostResponse[]> {
  try {
    const params = new URLSearchParams({ contentType, limit: '50' })
    const res = await fetch(`${API_BASE}/api/content/posts?${params.toString()}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as PaginatedContentPostsResponse
    return data.data
  } catch {
    return []
  }
}

/**
 * Server-side fetch for content categories.
 *
 * @example
 * ```typescript
 * const categories = await fetchCategories()
 * ```
 */
async function fetchCategories(): Promise<CategoryResponse[]> {
  try {
    const res = await fetch(`${API_BASE}/api/content/categories`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return (await res.json()) as CategoryResponse[]
  } catch {
    return []
  }
}

/**
 * Blog listing page (server component).
 * Fetches blog posts, case studies, and categories on the server
 * and passes them to the interactive client component.
 *
 * @example
 * ```
 * // Accessible at /blogs
 * ```
 */
export default async function BlogsPage() {
  const [blogPosts, caseStudies, categories] = await Promise.all([
    fetchPublishedPosts(ContentType.BLOG),
    fetchPublishedPosts(ContentType.CASE_STUDY),
    fetchCategories(),
  ])

  return (
    <BlogsClient
      blogPosts={blogPosts}
      caseStudies={caseStudies}
      categories={categories}
    />
  )
}
