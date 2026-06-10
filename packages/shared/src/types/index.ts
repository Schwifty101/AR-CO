export type { AssignToData, PaginationParams, ReviewPaymentData } from './common.types';

export type {
  SignupData,
  SigninData,
  OAuthCallbackData,
  RefreshTokenData,
  PasswordResetRequestData,
  PasswordResetConfirmData,
  AuthResponseUser,
  AuthResponse,
  AuthMessage,
  SignupPendingResponse,
} from './auth.types';

export type {
  InviteUserData,
  UpdateUserProfileData,
  CreateClientProfileData,
  UpdateClientProfileData,
  CreateAttorneyProfileData,
  UpdateAttorneyProfileData,
  ClientProfile,
  AttorneyProfile,
  UserProfile,
  PaginatedUsersResponse,
} from './users.types';

export type {
  AdminDashboardStats,
  ClientDashboardStats,
} from './dashboard.types';

export type {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  ClientResponse,
  PaginatedClientsResponse,
} from './clients.types';

export type {
  CreateComplaintData,
  ComplaintStatusCheckData,
  UpdateComplaintStatusData,
  ComplaintFilters,
  ComplaintResponse,
  ComplaintStatusResponse,
  PaginatedComplaintsResponse,
} from './complaints.types';

export type {
  CreateServiceRegistrationData,
  GuestStatusCheckData,
  UpdateRegistrationStatusData,
  ServiceRegistrationResponse,
  GuestStatusResponse,
  PaginatedServiceRegistrationsResponse,
  ServiceRegistrationDocumentResponse,
} from './service-registrations.types';

export type {
  ServiceResponse,
  PaginatedServicesResponse,
} from './services.types';

export type {
  CreateCaseData,
  UpdateCaseData,
  UpdateCaseStatusData,
  CaseFilters,
  CreateCaseActivityData,
  CreateCaseFromRegistrationData,
  CaseResponse,
  CaseActivityResponse,
  PaginatedCasesResponse,
  PaginatedCaseActivitiesResponse,
} from './cases.types';

export type {
  CreateConsultationData,
  ConsultationPaymentInitResponse,
  ConsultationStatusCheckData,
  ConsultationResponse,
  ConsultationStatusResponse,
  PaginatedConsultationsResponse,
  ConsultationFilters,
} from './consultations.types';

// Subscriptions
export type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionEvent,
  InitiateSubscriptionData,
  SubscriptionCheckoutResponse,
  CancelSubscriptionData,
  SubscriptionFilters,
  PaginatedSubscriptionsResponse,
  SubscriptionDetail,
} from './subscriptions.types';

export type {
  UploadDocumentData,
  UpdateDocumentData,
  DocumentFilters,
  DocumentResponse,
  PaginatedDocumentsResponse,
} from './documents.types';

// Content
export type {
  CreateContentPostData,
  UpdateContentPostData,
  ContentFilters,
  ContentPostResponse,
  PaginatedContentPostsResponse,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryResponse,
  CreateTestimonialData,
  TestimonialResponse,
  PaginatedTestimonialsResponse,
  CreateLegalNewsData,
  LegalNewsResponse,
} from './content.types';

// Payments / Invoices
export type {
  InvoiceItem,
  InvoiceResponse,
  CreateInvoiceData,
  UpdateInvoiceData,
  AddInvoiceItemData,
  InvoiceFilters,
  PaginatedInvoicesResponse,
} from './payments.types';

// Audit
export type {
  AuditLogResponse,
  AuditLogFilters,
  PaginatedAuditLogsResponse,
  AuditLogUser,
} from './audit.types';

// Admin
export type {
  CreateInteractionData,
  UpdateInteractionData,
  InteractionResponse,
  PaginatedInteractionsResponse,
  CreateActivityLogData,
  ActivityLogResponse,
  ActivityLogFilters,
  PaginatedActivityLogsResponse,
  AdminAnalyticsStats,
  CaseAnalytics,
  RevenueAnalytics,
} from './admin.types';
