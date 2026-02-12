'use client';

/**
 * Client Subscription Management Page
 *
 * Displays the current user's subscription status and provides subscription management.
 * Clients can subscribe, view subscription details, or cancel their subscription.
 *
 * @module ClientSubscriptionPage
 *
 * @example
 * Accessible at /client/subscription (requires authenticated client)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getMySubscription,
  cancelSubscription,
  type SubscriptionResponse,
} from '@/lib/api/subscriptions';
import { SubscriptionStatus } from '@repo/shared';

/** Subscription status badge color mapping */
const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.PENDING]: 'bg-yellow-500 text-white',
  [SubscriptionStatus.ACTIVE]: 'bg-green-500 text-white',
  [SubscriptionStatus.PAST_DUE]: 'bg-orange-500 text-white',
  [SubscriptionStatus.CANCELLED]: 'bg-gray-500 text-white',
  [SubscriptionStatus.EXPIRED]: 'bg-red-500 text-white',
};

/**
 * Client subscription management page component
 */
export default function ClientSubscriptionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch subscription on mount
  useEffect(() => {
    if (authLoading) return;

    async function loadSubscription() {
      try {
        setError(null);
        const data = await getMySubscription();
        setSubscription(data);
      } catch (err) {
        // 404 means no subscription exists - this is not an error
        if (err instanceof Error && err.message.includes('404')) {
          setSubscription(null);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load subscription');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadSubscription();
  }, [authLoading]);

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      const cancelled = await cancelSubscription(
        cancelReason.trim() ? { reason: cancelReason.trim() } : undefined,
      );
      setSubscription(cancelled);
      setCancelReason('');
      toast.success('Subscription cancelled successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
        <p className="text-muted-foreground">
          Manage your Civic Retainer subscription
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      )}

      {!subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              Subscribe to the Civic Retainer plan to submit complaints against government organizations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-6">
              <h3 className="text-xl font-semibold mb-2">Civic Retainer Plan</h3>
              <p className="text-3xl font-bold mb-4">
                PKR 700<span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>Submit unlimited complaints</li>
                <li>Professional escalation support</li>
                <li>Status tracking and updates</li>
                <li>Priority response to urgent cases</li>
              </ul>
              <Button onClick={() => router.push('/subscribe')} size="lg">
                Subscribe Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>
              Your current Civic Retainer subscription information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Plan</Label>
                <p className="text-lg font-semibold">Civic Retainer</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge className={STATUS_COLORS[subscription.status]}>
                    {subscription.status.toUpperCase().replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Monthly Amount</Label>
                <p className="text-lg font-semibold">PKR {subscription.monthlyAmount}</p>
              </div>
              {subscription.currentPeriodStart && (
                <div>
                  <Label className="text-muted-foreground">Current Period Start</Label>
                  <p className="text-lg">{formatDate(subscription.currentPeriodStart)}</p>
                </div>
              )}
              {subscription.currentPeriodEnd && (
                <div>
                  <Label className="text-muted-foreground">Current Period End</Label>
                  <p className="text-lg">{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
              )}
              {subscription.cancelledAt && (
                <div>
                  <Label className="text-muted-foreground">Cancelled On</Label>
                  <p className="text-lg">{formatDate(subscription.cancelledAt)}</p>
                </div>
              )}
            </div>

            {subscription.cancellationReason && (
              <div>
                <Label className="text-muted-foreground">Cancellation Reason</Label>
                <p className="text-sm mt-1">{subscription.cancellationReason}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {subscription.status === SubscriptionStatus.ACTIVE && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Cancel Subscription</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your Civic Retainer subscription?
                        You will lose access to complaint submission features.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-2">
                      <Label htmlFor="cancelReason">Reason (optional)</Label>
                      <Textarea
                        id="cancelReason"
                        placeholder="Let us know why you're cancelling..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {(subscription.status === SubscriptionStatus.CANCELLED ||
                subscription.status === SubscriptionStatus.EXPIRED) && (
                <Button onClick={() => router.push('/subscribe')}>
                  Resubscribe
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
