import { ContentType } from '@repo/shared'
import type { ContentPostResponse, CategoryResponse, PaginatedContentPostsResponse } from '@repo/shared'
import BlogsClient from './blogs-client'
import { buildInternalApiUrl } from '@/lib/server-api-url'

interface FetchResult<T> {
  data: T
  hasError: boolean
}

function createRequestId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Server-side fetch for published content posts.
 *
 * @example
 * ```typescript
 * const blogs = await fetchPublishedPosts(ContentType.BLOG)
 * ```
 */
async function fetchPublishedPosts(contentType: string): Promise<FetchResult<ContentPostResponse[]>> {
  const requestId = createRequestId('blogs-list')
  const url = buildInternalApiUrl(`/api/content/posts?${new URLSearchParams({ contentType, limit: '50' }).toString()}`)

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      console.error('Failed to fetch published content posts', {
        requestId,
        contentType,
        url,
        status: res.status,
      })
      return { data: [], hasError: true }
    }

    const data = (await res.json()) as PaginatedContentPostsResponse
    return { data: data.data, hasError: false }
  } catch (error) {
    console.error('Error fetching published content posts', {
      requestId,
      contentType,
      url,
      error,
    })
    return { data: [], hasError: true }
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
async function fetchCategories(): Promise<FetchResult<CategoryResponse[]>> {
  const requestId = createRequestId('blogs-categories')
  const url = buildInternalApiUrl('/api/content/categories')

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      console.error('Failed to fetch content categories', {
        requestId,
        url,
        status: res.status,
      })
      return { data: [], hasError: true }
    }

    return {
      data: (await res.json()) as CategoryResponse[],
      hasError: false,
    }
  } catch (error) {
    console.error('Error fetching content categories', {
      requestId,
      url,
      error,
    })
    return { data: [], hasError: true }
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
  const [blogPostsResult, caseStudiesResult, categoriesResult] = await Promise.all([
    fetchPublishedPosts(ContentType.BLOG),
    fetchPublishedPosts(ContentType.CASE_STUDY),
    fetchCategories(),
  ])

  const hasFetchError =
    blogPostsResult.hasError ||
    caseStudiesResult.hasError ||
    categoriesResult.hasError

  return (
    <BlogsClient
      blogPosts={blogPostsResult.data}
      caseStudies={caseStudiesResult.data}
      categories={categoriesResult.data}
      hasFetchError={hasFetchError}
    />
  )
}
