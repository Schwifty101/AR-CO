'use client';

/**
 * Client Subscription Management Page
 *
 * Placeholder - subscription service removed.
 *
 * @module ClientSubscriptionPage
 */

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ClientSubscriptionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  if (!authLoading && !user) {
    router.push('/auth/signin');
    return null;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
        <p className="text-muted-foreground">
          Subscription management is currently unavailable
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            The subscription service is currently unavailable. Please check back later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/client/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
