'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
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
import { getInvoices, type InvoiceResponse } from '@/lib/api/payments';
import { InvoiceStatus } from '@repo/shared';

const PAGE_SIZE = 10;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatAmount(amount: number) {
  return `PKR ${amount.toLocaleString()}`;
}

function getStatusVariant(status: InvoiceStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case InvoiceStatus.PAID: return 'default';
    case InvoiceStatus.SENT: return 'secondary';
    case InvoiceStatus.OVERDUE: return 'destructive';
    case InvoiceStatus.CANCELLED: return 'outline';
    default: return 'secondary';
  }
}

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await getInvoices({ page: currentPage, limit: PAGE_SIZE });
      setInvoices(data.data);
      setTotal(data.total);
      setTotalPages(Math.ceil(data.total / PAGE_SIZE));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load invoices';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">View invoices issued to your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Invoices</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading invoices...'
              : total === 0
                ? 'No invoices yet'
                : `Showing ${invoices.length} of ${total} invoices`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/15 p-4 text-destructive">{error}</div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">No invoices yet</h3>
                            <p className="text-sm text-muted-foreground">
                              Invoices issued by AR&amp;CO will appear here.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-sm font-medium">
                            {inv.invoiceNumber ?? '—'}
                          </TableCell>
                          <TableCell>{formatDate(inv.issueDate)}</TableCell>
                          <TableCell>{formatDate(inv.dueDate)}</TableCell>
                          <TableCell className="font-medium">
                            {formatAmount(inv.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(inv.status as InvoiceStatus)}>
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {!isLoading && totalPages > 1 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}>
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
