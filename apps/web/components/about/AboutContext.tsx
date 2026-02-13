'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AboutContextType {
  isOverlayOpen: boolean
  openOverlay: () => void
  closeOverlay: () => void
  toggleOverlay: () => void
}

const AboutContext = createContext<AboutContextType | undefined>(undefined)

/**
 * AboutProvider
 *
 * Provides state management for the About Us overlay.
 * Wrap your app with this provider to enable overlay functionality
 * from header, footer, and other components.
 */
export function AboutProvider({ children }: { children: ReactNode }) {
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
    <AboutContext.Provider
      value={{
        isOverlayOpen,
        openOverlay,
        closeOverlay,
        toggleOverlay,
      }}
    >
      {children}
    </AboutContext.Provider>
  )
}

/**
 * useAboutOverlay
 *
 * Hook to access the about overlay state and controls.
 *
 * @example
 * ```tsx
 * const { openOverlay } = useAboutOverlay()
 * <button onClick={openOverlay}>About Us</button>
 * ```
 */
export function useAboutOverlay() {
  const context = useContext(AboutContext)
  if (context === undefined) {
    throw new Error('useAboutOverlay must be used within an AboutProvider')
  }
  return context
}
