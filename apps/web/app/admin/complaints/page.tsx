'use client';

/**
 * Admin Complaints List Page
 *
 * Displays paginated list of all complaints with filtering capabilities.
 * Staff can filter by status, category, and target organization.
 *
 * @module AdminComplaintsPage
 *
 * @example
 * Accessible at /admin/complaints
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getComplaints,
  type ComplaintResponse,
  type ComplaintFilters,
} from '@/lib/api/complaints';
import { ComplaintStatus, ComplaintCategory } from '@repo/shared';

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
 * Admin complaints list page component
 */
export default function AdminComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | ''>('');
  const [targetOrgFilter, setTargetOrgFilter] = useState('');

  // Fetch complaints when page or filters change
  useEffect(() => {
    async function loadComplaints() {
      try {
        setError(null);
        setIsLoading(true);

        const filters: Partial<ComplaintFilters> = {};
        if (statusFilter) filters.status = statusFilter;
        if (categoryFilter) filters.category = categoryFilter;
        if (targetOrgFilter) filters.targetOrganization = targetOrgFilter;

        const data = await getComplaints({
          page: currentPage,
          limit: PAGE_SIZE,
          ...filters,
        });

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
  }, [currentPage, statusFilter, categoryFilter, targetOrgFilter]);

  const handleClearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setTargetOrgFilter('');
    setCurrentPage(1);
  };

  const handleRowClick = (complaintId: string) => {
    router.push(`/admin/complaints/${complaintId}`);
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
        <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
        <p className="text-muted-foreground">
          Manage all client complaints and escalations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter complaints by status, category, or organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  setStatusFilter(value === 'all' ? '' : (value as ComplaintStatus));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(ComplaintStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={categoryFilter || 'all'}
                onValueChange={(value) => {
                  setCategoryFilter(value === 'all' ? '' : (value as ComplaintCategory));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {Object.values(ComplaintCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-org-filter">Target Organization</Label>
              <Input
                id="target-org-filter"
                placeholder="e.g., FBR, SECP"
                value={targetOrgFilter}
                onChange={(e) => {
                  setTargetOrgFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
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
                      <TableHead>Target Org</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
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
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : complaints.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          No complaints found
                        </TableCell>
                      </TableRow>
                    ) : (
                      complaints.map((complaint) => (
                        <TableRow
                          key={complaint.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(complaint.id)}
                        >
                          <TableCell className="font-medium">
                            {complaint.complaintNumber}
                          </TableCell>
                          <TableCell>{complaint.title}</TableCell>
                          <TableCell>{complaint.targetOrganization}</TableCell>
                          <TableCell>
                            {complaint.category ? complaint.category.replace(/_/g, ' ') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[complaint.status]}>
                              {complaint.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {complaint.assignedStaffName ? (
                              complaint.assignedStaffName
                            ) : complaint.assignedStaffId ? (
                              <span className="text-muted-foreground italic">Unknown Staff</span>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
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
