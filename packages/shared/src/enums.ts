/** User type enum matching the database `user_type` column */
export enum UserType {
  CLIENT = 'client',
  ATTORNEY = 'attorney',
  STAFF = 'staff',
  ADMIN = 'admin',
}

/** Company type enum matching the database `company_type` column */
export enum CompanyType {
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  PARTNERSHIP = 'partnership',
  LLC = 'llc',
  CORPORATION = 'corporation',
  NGO = 'ngo',
  OTHER = 'other',
}

/** Complaint lifecycle status */
export enum ComplaintStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

/** Payment status for complaints (manual screenshot flow) */
export enum ComplaintPaymentStatus {
  PENDING = 'pending',
  /** Screenshot proof uploaded by the guest, awaiting admin review */
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  PAID = 'paid',
  /** Admin reviewed the proof and flagged an issue; handled out-of-band */
  FLAGGED = 'flagged',
}

/** Categories for civic complaints */
export enum ComplaintCategory {
  INFRASTRUCTURE = 'infrastructure',
  PUBLIC_SERVICES = 'public_services',
  ENVIRONMENT = 'environment',
  GOVERNANCE = 'governance',
  HEALTH = 'health',
  EDUCATION = 'education',
  UTILITIES = 'utilities',
  OTHER = 'other',
}

/** Service registration processing status */
export enum ServiceRegistrationStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/** Payment status for service registrations */
export enum ServiceRegistrationPaymentStatus {
  PENDING = 'pending',
  /** Screenshot proof uploaded by the guest, awaiting admin review */
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  PAID = 'paid',
  /** Admin reviewed the proof and flagged an issue; handled out-of-band */
  FLAGGED = 'flagged',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/** Case lifecycle status - matches DB case_status enum */
export enum CaseStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

/** Case priority level - matches DB case_priority enum */
export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/** Case activity types for timeline entries - matches DB activity_type enum */
export enum CaseActivityType {
  CASE_CREATED = 'case_created',
  STATUS_CHANGED = 'status_changed',
  ATTORNEY_ASSIGNED = 'attorney_assigned',
  DOCUMENT_UPLOADED = 'document_uploaded',
  NOTE_ADDED = 'note_added',
  HEARING_SCHEDULED = 'hearing_scheduled',
  PAYMENT_RECEIVED = 'payment_received',
  OTHER = 'other',
}

/** Consultation booking lifecycle status */
export enum ConsultationBookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

/** Consultation urgency level */
export enum ConsultationUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/** Consultation payment status */
export enum ConsultationPaymentStatus {
  PENDING = 'pending',
  /** Screenshot proof uploaded by the guest, awaiting admin review */
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  PAID = 'paid',
  /** Admin reviewed the proof and flagged an issue; handled out-of-band */
  FLAGGED = 'flagged',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/** Status of a user's subscription lifecycle */
export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  ENDED = 'ended',
  FAILED = 'failed',
  UNPAID = 'unpaid',
}

/** Billing interval for subscription plans */
export enum BillingInterval {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

/**
 * Document type classification
 *
 * @example
 * ```typescript
 * import { DocumentType } from '@repo/shared';
 * const type = DocumentType.CONTRACT;
 * ```
 */
export enum DocumentType {
  CONTRACT = 'contract',
  AGREEMENT = 'agreement',
  COURT_FILING = 'court_filing',
  EVIDENCE = 'evidence',
  CORRESPONDENCE = 'correspondence',
  INVOICE_DOCUMENT = 'invoice_document',
  CLIENT_ID = 'client_id',
  OTHER = 'other',
}

/** Content type discriminator for blog_posts table */
export enum ContentType {
  BLOG = 'blog',
  CASE_STUDY = 'case_study',
}

/** Blog post publication status — matches DB post_status enum */
export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/** Actions tracked in the audit log system */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  ASSIGN = 'ASSIGN',
  INVITE = 'INVITE',
  CANCEL = 'CANCEL',
  ADD_ACTIVITY = 'ADD_ACTIVITY',
  SIGNUP = 'SIGNUP',
  SIGNIN = 'SIGNIN',
  OAUTH_LOGIN = 'OAUTH_LOGIN',
  EMAIL_CONFIRM = 'EMAIL_CONFIRM',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  SIGNOUT = 'SIGNOUT',
}

/** Entity types tracked in the audit log system */
export enum AuditEntityType {
  USER = 'user',
  CLIENT = 'client',
  CASE = 'case',
  COMPLAINT = 'complaint',
  SERVICE_REGISTRATION = 'service_registration',
  CONSULTATION = 'consultation',
  SUBSCRIPTION = 'subscription',
  BLOG_POST = 'blog_post',
  BLOG_CATEGORY = 'blog_category',
  DOCUMENT = 'document',
  AUTH = 'auth',
}

/** Client interaction type — matches DB interaction_type enum */
export enum InteractionType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  WHATSAPP = 'whatsapp',
  OTHER = 'other',
}

/** Invoice lifecycle status — matches DB invoice_status enum */
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

/** Payment method used for a transaction */
export enum PaymentMethod {
  CARD = 'card',
  MOBILE_WALLET = 'mobile_wallet',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  OTHER = 'other',
}
