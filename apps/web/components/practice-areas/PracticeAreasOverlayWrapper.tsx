'use client'

import PracticeAreasOverlay from './PracticeAreasOverlay'
import { usePracticeAreasOverlay } from './PracticeAreasContext'

/**
 * PracticeAreasOverlayWrapper
 *
 * Client component wrapper that connects the overlay to the context.
 * This is rendered in the root layout.
 */
export default function PracticeAreasOverlayWrapper() {
  const { isOverlayOpen, closeOverlay } = usePracticeAreasOverlay()

  return <PracticeAreasOverlay isOpen={isOverlayOpen} onClose={closeOverlay} />
}
