'use client';

/**
 * Client Payment History Page
 *
 * Displays a paginated table of all payment transactions for the
 * authenticated client, including consultations, service registrations,
 * and subscription payments.
 *
 * @module ClientPaymentsPage
 *
 * @example
 * Accessible at /client/payments (requires authenticated client)
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, ReceiptText } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/use-auth';
import {
  getPaymentHistory,
  type PaymentHistoryEntry,
} from '@/lib/api/payments';

/** Number of items per page */
const PAGE_SIZE = 20;

/**
 * Format an ISO date string for display.
 *
 * @param dateString - ISO date string or null
 * @returns Formatted date like "Mar 17, 2026" or "—"
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format an amount from the smallest currency unit to a human-readable string.
 *
 * @param amount - Amount in paisa (for PKR) or cents
 * @param currency - ISO 4217 currency code
 * @returns Formatted string like "Rs. 700"
 */
function formatAmount(amount: number, currency: string): string {
  if (currency === 'PKR') {
    return `Rs. ${amount.toLocaleString('en-US')}`;
  }
  return `${currency} ${amount.toLocaleString('en-US')}`;
}

/**
 * Returns a human-readable label for the payment type.
 *
 * @param type - Payment type from the API
 */
function formatType(type: PaymentHistoryEntry['type']): string {
  switch (type) {
    case 'consultation':
      return 'Consultation';
    case 'service':
      return 'Service';
    case 'subscription':
      return 'Subscription';
    default:
      return 'Payment';
  }
}

/**
 * Returns Badge variant for a payment status.
 *
 * @param status - Payment status string
 */
function getStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'success':
      return 'default';
    case 'pending':
    case 'processing':
      return 'secondary';
    case 'failed':
    case 'refunded':
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Formats the status string for display (title case).
 *
 * @param status - Raw status string
 */
function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Client payment history page component.
 *
 * Fetches payment history with pagination and renders a data table.
 * Shows loading skeletons, an empty state, and error recovery.
 */
export default function ClientPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await getPaymentHistory({
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setPayments(data.data);
      setTotal(data.total);
      setTotalPages(Math.ceil(data.total / PAGE_SIZE));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load payment history';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user, loadPayments]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Payment History
          </h1>
          <p className="text-muted-foreground">
            All your past transactions and payments
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading payment history...'
              : total === 0
                ? 'No payments found'
                : `Showing ${payments.length} of ${total} transactions`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/15 p-4 text-destructive flex items-center justify-between gap-4">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadPayments}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-16" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <ReceiptText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">
                              No payments yet
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Your payment history will appear here after your
                              first transaction.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.referenceNumber}>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {formatDate(payment.paidAt)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.referenceNumber}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {payment.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              <CreditCard className="mr-1 h-3 w-3" />
                              {formatType(payment.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap">
                            {formatAmount(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(payment.status)}>
                              {formatStatus(payment.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!isLoading && payments.length > 0 && totalPages > 1 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        currentPage > 1 && setCurrentPage(currentPage - 1)
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        currentPage < totalPages &&
                        setCurrentPage(currentPage + 1)
                      }
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
