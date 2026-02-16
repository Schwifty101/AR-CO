'use client';

/**
 * Client Case Detail Page
 *
 * Displays detailed information about a single case and its activity timeline.
 * Read-only interface for client users (no status updates or activity creation).
 *
 * @module ClientCaseDetailPage
 *
 * @example
 * Accessible at /client/cases/[id] (requires authenticated client)
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Briefcase, Clock } from 'lucide-react';
import {
  getCaseById,
  getCaseActivities,
  CaseStatus,
  CasePriority,
  CaseActivityType,
  type CaseResponse,
  type CaseActivityResponse,
} from '@/lib/api/cases';

/** Case status badge color mapping */
const STATUS_COLORS: Record<CaseStatus, string> = {
  [CaseStatus.PENDING]: 'bg-yellow-500 text-white',
  [CaseStatus.ACTIVE]: 'bg-blue-500 text-white',
  [CaseStatus.ON_HOLD]: 'bg-orange-500 text-white',
  [CaseStatus.RESOLVED]: 'bg-green-500 text-white',
  [CaseStatus.CLOSED]: 'bg-gray-500 text-white',
};

/** Case priority badge color mapping */
const PRIORITY_COLORS: Record<CasePriority, string> = {
  [CasePriority.LOW]: 'bg-gray-500 text-white',
  [CasePriority.MEDIUM]: 'bg-blue-500 text-white',
  [CasePriority.HIGH]: 'bg-orange-500 text-white',
  [CasePriority.URGENT]: 'bg-red-500 text-white',
};

/** Activity type badge color mapping */
const ACTIVITY_TYPE_COLORS: Record<CaseActivityType, string> = {
  [CaseActivityType.CASE_CREATED]: 'bg-indigo-500 text-white',
  [CaseActivityType.STATUS_CHANGED]: 'bg-blue-500 text-white',
  [CaseActivityType.NOTE_ADDED]: 'bg-gray-500 text-white',
  [CaseActivityType.ATTORNEY_ASSIGNED]: 'bg-purple-500 text-white',
  [CaseActivityType.DOCUMENT_UPLOADED]: 'bg-green-500 text-white',
  [CaseActivityType.HEARING_SCHEDULED]: 'bg-orange-500 text-white',
  [CaseActivityType.PAYMENT_RECEIVED]: 'bg-emerald-500 text-white',
  [CaseActivityType.OTHER]: 'bg-slate-500 text-white',
};

/**
 * Client case detail page component
 */
export default function ClientCaseDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [activities, setActivities] = useState<CaseActivityResponse[]>([]);
  const [isLoadingCase, setIsLoadingCase] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load case detail on mount
  useEffect(() => {
    if (authLoading || !caseId) return;

    async function loadCase() {
      try {
        setError(null);
        setIsLoadingCase(true);
        const data = await getCaseById(caseId);
        setCaseData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load case');
        toast.error('Failed to load case details');
      } finally {
        setIsLoadingCase(false);
      }
    }

    loadCase();
  }, [caseId, authLoading]);

  // Load case activities on mount
  useEffect(() => {
    if (authLoading || !caseId) return;

    async function loadActivities() {
      try {
        setIsLoadingActivities(true);
        const data = await getCaseActivities(caseId, { page: 1, limit: 50 });
        setActivities(data.activities);
      } catch {
        toast.error('Failed to load case activities');
      } finally {
        setIsLoadingActivities(false);
      }
    }

    loadActivities();
  }, [caseId, authLoading]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/client/cases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cases
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md bg-destructive/15 p-4 text-destructive">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => router.push('/client/cases')}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Cases
          </Button>
          {isLoadingCase ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {caseData?.caseNumber}
                </h1>
                <Badge className={STATUS_COLORS[caseData?.status || CaseStatus.PENDING]}>
                  {caseData?.status.toUpperCase().replace('_', ' ')}
                </Badge>
                <Badge className={PRIORITY_COLORS[caseData?.priority || CasePriority.MEDIUM]}>
                  {caseData?.priority.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground">{caseData?.title}</p>
            </>
          )}
        </div>
      </div>

      {/* Case Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Case Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCase ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                <p className="text-base mt-1">
                  {caseData?.assignedToName || 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Practice Area</p>
                <p className="text-base mt-1">{caseData?.practiceAreaName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service</p>
                <p className="text-base mt-1">{caseData?.serviceName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Case Type</p>
                <p className="text-base mt-1">{caseData?.caseType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filing Date</p>
                <p className="text-base mt-1">{formatDate(caseData?.filingDate || null)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Closing Date</p>
                <p className="text-base mt-1">
                  {caseData?.closingDate ? formatDate(caseData.closingDate) : 'N/A'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-base mt-1 whitespace-pre-wrap">
                  {caseData?.description || 'No description provided'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
          <CardDescription>
            Chronological history of case events and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingActivities ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities recorded yet
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="flex-1 w-px bg-border mt-2" style={{ minHeight: '2rem' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={ACTIVITY_TYPE_COLORS[activity.activityType]}>
                              {activity.activityType.toUpperCase().replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(activity.createdAt)}
                            </span>
                          </div>
                          <p className="font-medium mb-1">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            By {activity.createdByName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < activities.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
