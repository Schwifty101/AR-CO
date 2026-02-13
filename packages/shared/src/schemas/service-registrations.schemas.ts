import { z } from 'zod';
import { ServiceRegistrationStatus, ServiceRegistrationPaymentStatus } from '../enums';

/** Schema for creating a service registration (guest, no auth) */
export const CreateServiceRegistrationSchema = z.object({
  serviceId: z.string().uuid('Valid service ID is required'),
  fullName: z.string().min(1, 'Full name is required').max(255),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(1, 'Phone number is required').max(20),
  cnic: z.string().max(15).optional(),
  address: z.string().max(500).optional(),
  descriptionOfNeed: z.string().max(2000).optional(),
});

/** Schema for guest status check */
export const GuestStatusCheckSchema = z.object({
  referenceNumber: z.string().min(1, 'Reference number is required'),
  email: z.string().email('Valid email is required'),
});

/** Schema for staff updating registration status */
export const UpdateRegistrationStatusSchema = z.object({
  status: z.nativeEnum(ServiceRegistrationStatus),
  staffNotes: z.string().max(2000).optional(),
});

/** Service registration response */
export const ServiceRegistrationResponseSchema = z.object({
  id: z.string().uuid(),
  referenceNumber: z.string(),
  serviceId: z.string().uuid(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  cnic: z.string().nullable(),
  address: z.string().nullable(),
  descriptionOfNeed: z.string().nullable(),
  paymentStatus: z.nativeEnum(ServiceRegistrationPaymentStatus),
  status: z.nativeEnum(ServiceRegistrationStatus),
  clientProfileId: z.string().uuid().nullable(),
  assignedStaffId: z.string().uuid().nullable(),
  staffNotes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Guest-safe status response (minimal info) */
export const GuestStatusResponseSchema = z.object({
  referenceNumber: z.string(),
  status: z.nativeEnum(ServiceRegistrationStatus),
  paymentStatus: z.nativeEnum(ServiceRegistrationPaymentStatus),
  createdAt: z.string(),
});

/** Paginated service registrations response */
export const PaginatedServiceRegistrationsResponseSchema = z.object({
  data: z.array(ServiceRegistrationResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
