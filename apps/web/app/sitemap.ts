import type { MetadataRoute } from 'next'
import type { ContentPostResponse, PaginatedContentPostsResponse } from '@repo/shared'
import { practiceAreas } from '@/app/(public)/practice-areas/practiceAreasData'
import { facilitationServices } from '@/components/data/facilitationCenterData'
import { overseasServices } from '@/components/data/overseasServicesData'
import { womenDeskServices } from '@/components/data/womenDeskData'
import { regulatoryServices } from '@/components/data/regulatoryServiceData'
import { buildInternalApiUrl } from '@/lib/server-api-url'

const SITE_URL = 'https://arandcolaw.com'

const STATIC_PUBLIC_ROUTES = [
  '/',
  '/terms',
  '/privacy',
  '/team',
  '/blogs',
  '/complaint-section',
]

/**
 * Fetch published blog and case-study posts to include concrete post URLs.
 */
async function getPublishedBlogPostPaths(): Promise<string[]> {
  const query = new URLSearchParams({
    limit: '500',
  }).toString()
  const url = buildInternalApiUrl(`/api/content/posts?${query}`)

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as PaginatedContentPostsResponse | ContentPostResponse[]
    const posts = Array.isArray(payload) ? payload : payload.data

    return posts
      .map((post) => post.slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => `/blogs/${slug}`)
  } catch {
    return []
  }
}

/**
 * Convert service ids to public paths for each supported service category.
 */
function getServicePaths(): string[] {
  const paths: string[] = ['/services/facilitation/ip-services']

  facilitationServices.forEach((service) => {
    const base = `/services/facilitation/${service.id}`
    paths.push(base, `${base}/process`, `${base}/documents`, `${base}/faq`)
  })

  overseasServices.forEach((service) => {
    const base = `/services/overseas/${service.id}`
    paths.push(base, `${base}/process`, `${base}/faq`)
  })

  womenDeskServices.forEach((service) => {
    const base = `/services/women-desk/${service.id}`
    paths.push(base, `${base}/process`, `${base}/faq`)
  })

  regulatoryServices.forEach((service) => {
    const base = `/services/regulatory/${service.id}`
    paths.push(base, `${base}/process`, `${base}/faq`)
  })

  return paths
}

/**
 * Build the canonical sitemap for all public and indexable website URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPostPaths = await getPublishedBlogPostPaths()

  const allPaths = [
    ...STATIC_PUBLIC_ROUTES,
    ...practiceAreas.map((area) => `/practice-areas/${area.slug}`),
    ...getServicePaths(),
    ...blogPostPaths,
  ]

  const uniquePaths = Array.from(new Set(allPaths))

  return uniquePaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }))
}
