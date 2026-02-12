'use client';

/**
 * Admin Service Registration Detail Page
 *
 * Displays full service registration details with ability to update status and assign staff.
 * Staff can add notes, track processing progress, and manage assignments.
 *
 * @module AdminServiceRegistrationDetailPage
 *
 * @example
 * Accessible at /admin/service-registrations/[id]
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getRegistrationById,
  updateRegistrationStatus,
  assignRegistration,
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

/** Update status form schema */
const updateStatusSchema = z.object({
  status: z.nativeEnum(ServiceRegistrationStatus),
  staffNotes: z.string().optional(),
});

type UpdateStatusForm = z.infer<typeof updateStatusSchema>;

/** Assign staff form schema */
const assignStaffSchema = z.object({
  staffId: z.string().uuid('Invalid staff ID format'),
});

type AssignStaffForm = z.infer<typeof assignStaffSchema>;

/**
 * Admin service registration detail page component
 */
export default function AdminServiceRegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params.id as string;

  const [registration, setRegistration] = useState<ServiceRegistrationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update status form
  const {
    register: registerStatus,
    handleSubmit: handleSubmitStatus,
    formState: { errors: statusErrors, isSubmitting: isUpdatingStatus },
    reset: resetStatus,
  } = useForm<UpdateStatusForm>({
    resolver: zodResolver(updateStatusSchema),
  });

  // Assign staff form
  const {
    register: registerAssign,
    handleSubmit: handleSubmitAssign,
    formState: { errors: assignErrors, isSubmitting: isAssigning },
    reset: resetAssign,
  } = useForm<AssignStaffForm>({
    resolver: zodResolver(assignStaffSchema),
  });

  // Fetch registration on mount
  useEffect(() => {
    async function loadRegistration() {
      try {
        setError(null);
        setIsLoading(true);
        const data = await getRegistrationById(registrationId);
        setRegistration(data);
        resetStatus({
          status: data.status,
          staffNotes: data.staffNotes || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load registration');
        toast.error('Failed to load registration');
      } finally {
        setIsLoading(false);
      }
    }

    loadRegistration();
  }, [registrationId, resetStatus]);

  const onUpdateStatus = async (data: UpdateStatusForm) => {
    try {
      const updated = await updateRegistrationStatus(registrationId, {
        status: data.status,
        staffNotes: data.staffNotes,
      });
      setRegistration(updated);
      toast.success('Registration status updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const onAssignStaff = async (data: AssignStaffForm) => {
    try {
      const updated = await assignRegistration(registrationId, data.staffId);
      setRegistration(updated);
      resetAssign();
      toast.success('Registration assigned successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign registration');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/admin/service-registrations')}>
          Back to Registrations
        </Button>
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error || 'Registration not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/admin/service-registrations')}>
          Back to Registrations
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {registration.referenceNumber}
          </h1>
          <p className="text-muted-foreground">{registration.fullName}</p>
        </div>
      </div>

      {/* Registration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Details</CardTitle>
          <CardDescription>View full service registration information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Reference Number</Label>
              <p className="font-medium">{registration.referenceNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1 flex gap-2">
                <Badge className={STATUS_COLORS[registration.status]}>
                  {registration.status.replace(/_/g, ' ')}
                </Badge>
                <Badge className={PAYMENT_STATUS_COLORS[registration.paymentStatus]}>
                  {registration.paymentStatus.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Full Name</Label>
              <p className="font-medium">{registration.fullName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{registration.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone Number</Label>
              <p className="font-medium">{registration.phoneNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">CNIC</Label>
              <p className="font-medium">{registration.cnic || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">Address</Label>
              <p className="font-medium">{registration.address || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Service ID</Label>
              <p className="font-mono text-xs">{registration.serviceId}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Assigned To</Label>
              <p className="font-medium">
                {registration.assignedStaffId || <span className="text-muted-foreground">Unassigned</span>}
              </p>
            </div>
          </div>

          <Separator />

          {registration.descriptionOfNeed && (
            <div>
              <Label className="text-muted-foreground">Description of Need</Label>
              <p className="whitespace-pre-wrap">{registration.descriptionOfNeed}</p>
            </div>
          )}

          {registration.staffNotes && (
            <div>
              <Label className="text-muted-foreground">Staff Notes</Label>
              <p className="whitespace-pre-wrap">{registration.staffNotes}</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p>{formatDate(registration.createdAt)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Updated</Label>
              <p>{formatDate(registration.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Update status or assign staff to this registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Update Status Form */}
          <form onSubmit={handleSubmitStatus(onUpdateStatus)} className="space-y-4">
            <h3 className="font-semibold">Update Status</h3>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={registration.status}
                onValueChange={(value) => {
                  resetStatus({
                    status: value as ServiceRegistrationStatus,
                    staffNotes: registration.staffNotes || '',
                  });
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ServiceRegistrationStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusErrors.status && (
                <p className="text-sm text-destructive">{statusErrors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffNotes">Staff Notes</Label>
              <Textarea
                id="staffNotes"
                placeholder="Add internal notes about this registration"
                {...registerStatus('staffNotes')}
              />
            </div>

            <Button type="submit" disabled={isUpdatingStatus}>
              {isUpdatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </form>

          <Separator />

          {/* Assign Staff Form */}
          <form onSubmit={handleSubmitAssign(onAssignStaff)} className="space-y-4">
            <h3 className="font-semibold">Assign Staff</h3>
            <div className="space-y-2">
              <Label htmlFor="staffId">Staff UUID</Label>
              <Input
                id="staffId"
                placeholder="Enter staff member UUID"
                {...registerAssign('staffId')}
              />
              {assignErrors.staffId && (
                <p className="text-sm text-destructive">{assignErrors.staffId.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isAssigning}>
              {isAssigning ? 'Assigning...' : 'Assign Staff'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
