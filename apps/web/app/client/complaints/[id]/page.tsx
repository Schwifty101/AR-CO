'use client';

/**
 * Complaint Detail Page
 *
 * Displays detailed information about a specific complaint.
 * Shows all complaint fields, status, dates, and staff notes.
 *
 * @module ComplaintDetailPage
 *
 * @example
 * Accessible at /client/complaints/[id] (requires authenticated client)
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getComplaintById, type ComplaintResponse } from '@/lib/api/complaints';
import { ComplaintStatus } from '@repo/shared';

/** Complaint status badge color mapping */
const STATUS_COLORS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.SUBMITTED]: 'bg-gray-500 text-white',
  [ComplaintStatus.UNDER_REVIEW]: 'bg-yellow-500 text-white',
  [ComplaintStatus.ESCALATED]: 'bg-orange-500 text-white',
  [ComplaintStatus.RESOLVED]: 'bg-green-500 text-white',
  [ComplaintStatus.CLOSED]: 'bg-blue-500 text-white',
};

/**
 * Complaint detail page component
 */
export default function ComplaintDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState<ComplaintResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const complaintId = params.id as string;

  // Fetch complaint on mount
  useEffect(() => {
    if (authLoading) return;

    async function loadComplaint() {
      try {
        setError(null);
        const data = await getComplaintById(complaintId);
        setComplaint(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load complaint');
        toast.error('Failed to load complaint');
      } finally {
        setIsLoading(false);
      }
    }

    loadComplaint();
  }, [complaintId, authLoading]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/client/complaints')}>
          ← Back to Complaints
        </Button>
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error || 'Complaint not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {complaint.complaintNumber}
          </h1>
          <p className="text-muted-foreground">{complaint.title}</p>
        </div>
        <Badge className={STATUS_COLORS[complaint.status]}>
          {complaint.status.toUpperCase().replace('_', ' ')}
        </Badge>
      </div>

      <Button variant="outline" onClick={() => router.push('/client/complaints')}>
        ← Back to Complaints
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Complaint Information</CardTitle>
          <CardDescription>Detailed information about your complaint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Complaint Number</Label>
              <p className="text-lg font-semibold">{complaint.complaintNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge className={STATUS_COLORS[complaint.status]}>
                  {complaint.status.toUpperCase().replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Target Organization</Label>
              <p className="text-lg">{complaint.targetOrganization}</p>
            </div>
            {complaint.category && (
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="text-lg capitalize">
                  {complaint.category.replace('_', ' ')}
                </p>
              </div>
            )}
            {complaint.location && (
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="text-lg">{complaint.location}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-muted-foreground">Title</Label>
            <p className="text-lg font-medium mt-1">{complaint.title}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Description</Label>
            <p className="text-base mt-1 whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {complaint.evidenceUrls && complaint.evidenceUrls.length > 0 && (
            <div>
              <Label className="text-muted-foreground">Evidence</Label>
              <div className="space-y-1 mt-1">
                {complaint.evidenceUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-400 hover:underline"
                  >
                    Evidence {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {complaint.staffNotes && (
            <>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Staff Notes</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{complaint.staffNotes}</p>
              </div>
            </>
          )}

          {complaint.resolutionNotes && (
            <>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Resolution Notes</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {complaint.resolutionNotes}
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Submitted</Label>
              <p>{formatDateTime(complaint.createdAt)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Updated</Label>
              <p>{formatDateTime(complaint.updatedAt)}</p>
            </div>
            {complaint.resolvedAt && (
              <div>
                <Label className="text-muted-foreground">Resolved</Label>
                <p>{formatDateTime(complaint.resolvedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
