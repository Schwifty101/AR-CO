'use client';

/**
 * Payment Cancel Page
 *
 * Displayed when a user cancels out of the LemonSqueezy hosted checkout.
 * Reads `type` and `ref` from URL params to surface a context-aware
 * "Try Again" link that returns the user to the correct entry point.
 *
 * @module PaymentCancelPage
 *
 * @example
 * Accessible at /payment/cancel?type=subscription&ref=SUB-2026-0001
 * Accessible at /payment/cancel?type=consultation&ref=CON-2026-0009
 * Accessible at /payment/cancel?type=service&ref=SVC-2026-0042
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Payment type as encoded in the redirect URL */
type PaymentType = 'consultation' | 'service' | 'subscription' | null;

/**
 * Returns the retry href for each payment type.
 *
 * @param type - Payment type from URL params
 * @returns Route to send the user when they click "Try Again"
 */
function getRetryHref(type: PaymentType): string {
  switch (type) {
    case 'consultation':
      return '/consultation';
    case 'service':
      return '/services';
    case 'subscription':
      return '/subscribe';
    default:
      return '/';
  }
}

/**
 * Returns the human-readable label for the retry action.
 *
 * @param type - Payment type from URL params
 */
function getRetryLabel(type: PaymentType): string {
  switch (type) {
    case 'consultation':
      return 'Book a Consultation';
    case 'service':
      return 'Browse Services';
    case 'subscription':
      return 'View Subscription Plans';
    default:
      return 'Try Again';
  }
}

/**
 * Inner component that reads URL params and renders the cancel state.
 * Must be wrapped in Suspense because it calls useSearchParams().
 */
function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as PaymentType;
  const ref = searchParams.get('ref');

  const retryHref = getRetryHref(type);
  const retryLabel = getRetryLabel(type);

  return (
    <div className="flex flex-col items-center text-center gap-6 max-w-md mx-auto">
      {/* Cancel icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-10 w-10 text-destructive" />
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Payment Cancelled
        </h1>
        {ref && (
          <p className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-md inline-block">
            Reference: {ref}
          </p>
        )}
      </div>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">
        Your payment was cancelled and you have not been charged. You can try
        again anytime — your progress has been saved.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          asChild
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Link href={retryHref}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {retryLabel}
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Payment cancel page with Suspense boundary for useSearchParams.
 */
export default function PaymentCancelPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex items-center justify-center p-6">
      {/* Subtle atmosphere */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(239,68,68,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-destructive" />
                <p className="text-muted-foreground text-sm">Loading...</p>
              </div>
            }
          >
            <PaymentCancelContent />
          </Suspense>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          If you experienced an issue during payment, please contact our support
          team at{' '}
          <a
            href="mailto:support@arcolawfirm.com"
            className="underline hover:text-foreground"
          >
            support@arcolawfirm.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
