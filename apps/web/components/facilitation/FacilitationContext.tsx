'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface FacilitationContextType {
  isOverlayOpen: boolean
  openOverlay: () => void
  closeOverlay: () => void
  toggleOverlay: () => void
}

const FacilitationContext = createContext<FacilitationContextType | undefined>(undefined)

/**
 * FacilitationProvider
 *
 * Provides state management for the Facilitation Services overlay.
 * Wrap your app with this provider to enable overlay functionality
 * from header, footer, and sidepanel.
 */
export function FacilitationProvider({ children }: { children: ReactNode }) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  const openOverlay = useCallback(() => {
    setIsOverlayOpen(true)
  }, [])

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false)
  }, [])

  const toggleOverlay = useCallback(() => {
    setIsOverlayOpen(prev => !prev)
  }, [])

  return (
    <FacilitationContext.Provider
      value={{
        isOverlayOpen,
        openOverlay,
        closeOverlay,
        toggleOverlay,
      }}
    >
      {children}
    </FacilitationContext.Provider>
  )
}

/**
 * useFacilitationOverlay
 *
 * Hook to access the facilitation services overlay state and controls.
 *
 * @example
 * ```tsx
 * const { openOverlay } = useFacilitationOverlay()
 * <button onClick={openOverlay}>Facilitation Centre</button>
 * ```
 */
export function useFacilitationOverlay() {
  const context = useContext(FacilitationContext)
  if (context === undefined) {
    throw new Error('useFacilitationOverlay must be used within a FacilitationProvider')
  }
  return context
}
