'use client';

/**
 * Client Profile Page
 *
 * Displays and allows editing of the current client user's profile.
 * Shows personal information and business/company details.
 *
 * @module ClientProfilePage
 *
 * @example
 * Accessible at /client/profile
 * Requires authentication and client user type
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getUserProfile,
  updateUserProfile,
  updateClientProfile,
  type UserProfile,
  type CompanyType,
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

/** Validation schema for business info */
const businessInfoSchema = z.object({
  companyName: z.string().optional().or(z.literal('')),
  companyType: z
    .enum([
      'sole_proprietorship',
      'partnership',
      'llc',
      'corporation',
      'ngo',
      'other',
      '',
    ])
    .optional(),
  taxId: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
});

type BusinessInfoData = z.infer<typeof businessInfoSchema>;

/** Company type labels for display */
const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  sole_proprietorship: 'Sole Proprietorship',
  partnership: 'Partnership',
  llc: 'Limited Liability Company (LLC)',
  corporation: 'Corporation',
  ngo: 'Non-Governmental Organization (NGO)',
  other: 'Other',
};

/**
 * Client profile page component
 */
export default function ClientProfilePage() {
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
    register: registerBusiness,
    handleSubmit: handleSubmitBusiness,
    formState: { errors: businessErrors, isSubmitting: isSubmittingBusiness },
    reset: resetBusiness,
    setValue: setBusinessValue,
    watch: watchBusiness,
  } = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
  });

  const companyType = watchBusiness('companyType');

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

        if (data.clientProfile) {
          resetBusiness({
            companyName: data.clientProfile.companyName || '',
            companyType: (data.clientProfile.companyType || '') as BusinessInfoData['companyType'],
            taxId: data.clientProfile.taxId || '',
            address: data.clientProfile.address || '',
            city: data.clientProfile.city || '',
            country: data.clientProfile.country || '',
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
  }, [resetPersonal, resetBusiness]);

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

  const handleUpdateBusinessInfo = async (data: BusinessInfoData) => {
    try {
      const updated = await updateClientProfile({
        companyName: data.companyName || undefined,
        companyType: (data.companyType as CompanyType) || undefined,
        taxId: data.taxId || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
      });
      setProfile(updated);
      toast.success('Business information updated successfully');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update business profile',
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
          Manage your personal and business information
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

      {/* Business Information */}
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Manage your company details and address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmitBusiness(handleUpdateBusinessInfo)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Tech Solutions Pvt Ltd"
                {...registerBusiness('companyName')}
              />
              {businessErrors.companyName && (
                <p className="text-xs text-destructive">
                  {businessErrors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyType">Company Type</Label>
              <Select
                value={companyType || 'none'}
                onValueChange={(value) =>
                  setBusinessValue('companyType', value === 'none' ? '' as BusinessInfoData['companyType'] : value as BusinessInfoData['companyType'])
                }
              >
                <SelectTrigger id="companyType">
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {Object.entries(COMPANY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {businessErrors.companyType && (
                <p className="text-xs text-destructive">
                  {businessErrors.companyType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax Identification Number</Label>
              <Input
                id="taxId"
                type="text"
                placeholder="1234567-8"
                {...registerBusiness('taxId')}
              />
              {businessErrors.taxId && (
                <p className="text-xs text-destructive">
                  {businessErrors.taxId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main Street, Suite 100"
                {...registerBusiness('address')}
              />
              {businessErrors.address && (
                <p className="text-xs text-destructive">
                  {businessErrors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Karachi"
                  {...registerBusiness('city')}
                />
                {businessErrors.city && (
                  <p className="text-xs text-destructive">
                    {businessErrors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Pakistan"
                  {...registerBusiness('country')}
                />
                {businessErrors.country && (
                  <p className="text-xs text-destructive">
                    {businessErrors.country.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isSubmittingBusiness}>
              {isSubmittingBusiness ? 'Saving...' : 'Save Business Info'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
