'use client';

/**
 * New Complaint Submission Page
 *
 * Form for authenticated clients to submit new complaints against government organizations.
 * Requires an active subscription. Uses React Hook Form with Zod validation.
 *
 * @module NewComplaintPage
 *
 * @example
 * Accessible at /client/complaints/new (requires authenticated client with active subscription)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/use-auth';
import { Button } from '@/components/ui/button';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { submitComplaint, type CreateComplaintData } from '@/lib/api/complaints';
import { ComplaintCategory } from '@repo/shared';

/** Validation schema for complaint submission */
const complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  targetOrganization: z.string().min(2, 'Target organization is required'),
  location: z.string().optional().or(z.literal('')),
  category: z.nativeEnum(ComplaintCategory),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

/** Category display labels */
const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  [ComplaintCategory.INFRASTRUCTURE]: 'Infrastructure',
  [ComplaintCategory.PUBLIC_SERVICES]: 'Public Services',
  [ComplaintCategory.ENVIRONMENT]: 'Environment',
  [ComplaintCategory.GOVERNANCE]: 'Governance',
  [ComplaintCategory.HEALTH]: 'Health',
  [ComplaintCategory.EDUCATION]: 'Education',
  [ComplaintCategory.UTILITIES]: 'Utilities',
  [ComplaintCategory.OTHER]: 'Other',
};

/**
 * New complaint submission page component
 */
export default function NewComplaintPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      category: ComplaintCategory.OTHER,
    },
  });

  const selectedCategory = watch('category');

  const handleFormSubmit = async (data: ComplaintFormData) => {
    try {
      setIsSubmitting(true);
      const complaintData: CreateComplaintData = {
        title: data.title,
        description: data.description,
        targetOrganization: data.targetOrganization,
        category: data.category,
        location: data.location || undefined,
      };

      const complaint = await submitComplaint(complaintData);
      toast.success('Complaint submitted successfully');
      router.push('/client/complaints');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit complaint';
      toast.error(errorMessage);

      // Special handling for subscription requirement
      if (errorMessage.includes('Active subscription required') || errorMessage.includes('subscription')) {
        setTimeout(() => {
          router.push('/client/subscription');
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submit New Complaint</h1>
        <p className="text-muted-foreground">
          File a complaint against a government organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
          <CardDescription>
            Provide detailed information about your complaint. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Brief summary of your complaint"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetOrganization">
                Target Organization <span className="text-destructive">*</span>
              </Label>
              <Input
                id="targetOrganization"
                type="text"
                placeholder="e.g., FBR, SECP, NADRA, CDA"
                {...register('targetOrganization')}
              />
              {errors.targetOrganization && (
                <p className="text-xs text-destructive">
                  {errors.targetOrganization.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category', value as ComplaintCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select complaint category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="City or specific location (optional)"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of your complaint, including relevant dates, incidents, and any communication with the organization..."
                rows={8}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-2">Evidence Attachments</p>
              <p className="text-sm text-muted-foreground">
                Evidence upload functionality coming soon. For now, please include any relevant
                reference numbers or document details in the description above.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/client/complaints')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
