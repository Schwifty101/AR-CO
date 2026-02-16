'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Inner component that reads search params and communicates with the opener window.
 */
function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Processing payment...')

  useEffect(() => {
    const cancelled = searchParams.get('cancelled')
    const tracker = searchParams.get('tracker')
    const signature = searchParams.get('sig')
    const reference = searchParams.get('reference')

    if (window.opener) {
      if (cancelled) {
        window.opener.postMessage(
          { type: 'safepay-payment-cancelled' },
          window.location.origin,
        )
      } else if (tracker) {
        window.opener.postMessage(
          {
            type: 'safepay-payment-success',
            tracker,
            reference,
            signature,
          },
          window.location.origin,
        )
      }

      setMessage('Payment processed. You can close this window.')
      window.close()
    } else {
      setMessage('Payment processed. Please close this window and return to the booking form.')
    }
  }, [searchParams])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Georgia, serif',
      color: '#666',
      fontSize: '0.9rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <p>{message}</p>
    </div>
  )
}

/**
 * Safepay payment callback page.
 *
 * Safepay redirects the popup window here after payment completes or is cancelled.
 * Reads URL params, sends postMessage to the opener (consultation overlay), then
 * closes itself. Shows a fallback message if the window can't auto-close.
 *
 * Success params: ?tracker=track_xxx&sig=abc123&reference=969025&order_id=CON-2026-0009
 * Cancel params: ?cancelled=true
 *
 * @example
 * ```
 * // Safepay redirects to:
 * /consultation/payment-callback?tracker=track_xxx&sig=abc&reference=123&order_id=CON-2026-0009
 * ```
 */
export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Georgia, serif',
        color: '#666',
        fontSize: '0.9rem',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <p>Processing payment...</p>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
