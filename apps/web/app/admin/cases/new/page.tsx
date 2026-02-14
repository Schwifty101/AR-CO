'use client';

/**
 * Admin Create Case Form Page
 *
 * Form to create a new case for a client. Staff can select client,
 * specify practice area, set priority, and add case details.
 *
 * @module AdminCreateCasePage
 *
 * @example
 * Accessible at /admin/cases/new
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createCase, CasePriority } from '@/lib/api/cases';
import { getClients, type ClientResponse } from '@/lib/api/clients';
import { getPracticeAreas, type PracticeArea } from '@/lib/api/practice-areas';

/** New case form schema */
const newCaseSchema = z.object({
  clientProfileId: z.string().uuid('Please select a client'),
  practiceAreaId: z.string().uuid('Valid practice area UUID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().max(5000).optional().or(z.literal('')),
  priority: z.nativeEnum(CasePriority),
  caseType: z.string().max(100).optional().or(z.literal('')),
  filingDate: z.string().optional().or(z.literal('')),
});

type NewCaseForm = z.infer<typeof newCaseSchema>;

/**
 * Admin create case page component
 */
export default function AdminCreateCasePage() {
  const router = useRouter();

  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingPracticeAreas, setIsLoadingPracticeAreas] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form setup with React Hook Form + Zod
  const form = useForm<NewCaseForm>({
    resolver: zodResolver(newCaseSchema),
    defaultValues: {
      clientProfileId: '',
      practiceAreaId: '',
      title: '',
      description: '',
      priority: CasePriority.LOW,
      caseType: '',
      filingDate: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = form;

  // Fetch clients and practice areas on mount
  useEffect(() => {
    async function loadClients() {
      try {
        setIsLoadingClients(true);
        const data = await getClients({ limit: 100 });
        setClients(data.clients);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load clients';
        setLoadError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingClients(false);
      }
    }

    async function loadPracticeAreas() {
      try {
        setIsLoadingPracticeAreas(true);
        const data = await getPracticeAreas();
        setPracticeAreas(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load practice areas');
      } finally {
        setIsLoadingPracticeAreas(false);
      }
    }

    loadClients();
    loadPracticeAreas();
  }, []);

  const onSubmit = async (data: NewCaseForm) => {
    try {
      // Filter out empty strings from optional fields
      const payload = {
        clientProfileId: data.clientProfileId,
        practiceAreaId: data.practiceAreaId,
        title: data.title,
        priority: data.priority,
        ...(data.description && data.description.trim() !== '' ? { description: data.description } : {}),
        ...(data.caseType && data.caseType.trim() !== '' ? { caseType: data.caseType } : {}),
        ...(data.filingDate && data.filingDate.trim() !== '' ? { filingDate: data.filingDate } : {}),
      };

      const created = await createCase(payload);
      toast.success('Case created successfully');
      router.push(`/admin/cases/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create case');
    }
  };

  const handleCancel = () => {
    router.push('/admin/cases');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Case</h1>
          <p className="text-muted-foreground">Add a new case for a client</p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Back to Cases
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
          <CardDescription>
            Enter the details for the new case. All required fields must be completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Client Selection */}
              <FormField
                control={control}
                name="clientProfileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingClients}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingClients
                                ? 'Loading clients...'
                                : loadError
                                  ? 'Error loading clients'
                                  : 'Select a client'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.fullName}
                            {client.companyName && ` (${client.companyName})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Practice Area Selection */}
              <FormField
                control={control}
                name="practiceAreaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Practice Area *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingPracticeAreas}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingPracticeAreas
                                ? 'Loading practice areas...'
                                : 'Select a practice area'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {practiceAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Tax Audit Defense for ABC Corp"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the case..."
                  rows={5}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Two-column grid for Priority, Case Type, Filing Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <FormField
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CasePriority).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Case Type */}
                <div className="space-y-2">
                  <Label htmlFor="caseType">Case Type</Label>
                  <Input
                    id="caseType"
                    placeholder="e.g., Civil, Criminal, Corporate"
                    {...register('caseType')}
                  />
                  {errors.caseType && (
                    <p className="text-sm text-destructive">
                      {errors.caseType.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Filing Date */}
              <div className="space-y-2">
                <Label htmlFor="filingDate">Filing Date</Label>
                <Input
                  id="filingDate"
                  type="date"
                  {...register('filingDate')}
                />
                {errors.filingDate && (
                  <p className="text-sm text-destructive">
                    {errors.filingDate.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Case...' : 'Create Case'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
