'use client';

/**
 * Admin Service Registrations List Page
 *
 * Displays paginated list of all service registration requests with filtering
 * by status and payment status. Staff can view registration details, payment
 * status, case links, and click through to manage individual requests.
 *
 * @module AdminServiceRegistrationsPage
 *
 * @example
 * Accessible at /admin/service-registrations
 * Requires authentication and admin/staff user type
 */

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList } from 'lucide-react';
import {
  getMyRegistrations,
  type ServiceRegistrationResponse,
} from '@/lib/api/service-registrations';
import {
  ServiceRegistrationStatus,
  ServiceRegistrationPaymentStatus,
} from '@repo/shared';

/** Registration status badge color mapping */
const STATUS_COLORS: Record<ServiceRegistrationStatus, string> = {
  [ServiceRegistrationStatus.PENDING_PAYMENT]: 'bg-yellow-500 text-white',
  [ServiceRegistrationStatus.PAID]: 'bg-blue-500 text-white',
  [ServiceRegistrationStatus.IN_PROGRESS]: 'bg-purple-500 text-white',
  [ServiceRegistrationStatus.COMPLETED]: 'bg-green-500 text-white',
  [ServiceRegistrationStatus.CANCELLED]: 'bg-gray-500 text-white',
};

/** Payment status badge color mapping */
const PAYMENT_STATUS_COLORS: Record<ServiceRegistrationPaymentStatus, string> = {
  [ServiceRegistrationPaymentStatus.PENDING]: 'bg-yellow-500 text-white',
  [ServiceRegistrationPaymentStatus.PAID]: 'bg-green-500 text-white',
  [ServiceRegistrationPaymentStatus.FAILED]: 'bg-red-500 text-white',
  [ServiceRegistrationPaymentStatus.REFUNDED]: 'bg-gray-500 text-white',
};

/** Items per page */
const PAGE_SIZE = 20;

/**
 * Format a date string for display (short format)
 *
 * @param dateString - ISO date string
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate('2024-01-15') // 'Jan 15, 2024'
 * ```
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Admin service registrations list page component
 *
 * @example
 * Renders at /admin/service-registrations
 */
export default function AdminServiceRegistrationsPage() {
  return (
    <Suspense fallback={<RegistrationsPageSkeleton />}>
      <AdminServiceRegistrationsContent />
    </Suspense>
  );
}

/**
 * Skeleton placeholder while the page loads
 */
function RegistrationsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Service Registrations
          </h1>
          <p className="text-muted-foreground">
            Manage all facilitation service registration requests
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main content component for admin service registrations list
 */
function AdminServiceRegistrationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrations, setRegistrations] = useState<ServiceRegistrationResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize status filter from URL search params (for dashboard link integration)
  const initialStatus = searchParams?.get('status') || '';

  // Filter states
  const [statusFilter, setStatusFilter] = useState<ServiceRegistrationStatus | ''>(
    initialStatus as ServiceRegistrationStatus | ''
  );
  const [paymentFilter, setPaymentFilter] = useState<ServiceRegistrationPaymentStatus | ''>('');
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch registrations when page changes
  useEffect(() => {
    async function loadRegistrations() {
      try {
        setError(null);
        setIsLoading(true);
        const data = await getMyRegistrations({ page: currentPage, limit: PAGE_SIZE });
        setRegistrations(data.registrations);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load registrations');
        toast.error('Failed to load registrations');
      } finally {
        setIsLoading(false);
      }
    }

    loadRegistrations();
  }, [currentPage]);

  // Client-side filtering (backend does not support filter query params yet)
  const filteredRegistrations = useMemo(() => {
    let filtered = registrations;

    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (paymentFilter) {
      filtered = filtered.filter((r) => r.paymentStatus === paymentFilter);
    }

    if (searchFilter) {
      const query = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.referenceNumber.toLowerCase().includes(query) ||
          r.fullName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [registrations, statusFilter, paymentFilter, searchFilter]);

  const handleClearFilters = () => {
    setStatusFilter('');
    setPaymentFilter('');
    setSearchFilter('');
    setCurrentPage(1);
  };

  const handleRowClick = (registrationId: string) => {
    router.push(`/admin/service-registrations/${registrationId}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Service Registrations
          </h1>
          <p className="text-muted-foreground">
            Manage all facilitation service registration requests
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter registrations by status, payment status, or search by reference number/name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  setStatusFilter(
                    value === 'all' ? '' : (value as ServiceRegistrationStatus)
                  );
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(ServiceRegistrationStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-filter">Payment Status</Label>
              <Select
                value={paymentFilter || 'all'}
                onValueChange={(value) => {
                  setPaymentFilter(
                    value === 'all' ? '' : (value as ServiceRegistrationPaymentStatus)
                  );
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="payment-filter">
                  <SelectValue placeholder="All payment statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All payment statuses</SelectItem>
                  {Object.values(ServiceRegistrationPaymentStatus).map((ps) => (
                    <SelectItem key={ps} value={ps}>
                      {ps.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-filter">Search</Label>
              <Input
                id="search-filter"
                placeholder="Reference # or name"
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
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

      {/* Registrations Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Registrations</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading registrations...'
              : `Showing ${filteredRegistrations.length} of ${total} total registrations`}
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
                      <TableHead>Reference #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Case #</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-40" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredRegistrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">
                              No service registrations found
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              No registrations match the current filters. Try
                              adjusting or clearing the filters above.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegistrations.map((registration) => (
                        <TableRow
                          key={registration.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(registration.id)}
                        >
                          <TableCell className="font-medium">
                            {registration.referenceNumber}
                          </TableCell>
                          <TableCell>{registration.fullName}</TableCell>
                          <TableCell>{registration.email}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[registration.status]}>
                              {registration.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                PAYMENT_STATUS_COLORS[registration.paymentStatus]
                              }
                            >
                              {registration.paymentStatus.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {registration.assignedToName ? (
                              registration.assignedToName
                            ) : registration.assignedToId ? (
                              <span className="text-muted-foreground italic">
                                Unknown
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {registration.caseNumber && registration.caseId ? (
                              <Link
                                href={`/admin/cases/${registration.caseId}`}
                                className="text-primary hover:underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {registration.caseNumber}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">
                                &mdash;
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(registration.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {!isLoading && filteredRegistrations.length > 0 && (
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
