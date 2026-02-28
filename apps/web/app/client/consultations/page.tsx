'use client';

/**
 * Client Consultations Page
 *
 * Allows clients to book new consultations (pre-filled overlay) and
 * view their consultation history with status, meeting links, and dates.
 *
 * @module ClientConsultationsPage
 *
 * @example
 * Accessible at /client/consultations
 * Requires authentication with client user type
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, ExternalLink, Video } from 'lucide-react';
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
import { useAuth } from '@/lib/auth/use-auth';
import { useConsultationOverlay } from '@/components/consultation';
import {
  getMyConsultations,
  type PaginatedConsultations,
} from '@/lib/api/consultations';
import type { ConsultationResponse } from '@repo/shared';
import {
  ConsultationBookingStatus,
} from '@repo/shared';

/** Items per page */
const PAGE_SIZE = 10;

/** Format ISO date to readable string */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format status to title case */
function formatLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Get badge variant for booking status */
function getStatusVariant(
  status: ConsultationBookingStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case ConsultationBookingStatus.BOOKED:
    case ConsultationBookingStatus.COMPLETED:
      return 'default';
    case ConsultationBookingStatus.PAYMENT_CONFIRMED:
    case ConsultationBookingStatus.PENDING_PAYMENT:
      return 'secondary';
    case ConsultationBookingStatus.CANCELLED:
      return 'destructive';
    case ConsultationBookingStatus.NO_SHOW:
      return 'outline';
    default:
      return 'secondary';
  }
}

export default function ClientConsultationsPage() {
  const { user } = useAuth();
  const { openOverlay } = useConsultationOverlay();
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConsultations = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data: PaginatedConsultations = await getMyConsultations({
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setConsultations(data.consultations);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consultations');
      toast.error('Failed to load consultations');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  const handleBookConsultation = () => {
    openOverlay({
      name: user?.fullName || '',
      email: user?.email || '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
          <p className="text-muted-foreground">
            Book and track your legal consultations
          </p>
        </div>
        <Button onClick={handleBookConsultation}>
          <Calendar className="mr-2 h-4 w-4" />
          Book a Consultation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Consultations</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading your consultations...'
              : total === 0
                ? 'You have no consultations yet'
                : `Showing ${consultations.length} of ${total} consultations`}
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
                      <TableHead>Reference</TableHead>
                      <TableHead>Practice Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Meeting</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : consultations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">No consultations yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Book a consultation to get legal advice from our team.
                            </p>
                            <Button variant="outline" onClick={handleBookConsultation}>
                              Book Your First Consultation
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      consultations.map((consultation) => (
                        <TableRow key={consultation.id}>
                          <TableCell className="font-medium font-mono text-sm">
                            {consultation.referenceNumber}
                          </TableCell>
                          <TableCell>{consultation.practiceArea}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(consultation.bookingStatus as ConsultationBookingStatus)}>
                              {formatLabel(consultation.bookingStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {consultation.bookingDate
                              ? `${formatDate(consultation.bookingDate)}${consultation.bookingTime ? ` at ${consultation.bookingTime}` : ''}`
                              : <span className="text-muted-foreground">Not scheduled</span>}
                          </TableCell>
                          <TableCell>
                            {consultation.meetingLink ? (
                              <a
                                href={consultation.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                              >
                                <Video className="h-3 w-3" />
                                Join
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">&mdash;</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(consultation.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!isLoading && consultations.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
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
