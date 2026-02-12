'use client';

/**
 * Subscription Cancel Page
 *
 * Displayed when user cancels the payment process at Safepay checkout.
 * Provides option to retry subscription.
 *
 * @module SubscribeCancelPage
 *
 * @example
 * Accessible at /subscribe/cancel (redirect from Safepay on cancellation)
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

/**
 * Subscription cancel page component
 */
export default function SubscribeCancelPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <XCircle className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Subscription Cancelled</CardTitle>
            <CardDescription>
              Your payment was not completed and the subscription was not activated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p>
                If you experienced any issues during the payment process, please try again or contact our support team for assistance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="flex-1">
                <Link href="/subscribe">
                  Try Again
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <Link href="/">
                  Return to Homepage
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Need help? Contact us at{' '}
              <a href="mailto:support@arco.com" className="text-primary hover:underline">
                support@arco.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
