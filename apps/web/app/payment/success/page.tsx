'use client';

/**
 * Payment Success Page
 *
 * Displayed after a successful LemonSqueezy payment redirect.
 * Reads `type` (consultation|service|subscription) and `ref` (reference number)
 * from URL search params. Shows type-specific success messaging with next steps.
 *
 * Shows a 2-second loading state to allow webhook processing time before
 * displaying the final success content.
 *
 * @module PaymentSuccessPage
 *
 * @example
 * Accessible at /payment/success?type=subscription&ref=SUB-2026-0001
 * Accessible at /payment/success?type=consultation&ref=CON-2026-0009
 * Accessible at /payment/success?type=service&ref=SVC-2026-0042
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Payment type as encoded in the LemonSqueezy redirect URL */
type PaymentType = 'consultation' | 'service' | 'subscription' | null;

/**
 * Returns the heading, description, and next-step action for each payment type.
 *
 * @param type - The payment type from URL params
 * @param ref - The reference number from URL params
 */
function getSuccessContent(
  type: PaymentType,
  ref: string | null,
): {
  heading: string;
  description: string;
  actionLabel: string;
  actionHref: string;
} {
  switch (type) {
    case 'consultation':
      return {
        heading: 'Consultation Payment Confirmed',
        description:
          'Payment confirmed! You can now schedule your appointment. Our team will reach out with your Cal.com booking link.',
        actionLabel: 'View My Consultations',
        actionHref: '/client/consultations',
      };
    case 'service':
      return {
        heading: 'Service Registration Payment Confirmed',
        description:
          'Payment confirmed! Our team will process your registration. Check your email for portal access credentials and next steps.',
        actionLabel: 'View My Services',
        actionHref: '/client/services',
      };
    case 'subscription':
      return {
        heading: 'Subscription Activated',
        description:
          'Welcome to the Civic Retainer plan! Your subscription is now active and you have full access to premium legal services.',
        actionLabel: 'Manage Subscription',
        actionHref: '/client/subscription',
      };
    default:
      return {
        heading: 'Payment Successful',
        description:
          'Your payment has been processed successfully. Thank you for choosing AR&CO Law Firm.',
        actionLabel: 'Go to Dashboard',
        actionHref: '/client/dashboard',
      };
  }
}

/**
 * Inner component that reads URL params and renders the success state.
 * Must be wrapped in Suspense because it calls useSearchParams().
 */
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as PaymentType;
  const ref = searchParams.get('ref');

  const [isLoading, setIsLoading] = useState(true);

  // Simulate webhook processing time — 2 seconds before revealing success UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const content = getSuccessContent(type, ref);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-yellow-500" />
        <p className="text-muted-foreground text-sm">Processing your payment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-6 max-w-md mx-auto">
      {/* Success icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {content.heading}
        </h1>
        {ref && (
          <p className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-md inline-block">
            Reference: {ref}
          </p>
        )}
      </div>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">
        {content.description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button asChild className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          <Link href={content.actionHref}>
            {content.actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/client/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Payment success page with Suspense boundary for useSearchParams.
 */
export default function PaymentSuccessPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex items-center justify-center p-6">
      {/* Subtle gold atmosphere glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-yellow-500" />
                <p className="text-muted-foreground text-sm">
                  Processing your payment...
                </p>
              </div>
            }
          >
            <PaymentSuccessContent />
          </Suspense>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Payments are securely processed by LemonSqueezy. A receipt has been
          sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
