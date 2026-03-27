'use client';

/**
 * Consultation Payment Callback Page
 *
 * Handles two redirect patterns:
 *
 * 1. **LemonSqueezy redirect** (new): LemonSqueezy redirects back after checkout
 *    with `?ref=CON-2026-XXXX` in the URL. Shows a success message and link to
 *    view consultation status.
 *
 * 2. **Legacy Safepay popup** (old): The popup window sends a postMessage to the
 *    opener and closes itself. Kept for backwards compatibility.
 *
 * If `ref` param is present → LemonSqueezy flow → show success UI.
 * If no params → redirect to /consultation.
 *
 * @module ConsultationPaymentCallbackPage
 *
 * @example
 * // LemonSqueezy redirect after successful payment:
 * /consultation/payment-callback?ref=CON-2026-0009
 *
 * // Legacy Safepay popup callback:
 * /consultation/payment-callback?tracker=track_xxx&sig=abc&reference=123
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Inner component that reads search params and handles both redirect patterns.
 * Must be wrapped in Suspense because it calls useSearchParams().
 */
function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('Processing payment...');
  const [isLemonSqueezyFlow, setIsLemonSqueezyFlow] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');

    // LemonSqueezy redirect pattern: ?ref=CON-2026-XXXX
    if (ref) {
      setReferenceNumber(ref);
      setIsLemonSqueezyFlow(true);
      setMessage('Payment confirmed!');
      return;
    }

    // Legacy Safepay popup pattern
    const cancelled = searchParams.get('cancelled');
    const tracker = searchParams.get('tracker');
    const signature = searchParams.get('sig');
    const reference = searchParams.get('reference');

    if (window.opener) {
      if (cancelled) {
        window.opener.postMessage(
          { type: 'safepay-payment-cancelled' },
          window.location.origin,
        );
      } else if (tracker) {
        window.opener.postMessage(
          {
            type: 'safepay-payment-success',
            tracker,
            reference,
            signature,
          },
          window.location.origin,
        );
      }

      setMessage('Payment processed. You can close this window.');
      window.close();
      return;
    }

    // No params at all — redirect to consultation home
    if (!ref && !cancelled && !tracker) {
      router.replace('/consultation');
      return;
    }

    // Fallback for popup that can't close
    setMessage(
      'Payment processed. Please close this window and return to the booking form.',
    );
  }, [searchParams, router]);

  // LemonSqueezy success UI
  if (isLemonSqueezyFlow) {
    return (
      <div className="flex flex-col items-center text-center gap-6 max-w-md mx-auto">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Consultation Payment Confirmed
          </h1>
          {referenceNumber && (
            <p className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-md inline-block">
              Reference: {referenceNumber}
            </p>
          )}
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Your payment has been confirmed. Our team will reach out with your
          scheduling link. You can track your consultation status below.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            asChild
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Link href="/client/consultations">
              View My Consultations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/client/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Legacy / processing fallback
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Georgia, serif',
        color: '#666',
        fontSize: '0.9rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <p>{message}</p>
    </div>
  );
}

/**
 * Consultation payment callback page with Suspense boundary.
 */
export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'Georgia, serif',
            color: '#666',
            fontSize: '0.9rem',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <p>Processing payment...</p>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
