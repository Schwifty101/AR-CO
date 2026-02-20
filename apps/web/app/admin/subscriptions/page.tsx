'use client';

/**
 * Admin Subscriptions Management Page
 *
 * Displays a paginated, filterable list of all user subscriptions.
 * Admins can filter by status and cancel active subscriptions.
 *
 * @module AdminSubscriptionsPage
 *
 * @example
 * Accessible at /admin/subscriptions
 * Requires authentication and admin user type
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';
import { SubscriptionStatus } from '@repo/shared';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  getSubscriptions,
  cancelSubscription,
  type PaginatedSubscriptionsResponse,
} from '@/lib/api/subscriptions';

/** Status badge color mapping */
const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'bg-green-500 text-white',
  [SubscriptionStatus.PENDING]: 'bg-yellow-500 text-white',
  [SubscriptionStatus.PAUSED]: 'bg-blue-500 text-white',
  [SubscriptionStatus.CANCELLED]: 'bg-red-500 text-white',
  [SubscriptionStatus.ENDED]: 'bg-gray-500 text-white',
  [SubscriptionStatus.FAILED]: 'bg-destructive text-destructive-foreground',
  [SubscriptionStatus.UNPAID]: 'bg-orange-500 text-white',
};

/** Statuses that allow cancellation */
const CANCELLABLE_STATUSES = new Set<SubscriptionStatus>([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PENDING,
  SubscriptionStatus.PAUSED,
]);

/** Items per page */
const PAGE_SIZE = 20;

/** Type for a single subscription row from the paginated response */
type SubscriptionRow = PaginatedSubscriptionsResponse['data'][number];

/**
 * Format an ISO date string to a human-readable format
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date (e.g., "Jan 15, 2026")
 *
 * @example
 * ```typescript
 * formatDate('2026-01-15T10:30:00Z'); // "Jan 15, 2026"
 * ```
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a subscription status for display
 *
 * @param status - Raw subscription status enum value
 * @returns Human-readable status label
 *
 * @example
 * ```typescript
 * formatStatus('active'); // "Active"
 * ```
 */
function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Admin subscriptions list page component
 */
export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('');

  /** Load subscriptions from the API */
  const loadSubscriptions = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const params: { status?: string; page?: number; limit?: number } = {
        page: currentPage,
        limit: PAGE_SIZE,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }

      const result = await getSubscriptions(params);

      setSubscriptions(result.data);
      setTotal(result.total);
      setTotalPages(Math.max(1, Math.ceil(result.total / result.limit)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load subscriptions';
      setError(message);
      toast.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  // Fetch subscriptions when page or filters change
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  /** Handle subscription cancellation */
  const handleCancel = async (subscriptionId: string) => {
    try {
      setCancellingId(subscriptionId);
      await cancelSubscription(subscriptionId);
      toast.success('Subscription cancelled successfully');
      await loadSubscriptions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  /** Clear all filters and reset to page 1 */
  const handleClearFilters = () => {
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage all client subscriptions and billing
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter subscriptions by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  setStatusFilter(
                    value === 'all' ? '' : (value as SubscriptionStatus),
                  );
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(SubscriptionStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading subscriptions...'
              : `Showing ${subscriptions.length} of ${total} total subscriptions`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/15 p-4 text-destructive">
              {error}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Billing Cycle</TableHead>
                      <TableHead>Last Paid</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-40" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-16 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">
                              No subscriptions found
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              No subscriptions match the current filters. Try
                              adjusting or clearing the filters above.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">
                            {subscription.userName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {subscription.userEmail}
                          </TableCell>
                          <TableCell>{subscription.plan.name}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                STATUS_COLORS[
                                  subscription.status as SubscriptionStatus
                                ] ?? 'bg-gray-500 text-white'
                              }
                            >
                              {formatStatus(subscription.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {subscription.currentBillingCycle ?? '--'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {subscription.lastPaidAt
                              ? formatDate(subscription.lastPaidAt)
                              : '--'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(subscription.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {CANCELLABLE_STATUSES.has(
                              subscription.status as SubscriptionStatus,
                            ) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={cancellingId === subscription.id}
                                  >
                                    {cancellingId === subscription.id
                                      ? 'Cancelling...'
                                      : 'Cancel'}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Cancel Subscription
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel the
                                      subscription for{' '}
                                      <strong>{subscription.userName}</strong> (
                                      {subscription.plan.name})? This action
                                      cannot be undone. The subscription will
                                      remain active until the end of the current
                                      billing period.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Keep Subscription
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleCancel(subscription.id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Yes, Cancel Subscription
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {!isLoading && subscriptions.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
