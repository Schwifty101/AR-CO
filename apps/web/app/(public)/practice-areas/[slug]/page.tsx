import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { practiceAreas } from '../practiceAreasData'
import PracticeAreaContent from './PracticeAreaContent'

const SITE_URL = 'https://arandcolaw.com'

interface PracticeAreaPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Pre-generate all practice area pages at build time.
 * Ensures static rendering + full SEO indexability for each slug.
 */
export function generateStaticParams() {
  return practiceAreas.map((area) => ({ slug: area.slug }))
}

/**
 * Per-slug SEO metadata for practice area pages.
 * Each page gets a unique title, description, canonical URL, and OG tags
 * derived from the practice area data — no more generic fallback titles.
 */
export async function generateMetadata({ params }: PracticeAreaPageProps): Promise<Metadata> {
  const { slug } = await params
  const area = practiceAreas.find((pa) => pa.slug === slug)

  if (!area) {
    return { title: 'Practice Area Not Found | AR&CO Law Associates' }
  }

  const title = `${area.title} — Law Firm in Islamabad | AR&CO Law Associates`
  const description =
    area.overview.length > 155 ? `${area.overview.slice(0, 152)}...` : area.overview
  const pageUrl = `${SITE_URL}/practice-areas/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      siteName: 'AR&CO Law Associates',
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${area.title} — AR&CO Law Associates`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

/**
 * Practice area detail page — server component.
 * Handles metadata, LegalService JSON-LD, and delegates rendering
 * to PracticeAreaContent (client component) for animations.
 */
export default async function PracticeAreaPage({ params }: PracticeAreaPageProps) {
  const { slug } = await params
  const area = practiceAreas.find((pa) => pa.slug === slug)

  if (!area) notFound()

  const legalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    '@id': `${SITE_URL}/practice-areas/${slug}/#legal-service`,
    name: `${area.title} — AR&CO Law Associates`,
    url: `${SITE_URL}/practice-areas/${slug}`,
    description: area.overview,
    areaServed: 'Pakistan',
    serviceType: area.title,
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legalServiceSchema) }}
      />
      <PracticeAreaContent area={area} />
    </>
  )
}
