'use client';

/**
 * Interactions Tab Component
 *
 * Displays CRM interactions for a client with the ability to log new ones,
 * and mark existing interactions as complete.
 *
 * @module InteractionsTab
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Phone,
  Mail,
  Users,
  MessageCircle,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  getClientInteractions,
  createInteraction,
  completeInteraction,
} from '@/lib/api/admin';
import type { InteractionResponse, CreateInteractionData } from '@repo/shared';

const INTERACTION_TYPES = [
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
] as const;

/** Maps interaction type to its icon component */
function getTypeIcon(type: string) {
  const match = INTERACTION_TYPES.find((t) => t.value === type);
  return match?.icon ?? MoreHorizontal;
}

/** Formats an ISO date to short readable format */
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Formats an ISO date to include time */
function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface InteractionsTabProps {
  clientProfileId: string;
}

/**
 * Interactions tab content for client detail page
 *
 * @param props.clientProfileId - UUID of the client profile
 */
export function InteractionsTab({ clientProfileId }: InteractionsTabProps) {
  const [interactions, setInteractions] = useState<InteractionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  const loadInteractions = useCallback(async () => {
    if (isLoaded || isLoading) return;
    try {
      setIsLoading(true);
      const data = await getClientInteractions(clientProfileId, { limit: 50 });
      setInteractions(data.data);
      setTotal(data.total);
      setIsLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load interactions');
    } finally {
      setIsLoading(false);
    }
  }, [clientProfileId, isLoaded, isLoading]);

  // Load on mount
  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  /** Handle marking an interaction as complete */
  const handleComplete = async (id: string) => {
    try {
      setCompleting(id);
      const updated = await completeInteraction(id);
      setInteractions((prev) =>
        prev.map((i) => (i.id === id ? updated : i)),
      );
      toast.success('Interaction marked as complete');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete interaction');
    } finally {
      setCompleting(null);
    }
  };

  /** Handle successful interaction creation */
  const handleCreated = (interaction: InteractionResponse) => {
    setInteractions((prev) => [interaction, ...prev]);
    setTotal((prev) => prev + 1);
    setDialogOpen(false);
    toast.success('Interaction logged successfully');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Interactions</CardTitle>
          <CardDescription>
            CRM interactions logged with this client ({total} total)
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Log Interaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <LogInteractionForm
              clientProfileId={clientProfileId}
              onSuccess={handleCreated}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <InteractionsSkeleton />
        ) : interactions.length === 0 && isLoaded ? (
          <p className="text-center text-muted-foreground py-8">
            No interactions logged for this client yet.
          </p>
        ) : interactions.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interactions.map((interaction) => {
                  const Icon = getTypeIcon(interaction.interactionType);
                  const isComplete = !!interaction.completedAt;
                  return (
                    <TableRow key={interaction.id}>
                      <TableCell>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">
                        {interaction.subject}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {interaction.staffName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {interaction.scheduledAt
                          ? formatDateTime(interaction.scheduledAt)
                          : formatDate(interaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        {isComplete ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Open
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!isComplete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={completing === interaction.id}
                            onClick={() => handleComplete(interaction.id)}
                          >
                            {completing === interaction.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ── Log Interaction Form ──

interface LogInteractionFormProps {
  clientProfileId: string;
  onSuccess: (interaction: InteractionResponse) => void;
  onCancel: () => void;
}

function LogInteractionForm({
  clientProfileId,
  onSuccess,
  onCancel,
}: LogInteractionFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<string>('call');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error('Subject is required');
      return;
    }

    try {
      setSubmitting(true);
      const data: CreateInteractionData = {
        interactionType: type as CreateInteractionData['interactionType'],
        subject: subject.trim(),
        ...(notes.trim() && { notes: notes.trim() }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt).toISOString() }),
      };
      const result = await createInteraction(clientProfileId, data);
      onSuccess(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to log interaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Log Interaction</DialogTitle>
        <DialogDescription>
          Record a new interaction with this client.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {INTERACTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of the interaction"
            maxLength={255}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details..."
            rows={3}
            maxLength={5000}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="scheduledAt">Scheduled Date (optional)</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || !subject.trim()}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Log Interaction'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── Skeleton ──

function InteractionsSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {['Type', 'Subject', 'Staff', 'Date', 'Status', 'Action'].map((h) => (
              <TableHead key={h}>
                <Skeleton className="h-4 w-16" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 6 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
