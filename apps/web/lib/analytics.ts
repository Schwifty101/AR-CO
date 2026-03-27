import { track } from '@vercel/analytics'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type CTAType = 'call' | 'whatsapp' | 'email' | 'consult'

/**
 * Fire a CTA interaction event to both Vercel Analytics and Google Analytics (gtag).
 *
 * @example
 * trackCTAClick('call', 'footer')
 * trackCTAClick('consult', 'cta-section')
 */
export function trackCTAClick(type: CTAType, location: string): void {
  if (typeof window === 'undefined') return

  const payload = { cta_type: type, cta_location: location }

  try {
    track('cta_click', payload)
  } catch {
    // Vercel Analytics unavailable — silent fail
  }

  try {
    window.gtag?.('event', 'cta_click', payload)
  } catch {
    // gtag unavailable — silent fail
  }
}
