import { z } from 'zod';
import {
  ConsultationBookingStatus,
  ConsultationUrgency,
  ConsultationPaymentStatus,
} from '../enums';

/** Schema for creating a consultation booking (guest intake form) */
export const CreateConsultationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required').max(20),
  practiceArea: z.string().min(1, 'Practice area is required').max(255),
  urgency: z.nativeEnum(ConsultationUrgency).default(ConsultationUrgency.MEDIUM),
  issueSummary: z.string().min(20, 'Please describe your issue in at least 20 characters').max(5000),
  relevantDates: z.string().max(500).optional(),
  opposingParty: z.string().max(255).optional(),
  additionalNotes: z.string().max(2000).optional(),
});

/** Schema for payment initiation response (LemonSqueezy hosted checkout) */
export const ConsultationPaymentInitResponseSchema = z.object({
  checkoutUrl: z.string().url(),
});

/** Schema for guest status check query parameters */
export const ConsultationStatusCheckSchema = z.object({
  referenceNumber: z.string().min(1, 'Reference number is required'),
  email: z.string().email('Valid email is required'),
});

/** Full consultation booking response */
export const ConsultationResponseSchema = z.object({
  id: z.string().uuid(),
  referenceNumber: z.string(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  practiceArea: z.string(),
  urgency: z.nativeEnum(ConsultationUrgency),
  issueSummary: z.string(),
  relevantDates: z.string().nullable(),
  opposingParty: z.string().nullable(),
  additionalNotes: z.string().nullable(),
  consultationFee: z.number(),
  paymentStatus: z.nativeEnum(ConsultationPaymentStatus),
  lemonsqueezyCheckoutId: z.string().nullable(),
  lemonsqueezyOrderId: z.string().nullable(),
  calcomBookingUid: z.string().nullable(),
  calcomBookingId: z.number().nullable(),
  bookingDate: z.string().nullable(),
  bookingTime: z.string().nullable(),
  meetingLink: z.string().nullable(),
  bookingStatus: z.nativeEnum(ConsultationBookingStatus),
  /** Storage path of the uploaded payment screenshot (manual payment flow) */
  paymentProofPath: z.string().nullable().optional(),
  /** Admin note recorded when reviewing the payment proof */
  paymentReviewNote: z.string().nullable().optional(),
  /** Timestamp the admin confirmed the manual payment */
  paymentConfirmedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Guest-safe status response (minimal info) */
export const ConsultationStatusResponseSchema = z.object({
  referenceNumber: z.string(),
  bookingStatus: z.nativeEnum(ConsultationBookingStatus),
  paymentStatus: z.nativeEnum(ConsultationPaymentStatus),
  bookingDate: z.string().nullable(),
  bookingTime: z.string().nullable(),
  meetingLink: z.string().nullable(),
  createdAt: z.string(),
});

/** Paginated consultations response (staff view) */
export const PaginatedConsultationsResponseSchema = z.object({
  data: z.array(ConsultationResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

/** Consultation list filters (staff view) */
export const ConsultationFiltersSchema = z.object({
  bookingStatus: z.nativeEnum(ConsultationBookingStatus).optional(),
  paymentStatus: z.nativeEnum(ConsultationPaymentStatus).optional(),
  practiceArea: z.string().optional(),
});
