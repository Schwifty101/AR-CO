'use client';

/**
 * Admin Clients List Page
 *
 * Displays paginated list of all registered clients in the system.
 * Staff can view all clients and create new client accounts.
 *
 * @module AdminClientsPage
 *
 * @example
 * Accessible at /admin/clients
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
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
import {
  getClients,
  createClient,
  CompanyType,
  type ClientResponse,
  type CreateClientData,
} from '@/lib/api/clients';

/** Items per page */
const PAGE_SIZE = 20;

/**
 * Admin clients list page component
 */
export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add client dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateClientData>({
    email: '',
    fullName: '',
    phoneNumber: '',
    companyName: '',
    companyType: undefined,
    address: '',
    city: '',
  });

  // Fetch clients when page changes
  useEffect(() => {
    async function loadClients() {
      try {
        setError(null);
        setIsLoading(true);
        const data = await getClients({ page: currentPage, limit: PAGE_SIZE });
        setClients(data.clients);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clients');
        toast.error('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    }

    loadClients();
  }, [currentPage]);

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

  const handleCreateClient = async () => {
    // Validate required fields
    if (!formData.email || !formData.fullName) {
      toast.error('Please fill in all required fields (Email and Full Name)');
      return;
    }

    try {
      setIsCreating(true);

      // Remove empty optional fields to avoid sending empty strings
      const cleanedData: CreateClientData = {
        email: formData.email,
        fullName: formData.fullName,
      };

      if (formData.phoneNumber) cleanedData.phoneNumber = formData.phoneNumber;
      if (formData.companyName) cleanedData.companyName = formData.companyName;
      if (formData.companyType) cleanedData.companyType = formData.companyType;
      if (formData.address) cleanedData.address = formData.address;
      if (formData.city) cleanedData.city = formData.city;

      await createClient(cleanedData);
      toast.success(`Client "${formData.fullName}" created successfully`);

      // Close dialog and reset form
      setAddDialogOpen(false);
      setFormData({
        email: '',
        fullName: '',
        phoneNumber: '',
        companyName: '',
        companyType: undefined,
        address: '',
        city: '',
      });

      // Refresh clients list
      const data = await getClients({ page: currentPage, limit: PAGE_SIZE });
      setClients(data.clients);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        email: '',
        fullName: '',
        phoneNumber: '',
        companyName: '',
        companyType: undefined,
        address: '',
        city: '',
      });
    }
  };

  const handleRowClick = (clientId: string) => {
    // Placeholder for client detail page
    toast.info('Client detail page coming soon');
    // Future: router.push(`/admin/clients/${clientId}`);
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
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage registered client accounts
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client account in the system.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="ABC Corporation"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyType">Company Type (Optional)</Label>
                <Select
                  value={formData.companyType || 'none'}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      companyType: value === 'none' ? undefined : (value as CompanyType),
                    })
                  }
                  disabled={isCreating}
                >
                  <SelectTrigger id="companyType">
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value={CompanyType.SOLE_PROPRIETORSHIP}>
                      Sole Proprietorship
                    </SelectItem>
                    <SelectItem value={CompanyType.PARTNERSHIP}>
                      Partnership
                    </SelectItem>
                    <SelectItem value={CompanyType.LLC}>LLC</SelectItem>
                    <SelectItem value={CompanyType.CORPORATION}>
                      Corporation
                    </SelectItem>
                    <SelectItem value={CompanyType.NGO}>NGO</SelectItem>
                    <SelectItem value={CompanyType.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street, Suite 400"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City (Optional)</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Karachi"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  disabled={isCreating}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateClient} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading clients...'
              : `Showing ${clients.length} of ${total} total clients`}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Registered</TableHead>
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
                            <Skeleton className="h-4 w-40" />
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
                    ) : clients.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                        >
                          No clients found
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow
                          key={client.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(client.id)}
                        >
                          <TableCell className="font-medium">
                            {client.fullName}
                          </TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>
                            {client.companyName || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {client.phoneNumber || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(client.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(client.id);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {!isLoading && clients.length > 0 && (
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
