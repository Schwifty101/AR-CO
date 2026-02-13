'use client';

/**
 * Admin Cases List Page
 *
 * Displays paginated list of all cases with filtering capabilities.
 * Staff can filter by status, priority, and search by case number or title.
 *
 * @module AdminCasesPage
 *
 * @example
 * Accessible at /admin/cases
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Briefcase } from 'lucide-react';
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
  getCases,
  CaseStatus,
  CasePriority,
  type CaseResponse,
  type CaseFilters,
} from '@/lib/api/cases';
import {
  STATUS_COLORS,
  PRIORITY_COLORS,
  PAGE_SIZE,
  formatDate,
} from './cases.utils';

/**
 * Admin cases list page component
 */
export default function AdminCasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize status filter from URL search params (for dashboard link integration)
  const initialStatus = searchParams?.get('status') || '';

  // Filter states
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>(
    initialStatus as CaseStatus | ''
  );
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | ''>('');
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch cases when page or filters change
  useEffect(() => {
    async function loadCases() {
      try {
        setError(null);
        setIsLoading(true);

        const filters: Partial<CaseFilters> = {};
        if (statusFilter) filters.status = statusFilter;
        if (priorityFilter) filters.priority = priorityFilter;
        if (searchFilter) filters.search = searchFilter;

        const data = await getCases({
          page: currentPage,
          limit: PAGE_SIZE,
          ...filters,
        });

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
  }, [currentPage, statusFilter, priorityFilter, searchFilter]);

  const handleClearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setSearchFilter('');
    setCurrentPage(1);
  };

  const handleRowClick = (caseId: string) => {
    router.push(`/admin/cases/${caseId}`);
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
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">
            Manage all legal cases
          </p>
        </div>
        <Button onClick={() => router.push('/admin/cases/new')}>
          New Case
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter cases by status, priority, or search by case number/title</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  setStatusFilter(value === 'all' ? '' : (value as CaseStatus));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(CaseStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority-filter">Priority</Label>
              <Select
                value={priorityFilter || 'all'}
                onValueChange={(value) => {
                  setPriorityFilter(value === 'all' ? '' : (value as CasePriority));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="priority-filter">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {Object.values(CasePriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-filter">Search</Label>
              <Input
                id="search-filter"
                placeholder="Case # or title"
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
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
          <CardTitle>All Cases</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading cases...'
              : `Showing ${cases.length} of ${total} total cases`}
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
                      <TableHead>Case #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Attorney</TableHead>
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
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
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
                        <TableCell colSpan={7} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">No cases found</h3>
                            <p className="text-sm text-muted-foreground">
                              No cases match the current filters. Try adjusting or clearing the filters above.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      cases.map((caseItem) => (
                        <TableRow
                          key={caseItem.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(caseItem.id)}
                        >
                          <TableCell className="font-medium">
                            {caseItem.caseNumber}
                          </TableCell>
                          <TableCell>{caseItem.title}</TableCell>
                          <TableCell>{caseItem.clientName || 'N/A'}</TableCell>
                          <TableCell>
                            {caseItem.attorneyName ? (
                              caseItem.attorneyName
                            ) : caseItem.attorneyProfileId ? (
                              <span className="text-muted-foreground italic">Unknown Attorney</span>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[caseItem.status]}>
                              {caseItem.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={PRIORITY_COLORS[caseItem.priority]}>
                              {caseItem.priority.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(caseItem.filingDate || caseItem.createdAt)}
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
