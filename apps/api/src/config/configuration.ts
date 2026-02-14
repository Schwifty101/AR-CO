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
 * Safepay configuration interface
 */
export interface SafepayConfig {
  /** Secret API key for backend SDK (sec_xxx) */
  secretKey: string;
  /** Public merchant API key for session creation (pub_xxx) */
  merchantApiKey: string;
  /** Current environment */
  environment: 'sandbox' | 'production';
  /** HMAC secret for webhook signature verification */
  webhookSecret: string;
  /** API host URL based on environment */
  host: string;
}

/**
 * Email configuration interface
 */
export interface EmailConfig {
  sendgridApiKey: string;
  fromEmail: string;
  fromName: string;
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
 * Complete application configuration interface
 */
export interface Configuration {
  app: AppConfig;
  supabase: SupabaseConfig;
  jwt: JwtConfig;
  safepay: SafepayConfig;
  email: EmailConfig;
  fileUpload: FileUploadConfig;
  admin: AdminConfig;
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
  safepay: {
    secretKey: process.env.SAFEPAY_SECRET_KEY || '',
    merchantApiKey: process.env.SAFEPAY_MERCHANT_API_KEY || '',
    environment:
      (process.env.SAFEPAY_ENVIRONMENT as 'sandbox' | 'production') ||
      'sandbox',
    webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || '',
    host:
      process.env.SAFEPAY_ENVIRONMENT === 'production'
        ? 'https://api.getsafepay.com'
        : 'https://sandbox.api.getsafepay.com',
  },
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'AR&CO Law Firm',
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
});
