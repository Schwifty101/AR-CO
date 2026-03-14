'use client';

/**
 * Admin Service Registration Detail Page
 *
 * Displays full service registration details with ability to update status,
 * assign staff, manage notes, link cases, and create cases from registrations.
 * Includes a "Create Case" dialog for converting paid registrations into cases.
 *
 * @module AdminServiceRegistrationDetailPage
 *
 * @example
 * Accessible at /admin/service-registrations/[id]
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getRegistrationById,
  updateRegistrationStatus,
  assignRegistration,
  listRegistrationDocuments,
  getDocumentDownloadUrl,
  type ServiceRegistrationResponse,
  type ServiceRegistrationDocument,
} from '@/lib/api/service-registrations';
import { createCaseFromRegistration } from '@/lib/api/cases';
import { getUsers } from '@/lib/api/users';
import {
  ServiceRegistrationStatus,
  CasePriority,
} from '@repo/shared';
import { ArrowLeft } from 'lucide-react';
import {
  STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  formatEnumLabel,
  getTodayDateString,
} from '../service-registrations.utils';
import {
  RegistrantInfoCard,
  ServiceDetailsCard,
  StaffActionsCard,
  LinkedCaseCard,
  DocumentsCard,
  type RegistrationDocument,
} from './detail-cards';
import { CreateCaseDialog } from './create-case-dialog';

/**
 * Admin service registration detail page component
 */
export default function AdminServiceRegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params.id as string;

  // Registration data state
  const [registration, setRegistration] = useState<ServiceRegistrationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status update state
  const [statusValue, setStatusValue] = useState<ServiceRegistrationStatus>(
    ServiceRegistrationStatus.PENDING_PAYMENT,
  );

  // Staff notes state
  const [staffNotes, setStaffNotes] = useState('');

  // Assignee state
  const [assignedToId, setAssignedToId] = useState('');
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingAssignees, setIsLoadingAssignees] = useState(true);

  // Documents state
  const [documents, setDocuments] = useState<RegistrationDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Create Case dialog state
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [casePriority, setCasePriority] = useState<CasePriority>(CasePriority.MEDIUM);
  const [caseType, setCaseType] = useState('');
  const [caseFilingDate, setCaseFilingDate] = useState(getTodayDateString());

  /**
   * Load registration data from API
   */
  const loadRegistration = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await getRegistrationById(registrationId);
      setRegistration(data);
      setStatusValue(data.status);
      setStaffNotes(data.staffNotes || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load registration');
      toast.error('Failed to load registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationId]);

  // Load assignees (staff + attorneys) for assignment dropdown
  useEffect(() => {
    async function loadAssignees() {
      try {
        setIsLoadingAssignees(true);
        const data = await getUsers({ userTypes: ['staff', 'attorney'], limit: 100 });
        const mapped = data.users.map((u) => ({
          id: u.id,
          name: u.fullName,
        }));
        setAssignees(mapped);
      } catch {
        toast.error('Failed to load assignees');
      } finally {
        setIsLoadingAssignees(false);
      }
    }

    loadAssignees();
  }, []);

  // Load documents for this registration
  useEffect(() => {
    async function loadDocuments() {
      try {
        setIsLoadingDocs(true);
        const docs = await listRegistrationDocuments(registrationId);
        setDocuments(
          docs.map((d: ServiceRegistrationDocument): RegistrationDocument => ({
            id: d.id,
            documentTypeId: d.documentTypeId,
            documentTypeName: d.documentTypeName,
            fileName: d.fileName,
            fileSize: d.fileSize,
            mimeType: d.mimeType,
            uploadedAt: d.uploadedAt,
          }))
        );
      } catch {
        // Non-critical — don't show error toast for documents
        setDocuments([]);
      } finally {
        setIsLoadingDocs(false);
      }
    }

    loadDocuments();
  }, [registrationId]);

  /** Handle status update */
  const handleUpdateStatus = async () => {
    if (!statusValue) {
      toast.error('Please select a status');
      return;
    }

    try {
      setIsUpdating(true);
      await updateRegistrationStatus(registrationId, { status: statusValue });
      await loadRegistration();
      toast.success('Registration status updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  /** Handle save staff notes (preserves current status) */
  const handleSaveNotes = async () => {
    if (!registration) return;

    try {
      setIsUpdating(true);
      await updateRegistrationStatus(registrationId, {
        status: registration.status,
        staffNotes: staffNotes || undefined,
      });
      await loadRegistration();
      toast.success('Staff notes saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setIsUpdating(false);
    }
  };

  /** Handle registration assignment */
  const handleAssign = async () => {
    if (!assignedToId.trim()) {
      toast.error('Please select a person to assign');
      return;
    }

    try {
      setIsUpdating(true);
      await assignRegistration(registrationId, { assignedToId });
      await loadRegistration();
      setAssignedToId('');
      toast.success('Registration assigned successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign registration');
    } finally {
      setIsUpdating(false);
    }
  };

  /** Open Create Case dialog with pre-populated defaults */
  const openCreateCaseDialog = () => {
    if (!registration) return;
    setCaseTitle(`Service - ${registration.fullName}`);
    setCaseDescription(registration.descriptionOfNeed || '');
    setCasePriority(CasePriority.MEDIUM);
    setCaseType('');
    setCaseFilingDate(getTodayDateString());
    setIsCreateCaseOpen(true);
  };

  /** Handle create case from registration */
  const handleCreateCase = async () => {
    try {
      setIsCreatingCase(true);
      await createCaseFromRegistration(registrationId, {
        title: caseTitle || undefined,
        description: caseDescription || undefined,
        priority: casePriority,
        caseType: caseType || undefined,
        filingDate: caseFilingDate || undefined,
      });
      setIsCreateCaseOpen(false);
      await loadRegistration();
      toast.success('Case created successfully from registration');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create case');
    } finally {
      setIsCreatingCase(false);
    }
  };

  /** Download a document by opening its signed URL in a new tab */
  const handleDownload = async (docId: string, fileName: string) => {
    try {
      setIsDownloading(docId);
      const { url } = await getDocumentDownloadUrl(registrationId, docId);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download document');
    } finally {
      setIsDownloading(null);
    }
  };

  /** Whether case creation is allowed (paid or in_progress, no existing case) */
  const canCreateCase = registration
    && !registration.caseId
    && (registration.status === ServiceRegistrationStatus.PAID
      || registration.status === ServiceRegistrationStatus.IN_PROGRESS);

  /** Whether Create Case button should show but be disabled */
  const showDisabledCreateCase = registration
    && !registration.caseId
    && (registration.status === ServiceRegistrationStatus.PENDING_PAYMENT
      || registration.status === ServiceRegistrationStatus.CANCELLED);

  // Loading state
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

  // Error state
  if (error || !registration) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/service-registrations')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/service-registrations')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registrations
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {registration.referenceNumber}
          </h1>
          <p className="text-xl text-muted-foreground">{registration.fullName}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={STATUS_COLORS[registration.status]}>
            {formatEnumLabel(registration.status)}
          </Badge>
          <Badge className={PAYMENT_STATUS_COLORS[registration.paymentStatus]}>
            {formatEnumLabel(registration.paymentStatus)}
          </Badge>
        </div>
      </div>

      {/* Registrant Info Card */}
      <RegistrantInfoCard registration={registration} />

      {/* Service Details Card */}
      <ServiceDetailsCard registration={registration} />

      {/* Staff Actions Card */}
      <StaffActionsCard
        statusValue={statusValue}
        onStatusChange={setStatusValue}
        onUpdateStatus={handleUpdateStatus}
        assignedToId={assignedToId}
        onAssignedToChange={setAssignedToId}
        onAssign={handleAssign}
        assignees={assignees}
        isLoadingAssignees={isLoadingAssignees}
        staffNotes={staffNotes}
        onStaffNotesChange={setStaffNotes}
        onSaveNotes={handleSaveNotes}
        isUpdating={isUpdating}
      />

      {/* Linked Case Card */}
      <LinkedCaseCard
        registration={registration}
        canCreateCase={!!canCreateCase}
        showDisabledCreateCase={!!showDisabledCreateCase}
        onCreateCase={openCreateCaseDialog}
      />

      {/* Documents Card */}
      <DocumentsCard
        documents={documents}
        isLoading={isLoadingDocs}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />

      {/* Create Case Dialog */}
      <CreateCaseDialog
        isOpen={isCreateCaseOpen}
        onOpenChange={setIsCreateCaseOpen}
        registration={registration}
        caseTitle={caseTitle}
        onCaseTitleChange={setCaseTitle}
        caseDescription={caseDescription}
        onCaseDescriptionChange={setCaseDescription}
        casePriority={casePriority}
        onCasePriorityChange={setCasePriority}
        caseType={caseType}
        onCaseTypeChange={setCaseType}
        caseFilingDate={caseFilingDate}
        onCaseFilingDateChange={setCaseFilingDate}
        onSubmit={handleCreateCase}
        isCreating={isCreatingCase}
      />
    </div>
  );
}
