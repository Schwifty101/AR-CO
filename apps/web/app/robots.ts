import type { MetadataRoute } from 'next'

const SITE_URL = 'https://arandcolaw.com'

/**
 * Robots policy for public crawl access while blocking private app areas.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/client',
        '/api',
        '/auth',
        '/auth/callback',
        '/auth/confirm',
        '/subscribe/success',
        '/subscribe/cancel',
        '/complaint-section/form',
        '/services/*/*/form',
        '/payment-callback',
        '/consultation/payment-callback',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: 'arandcolaw.com',
  }
}
