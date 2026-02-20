'use client';

/**
 * Client Subscription Management Page
 *
 * Displays the authenticated client's subscription details including plan info,
 * billing dates, status badge, and event history. Supports cancellation via
 * AlertDialog confirmation and links to subscribe for new/lapsed users.
 *
 * @module ClientSubscriptionPage
 *
 * @example
 * Accessible at /client/subscription (requires authenticated client)
 */

import { useCallback, useEffect, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
import {
  CreditCard,
  Calendar,
  Clock,
  XCircle,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  getMySubscription,
  cancelSubscription,
  type SubscriptionDetail,
} from '@/lib/api/subscriptions';
import { SubscriptionStatus, BillingInterval } from '@repo/shared';

/** Status badge color mapping */
const STATUS_BADGE_STYLES: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'bg-green-500 text-white',
  [SubscriptionStatus.PENDING]: 'bg-blue-500 text-white',
  [SubscriptionStatus.PAUSED]: 'bg-yellow-500 text-white',
  [SubscriptionStatus.CANCELLED]: 'bg-red-500 text-white',
  [SubscriptionStatus.ENDED]: 'bg-gray-500 text-white',
  [SubscriptionStatus.FAILED]: 'bg-red-700 text-white',
  [SubscriptionStatus.UNPAID]: 'bg-orange-500 text-white',
};

/** Human-readable status labels */
const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'Active',
  [SubscriptionStatus.PENDING]: 'Pending',
  [SubscriptionStatus.PAUSED]: 'Paused',
  [SubscriptionStatus.CANCELLED]: 'Cancelled',
  [SubscriptionStatus.ENDED]: 'Ended',
  [SubscriptionStatus.FAILED]: 'Failed',
  [SubscriptionStatus.UNPAID]: 'Unpaid',
};

/** Human-readable billing interval labels */
const INTERVAL_LABELS: Record<BillingInterval, string> = {
  [BillingInterval.DAY]: 'day',
  [BillingInterval.WEEK]: 'week',
  [BillingInterval.MONTH]: 'month',
};

/**
 * Format a date string for display
 *
 * @param dateString - ISO date string
 * @returns Formatted date like "Feb 18, 2026"
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format currency amount from paisa to rupees
 *
 * @param amount - Amount in paisa (smallest currency unit)
 * @param currency - Currency code (default PKR)
 * @returns Formatted string like "Rs. 5,000"
 */
function formatAmount(amount: number, currency = 'PKR'): string {
  const major = amount / 100;
  if (currency === 'PKR') {
    return `Rs. ${major.toLocaleString('en-PK')}`;
  }
  return `${currency} ${major.toLocaleString()}`;
}

/**
 * Format billing interval for display
 *
 * @param interval - Billing interval enum value
 * @param count - Interval count (e.g. 1 for monthly, 3 for quarterly)
 * @returns Formatted string like "Monthly" or "Every 3 months"
 */
function formatInterval(interval: BillingInterval, count: number): string {
  const label = INTERVAL_LABELS[interval];
  if (count === 1) {
    return `${label.charAt(0).toUpperCase() + label.slice(1)}ly`;
  }
  return `Every ${count} ${label}s`;
}

/**
 * Check whether the subscription is in a terminal/inactive state
 *
 * @param status - Subscription status
 * @returns True if the subscription cannot be used
 */
function isInactiveStatus(status: SubscriptionStatus): boolean {
  return [
    SubscriptionStatus.CANCELLED,
    SubscriptionStatus.ENDED,
    SubscriptionStatus.FAILED,
  ].includes(status);
}

/** Loading skeleton for subscription details */
function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Empty state when user has no subscription */
function NoSubscriptionState() {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">No Active Subscription</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            You do not have an active subscription. Subscribe to a plan to
            access premium legal services and features.
          </p>
          <Button onClick={() => router.push('/subscribe')}>
            View Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Subscription detail info row
 *
 * @param props - Label, value, and optional icon
 */
function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />}
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium">
          {value || 'N/A'}
        </p>
      </div>
    </div>
  );
}

/**
 * Client subscription management page component
 *
 * Fetches and displays subscription details, event history, and cancellation controls.
 */
export default function ClientSubscriptionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  /** Fetch subscription data */
  const loadSubscription = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await getMySubscription();
      setSubscription(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load subscription';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadSubscription();
  }, [authLoading, user, loadSubscription]);

  /** Handle subscription cancellation */
  const handleCancel = async () => {
    if (!subscription) return;

    try {
      setIsCancelling(true);
      await cancelSubscription(subscription.id);
      toast.success('Subscription cancelled successfully');
      await loadSubscription();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  // Redirect to signin when session is lost
  if (!authLoading && !user) {
    router.push('/auth/signin');
    return null;
  }

  if (authLoading || isLoading) {
    return <SubscriptionSkeleton />;
  }

  const isInactive = subscription ? isInactiveStatus(subscription.status) : false;
  const canCancel = subscription
    && subscription.status === SubscriptionStatus.ACTIVE;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* No Subscription */}
      {!error && !subscription && <NoSubscriptionState />}

      {/* Subscription Details */}
      {subscription && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  {subscription.plan.name}
                </CardTitle>
                <CardDescription>
                  {subscription.plan.description || 'Subscription plan'}
                </CardDescription>
              </div>
              <Badge className={STATUS_BADGE_STYLES[subscription.status]}>
                {STATUS_LABELS[subscription.status]}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Plan & Billing Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoRow
                  icon={CreditCard}
                  label="Amount"
                  value={`${formatAmount(subscription.plan.amount, subscription.plan.currency)} / ${INTERVAL_LABELS[subscription.plan.interval]}`}
                />
                <InfoRow
                  icon={Clock}
                  label="Billing Interval"
                  value={formatInterval(subscription.plan.interval, subscription.plan.intervalCount)}
                />
                <InfoRow
                  icon={Calendar}
                  label="Current Billing Cycle"
                  value={subscription.currentBillingCycle != null
                    ? `Cycle ${subscription.currentBillingCycle}`
                    : null}
                />
                <InfoRow
                  icon={Calendar}
                  label="Current Period"
                  value={subscription.currentPeriodStart && subscription.currentPeriodEnd
                    ? `${formatDate(subscription.currentPeriodStart)} - ${formatDate(subscription.currentPeriodEnd)}`
                    : null}
                />
                <InfoRow
                  icon={Calendar}
                  label="Next Payment"
                  value={subscription.currentPeriodEnd && !isInactive
                    ? formatDate(subscription.currentPeriodEnd)
                    : isInactive ? 'N/A' : null}
                />
                <InfoRow
                  icon={CheckCircle}
                  label="Last Paid"
                  value={subscription.lastPaidAt
                    ? formatDate(subscription.lastPaidAt)
                    : null}
                />
              </div>

              {/* Additional dates for cancelled/paused */}
              {subscription.cancelledAt && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Cancelled on {formatDate(subscription.cancelledAt)}</span>
                  </div>
                </>
              )}
              {subscription.pausedAt && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Paused on {formatDate(subscription.pausedAt)}</span>
                  </div>
                </>
              )}

              {/* Plan Features */}
              {subscription.plan.features.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Plan Features</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {subscription.plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-3">
                {canCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isCancelling}>
                        {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your{' '}
                          <span className="font-semibold">{subscription.plan.name}</span>{' '}
                          subscription? Your subscription will remain active until the end of
                          the current billing period
                          {subscription.currentPeriodEnd
                            ? ` (${formatDate(subscription.currentPeriodEnd)})`
                            : ''}.
                          After that, you will lose access to premium features.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Cancel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {isInactive && (
                  <Button onClick={() => router.push('/subscribe')}>
                    Subscribe Again
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event History */}
          <EventHistoryCard events={subscription.events} currency={subscription.plan.currency} />
        </>
      )}
    </div>
  );
}

/**
 * Subscription event history card
 *
 * Displays a table of subscription events sorted by most recent first.
 *
 * @param props - Events array and currency code
 */
function EventHistoryCard({
  events,
  currency,
}: {
  events: SubscriptionDetail['events'];
  currency: string;
}) {
  if (events.length === 0) {
    return null;
  }

  /** Format event type for display */
  const formatEventType = (eventType: string): string => {
    return eventType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event History</CardTitle>
        <CardDescription>
          Recent subscription events and billing activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    {formatEventType(event.eventType)}
                  </TableCell>
                  <TableCell>
                    {event.billingCycle != null ? `Cycle ${event.billingCycle}` : '--'}
                  </TableCell>
                  <TableCell>
                    {event.amount != null
                      ? formatAmount(event.amount, currency)
                      : '--'}
                  </TableCell>
                  <TableCell>
                    {event.status ? (
                      <span className="text-xs font-medium uppercase">
                        {event.status}
                      </span>
                    ) : (
                      '--'
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(event.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
