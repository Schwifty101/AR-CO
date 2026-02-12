'use client'

import ConsultationOverlay from './ConsultationOverlay'
import { useConsultationOverlay } from './ConsultationContext'

/**
 * ConsultationOverlayWrapper
 *
 * Connects the ConsultationContext to the ConsultationOverlay component.
 * Placed at root layout level to enable the overlay from any component.
 */
export default function ConsultationOverlayWrapper() {
  const { isOverlayOpen, closeOverlay } = useConsultationOverlay()
  return <ConsultationOverlay isOpen={isOverlayOpen} onClose={closeOverlay} />
}
