'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface PracticeAreasContextType {
  isOverlayOpen: boolean
  openOverlay: () => void
  closeOverlay: () => void
  toggleOverlay: () => void
}

const PracticeAreasContext = createContext<PracticeAreasContextType | undefined>(undefined)

/**
 * PracticeAreasProvider
 *
 * Provides state management for the Practice Areas overlay.
 * Wrap your app with this provider to enable overlay functionality
 * from header, footer, and sidepanel.
 */
export function PracticeAreasProvider({ children }: { children: ReactNode }) {
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
    <PracticeAreasContext.Provider
      value={{
        isOverlayOpen,
        openOverlay,
        closeOverlay,
        toggleOverlay,
      }}
    >
      {children}
    </PracticeAreasContext.Provider>
  )
}

/**
 * usePracticeAreasOverlay
 *
 * Hook to access the practice areas overlay state and controls.
 *
 * @example
 * ```tsx
 * const { openOverlay } = usePracticeAreasOverlay()
 * <button onClick={openOverlay}>Practice Areas</button>
 * ```
 */
export function usePracticeAreasOverlay() {
  const context = useContext(PracticeAreasContext)
  if (context === undefined) {
    throw new Error('usePracticeAreasOverlay must be used within a PracticeAreasProvider')
  }
  return context
}
