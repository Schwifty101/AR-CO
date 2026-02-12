'use client';

/**
 * Admin Complaint Detail Page
 *
 * Displays full complaint details with ability to update status and assign staff.
 * Staff can add notes, mark as resolved, and track progress.
 *
 * @module AdminComplaintDetailPage
 *
 * @example
 * Accessible at /admin/complaints/[id]
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
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
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

/** Update status form schema */
const updateStatusSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
  staffNotes: z.string().optional(),
  resolutionNotes: z.string().optional(),
});

type UpdateStatusForm = z.infer<typeof updateStatusSchema>;

/** Assign staff form schema */
const assignStaffSchema = z.object({
  staffId: z.string().uuid('Invalid staff ID format'),
});

type AssignStaffForm = z.infer<typeof assignStaffSchema>;

/**
 * Admin complaint detail page component
 */
export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<ComplaintResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update status form
  const {
    register: registerStatus,
    handleSubmit: handleSubmitStatus,
    formState: { errors: statusErrors, isSubmitting: isUpdatingStatus },
    watch,
    reset: resetStatus,
  } = useForm<UpdateStatusForm>({
    resolver: zodResolver(updateStatusSchema),
  });

  const selectedStatus = watch('status');

  // Assign staff form
  const {
    register: registerAssign,
    handleSubmit: handleSubmitAssign,
    formState: { errors: assignErrors, isSubmitting: isAssigning },
    reset: resetAssign,
  } = useForm<AssignStaffForm>({
    resolver: zodResolver(assignStaffSchema),
  });

  // Fetch complaint on mount
  useEffect(() => {
    async function loadComplaint() {
      try {
        setError(null);
        setIsLoading(true);
        const data = await getComplaintById(complaintId);
        setComplaint(data);
        resetStatus({
          status: data.status,
          staffNotes: data.staffNotes || '',
          resolutionNotes: data.resolutionNotes || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load complaint');
        toast.error('Failed to load complaint');
      } finally {
        setIsLoading(false);
      }
    }

    loadComplaint();
  }, [complaintId, resetStatus]);

  const onUpdateStatus = async (data: UpdateStatusForm) => {
    try {
      const updated = await updateComplaintStatus(complaintId, {
        status: data.status,
        staffNotes: data.staffNotes,
        resolutionNotes: data.resolutionNotes,
      });
      setComplaint(updated);
      toast.success('Complaint status updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const onAssignStaff = async (data: AssignStaffForm) => {
    try {
      const updated = await assignComplaint(complaintId, { staffId: data.staffId });
      setComplaint(updated);
      resetAssign();
      toast.success('Complaint assigned successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign complaint');
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

  if (error || !complaint) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/admin/complaints')}>
          Back to Complaints
        </Button>
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error || 'Complaint not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/admin/complaints')}>
          Back to Complaints
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {complaint.complaintNumber}
          </h1>
          <p className="text-muted-foreground">{complaint.title}</p>
        </div>
      </div>

      {/* Complaint Details */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
          <CardDescription>View full complaint information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Complaint Number</Label>
              <p className="font-medium">{complaint.complaintNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge className={STATUS_COLORS[complaint.status]}>
                  {complaint.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Target Organization</Label>
              <p className="font-medium">{complaint.targetOrganization}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <p className="font-medium">{complaint.category ? complaint.category.replace(/_/g, ' ') : 'N/A'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Location</Label>
              <p className="font-medium">{complaint.location || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Assigned To</Label>
              <p className="font-medium">
                {complaint.assignedStaffId || <span className="text-muted-foreground">Unassigned</span>}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-muted-foreground">Title</Label>
            <p className="font-medium">{complaint.title}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Description</Label>
            <p className="whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {complaint.evidenceUrls && complaint.evidenceUrls.length > 0 && (
            <div>
              <Label className="text-muted-foreground">Evidence URLs</Label>
              <ul className="list-disc list-inside space-y-1">
                {complaint.evidenceUrls.map((url, idx) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {complaint.staffNotes && (
            <div>
              <Label className="text-muted-foreground">Staff Notes</Label>
              <p className="whitespace-pre-wrap">{complaint.staffNotes}</p>
            </div>
          )}

          {complaint.resolutionNotes && (
            <div>
              <Label className="text-muted-foreground">Resolution Notes</Label>
              <p className="whitespace-pre-wrap">{complaint.resolutionNotes}</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p>{formatDate(complaint.createdAt)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Updated</Label>
              <p>{formatDate(complaint.updatedAt)}</p>
            </div>
            {complaint.resolvedAt && (
              <div>
                <Label className="text-muted-foreground">Resolved</Label>
                <p>{formatDate(complaint.resolvedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Update status or assign staff to this complaint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Update Status Form */}
          <form onSubmit={handleSubmitStatus(onUpdateStatus)} className="space-y-4">
            <h3 className="font-semibold">Update Status</h3>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={complaint.status}
                onValueChange={(value) => {
                  resetStatus({
                    status: value as ComplaintStatus,
                    staffNotes: complaint.staffNotes || '',
                    resolutionNotes: complaint.resolutionNotes || '',
                  });
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ComplaintStatus).map((status) => (
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
                placeholder="Add internal notes about this complaint"
                {...registerStatus('staffNotes')}
              />
            </div>

            {selectedStatus === ComplaintStatus.RESOLVED && (
              <div className="space-y-2">
                <Label htmlFor="resolutionNotes">Resolution Notes</Label>
                <Textarea
                  id="resolutionNotes"
                  placeholder="Describe how the complaint was resolved"
                  {...registerStatus('resolutionNotes')}
                />
              </div>
            )}

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
