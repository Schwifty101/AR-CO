import { ContentType } from '@repo/shared'
import type { ContentPostResponse, CategoryResponse, PaginatedContentPostsResponse } from '@repo/shared'
import BlogsClient from './blogs-client'
import { buildInternalApiUrl } from '@/lib/server-api-url'

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
    const res = await fetch(buildInternalApiUrl(`/api/content/posts?${params.toString()}`), {
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      console.error('Failed to fetch published content posts', {
        contentType,
        status: res.status,
      })
      return []
    }
    const data = (await res.json()) as PaginatedContentPostsResponse
    return data.data
  } catch (error) {
    console.error('Error fetching published content posts', {
      contentType,
      error,
    })
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
    const res = await fetch(buildInternalApiUrl('/api/content/categories'), {
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      console.error('Failed to fetch content categories', {
        status: res.status,
      })
      return []
    }
    return (await res.json()) as CategoryResponse[]
  } catch (error) {
    console.error('Error fetching content categories', { error })
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
