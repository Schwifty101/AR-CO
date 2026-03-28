'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useConsultationOverlay } from './ConsultationContext'
import ConsultationOverlay from './ConsultationOverlay'

/**
 * ConsultationOverlayWrapper
 *
 * Connects the ConsultationContext to the ConsultationOverlay component.
 * Placed at root layout level to enable the overlay from any component.
 *
 * Also handles LemonSqueezy payment return: when the URL contains
 * `?payment=confirmed&booking_id=...&ref=...`, the overlay opens at step 4.
 */
export default function ConsultationOverlayWrapper() {
  const { isOverlayOpen, prefillData, closeOverlay, openOverlayAtPaymentReturn } = useConsultationOverlay()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const payment = searchParams.get('payment')
    const bookingId = searchParams.get('booking_id')
    const ref = searchParams.get('ref')

    if (payment === 'confirmed' && bookingId && ref) {
      openOverlayAtPaymentReturn({ bookingId, referenceNumber: ref })

      // Clean URL params without triggering a navigation
      const url = new URL(window.location.href)
      url.searchParams.delete('payment')
      url.searchParams.delete('booking_id')
      url.searchParams.delete('ref')
      router.replace(url.pathname + (url.search || ''), { scroll: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ConsultationOverlay
      isOpen={isOverlayOpen}
      onClose={closeOverlay}
      prefillData={prefillData}
    />
  )
}
