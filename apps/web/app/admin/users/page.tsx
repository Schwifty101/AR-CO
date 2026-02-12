'use client';

/**
 * Admin Users List Page
 *
 * Displays paginated list of all users in the system.
 * Admin and staff can view all users; admins can delete users.
 *
 * @module AdminUsersPage
 *
 * @example
 * Accessible at /admin/users
 * Requires authentication and admin/staff user type
 */

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Search, UserPlus } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getUsers, deleteUser, inviteUser, type UserProfile, type InviteUserData } from '@/lib/api/users';

/** User type badge color mapping */
const USER_TYPE_COLORS: Record<string, string> = {
  admin: 'bg-red-500 text-white',
  attorney: 'bg-blue-500 text-white',
  staff: 'bg-green-500 text-white',
  client: 'bg-gray-500 text-white',
};

/** Items per page */
const PAGE_SIZE = 20;

/**
 * Admin users list page component
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');

  // Invite user dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteFormData, setInviteFormData] = useState<InviteUserData>({
    email: '',
    fullName: '',
    userType: 'staff',
    phoneNumber: '',
  });

  // Debounce search input (300ms)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, userTypeFilter]);

  // Fetch users when page or filters change
  useEffect(() => {
    async function loadUsers() {
      try {
        setError(null);
        setIsLoading(true);

        // Build userTypes array based on filter selection
        let userTypes: string[] | undefined;
        if (userTypeFilter === 'all') {
          userTypes = ['admin', 'staff', 'attorney'];
        } else {
          userTypes = [userTypeFilter];
        }

        const data = await getUsers({
          page: currentPage,
          limit: PAGE_SIZE,
          userTypes,
          search: debouncedSearch || undefined,
        });
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [currentPage, debouncedSearch, userTypeFilter]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await deleteUser(userId);
      toast.success('User deleted successfully');

      // Reload users list with current filters
      const userTypes = userTypeFilter === 'all'
        ? ['admin', 'staff', 'attorney']
        : [userTypeFilter];
      const data = await getUsers({
        page: currentPage,
        limit: PAGE_SIZE,
        userTypes,
        search: debouncedSearch || undefined,
      });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);

      // If current page is now empty and not page 1, go to previous page
      if (data.users.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete user',
      );
    } finally {
      setDeletingUserId(null);
    }
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

  const handleInviteUser = async () => {
    // Validate form
    if (!inviteFormData.email || !inviteFormData.fullName || !inviteFormData.userType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsInviting(true);
      await inviteUser(inviteFormData);
      toast.success(`Invitation sent to ${inviteFormData.email}`);

      // Close dialog and reset form
      setInviteDialogOpen(false);
      setInviteFormData({
        email: '',
        fullName: '',
        userType: 'staff',
        phoneNumber: '',
      });

      // Refresh users list with current filters
      const userTypes = userTypeFilter === 'all'
        ? ['admin', 'staff', 'attorney']
        : [userTypeFilter];
      const data = await getUsers({
        page: currentPage,
        limit: PAGE_SIZE,
        userTypes,
        search: debouncedSearch || undefined,
      });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to invite user');
    } finally {
      setIsInviting(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setInviteDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setInviteFormData({
        email: '',
        fullName: '',
        userType: 'staff',
        phoneNumber: '',
      });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Admin Users</h1>
          <p className="text-muted-foreground">
            Manage admin, staff, and attorney accounts
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation email to a new admin, staff, or attorney user.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteFormData.email}
                  onChange={(e) =>
                    setInviteFormData({ ...inviteFormData, email: e.target.value })
                  }
                  disabled={isInviting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={inviteFormData.fullName}
                  onChange={(e) =>
                    setInviteFormData({ ...inviteFormData, fullName: e.target.value })
                  }
                  disabled={isInviting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">User Type *</Label>
                <Select
                  value={inviteFormData.userType}
                  onValueChange={(value) =>
                    setInviteFormData({
                      ...inviteFormData,
                      userType: value as 'admin' | 'staff' | 'attorney',
                    })
                  }
                  disabled={isInviting}
                >
                  <SelectTrigger id="userType">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="attorney">Attorney</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={inviteFormData.phoneNumber}
                  onChange={(e) =>
                    setInviteFormData({ ...inviteFormData, phoneNumber: e.target.value })
                  }
                  disabled={isInviting}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                disabled={isInviting}
              >
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={isInviting}>
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading team members...'
              : `Showing ${users.length} of ${total} staff, admin, and attorney users`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="attorney">Attorney</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeleton rows
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-8 w-16 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.fullName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                USER_TYPE_COLORS[user.userType] ||
                                'bg-gray-500'
                              }
                            >
                              {user.userType.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.phoneNumber || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteUser(user.id, user.fullName)
                              }
                              disabled={deletingUserId === user.id}
                            >
                              {deletingUserId === user.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {!isLoading && users.length > 0 && (
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
