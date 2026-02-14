import type { z } from 'zod';
import type {
  CreateConsultationSchema,
  ConsultationPaymentInitResponseSchema,
  ConfirmConsultationPaymentSchema,
  ConsultationStatusCheckSchema,
  ConsultationResponseSchema,
  ConsultationStatusResponseSchema,
  PaginatedConsultationsResponseSchema,
  ConsultationFiltersSchema,
} from '../schemas/consultations.schemas';

/** Data for creating a new consultation booking */
export type CreateConsultationData = z.infer<typeof CreateConsultationSchema>;

/** Payment initiation response with Safepay credentials */
export type ConsultationPaymentInitResponse = z.infer<typeof ConsultationPaymentInitResponseSchema>;

/** Data for confirming a payment */
export type ConfirmConsultationPaymentData = z.infer<typeof ConfirmConsultationPaymentSchema>;

/** Guest status check query parameters */
export type ConsultationStatusCheckData = z.infer<typeof ConsultationStatusCheckSchema>;

/** Full consultation booking response */
export type ConsultationResponse = z.infer<typeof ConsultationResponseSchema>;

/** Guest-safe consultation status response */
export type ConsultationStatusResponse = z.infer<typeof ConsultationStatusResponseSchema>;

/** Paginated consultations list response */
export type PaginatedConsultationsResponse = z.infer<typeof PaginatedConsultationsResponseSchema>;

/** Consultation list filters */
export type ConsultationFilters = z.infer<typeof ConsultationFiltersSchema>;
