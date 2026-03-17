export {
  PasswordSchema,
  SignupSchema,
  SigninSchema,
  OAuthCallbackSchema,
  RefreshTokenSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  AuthResponseUserSchema,
  AuthResponseSchema,
  AuthMessageSchema,
  SignupPendingResponseSchema,
} from './auth.schemas';

export {
  InviteUserSchema,
  UpdateUserProfileSchema,
  CreateClientProfileSchema,
  UpdateClientProfileSchema,
  CreateAttorneyProfileSchema,
  UpdateAttorneyProfileSchema,
  ClientProfileResponseSchema,
  AttorneyProfileResponseSchema,
  UserProfileResponseSchema,
  PaginatedUsersResponseSchema,
} from './users.schemas';

export { PaginationSchema, AssignToSchema } from './common.schemas';

export {
  AdminDashboardStatsSchema,
  ClientDashboardStatsSchema,
} from './dashboard.schemas';

export {
  CreateClientSchema,
  UpdateClientSchema,
  ClientFiltersSchema,
  ClientResponseSchema,
  PaginatedClientsResponseSchema,
} from './clients.schemas';

export {
  CreateComplaintSchema,
  UpdateComplaintStatusSchema,
  ComplaintFiltersSchema,
  ComplaintResponseSchema,
  PaginatedComplaintsResponseSchema,
} from './complaints.schemas';

export {
  CreateServiceRegistrationSchema,
  GuestStatusCheckSchema,
  UpdateRegistrationStatusSchema,
  ServiceRegistrationResponseSchema,
  GuestStatusResponseSchema,
  PaginatedServiceRegistrationsResponseSchema,
  ServiceRegistrationDocumentResponseSchema,
} from './service-registrations.schemas';

export {
  ServiceResponseSchema,
  PaginatedServicesResponseSchema,
} from './services.schemas';

export {
  CreateCaseSchema,
  UpdateCaseSchema,
  UpdateCaseStatusSchema,
  CaseFiltersSchema,
  CreateCaseActivitySchema,
  CreateCaseFromRegistrationSchema,
  CaseResponseSchema,
  CaseActivityResponseSchema,
  PaginatedCasesResponseSchema,
  PaginatedCaseActivitiesResponseSchema,
} from './cases.schemas';

export {
  CreateConsultationSchema,
  ConsultationPaymentInitResponseSchema,
  ConsultationStatusCheckSchema,
  ConsultationResponseSchema,
  ConsultationStatusResponseSchema,
  PaginatedConsultationsResponseSchema,
  ConsultationFiltersSchema,
} from './consultations.schemas';

// Subscriptions
export {
  SubscriptionPlanSchema,
  UserSubscriptionSchema,
  SubscriptionEventSchema,
  InitiateSubscriptionSchema,
  SubscriptionCheckoutResponseSchema,
  CancelSubscriptionSchema,
  SubscriptionFiltersSchema,
  PaginatedSubscriptionsResponseSchema,
  SubscriptionDetailSchema,
} from './subscriptions.schemas';

export {
  UploadDocumentSchema,
  UpdateDocumentSchema,
  DocumentFiltersSchema,
  DocumentResponseSchema,
  PaginatedDocumentsResponseSchema,
} from './documents.schemas';

// Content
export {
  CreateContentPostSchema,
  UpdateContentPostSchema,
  ContentFiltersSchema,
  ContentPostResponseSchema,
  PaginatedContentPostsResponseSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryResponseSchema,
  CreateTestimonialSchema,
  TestimonialResponseSchema,
  PaginatedTestimonialsResponseSchema,
  CreateLegalNewsSchema,
  LegalNewsResponseSchema,
} from './content.schemas';

// Audit
export {
  AuditLogResponseSchema,
  AuditLogFiltersSchema,
  PaginatedAuditLogsResponseSchema,
  AuditLogUserSchema,
} from './audit.schemas';

// Admin
export {
  CreateInteractionSchema,
  UpdateInteractionSchema,
  InteractionResponseSchema,
  PaginatedInteractionsResponseSchema,
  CreateActivityLogSchema,
  ActivityLogResponseSchema,
  ActivityLogFiltersSchema,
  PaginatedActivityLogsResponseSchema,
  AdminAnalyticsStatsSchema,
  CaseAnalyticsSchema,
  RevenueAnalyticsSchema,
} from './admin.schemas';
