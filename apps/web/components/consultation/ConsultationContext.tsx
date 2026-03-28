'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

/** Data to pre-fill in the consultation form for logged-in clients */
export interface ConsultationPrefillData {
  name?: string
  email?: string
  phone?: string
}

/** Data passed back from LemonSqueezy payment redirect to resume at step 4 */
export interface PaymentReturnData {
  bookingId: string
  referenceNumber: string
}

interface ConsultationContextType {
  isOverlayOpen: boolean
  prefillData: ConsultationPrefillData | null
  paymentReturnData: PaymentReturnData | null
  openOverlay: (prefill?: ConsultationPrefillData) => void
  openOverlayAtPaymentReturn: (data: PaymentReturnData) => void
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
  const [prefillData, setPrefillData] = useState<ConsultationPrefillData | null>(null)
  const [paymentReturnData, setPaymentReturnData] = useState<PaymentReturnData | null>(null)

  const openOverlay = useCallback((prefill?: ConsultationPrefillData) => {
    setPrefillData(prefill ?? null)
    setPaymentReturnData(null)
    setIsOverlayOpen(true)
  }, [])

  const openOverlayAtPaymentReturn = useCallback((data: PaymentReturnData) => {
    setPaymentReturnData(data)
    setPrefillData(null)
    setIsOverlayOpen(true)
  }, [])

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false)
    setPrefillData(null)
    setPaymentReturnData(null)
  }, [])

  const toggleOverlay = useCallback(() => {
    setIsOverlayOpen((prev) => !prev)
  }, [])

  return (
    <ConsultationContext.Provider
      value={{ isOverlayOpen, prefillData, paymentReturnData, openOverlay, openOverlayAtPaymentReturn, closeOverlay, toggleOverlay }}
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
 * // Without pre-fill (guest)
 * <button onClick={() => openOverlay()}>Book Consultation</button>
 * // With pre-fill (logged-in client)
 * <button onClick={() => openOverlay({ name: 'John', email: 'john@example.com' })}>Book</button>
 * ```
 */
export function useConsultationOverlay() {
  const context = useContext(ConsultationContext)
  if (context === undefined) {
    throw new Error('useConsultationOverlay must be used within a ConsultationProvider')
  }
  return context
}
