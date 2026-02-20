'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Payment source types for the shared callback page */
export type PaymentSource = 'consultation' | 'subscription' | 'service';

interface UsePaymentPopupOptions {
  /** Which payment flow this popup belongs to */
  source: PaymentSource;
  /** Called when payment succeeds (data from postMessage) */
  onSuccess: (data: {
    tracker?: string;
    reference?: string;
    signature?: string;
  }) => void;
  /** Called when payment is cancelled */
  onCancel?: () => void;
  /** Called on error (popup blocked, etc.) */
  onError?: (message: string) => void;
}

interface UsePaymentPopupReturn {
  /** Open the payment popup with the given checkout URL */
  openPopup: (checkoutUrl: string) => void;
  /** Whether a popup is currently open */
  isOpen: boolean;
}

/**
 * Shared hook for Safepay popup-based checkout.
 * Opens a centered popup, listens for postMessage from /payment-callback,
 * and handles success/cancel/error scenarios.
 *
 * @example
 * const { openPopup, isOpen } = usePaymentPopup({
 *   source: 'subscription',
 *   onSuccess: (data) => confirmPayment(data),
 *   onCancel: () => toast.error('Payment cancelled'),
 * });
 */
export function usePaymentPopup({
  source,
  onSuccess,
  onCancel,
  onError,
}: UsePaymentPopupOptions): UsePaymentPopupReturn {
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Listen for postMessage from the callback page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;

      const { type, tracker, reference, signature } = event.data || {};

      if (type === `safepay-${source}-success`) {
        setIsOpen(false);
        cleanup();
        onSuccess({ tracker, reference, signature });
      } else if (type === `safepay-${source}-cancelled`) {
        setIsOpen(false);
        cleanup();
        onCancel?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [source, onSuccess, onCancel, cleanup]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const openPopup = useCallback(
    (checkoutUrl: string) => {
      // Center the popup
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        checkoutUrl,
        'safepay-checkout',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
      );

      if (!popup) {
        onError?.(
          'Payment popup was blocked. Please allow popups for this site.',
        );
        return;
      }

      popupRef.current = popup;
      setIsOpen(true);

      // Poll for popup closure (user closed without completing)
      pollRef.current = setInterval(() => {
        if (popup.closed) {
          cleanup();
          setIsOpen(false);
          // Don't trigger cancel if success already handled
        }
      }, 500);
    },
    [cleanup, onError],
  );

  return { openPopup, isOpen };
}
