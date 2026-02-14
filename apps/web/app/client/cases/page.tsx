'use client';

/**
 * Client Cases List Page
 *
 * Displays a paginated list of the authenticated client's cases.
 * Allows navigation to case detail view. Read-only interface.
 *
 * @module ClientCasesPage
 *
 * @example
 * Accessible at /client/cases (requires authenticated client)
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase } from 'lucide-react';
import {
  getCases,
  CaseStatus,
  CasePriority,
  type CaseResponse,
} from '@/lib/api/cases';

/** Case status badge color mapping */
const STATUS_COLORS: Record<CaseStatus, string> = {
  [CaseStatus.PENDING]: 'bg-yellow-500 text-white',
  [CaseStatus.ACTIVE]: 'bg-blue-500 text-white',
  [CaseStatus.ON_HOLD]: 'bg-orange-500 text-white',
  [CaseStatus.RESOLVED]: 'bg-green-500 text-white',
  [CaseStatus.CLOSED]: 'bg-gray-500 text-white',
};

/** Case priority badge color mapping */
const PRIORITY_COLORS: Record<CasePriority, string> = {
  [CasePriority.LOW]: 'bg-gray-100 text-gray-800',
  [CasePriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [CasePriority.HIGH]: 'bg-orange-100 text-orange-800',
  [CasePriority.URGENT]: 'bg-red-500 text-white',
};

/** Items per page */
const PAGE_SIZE = 20;

/**
 * Client cases list page component
 */
export default function ClientCasesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');

  // Fetch cases when page or filter changes
  useEffect(() => {
    if (authLoading) return;

    async function loadCases() {
      try {
        setError(null);
        setIsLoading(true);
        const params: Parameters<typeof getCases>[0] = {
          page: currentPage,
          limit: PAGE_SIZE,
        };
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        const data = await getCases(params);
        setCases(data.cases);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cases');
        toast.error('Failed to load cases');
      } finally {
        setIsLoading(false);
      }
    }

    loadCases();
  }, [currentPage, statusFilter, authLoading]);

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

  const handleRowClick = (caseId: string) => {
    router.push(`/client/cases/${caseId}`);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as CaseStatus | 'all');
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Redirect to signin when session is lost
  if (!authLoading && !user) {
    router.push('/auth/signin');
    return null;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Cases</h1>
        <p className="text-muted-foreground">
          View and track your legal cases
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cases</CardTitle>
              <CardDescription>
                {isLoading
                  ? 'Loading cases...'
                  : `Showing ${cases.length} of ${total} total cases`}
              </CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={CaseStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={CaseStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={CaseStatus.ON_HOLD}>On Hold</SelectItem>
                <SelectItem value={CaseStatus.RESOLVED}>Resolved</SelectItem>
                <SelectItem value={CaseStatus.CLOSED}>Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                      <TableHead>Case #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Filing Date</TableHead>
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
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : cases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">No cases found</h3>
                            <p className="text-sm text-muted-foreground">
                              {statusFilter === 'all'
                                ? 'You do not have any cases yet.'
                                : `No cases with status "${statusFilter}".`}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      cases.map((caseItem) => (
                        <TableRow
                          key={caseItem.id}
                          onClick={() => handleRowClick(caseItem.id)}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {caseItem.caseNumber}
                          </TableCell>
                          <TableCell>{caseItem.title}</TableCell>
                          <TableCell>
                            {caseItem.assignedToName || 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[caseItem.status]}>
                              {caseItem.status.toUpperCase().replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={PRIORITY_COLORS[caseItem.priority]}>
                              {caseItem.priority.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(caseItem.filingDate)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {!isLoading && cases.length > 0 && (
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
