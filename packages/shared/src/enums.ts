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
