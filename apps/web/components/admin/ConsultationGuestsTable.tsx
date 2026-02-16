'use client';

/**
 * ConsultationGuestsTable Component
 *
 * Self-contained admin table for viewing consultation booking guests. Displays
 * a paginated, filterable table with expandable rows showing full booking
 * details. Manages its own data fetching, filtering, and pagination state.
 *
 * @module ConsultationGuestsTable
 *
 * @example
 * ```tsx
 * import ConsultationGuestsTable from '@/components/admin/ConsultationGuestsTable';
 *
 * export default function AdminConsultationsPage() {
 *   return <ConsultationGuestsTable />;
 * }
 * ```
 */

import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  getConsultations, type PaginatedConsultations,
} from '@/lib/api/consultations';
import type { ConsultationResponse } from '@repo/shared';
import {
  ConsultationBookingStatus, ConsultationPaymentStatus,
} from '@repo/shared';

/** Items per page */
const PAGE_SIZE = 20;

/** Total columns including the chevron expand icon column */
const TOTAL_COLS = 8;

/** Badge styling props shared between payment and booking badge helpers */
type BadgeProps = {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
};

/**
 * Formats an ISO date string into "Jan 1, 2025" format.
 *
 * @example
 * ```ts
 * formatDate('2025-01-01T00:00:00Z'); // "Jan 1, 2025"
 * ```
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/**
 * Converts a snake_case enum value into a Title Case label.
 *
 * @example
 * ```ts
 * formatLabel('pending_payment'); // "Pending Payment"
 * ```
 */
function formatLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Returns Badge variant and optional className for a payment status.
 *
 * @example
 * ```ts
 * getPaymentBadgeProps(ConsultationPaymentStatus.PAID);
 * // { variant: 'default', className: 'bg-green-600 hover:bg-green-600/90' }
 * ```
 */
function getPaymentBadgeProps(status: ConsultationPaymentStatus): BadgeProps {
  switch (status) {
    case ConsultationPaymentStatus.PAID:
      return { variant: 'default', className: 'bg-green-600 hover:bg-green-600/90' };
    case ConsultationPaymentStatus.PENDING:
      return { variant: 'secondary' };
    case ConsultationPaymentStatus.FAILED:
      return { variant: 'destructive' };
    case ConsultationPaymentStatus.REFUNDED:
      return { variant: 'outline' };
    default:
      return { variant: 'secondary' };
  }
}

/**
 * Returns Badge variant and optional className for a booking status.
 *
 * @example
 * ```ts
 * getBookingBadgeProps(ConsultationBookingStatus.BOOKED);
 * // { variant: 'default' }
 * ```
 */
function getBookingBadgeProps(status: ConsultationBookingStatus): BadgeProps {
  switch (status) {
    case ConsultationBookingStatus.BOOKED:
      return { variant: 'default' };
    case ConsultationBookingStatus.PAYMENT_CONFIRMED:
      return { variant: 'secondary', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    case ConsultationBookingStatus.PENDING_PAYMENT:
      return { variant: 'secondary' };
    case ConsultationBookingStatus.COMPLETED:
      return { variant: 'default' };
    case ConsultationBookingStatus.CANCELLED:
      return { variant: 'destructive' };
    case ConsultationBookingStatus.NO_SHOW:
      return { variant: 'outline' };
    default:
      return { variant: 'secondary' };
  }
}

/** Renders a label/value pair in the expanded detail section. */
function DetailItem({ label, value, fullWidth = false }: {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  );
}

/**
 * Renders the expanded detail section for a consultation booking row.
 * Shows reference, urgency, issue summary, scheduling, meeting link,
 * notes, opposing party, and relevant dates in a 2-column grid.
 *
 * @example
 * ```tsx
 * <ExpandedDetails consultation={consultationData} />
 * ```
 */
function ExpandedDetails({ consultation }: { consultation: ConsultationResponse }) {
  return (
    <div className="p-4 bg-muted/30 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Reference Number" value={consultation.referenceNumber} />
        <DetailItem label="Urgency" value={formatLabel(consultation.urgency)} />
        <DetailItem label="Issue Summary" value={consultation.issueSummary} fullWidth />
        <DetailItem
          label="Booking Date"
          value={
            consultation.bookingDate
              ? `${formatDate(consultation.bookingDate)}${consultation.bookingTime ? ` at ${consultation.bookingTime}` : ''}`
              : 'Not scheduled'
          }
        />
        <DetailItem
          label="Meeting Link"
          value={
            consultation.meetingLink ? (
              <a
                href={consultation.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Join Meeting
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              'Not available'
            )
          }
        />
        <DetailItem label="Additional Notes" value={consultation.additionalNotes || 'None'} />
        <DetailItem label="Opposing Party" value={consultation.opposingParty || 'Not specified'} />
        <DetailItem label="Relevant Dates" value={consultation.relevantDates || 'None'} />
      </div>
    </div>
  );
}

/**
 * Renders a consultation data row and its optional expanded detail row.
 *
 * @example
 * ```tsx
 * <ConsultationRow
 *   consultation={data}
 *   isExpanded={true}
 *   paymentBadge={{ variant: 'default', className: 'bg-green-600' }}
 *   bookingBadge={{ variant: 'default' }}
 *   onToggle={(id) => setExpandedId(id)}
 * />
 * ```
 */
function ConsultationRow({ consultation, isExpanded, paymentBadge, bookingBadge, onToggle }: {
  consultation: ConsultationResponse;
  isExpanded: boolean;
  paymentBadge: BadgeProps;
  bookingBadge: BadgeProps;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => onToggle(consultation.id)}>
        <TableCell className="w-[30px] pr-0">
          {isExpanded
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </TableCell>
        <TableCell className="font-medium">{consultation.fullName}</TableCell>
        <TableCell>{consultation.email}</TableCell>
        <TableCell>{consultation.phoneNumber}</TableCell>
        <TableCell>{consultation.practiceArea}</TableCell>
        <TableCell>
          <Badge variant={paymentBadge.variant} className={paymentBadge.className}>
            {formatLabel(consultation.paymentStatus)}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={bookingBadge.variant} className={bookingBadge.className}>
            {formatLabel(consultation.bookingStatus)}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatDate(consultation.createdAt)}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={TOTAL_COLS} className="p-0 border-b">
            <ExpandedDetails consultation={consultation} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

/**
 * Consultation guests table with filtering, expandable rows, and pagination.
 *
 * Renders a Card containing filter dropdowns (booking status, payment status),
 * a data table with expandable detail rows, loading skeletons,
 * empty/error states, and Previous/Next pagination controls.
 *
 * @example
 * ```tsx
 * <ConsultationGuestsTable />
 * ```
 */
export default function ConsultationGuestsTable() {
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [bookingStatusFilter, paymentStatusFilter]);

  // Fetch consultations when page or filters change
  const loadConsultations = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data: PaginatedConsultations = await getConsultations({
        page: currentPage,
        limit: PAGE_SIZE,
        bookingStatus: bookingStatusFilter === 'all'
          ? undefined
          : (bookingStatusFilter as ConsultationBookingStatus),
        paymentStatus: paymentStatusFilter === 'all'
          ? undefined
          : (paymentStatusFilter as ConsultationPaymentStatus),
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
  }, [currentPage, bookingStatusFilter, paymentStatusFilter]);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  /** Toggle expanded state for a consultation row */
  const handleRowClick = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultation Guests</CardTitle>
        <CardDescription>
          {isLoading
            ? 'Loading consultation bookings...'
            : `Showing ${consultations.length} of ${total} total bookings`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
          <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Booking status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Booking Statuses</SelectItem>
              <SelectItem value={ConsultationBookingStatus.PENDING_PAYMENT}>Pending Payment</SelectItem>
              <SelectItem value={ConsultationBookingStatus.PAYMENT_CONFIRMED}>Payment Confirmed</SelectItem>
              <SelectItem value={ConsultationBookingStatus.BOOKED}>Booked</SelectItem>
              <SelectItem value={ConsultationBookingStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={ConsultationBookingStatus.CANCELLED}>Cancelled</SelectItem>
              <SelectItem value={ConsultationBookingStatus.NO_SHOW}>No Show</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Statuses</SelectItem>
              <SelectItem value={ConsultationPaymentStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={ConsultationPaymentStatus.PAID}>Paid</SelectItem>
              <SelectItem value={ConsultationPaymentStatus.FAILED}>Failed</SelectItem>
              <SelectItem value={ConsultationPaymentStatus.REFUNDED}>Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <div className="rounded-md bg-destructive/15 p-4 text-destructive">{error}</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]" />
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Practice Area</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : consultations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={TOTAL_COLS} className="text-center text-muted-foreground py-8">
                        No consultation bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    consultations.map((consultation) => (
                      <ConsultationRow
                        key={consultation.id}
                        consultation={consultation}
                        isExpanded={expandedId === consultation.id}
                        paymentBadge={getPaymentBadgeProps(consultation.paymentStatus)}
                        bookingBadge={getBookingBadgeProps(consultation.bookingStatus)}
                        onToggle={handleRowClick}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && consultations.length > 0 && (
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
  );
}
