'use client';

/**
 * Admin Profile Page
 *
 * Displays and allows editing of the current admin user's profile.
 * Shows personal information and attorney-specific fields if applicable.
 *
 * @module AdminProfilePage
 *
 * @example
 * Accessible at /admin/profile
 * Requires authentication and admin/attorney/staff user type
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getUserProfile,
  updateUserProfile,
  updateAttorneyProfile,
  type UserProfile,
} from '@/lib/api/users';

/** Validation schema for personal info */
const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[0-9]{10,15}$/,
      'Phone number must be 10-15 digits (optional + prefix)',
    )
    .optional()
    .or(z.literal('')),
});

type PersonalInfoData = z.infer<typeof personalInfoSchema>;

/** Validation schema for attorney info */
const attorneyInfoSchema = z.object({
  barNumber: z.string().optional().or(z.literal('')),
  specializations: z.string().optional().or(z.literal('')),
  education: z.string().optional().or(z.literal('')),
  experienceYears: z.coerce.number().int().min(0).optional().or(z.literal('')),
  hourlyRate: z.coerce.number().min(0).optional().or(z.literal('')),
});

type AttorneyInfoData = z.infer<typeof attorneyInfoSchema>;

/**
 * Admin profile page component
 */
export default function AdminProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    formState: { errors: personalErrors, isSubmitting: isSubmittingPersonal },
    reset: resetPersonal,
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
  });

  const {
    register: registerAttorney,
    handleSubmit: handleSubmitAttorney,
    formState: { errors: attorneyErrors, isSubmitting: isSubmittingAttorney },
    reset: resetAttorney,
  } = useForm<AttorneyInfoData>({
    resolver: zodResolver(attorneyInfoSchema),
  });

  // Fetch profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setError(null);
        const data = await getUserProfile();
        setProfile(data);

        // Populate forms with existing data
        resetPersonal({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber || '',
        });

        if (data.attorneyProfile) {
          resetAttorney({
            barNumber: data.attorneyProfile.barNumber || '',
            specializations: (data.attorneyProfile.specializations ?? []).join(', '),
            education: data.attorneyProfile.education || '',
            experienceYears: data.attorneyProfile.experienceYears ?? '',
            hourlyRate: data.attorneyProfile.hourlyRate ?? '',
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [resetPersonal, resetAttorney]);

  const handleUpdatePersonalInfo = async (data: PersonalInfoData) => {
    try {
      const updated = await updateUserProfile({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || undefined,
      });
      setProfile(updated);
      toast.success('Personal information updated successfully');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update profile',
      );
    }
  };

  const handleUpdateAttorneyInfo = async (data: AttorneyInfoData) => {
    try {
      const specializationsArray = data.specializations
        ? data.specializations.split(',').map((s) => s.trim())
        : [];

      const updated = await updateAttorneyProfile({
        barNumber: data.barNumber || undefined,
        specializations:
          specializationsArray.length > 0
            ? specializationsArray
            : undefined,
        education: data.education || undefined,
        experienceYears: data.experienceYears
          ? Number(data.experienceYears)
          : undefined,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
      });
      setProfile(updated);
      toast.success('Attorney information updated successfully');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update attorney profile',
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive">
        {error || 'Failed to load profile'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal and professional information
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your name and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmitPersonal(handleUpdatePersonalInfo)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                {...registerPersonal('fullName')}
              />
              {personalErrors.fullName && (
                <p className="text-xs text-destructive">
                  {personalErrors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+923001234567"
                {...registerPersonal('phoneNumber')}
              />
              {personalErrors.phoneNumber && (
                <p className="text-xs text-destructive">
                  {personalErrors.phoneNumber.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmittingPersonal}>
              {isSubmittingPersonal ? 'Saving...' : 'Save Personal Info'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Attorney Information (only show if user is an attorney) */}
      {profile.userType === 'attorney' && profile.attorneyProfile && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Attorney Information</CardTitle>
              <CardDescription>
                Manage your professional credentials and specializations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmitAttorney(handleUpdateAttorneyInfo)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="barNumber">Bar Registration Number</Label>
                  <Input
                    id="barNumber"
                    type="text"
                    placeholder="BAR123456"
                    {...registerAttorney('barNumber')}
                  />
                  {attorneyErrors.barNumber && (
                    <p className="text-xs text-destructive">
                      {attorneyErrors.barNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations</Label>
                  <Input
                    id="specializations"
                    type="text"
                    placeholder="Corporate Law, Tax Law, IP Law"
                    {...registerAttorney('specializations')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple specializations with commas
                  </p>
                  {attorneyErrors.specializations && (
                    <p className="text-xs text-destructive">
                      {attorneyErrors.specializations.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    type="text"
                    placeholder="LLB, LLM from XYZ University"
                    {...registerAttorney('education')}
                  />
                  {attorneyErrors.education && (
                    <p className="text-xs text-destructive">
                      {attorneyErrors.education.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">
                      Years of Experience
                    </Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      min="0"
                      placeholder="10"
                      {...registerAttorney('experienceYears')}
                    />
                    {attorneyErrors.experienceYears && (
                      <p className="text-xs text-destructive">
                        {attorneyErrors.experienceYears.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (PKR)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="15000"
                      {...registerAttorney('hourlyRate')}
                    />
                    {attorneyErrors.hourlyRate && (
                      <p className="text-xs text-destructive">
                        {attorneyErrors.hourlyRate.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingAttorney}>
                  {isSubmittingAttorney ? 'Saving...' : 'Save Attorney Info'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
