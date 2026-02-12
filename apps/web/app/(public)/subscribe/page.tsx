'use client';

/**
 * Subscribe Landing Page
 *
 * Public landing page for the "Civic Retainer" subscription service.
 * Allows authenticated users to create a subscription or redirects
 * unauthenticated users to sign up.
 *
 * @module SubscribePage
 *
 * @example
 * Accessible at /subscribe
 * - Anonymous users: shown signup prompt
 * - Authenticated users: can subscribe directly
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { createSubscription } from '@/lib/api/subscriptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2, Scale, FileText, Users } from 'lucide-react';

/**
 * Subscribe landing page component
 */
export default function SubscribePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [subscribing, setSubscribing] = useState(false);

  /**
   * Handles subscription button click
   * - If not authenticated, redirects to signup with return URL
   * - If authenticated, creates subscription and redirects to checkout
   */
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=/subscribe');
      return;
    }

    // Only client accounts can subscribe
    if (user?.userType !== 'client') {
      toast.error('Only client accounts can subscribe. Please sign in with a client account.');
      return;
    }

    setSubscribing(true);
    try {
      const { checkoutUrl } = await createSubscription();
      toast.success('Subscription created! Redirecting to payment...');
      window.location.href = checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create subscription';
      toast.error(message);
      setSubscribing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Civic Retainer Service
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Your Voice, Our Advocacy
        </p>
        <p className="text-lg text-muted-foreground">
          PKR 700/month - Professional legal support for government-related matters
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="mx-auto max-w-5xl mb-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Submit Complaints</CardTitle>
              <CardDescription>
                File official complaints against government organizations directly through our platform
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>
                Monitor your complaint status in real-time with detailed resolution tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Scale className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Legal Support</CardTitle>
              <CardDescription>
                Access professional legal guidance throughout the complaint resolution process
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="mx-auto max-w-2xl mb-12">
        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
            <CardDescription>
              Comprehensive support for your civic engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>Unlimited complaint submissions against government organizations</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>Real-time tracking and status updates for all your complaints</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>Professional legal review and guidance for each complaint</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>Direct communication channel with legal experts</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>Priority email and phone support during business hours</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-md text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
            <CardDescription>
              {isAuthenticated
                ? 'Click below to activate your subscription'
                : 'Create an account to subscribe'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-3xl font-bold">PKR 700</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleSubscribe}
              disabled={subscribing}
            >
              {subscribing ? 'Processing...' : isAuthenticated ? 'Subscribe Now' : 'Sign Up to Subscribe'}
            </Button>
            {isAuthenticated && (
              <p className="text-xs text-muted-foreground mt-4">
                You will be redirected to our secure payment gateway
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trust Section */}
      <div className="mx-auto max-w-3xl text-center mt-12">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <p>Trusted by clients seeking fair resolution of civic matters</p>
        </div>
      </div>
    </div>
  );
}
