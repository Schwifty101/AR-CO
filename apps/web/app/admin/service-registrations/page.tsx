'use client';

/**
 * Admin Service Registrations List Page
 *
 * Displays paginated list of all service registration requests.
 * Staff can view registration details, payment status, and click through to manage individual requests.
 *
 * @module AdminServiceRegistrationsPage
 *
 * @example
 * Accessible at /admin/service-registrations
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  getMyRegistrations,
  type ServiceRegistrationResponse,
} from '@/lib/api/service-registrations';
import { ServiceRegistrationStatus, ServiceRegistrationPaymentStatus } from '@repo/shared';

/** Registration status badge color mapping */
const STATUS_COLORS: Record<ServiceRegistrationStatus, string> = {
  [ServiceRegistrationStatus.PENDING_PAYMENT]: 'bg-gray-500 text-white',
  [ServiceRegistrationStatus.PAID]: 'bg-green-500 text-white',
  [ServiceRegistrationStatus.IN_PROGRESS]: 'bg-blue-500 text-white',
  [ServiceRegistrationStatus.COMPLETED]: 'bg-green-500 text-white',
  [ServiceRegistrationStatus.CANCELLED]: 'bg-red-500 text-white',
};

/** Payment status badge color mapping */
const PAYMENT_STATUS_COLORS: Record<ServiceRegistrationPaymentStatus, string> = {
  [ServiceRegistrationPaymentStatus.PENDING]: 'bg-yellow-500 text-white',
  [ServiceRegistrationPaymentStatus.PAID]: 'bg-green-500 text-white',
  [ServiceRegistrationPaymentStatus.FAILED]: 'bg-red-500 text-white',
  [ServiceRegistrationPaymentStatus.REFUNDED]: 'bg-orange-500 text-white',
};

/** Items per page */
const PAGE_SIZE = 20;

/**
 * Admin service registrations list page component
 */
export default function AdminServiceRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<ServiceRegistrationResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch registrations when page changes
  useEffect(() => {
    async function loadRegistrations() {
      try {
        setError(null);
        setIsLoading(true);
        // Note: getMyRegistrations returns ALL registrations for staff users
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service Registrations</h1>
        <p className="text-muted-foreground">
          Manage all facilitation service registration requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Registrations</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading registrations...'
              : `Showing ${registrations.length} of ${total} total registrations`}
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
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Service ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeleton rows
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
                            <Skeleton className="h-4 w-24" />
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
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : registrations.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-muted-foreground py-8"
                        >
                          No registrations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrations.map((registration) => (
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
                          <TableCell className="font-mono text-xs">
                            {registration.serviceId}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[registration.status]}>
                              {registration.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={PAYMENT_STATUS_COLORS[registration.paymentStatus]}>
                              {registration.paymentStatus.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {registration.assignedToName ? (
                              registration.assignedToName
                            ) : registration.assignedToId ? (
                              <span className="text-muted-foreground italic">Unknown</span>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
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
              {!isLoading && registrations.length > 0 && (
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
