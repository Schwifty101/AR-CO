import type { Metadata } from 'next'
import HomePageClient from './HomePageClient'

const SITE_URL = 'https://arandcolaw.com'
const HOMEPAGE_URL = `${SITE_URL}/`

export const metadata: Metadata = {
  title: 'Law Firm in Islamabad, Pakistan | AR&CO Law Associates',
  description:
    'AR&CO Law Associates is a leading law firm in Islamabad, Pakistan for corporate law, litigation, dispute resolution, intellectual property, energy law, and regulatory legal services.',
  keywords: [
    'law firm Islamabad',
    'lawyers in Pakistan',
    'corporate lawyer Islamabad',
    'litigation lawyer Pakistan',
    'intellectual property lawyer Pakistan',
    'AR&CO Law Associates',
  ],
  alternates: {
    canonical: HOMEPAGE_URL,
  },
  openGraph: {
    title: 'Law Firm in Islamabad, Pakistan | AR&CO Law Associates',
    description:
      'Trusted legal counsel in Islamabad for corporate law, litigation, dispute resolution, intellectual property, and regulatory legal matters.',
    url: HOMEPAGE_URL,
    siteName: 'AR&CO Law Associates',
    type: 'website',
    locale: 'en_PK',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AR&CO Law Associates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Law Firm in Islamabad, Pakistan | AR&CO Law Associates',
    description:
      'Leading Islamabad law firm for corporate legal advisory, litigation, and dispute resolution services in Pakistan.',
    images: ['/twitter-image.jpg'],
  },
}

export default function HomePage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'AR&CO Law Associates',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon-512x512.png`,
    email: 'info@arco.law',
    telephone: '+92 51 2252144',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Islamabad',
      addressCountry: 'PK',
    },
  }

  const legalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    '@id': `${SITE_URL}/#legal-service`,
    name: 'AR&CO Law Associates',
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    areaServed: 'Pakistan',
    priceRange: '$$$',
    telephone: '+92 51 2252144',
    email: 'info@arco.law',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Islamabad',
      addressCountry: 'PK',
    },
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
    serviceType: [
      'Corporate Law',
      'Litigation and Dispute Resolution',
      'Intellectual Property Law',
      'Energy and Regulatory Law',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'AR&CO Law Associates',
    inLanguage: 'en-PK',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legalServiceSchema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <HomePageClient />
    </>
  )
}
