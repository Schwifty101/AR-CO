'use client'

import FacilitationOverlay from './FacilitationOverlay'
import { useFacilitationOverlay } from './FacilitationContext'

/**
 * FacilitationOverlayWrapper
 *
 * Connects the FacilitationContext to the FacilitationOverlay component.
 * This wrapper is placed at the root layout level to enable overlay
 * functionality from any component in the app.
 */
export default function FacilitationOverlayWrapper() {
  const { isOverlayOpen, closeOverlay } = useFacilitationOverlay()
  return <FacilitationOverlay isOpen={isOverlayOpen} onClose={closeOverlay} />
}
