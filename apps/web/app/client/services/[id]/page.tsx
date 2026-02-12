'use client';

/**
 * Service Registration Detail Page
 *
 * Displays detailed information about a specific service registration.
 * Shows all registration fields, status, payment status, and staff notes.
 *
 * @module ServiceRegistrationDetailPage
 *
 * @example
 * Accessible at /client/services/[id] (requires authenticated client)
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
import {
  getRegistrationById,
  type ServiceRegistrationResponse,
} from '@/lib/api/service-registrations';
import {
  ServiceRegistrationStatus,
  ServiceRegistrationPaymentStatus,
} from '@repo/shared';

/** Registration status badge color mapping */
const STATUS_COLORS: Record<ServiceRegistrationStatus, string> = {
  [ServiceRegistrationStatus.PENDING_PAYMENT]: 'bg-yellow-500 text-white',
  [ServiceRegistrationStatus.PAID]: 'bg-blue-500 text-white',
  [ServiceRegistrationStatus.IN_PROGRESS]: 'bg-purple-500 text-white',
  [ServiceRegistrationStatus.COMPLETED]: 'bg-green-500 text-white',
  [ServiceRegistrationStatus.CANCELLED]: 'bg-gray-500 text-white',
};

/** Payment status badge color mapping */
const PAYMENT_STATUS_COLORS: Record<ServiceRegistrationPaymentStatus, string> = {
  [ServiceRegistrationPaymentStatus.PENDING]: 'bg-yellow-500 text-white',
  [ServiceRegistrationPaymentStatus.PAID]: 'bg-green-500 text-white',
  [ServiceRegistrationPaymentStatus.FAILED]: 'bg-red-500 text-white',
  [ServiceRegistrationPaymentStatus.REFUNDED]: 'bg-gray-500 text-white',
};

/**
 * Service registration detail page component
 */
export default function ServiceRegistrationDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [registration, setRegistration] = useState<ServiceRegistrationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const registrationId = params.id as string;

  // Fetch registration on mount
  useEffect(() => {
    if (authLoading) return;

    async function loadRegistration() {
      try {
        setError(null);
        const data = await getRegistrationById(registrationId);
        setRegistration(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load registration');
        toast.error('Failed to load service registration');
      } finally {
        setIsLoading(false);
      }
    }

    loadRegistration();
  }, [registrationId, authLoading]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  if (error || !registration) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/client/services')}>
          ← Back to Service Registrations
        </Button>
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error || 'Service registration not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {registration.referenceNumber}
          </h1>
          <p className="text-muted-foreground">
            Service Registration Details
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className={STATUS_COLORS[registration.status]}>
            {registration.status.toUpperCase().replace('_', ' ')}
          </Badge>
          <Badge className={PAYMENT_STATUS_COLORS[registration.paymentStatus]}>
            {registration.paymentStatus.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Button variant="outline" onClick={() => router.push('/client/services')}>
        ← Back to Service Registrations
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Registration Information</CardTitle>
          <CardDescription>Detailed information about your service request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Reference Number</Label>
              <p className="text-lg font-semibold">{registration.referenceNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge className={STATUS_COLORS[registration.status]}>
                  {registration.status.toUpperCase().replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Payment Status</Label>
              <div className="mt-1">
                <Badge className={PAYMENT_STATUS_COLORS[registration.paymentStatus]}>
                  {registration.paymentStatus.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Service ID</Label>
              <p className="text-lg">{registration.serviceId}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Full Name</Label>
              <p className="text-base">{registration.fullName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-base">{registration.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone Number</Label>
              <p className="text-base">{registration.phoneNumber}</p>
            </div>
            {registration.cnic && (
              <div>
                <Label className="text-muted-foreground">CNIC</Label>
                <p className="text-base">{registration.cnic}</p>
              </div>
            )}
          </div>

          {registration.address && (
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <p className="text-base mt-1">{registration.address}</p>
            </div>
          )}

          {registration.descriptionOfNeed && (
            <div>
              <Label className="text-muted-foreground">Description of Need</Label>
              <p className="text-base mt-1 whitespace-pre-wrap">
                {registration.descriptionOfNeed}
              </p>
            </div>
          )}

          {registration.staffNotes && (
            <>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Staff Notes</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{registration.staffNotes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Submitted</Label>
              <p>{formatDateTime(registration.createdAt)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Updated</Label>
              <p>{formatDateTime(registration.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
