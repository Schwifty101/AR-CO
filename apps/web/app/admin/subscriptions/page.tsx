'use client';

/**
 * Admin Subscriptions List Page
 *
 * Displays paginated list of all client subscriptions.
 * Staff can view subscription details including status and billing periods.
 *
 * @module AdminSubscriptionsPage
 *
 * @example
 * Accessible at /admin/subscriptions
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllSubscriptions, type SubscriptionResponse } from '@/lib/api/subscriptions';
import { SubscriptionStatus } from '@repo/shared';

/** Subscription status badge color mapping */
const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.PENDING]: 'bg-gray-500 text-white',
  [SubscriptionStatus.ACTIVE]: 'bg-green-500 text-white',
  [SubscriptionStatus.PAST_DUE]: 'bg-red-500 text-white',
  [SubscriptionStatus.CANCELLED]: 'bg-orange-500 text-white',
  [SubscriptionStatus.EXPIRED]: 'bg-gray-500 text-white',
};

/** Items per page */
const PAGE_SIZE = 20;

/**
 * Admin subscriptions list page component
 */
export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscriptions when page changes
  useEffect(() => {
    async function loadSubscriptions() {
      try {
        setError(null);
        setIsLoading(true);
        const data = await getAllSubscriptions({ page: currentPage, limit: PAGE_SIZE });
        setSubscriptions(data.subscriptions);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
        toast.error('Failed to load subscriptions');
      } finally {
        setIsLoading(false);
      }
    }

    loadSubscriptions();
  }, [currentPage]);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          View all client subscriptions and billing status
        </p>
      </div>

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
                      <TableHead>Client Profile ID</TableHead>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Monthly Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period Start</TableHead>
                      <TableHead>Period End</TableHead>
                      <TableHead>Cancelled At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeleton rows
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-mono text-xs">
                            {subscription.clientProfileId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {subscription.planName}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(subscription.monthlyAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[subscription.status]}>
                              {subscription.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(subscription.currentPeriodStart)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(subscription.currentPeriodEnd)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(subscription.cancelledAt)}
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
