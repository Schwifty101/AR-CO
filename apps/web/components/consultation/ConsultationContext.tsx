'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ConsultationContextType {
  isOverlayOpen: boolean
  openOverlay: () => void
  closeOverlay: () => void
  toggleOverlay: () => void
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined)

/**
 * ConsultationProvider
 *
 * Provides state management for the Book Consultation overlay.
 * Wrap your app with this provider to enable the overlay from
 * any component (navbar CTA, CTA sections, etc.).
 */
export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  const openOverlay = useCallback(() => {
    setIsOverlayOpen(true)
  }, [])

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false)
  }, [])

  const toggleOverlay = useCallback(() => {
    setIsOverlayOpen((prev) => !prev)
  }, [])

  return (
    <ConsultationContext.Provider
      value={{ isOverlayOpen, openOverlay, closeOverlay, toggleOverlay }}
    >
      {children}
    </ConsultationContext.Provider>
  )
}

/**
 * useConsultationOverlay
 *
 * Hook to access the consultation overlay state and controls.
 *
 * @example
 * ```tsx
 * const { openOverlay } = useConsultationOverlay()
 * <button onClick={openOverlay}>Book Consultation</button>
 * ```
 */
export function useConsultationOverlay() {
  const context = useContext(ConsultationContext)
  if (context === undefined) {
    throw new Error('useConsultationOverlay must be used within a ConsultationProvider')
  }
  return context
}
