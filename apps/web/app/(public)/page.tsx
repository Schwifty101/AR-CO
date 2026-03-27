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
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${SITE_URL}/#organization`,
    name: 'AR&CO Law Associates',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon-512x512.png`,
    image: `${SITE_URL}/og-image.jpg`,
    email: 'info@arco.law',
    telephone: '+92 51 2252144',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Islamabad',
      addressRegion: 'Islamabad Capital Territory',
      addressCountry: 'PK',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
    ],
    serviceArea: {
      '@type': 'Country',
      name: 'Pakistan',
    },
    areaServed: 'Pakistan',
    priceRange: '$$$',
    sameAs: [
      'https://instagram.com/arco.law',
      'https://Linkedin.com/arco.law',
      'https://Facebook.com/arco.law',
    ],
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What areas of law does AR&CO specialise in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AR&CO Law Associates specialises in corporate law, litigation and dispute resolution, intellectual property, energy law, tax law, immigration law, and real estate law, serving clients across Pakistan.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is AR&CO Law Associates based in Islamabad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, AR&CO Law Associates is headquartered in Islamabad, Pakistan, and serves clients across Pakistan including Rawalpindi, Lahore, and Karachi.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I book a legal consultation with AR&CO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can book a consultation by calling +92 51 2252144, emailing info@arco.law, or using the consultation booking form on our website.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does AR&CO handle corporate and business legal matters?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we provide comprehensive corporate legal services including company incorporation, SECP compliance, contract drafting, mergers and acquisitions, and ongoing corporate advisory for businesses across Pakistan.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can AR&CO represent clients across Pakistan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, AR&CO represents individuals and businesses across all provinces of Pakistan and handles matters before courts and tribunals nationwide.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does AR&CO provide SECP registration and company incorporation services?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, our facilitation centre provides end-to-end services for SECP registration, NTN registration, company incorporation, trademark registration, and other regulatory compliance requirements.',
        },
      },
    ],
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
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageClient />
    </>
  )
}
