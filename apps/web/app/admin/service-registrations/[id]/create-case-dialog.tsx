'use client';

/**
 * Create Case from Registration Dialog
 *
 * Dialog component for creating a new case linked to a service registration.
 * Displays read-only registration info and editable case fields (title,
 * description, priority, case type, filing date).
 *
 * @module CreateCaseDialog
 *
 * @example
 * ```tsx
 * <CreateCaseDialog
 *   isOpen={isCreateCaseOpen}
 *   onOpenChange={setIsCreateCaseOpen}
 *   registration={registrationData}
 *   caseTitle={caseTitle}
 *   onCaseTitleChange={setCaseTitle}
 *   caseDescription={caseDescription}
 *   onCaseDescriptionChange={setCaseDescription}
 *   casePriority={casePriority}
 *   onCasePriorityChange={setCasePriority}
 *   caseType={caseType}
 *   onCaseTypeChange={setCaseType}
 *   caseFilingDate={caseFilingDate}
 *   onCaseFilingDateChange={setCaseFilingDate}
 *   onSubmit={handleCreateCase}
 *   isCreating={isCreatingCase}
 * />
 * ```
 */

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ServiceRegistrationResponse } from '@/lib/api/service-registrations';
import { CasePriority } from '@repo/shared';
import { formatEnumLabel } from '../service-registrations.utils';

/** Props for CreateCaseDialog */
export interface CreateCaseDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Registration data for read-only display */
  registration: ServiceRegistrationResponse;
  /** Case title input value */
  caseTitle: string;
  /** Callback when case title changes */
  onCaseTitleChange: (value: string) => void;
  /** Case description input value */
  caseDescription: string;
  /** Callback when case description changes */
  onCaseDescriptionChange: (value: string) => void;
  /** Case priority select value */
  casePriority: CasePriority;
  /** Callback when case priority changes */
  onCasePriorityChange: (value: CasePriority) => void;
  /** Case type input value */
  caseType: string;
  /** Callback when case type changes */
  onCaseTypeChange: (value: string) => void;
  /** Case filing date input value */
  caseFilingDate: string;
  /** Callback when case filing date changes */
  onCaseFilingDateChange: (value: string) => void;
  /** Callback to submit the form */
  onSubmit: () => void;
  /** Whether form is currently submitting */
  isCreating: boolean;
}

/**
 * Dialog for creating a case from a service registration
 *
 * Displays read-only client name and reference number at the top, followed
 * by editable fields for case title, description, priority, type, and filing
 * date. Title defaults to "Service - {fullName}" and description defaults to
 * the registration's description of need.
 */
export function CreateCaseDialog({
  isOpen,
  onOpenChange,
  registration,
  caseTitle,
  onCaseTitleChange,
  caseDescription,
  onCaseDescriptionChange,
  casePriority,
  onCasePriorityChange,
  caseType,
  onCaseTypeChange,
  caseFilingDate,
  onCaseFilingDateChange,
  onSubmit,
  isCreating,
}: CreateCaseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Case from Registration</DialogTitle>
          <DialogDescription>
            Create a new case linked to this service registration. The case will be
            automatically associated with the registrant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-4 rounded-md border p-3 bg-muted/50">
            <div>
              <Label className="text-xs text-muted-foreground">Client Name</Label>
              <p className="text-sm font-medium">{registration.fullName}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reference Number</Label>
              <p className="text-sm font-medium">{registration.referenceNumber}</p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="caseTitle">Title</Label>
            <Input
              id="caseTitle"
              value={caseTitle}
              onChange={(e) => onCaseTitleChange(e.target.value)}
              placeholder="Case title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="caseDescription">Description</Label>
            <Textarea
              id="caseDescription"
              value={caseDescription}
              onChange={(e) => onCaseDescriptionChange(e.target.value)}
              placeholder="Case description"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="casePriority">Priority</Label>
            <Select
              value={casePriority}
              onValueChange={(v) => onCasePriorityChange(v as CasePriority)}
            >
              <SelectTrigger id="casePriority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CasePriority).map((priority: CasePriority) => (
                  <SelectItem key={priority} value={priority}>
                    {formatEnumLabel(priority)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Case Type */}
          <div className="space-y-2">
            <Label htmlFor="caseType">Case Type (Optional)</Label>
            <Input
              id="caseType"
              value={caseType}
              onChange={(e) => onCaseTypeChange(e.target.value)}
              placeholder="e.g., NTN Registration, SECP Filing"
            />
          </div>

          {/* Filing Date */}
          <div className="space-y-2">
            <Label htmlFor="caseFilingDate">Filing Date</Label>
            <Input
              id="caseFilingDate"
              type="date"
              value={caseFilingDate}
              onChange={(e) => onCaseFilingDateChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Case'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
