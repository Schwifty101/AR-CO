'use client';

/**
 * Client Complaints List Page
 *
 * Displays a paginated list of the authenticated client's complaints.
 * Allows navigation to complaint detail view and new complaint submission.
 *
 * @module ClientComplaintsPage
 *
 * @example
 * Accessible at /client/complaints (requires authenticated client)
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getComplaints,
  type ComplaintResponse,
} from '@/lib/api/complaints';
import { ComplaintStatus } from '@repo/shared';

/** Complaint status badge color mapping */
const STATUS_COLORS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.SUBMITTED]: 'bg-gray-500 text-white',
  [ComplaintStatus.UNDER_REVIEW]: 'bg-yellow-500 text-white',
  [ComplaintStatus.ESCALATED]: 'bg-orange-500 text-white',
  [ComplaintStatus.RESOLVED]: 'bg-green-500 text-white',
  [ComplaintStatus.CLOSED]: 'bg-blue-500 text-white',
};

/** Items per page */
const PAGE_SIZE = 20;

/**
 * Client complaints list page component
 */
export default function ClientComplaintsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch complaints when page changes
  useEffect(() => {
    if (authLoading) return;

    async function loadComplaints() {
      try {
        setError(null);
        setIsLoading(true);
        const data = await getComplaints({ page: currentPage, limit: PAGE_SIZE });
        setComplaints(data.complaints);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load complaints');
        toast.error('Failed to load complaints');
      } finally {
        setIsLoading(false);
      }
    }

    loadComplaints();
  }, [currentPage, authLoading]);

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

  const handleRowClick = (complaintId: string) => {
    router.push(`/client/complaints/${complaintId}`);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Complaints</h1>
          <p className="text-muted-foreground">
            Track and manage your submitted complaints
          </p>
        </div>
        <Button onClick={() => router.push('/client/complaints/new')}>
          New Complaint
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaints</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading complaints...'
              : `Showing ${complaints.length} of ${total} total complaints`}
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
                      <TableHead>Complaint #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Target Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeleton rows
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : complaints.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No complaints found. Click "New Complaint" to submit one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      complaints.map((complaint) => (
                        <TableRow
                          key={complaint.id}
                          onClick={() => handleRowClick(complaint.id)}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {complaint.complaintNumber}
                          </TableCell>
                          <TableCell>{complaint.title}</TableCell>
                          <TableCell>{complaint.targetOrganization}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[complaint.status]}>
                              {complaint.status.toUpperCase().replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(complaint.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {!isLoading && complaints.length > 0 && (
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
