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

/** Subscription status for civic retainer plans */
export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/** Complaint lifecycle status */
export enum ComplaintStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
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
  PAID = 'paid',
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
