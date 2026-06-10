/**
 * Configuration module for AR-CO Backend API
 *
 * This module exports a typed configuration object that loads environment variables
 * and provides them to the NestJS application in a type-safe manner.
 *
 * @module Configuration
 *
 * @example
 * ```typescript
 * import configuration from './config/configuration';
 *
 * const config = configuration();
 * console.log(config.app.port); // 4000
 * console.log(config.supabase.url); // https://...
 * ```
 */

/**
 * Application configuration interface
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
}

/**
 * Supabase configuration interface
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  storageBucket: string;
}

/**
 * JWT configuration interface
 */
export interface JwtConfig {
  secret: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

/**
 * Email configuration interface (SMTP / nodemailer)
 */
export interface EmailConfig {
  /** SMTP host (e.g. smtp.gmail.com, mail.arandcolaw.com) */
  smtpHost: string;
  /** SMTP port (587 for STARTTLS, 465 for SSL) */
  smtpPort: number;
  /** Use a fully-encrypted connection (true for port 465) */
  smtpSecure: boolean;
  /** SMTP auth username (usually the full mailbox address) */
  smtpUser: string;
  /** SMTP auth password / app password */
  smtpPass: string;
  /** From address shown to recipients (info@arandcolaw.com) */
  fromEmail: string;
  /** From display name */
  fromName: string;
  /** Internal mailbox that receives new-registration notifications */
  adminEmail: string;
}

/**
 * File upload configuration interface
 */
export interface FileUploadConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
}

/**
 * Admin configuration interface
 */
export interface AdminConfig {
  emails: string[];
}

/**
 * LemonSqueezy payment configuration interface (Merchant of Record)
 */
export interface LemonSqueezyConfig {
  /** LemonSqueezy API key */
  apiKey: string;
  /** LemonSqueezy store ID */
  storeId: string;
  /** HMAC secret for webhook signature verification (X-Signature header) */
  webhookSecret: string;
  /** Variant ID for Civic Retainer subscription (PKR 700/month) */
  subscriptionVariantId: string;
  /** Variant ID for Legal Consultation one-time fee (PKR 50,000) */
  consultationVariantId: string;
  /** Variant ID for Facilitation Service standard fee (PKR 5,400) */
  serviceVariantId: string;
  /** Variant ID for Facilitation Service with government charges (PKR 8,400) */
  serviceGovtVariantId: string;
  /** Frontend URL for payment redirect callbacks */
  frontendUrl: string;
}

/**
 * Google APIs configuration interface
 */
export interface GoogleConfig {
  serviceAccountKey: string;
}

/**
 * Manual payment configuration interface.
 *
 * Bank details + contact channels shown to guests who pay manually (bank
 * transfer + screenshot upload). The WhatsApp number and bank details are
 * provided later via env; until then clearly-marked placeholders are used and
 * the WhatsApp line is hidden when empty.
 */
export interface ManualPaymentConfig {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  /** Official WhatsApp number for queries; empty string → UI hides the line */
  whatsappNumber: string;
  /** Contact email for queries (final: info@arandcolaw.com) */
  contactEmail: string;
}

/**
 * Complete application configuration interface
 */
export interface Configuration {
  app: AppConfig;
  supabase: SupabaseConfig;
  jwt: JwtConfig;
  email: EmailConfig;
  fileUpload: FileUploadConfig;
  admin: AdminConfig;
  lemonsqueezy: LemonSqueezyConfig;
  google: GoogleConfig;
  manualPayment: ManualPaymentConfig;
}

/**
 * Configuration factory function
 *
 * Loads environment variables and returns a typed configuration object.
 * This function is used by NestJS ConfigModule.forRoot().
 *
 * @returns {Configuration} Typed configuration object
 *
 * @example
 * ```typescript
 * ConfigModule.forRoot({
 *   load: [configuration],
 *   isGlobal: true,
 * })
 * ```
 */
export default (): Configuration => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:4000',
    ],
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'documents',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
    refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
  },
  email: {
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    fromEmail: process.env.MAIL_FROM || 'info@arandcolaw.com',
    fromName: process.env.MAIL_FROM_NAME || 'AR&CO Law Firm',
    adminEmail: process.env.MAIL_ADMIN || 'info@arandcolaw.com',
  },
  fileUpload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      '.pdf',
      '.doc',
      '.docx',
      '.jpg',
      '.jpeg',
      '.png',
    ],
  },
  admin: {
    emails:
      process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) || [],
  },
  lemonsqueezy: {
    apiKey: process.env.LEMONSQUEEZY_API_KEY ?? '',
    storeId: process.env.LEMONSQUEEZY_STORE_ID ?? '',
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '',
    subscriptionVariantId:
      process.env.LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID ?? '',
    consultationVariantId:
      process.env.LEMONSQUEEZY_CONSULTATION_VARIANT_ID ?? '',
    serviceVariantId: process.env.LEMONSQUEEZY_SERVICE_VARIANT_ID ?? '',
    serviceGovtVariantId:
      process.env.LEMONSQUEEZY_SERVICE_GOVT_VARIANT_ID ?? '',
    frontendUrl: 'https://arandcolaw.com',
  },
  google: {
    serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '',
  },
  // Real bank/WhatsApp values are TBD — fall back to clearly-marked placeholders
  // until the env vars are set. contactEmail is final.
  manualPayment: {
    bankName: process.env.MANUAL_PAY_BANK_NAME || 'Bank details to be provided',
    accountTitle: process.env.MANUAL_PAY_ACCOUNT_TITLE || 'AR & CO',
    accountNumber: process.env.MANUAL_PAY_ACCOUNT_NUMBER || 'XXXX-XXXX-XXXX',
    iban: process.env.MANUAL_PAY_IBAN || 'PKXX XXXX XXXX XXXX XXXX XXXX',
    whatsappNumber: process.env.MANUAL_PAY_WHATSAPP || '',
    contactEmail: process.env.MANUAL_PAY_CONTACT_EMAIL || 'info@arandcolaw.com',
  },
});
