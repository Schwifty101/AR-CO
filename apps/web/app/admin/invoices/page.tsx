'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FileText, Send } from 'lucide-react';
import { InvoiceStatus } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  getInvoices,
  sendInvoice,
  type InvoiceResponse,
} from '@/lib/api/payments';

const PAGE_SIZE = 20;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatAmount(amount: number) {
  return `PKR ${amount.toLocaleString()}`;
}

function getStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status as InvoiceStatus) {
    case InvoiceStatus.PAID: return 'default';
    case InvoiceStatus.SENT: return 'secondary';
    case InvoiceStatus.OVERDUE: return 'destructive';
    case InvoiceStatus.CANCELLED: return 'outline';
    default: return 'secondary';
  }
}

const SENDABLE_STATUSES = new Set<InvoiceStatus>([
  InvoiceStatus.DRAFT,
  InvoiceStatus.SENT,
]);

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const params: { page?: number; limit?: number; status?: string } = {
        page: currentPage,
        limit: PAGE_SIZE,
      };
      if (statusFilter) params.status = statusFilter;
      const data = await getInvoices(params);
      setInvoices(data.data);
      setTotal(data.total);
      setTotalPages(Math.max(1, Math.ceil(data.total / PAGE_SIZE)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load invoices';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async (invoiceId: string) => {
    try {
      setSendingId(invoiceId);
      await sendInvoice(invoiceId);
      toast.success('Invoice sent successfully');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">Manage and send invoices to clients</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter invoices by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  setStatusFilter(value === 'all' ? '' : (value as InvoiceStatus));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(InvoiceStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading invoices...'
              : `Showing ${invoices.length} of ${total} invoices`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/15 p-4 text-destructive">{error}</div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">No invoices found</h3>
                            <p className="text-sm text-muted-foreground">
                              No invoices match the current filters.
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
                          <TableCell className="text-muted-foreground">
                            {inv.email ?? inv.clientProfileId ?? '—'}
                          </TableCell>
                          <TableCell>{formatDate(inv.issueDate)}</TableCell>
                          <TableCell>{formatDate(inv.dueDate)}</TableCell>
                          <TableCell className="font-medium">
                            {formatAmount(inv.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(inv.status)}>
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {SENDABLE_STATUSES.has(inv.status as InvoiceStatus) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={sendingId === inv.id}
                                  >
                                    <Send className="h-3.5 w-3.5 mr-1.5" />
                                    {sendingId === inv.id ? 'Sending...' : 'Send'}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Send Invoice</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Send invoice{' '}
                                      <strong>{inv.invoiceNumber ?? inv.id}</strong> to
                                      the client via email? The invoice status will be
                                      updated to &ldquo;Sent&rdquo;.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSend(inv.id)}>
                                      Send Invoice
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

              {!isLoading && totalPages > 1 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
