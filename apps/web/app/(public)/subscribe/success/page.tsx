'use client';

/**
 * Subscription Success Page
 *
 * Displayed after successful payment completion via Safepay.
 * Confirms subscription activation and provides navigation to client portal.
 *
 * @module SubscribeSuccessPage
 *
 * @example
 * Accessible at /subscribe/success (redirect from Safepay)
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

/**
 * Subscription success page component
 */
export default function SubscribeSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Subscription Activated</CardTitle>
            <CardDescription>
              Your Civic Retainer subscription has been successfully activated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground mb-2">
                What's Next?
              </p>
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access your subscription details in the client portal</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Start submitting complaints against government organizations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Track your complaint status and receive legal guidance</span>
                </li>
              </ul>
            </div>

            <Button asChild size="lg" className="w-full">
              <Link href="/client/subscription">
                Go to Subscription Dashboard
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground">
              You will receive a confirmation email shortly with your subscription details.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
