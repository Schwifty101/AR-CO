'use client'

import AboutOverlay from './AboutOverlay'
import { useAboutOverlay } from './AboutContext'

/**
 * AboutOverlayWrapper
 *
 * Connects the AboutContext to the AboutOverlay component.
 * This wrapper is placed at the root layout level to enable overlay
 * functionality from any component in the app.
 */
export default function AboutOverlayWrapper() {
  const { isOverlayOpen, closeOverlay } = useAboutOverlay()
  return <AboutOverlay isOpen={isOverlayOpen} onClose={closeOverlay} />
}
