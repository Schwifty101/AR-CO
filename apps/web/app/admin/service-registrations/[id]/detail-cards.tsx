'use client';

/**
 * Admin Service Registration Detail Page - Sub-components
 *
 * Extracted card components used by the service registration detail page.
 * Split from the main page to comply with the 500-line file limit.
 *
 * @module AdminServiceRegistrationDetailCards
 */

import Link from 'next/link';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ServiceRegistrationResponse } from '@/lib/api/service-registrations';
import { ServiceRegistrationStatus } from '@repo/shared';
import {
  User,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Clock,
  LinkIcon,
  Plus,
  Download,
  FileArchive,
} from 'lucide-react';
import { formatDateTime, formatEnumLabel } from '../service-registrations.utils';

// ─── Registrant Info Card ────────────────────────────────────────────────────

/** Props for RegistrantInfoCard */
interface RegistrantInfoCardProps {
  /** Registration data */
  registration: ServiceRegistrationResponse;
}

/**
 * Displays registrant contact information in a 2-column grid
 *
 * @example
 * ```tsx
 * <RegistrantInfoCard registration={registrationData} />
 * ```
 */
export function RegistrantInfoCard({ registration }: RegistrantInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrant Information</CardTitle>
        <CardDescription>
          Contact details of the person who submitted the registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <p className="font-medium">{registration.fullName}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <p className="font-medium">{registration.email}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <p className="font-medium">{registration.phoneNumber}</p>
          </div>
          {registration.cnic && (
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                CNIC
              </Label>
              <p className="font-medium">{registration.cnic}</p>
            </div>
          )}
          {registration.address && (
            <div className="space-y-1 md:col-span-2">
              <Label className="text-muted-foreground">Address</Label>
              <p className="font-medium">{registration.address}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Service Details Card ────────────────────────────────────────────────────

/** Props for ServiceDetailsCard */
interface ServiceDetailsCardProps {
  /** Registration data */
  registration: ServiceRegistrationResponse;
}

/**
 * Displays service details, timestamps, and description of need
 *
 * @example
 * ```tsx
 * <ServiceDetailsCard registration={registrationData} />
 * ```
 */
export function ServiceDetailsCard({ registration }: ServiceDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Details</CardTitle>
        <CardDescription>Information about the requested service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Service ID
            </Label>
            <p className="font-mono text-xs">{registration.serviceId}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Assigned To
            </Label>
            <p className="font-medium">
              {registration.assignedToName || (
                <span className="text-muted-foreground italic">Unassigned</span>
              )}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Created
            </Label>
            <p className="font-medium">{formatDateTime(registration.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Updated
            </Label>
            <p className="font-medium">{formatDateTime(registration.updatedAt)}</p>
          </div>
        </div>

        {registration.descriptionOfNeed && (
          <>
            <Separator />
            <div className="space-y-1">
              <Label className="text-muted-foreground">Description of Need</Label>
              <p className="whitespace-pre-wrap">{registration.descriptionOfNeed}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Staff Actions Card ──────────────────────────────────────────────────────

/** Props for StaffActionsCard */
export interface StaffActionsCardProps {
  /** Current selected status value */
  statusValue: ServiceRegistrationStatus;
  /** Callback when status changes */
  onStatusChange: (value: ServiceRegistrationStatus) => void;
  /** Callback to submit status update */
  onUpdateStatus: () => void;
  /** Current selected assignee ID */
  assignedToId: string;
  /** Callback when assignee changes */
  onAssignedToChange: (value: string) => void;
  /** Callback to submit assignment */
  onAssign: () => void;
  /** Available assignees list */
  assignees: { id: string; name: string }[];
  /** Whether assignees are still loading */
  isLoadingAssignees: boolean;
  /** Current staff notes text */
  staffNotes: string;
  /** Callback when staff notes change */
  onStaffNotesChange: (value: string) => void;
  /** Callback to save staff notes */
  onSaveNotes: () => void;
  /** Whether any action is currently in progress */
  isUpdating: boolean;
}

/**
 * Staff actions card with status update, assignment, and notes management
 *
 * @example
 * ```tsx
 * <StaffActionsCard
 *   statusValue={statusValue}
 *   onStatusChange={setStatusValue}
 *   onUpdateStatus={handleUpdateStatus}
 *   // ...other props
 * />
 * ```
 */
export function StaffActionsCard({
  statusValue,
  onStatusChange,
  onUpdateStatus,
  assignedToId,
  onAssignedToChange,
  onAssign,
  assignees,
  isLoadingAssignees,
  staffNotes,
  onStaffNotesChange,
  onSaveNotes,
  isUpdating,
}: StaffActionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Actions</CardTitle>
        <CardDescription>Update status, assign staff, or manage notes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Update Status */}
        <div className="space-y-4">
          <h3 className="font-semibold">Update Status</h3>
          <div className="flex gap-2">
            <Select
              value={statusValue}
              onValueChange={(v) => onStatusChange(v as ServiceRegistrationStatus)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ServiceRegistrationStatus).map(
                  (status: ServiceRegistrationStatus) => (
                    <SelectItem key={status} value={status}>
                      {formatEnumLabel(status)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Button onClick={onUpdateStatus} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Assign Registration */}
        <div className="space-y-4">
          <h3 className="font-semibold">Assign To</h3>
          <div className="flex gap-2">
            <Select
              value={assignedToId}
              onValueChange={onAssignedToChange}
              disabled={isLoadingAssignees}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue
                  placeholder={
                    isLoadingAssignees
                      ? 'Loading assignees...'
                      : 'Select a person'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onAssign} disabled={isUpdating}>
              {isUpdating ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Staff Notes */}
        <div className="space-y-4">
          <h3 className="font-semibold">Staff Notes</h3>
          <Textarea
            placeholder="Add internal notes about this registration"
            value={staffNotes}
            onChange={(e) => onStaffNotesChange(e.target.value)}
            rows={4}
          />
          <Button onClick={onSaveNotes} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Linked Case Card ────────────────────────────────────────────────────────

/** Props for LinkedCaseCard */
interface LinkedCaseCardProps {
  /** Registration data */
  registration: ServiceRegistrationResponse;
  /** Whether Create Case button should be enabled */
  canCreateCase: boolean;
  /** Whether Create Case button should show but be disabled */
  showDisabledCreateCase: boolean;
  /** Callback to open the Create Case dialog */
  onCreateCase: () => void;
}

/**
 * Card showing linked case or Create Case button
 *
 * @example
 * ```tsx
 * <LinkedCaseCard
 *   registration={registrationData}
 *   canCreateCase={true}
 *   showDisabledCreateCase={false}
 *   onCreateCase={handleOpenDialog}
 * />
 * ```
 */
export function LinkedCaseCard({
  registration,
  canCreateCase,
  showDisabledCreateCase,
  onCreateCase,
}: LinkedCaseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Linked Case
        </CardTitle>
        <CardDescription>
          Case associated with this service registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {registration.caseId && registration.caseNumber ? (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Linked
            </Badge>
            <Link
              href={`/admin/cases/${registration.caseId}`}
              className="text-primary hover:underline font-medium text-lg"
            >
              {registration.caseNumber}
            </Link>
          </div>
        ) : canCreateCase ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              No case has been created from this registration yet.
            </p>
            <Button onClick={onCreateCase}>
              <Plus className="mr-2 h-4 w-4" />
              Create Case
            </Button>
          </div>
        ) : showDisabledCreateCase ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Registration must be paid before a case can be created.
            </p>
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              Create Case
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No case linked to this registration.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Documents Card ──────────────────────────────────────────────────────────

/** Format bytes to human-readable size string */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format ISO timestamp to locale date/time string (en-PK) */
function formatUploadedAt(iso: string): string {
  return new Date(iso).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Document shape for DocumentsCard */
export interface RegistrationDocument {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

/** Props for DocumentsCard */
interface DocumentsCardProps {
  /** Array of uploaded documents for this registration */
  documents: RegistrationDocument[];
  /** Whether the documents list is still being fetched */
  isLoading: boolean;
  /** Callback invoked when the user clicks Download on a document */
  onDownload: (docId: string, fileName: string) => void;
  /** The docId currently being downloaded; disables that row's button */
  isDownloading: string | null;
}

/**
 * Displays uploaded documents for a service registration with download buttons.
 * Staff/admin only. Shows skeleton loading state while fetching and an empty
 * state message when no documents were uploaded.
 *
 * @example
 * ```tsx
 * <DocumentsCard
 *   documents={docs}
 *   isLoading={isLoadingDocs}
 *   onDownload={handleDownload}
 *   isDownloading={downloadingDocId}
 * />
 * ```
 */
export function DocumentsCard({
  documents,
  isLoading,
  onDownload,
  isDownloading,
}: DocumentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="h-5 w-5" />
          Submitted Documents
        </CardTitle>
        <CardDescription>
          Documents uploaded by the registrant during submission
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No documents were uploaded with this registration.
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 p-3 border rounded-md hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.documentTypeName} · {formatBytes(doc.fileSize)} · {formatUploadedAt(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(doc.id, doc.fileName)}
                  disabled={isDownloading === doc.id}
                  className="shrink-0"
                >
                  {isDownloading === doc.id ? (
                    <span className="text-xs">Downloading…</span>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
