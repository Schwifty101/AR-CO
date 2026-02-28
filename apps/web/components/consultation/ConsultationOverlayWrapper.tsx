'use client'

import { useConsultationOverlay } from './ConsultationContext'
import ConsultationOverlay from './ConsultationOverlay'

/**
 * ConsultationOverlayWrapper
 *
 * Connects the ConsultationContext to the ConsultationOverlay component.
 * Placed at root layout level to enable the overlay from any component.
 */
export default function ConsultationOverlayWrapper() {
  const { isOverlayOpen, prefillData, closeOverlay } = useConsultationOverlay()

  return (
    <ConsultationOverlay
      isOpen={isOverlayOpen}
      onClose={closeOverlay}
      prefillData={prefillData}
    />
  )
}
