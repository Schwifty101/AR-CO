'use client';

/**
 * Admin Audit Logs Page
 *
 * Paginated list of audit log entries with filtering by user, action,
 * entity type, and date range. Rows expand to show metadata JSON.
 *
 * @module AdminAuditLogsPage
 * @example Accessible at /admin/audit-logs — requires admin authentication
 */

import { Fragment, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollText, ChevronDown, ChevronRight } from 'lucide-react';
import { getAuditLogs, getAuditLogUsers } from '@/lib/api/audit-logs';
import type { AuditLogResponse, AuditLogUser } from '@repo/shared';
import { AuditAction, AuditEntityType } from '@repo/shared';

/** Auth session actions excluded from audit logs display */
const HIDDEN_AUTH_ACTIONS = new Set([
  AuditAction.SIGNIN,
  AuditAction.SIGNOUT,
  AuditAction.OAUTH_LOGIN,
  AuditAction.TOKEN_REFRESH,
]);

/** Filtered actions for the dropdown (excludes session noise) */
const VISIBLE_ACTIONS = Object.values(AuditAction).filter(
  (a) => !HIDDEN_AUTH_ACTIONS.has(a),
);

/** Action badge color mapping */
const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  INVITE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ADD_ACTIVITY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  STATUS_CHANGE: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  CANCEL: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  ASSIGN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  SIGNUP: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  EMAIL_CONFIRM: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  PASSWORD_RESET: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

/** Items per page */
const PAGE_SIZE = 25;

/** Format entity type for display — replaces underscores, capitalizes first letter */
function formatEntityType(entityType: string): string {
  const s = entityType.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Format timestamp as "Mar 3, 2026, 2:30 PM" */
function formatTimestamp(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

/** Admin audit logs page component */
export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AuditLogUser[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Filter states
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch users for dropdown on mount
  useEffect(() => {
    getAuditLogUsers()
      .then(setUsers)
      .catch(() => toast.error('Failed to load users for filter'));
  }, []);

  // Fetch audit logs when page or filters change
  const loadLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string | number> = { page: currentPage, limit: PAGE_SIZE };
      if (userFilter) params.userId = userFilter;
      if (actionFilter) params.action = actionFilter;
      if (entityTypeFilter) params.entityType = entityTypeFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const result = await getAuditLogs(params);
      // When no action filter is set, hide noisy auth session actions
      const filtered = actionFilter
        ? result.data
        : result.data.filter((l) => !HIDDEN_AUTH_ACTIONS.has(l.action as AuditAction));
      setLogs(filtered);
      setTotal(actionFilter ? result.total : filtered.length);
      setTotalPages(Math.max(1, Math.ceil(result.total / PAGE_SIZE)));
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, userFilter, actionFilter, entityTypeFilter, dateFrom, dateTo]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleClearFilters = () => {
    setUserFilter('');
    setActionFilter('');
    setEntityTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleRowClick = (logId: string) => {
    setExpandedRow(expandedRow === logId ? null : logId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">View all system activity and admin actions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter logs by user, action, entity type, or date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-filter">User</Label>
              <Select
                value={userFilter || 'all'}
                onValueChange={(v) => { setUserFilter(v === 'all' ? '' : v); setCurrentPage(1); }}
              >
                <SelectTrigger id="user-filter"><SelectValue placeholder="All users" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.fullName || u.id.slice(0, 8)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-filter">Action</Label>
              <Select
                value={actionFilter || 'all'}
                onValueChange={(v) => { setActionFilter(v === 'all' ? '' : v); setCurrentPage(1); }}
              >
                <SelectTrigger id="action-filter"><SelectValue placeholder="All actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {VISIBLE_ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity-type-filter">Entity Type</Label>
              <Select
                value={entityTypeFilter || 'all'}
                onValueChange={(v) => { setEntityTypeFilter(v === 'all' ? '' : v); setCurrentPage(1); }}
              >
                <SelectTrigger id="entity-type-filter"><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.values(AuditEntityType).map((t) => (
                    <SelectItem key={t} value={t}>{formatEntityType(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from">Date From</Label>
              <Input id="date-from" type="date" value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">Date To</Label>
              <Input id="date-to" type="date" value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading audit logs...' : `Showing ${logs.length} of ${total} total entries`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <ScrollText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-1">No audit logs found</h3>
                        <p className="text-sm text-muted-foreground">
                          No logs match the current filters. Try adjusting or clearing the filters above.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <Fragment key={log.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(log.id)}
                      >
                        <TableCell className="w-8 px-2">
                          {expandedRow === log.id
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.createdAt)}
                        </TableCell>
                        <TableCell>{log.userName || 'System'}</TableCell>
                        <TableCell>
                          <Badge className={ACTION_COLORS[log.action] || ''}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatEntityType(log.entityType)}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.entityId ? log.entityId.slice(0, 8) : '\u2014'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {log.ipAddress || '\u2014'}
                        </TableCell>
                      </TableRow>
                      {expandedRow === log.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30 p-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Metadata</p>
                              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto max-h-64">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                              {log.userAgent && (
                                <>
                                  <p className="text-sm font-medium mt-2">User Agent</p>
                                  <p className="text-xs text-muted-foreground break-all">{log.userAgent}</p>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && logs.length > 0 && (
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
        </CardContent>
      </Card>
    </div>
  );
}
