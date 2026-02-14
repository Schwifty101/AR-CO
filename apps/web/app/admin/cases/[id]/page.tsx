'use client';

/**
 * Admin Case Detail Page
 *
 * Displays full case details with ability to update status, assign staff/attorney,
 * and manage case activities. Includes timeline view of all case activities.
 *
 * @module AdminCaseDetailPage
 *
 * @example
 * Accessible at /admin/cases/[id]
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
  getCaseById,
  updateCaseStatus,
  assignCase,
  getCaseActivities,
  addCaseActivity,
  CaseStatus,
  CaseActivityType,
  type CaseResponse,
  type CaseActivityResponse,
} from '@/lib/api/cases';
import { getUsers } from '@/lib/api/users';
import { ArrowLeft, Calendar, User, Briefcase, Clock } from 'lucide-react';
import {
  STATUS_COLORS,
  PRIORITY_COLORS,
  formatDate,
  formatDateTime,
  formatEnumLabel,
  getRelativeTime,
} from '../cases.utils';

/**
 * Admin case detail page component
 */
export default function AdminCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [activities, setActivities] = useState<CaseActivityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status update state
  const [statusValue, setStatusValue] = useState<CaseStatus>(CaseStatus.PENDING);

  // Assignee state
  const [assignedToId, setAssignedToId] = useState('');
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingAssignees, setIsLoadingAssignees] = useState(true);

  // Activity form state
  const [activityType, setActivityType] = useState<CaseActivityType>(
    CaseActivityType.NOTE_ADDED,
  );
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');

  /**
   * Load case data and activities
   */
  const loadCase = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const [caseDetail, activitiesData] = await Promise.all([
        getCaseById(caseId),
        getCaseActivities(caseId, { page: 1, limit: 50 }),
      ]);
      setCaseData(caseDetail);
      setActivities(activitiesData.activities);
      setStatusValue(caseDetail.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load case');
      toast.error('Failed to load case');
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

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

  /**
   * Handle status update
   */
  const handleUpdateStatus = async () => {
    if (!statusValue) {
      toast.error('Please select a status');
      return;
    }

    try {
      setIsUpdating(true);
      await updateCaseStatus(caseId, { status: statusValue });
      await loadCase();
      toast.success('Case status updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle case assignment
   */
  const handleAssignCase = async () => {
    if (!assignedToId.trim()) {
      toast.error('Please select a person to assign');
      return;
    }

    try {
      setIsUpdating(true);
      await assignCase(caseId, { assignedToId });
      await loadCase();
      setAssignedToId('');
      toast.success('Case assigned successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign case');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle add activity
   */
  const handleAddActivity = async () => {
    if (!activityTitle.trim()) {
      toast.error('Please enter an activity title');
      return;
    }

    try {
      setIsUpdating(true);
      await addCaseActivity(caseId, {
        activityType,
        title: activityTitle,
        description: activityDescription || undefined,
      });
      await loadCase();
      setActivityTitle('');
      setActivityDescription('');
      setActivityType(CaseActivityType.NOTE_ADDED);
      toast.success('Activity added successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setIsUpdating(false);
    }
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

  if (error || !caseData) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/admin/cases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cases
        </Button>
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error || 'Case not found'}
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
            onClick={() => router.push('/admin/cases')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{caseData.caseNumber}</h1>
          <p className="text-xl text-muted-foreground">{caseData.title}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={STATUS_COLORS[caseData.status]}>
            {formatEnumLabel(caseData.status)}
          </Badge>
          <Badge className={PRIORITY_COLORS[caseData.priority]}>
            {formatEnumLabel(caseData.priority)}
          </Badge>
        </div>
      </div>

      {/* Case Information */}
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
          <CardDescription>Detailed case information and metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Client
              </Label>
              <p className="font-medium">{caseData.clientName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Assigned To
              </Label>
              <p className="font-medium">
                {caseData.assignedToName || (
                  <span className="text-muted-foreground italic">Unassigned</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Practice Area
              </Label>
              <p className="font-medium">{caseData.practiceAreaName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Service</Label>
              <p className="font-medium">
                {caseData.serviceName || (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Case Type</Label>
              <p className="font-medium">
                {caseData.caseType || <span className="text-muted-foreground">N/A</span>}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Filing Date
              </Label>
              <p className="font-medium">
                {caseData.filingDate ? (
                  formatDate(caseData.filingDate)
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Closing Date
              </Label>
              <p className="font-medium">
                {caseData.closingDate ? (
                  formatDate(caseData.closingDate)
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Created
              </Label>
              <p className="font-medium">{formatDateTime(caseData.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Updated
              </Label>
              <p className="font-medium">{formatDateTime(caseData.updatedAt)}</p>
            </div>
          </div>

          {caseData.description && (
            <>
              <Separator />
              <div className="space-y-1">
                <Label className="text-muted-foreground">Description</Label>
                <p className="whitespace-pre-wrap">{caseData.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Update case status or assign case</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Update Status */}
          <div className="space-y-4">
            <h3 className="font-semibold">Update Status</h3>
            <div className="flex gap-2">
              <Select value={statusValue} onValueChange={(v) => setStatusValue(v as CaseStatus)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CaseStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatEnumLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Assign Case */}
          <div className="space-y-4">
            <h3 className="font-semibold">Assign To</h3>
            <div className="flex gap-2">
              <Select
                value={assignedToId}
                onValueChange={setAssignedToId}
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
              <Button onClick={handleAssignCase} disabled={isUpdating}>
                {isUpdating ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activities Timeline</CardTitle>
          <CardDescription>
            Case activity history and updates (newest first)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity List */}
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="font-mono text-xs">
                      {formatEnumLabel(activity.activityType)}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{activity.title}</p>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.createdByName}</span>
                      <span>•</span>
                      <span>{getRelativeTime(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No activities recorded yet
            </p>
          )}

          <Separator />

          {/* Add Activity Form */}
          <div className="space-y-4">
            <h3 className="font-semibold">Add Activity</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                <Select
                  value={activityType}
                  onValueChange={(v) => setActivityType(v as CaseActivityType)}
                >
                  <SelectTrigger id="activityType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CaseActivityType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatEnumLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityTitle">Title</Label>
                <Input
                  id="activityTitle"
                  placeholder="Activity title"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityDescription">Description (Optional)</Label>
                <Textarea
                  id="activityDescription"
                  placeholder="Activity description"
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleAddActivity} disabled={isUpdating}>
                {isUpdating ? 'Adding...' : 'Add Activity'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
