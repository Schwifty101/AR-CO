/**
 * Environment variables validation schema using Joi
 *
 * This module defines a Joi schema to validate environment variables at application startup.
 * If validation fails, the application will not start and will throw an error with details
 * about which environment variables are missing or invalid.
 *
 * @module ValidationSchema
 *
 * @example
 * ```typescript
 * import { validationSchema } from './config/validation.schema';
 *
 * ConfigModule.forRoot({
 *   validationSchema,
 *   validationOptions: {
 *     allowUnknown: true,
 *     abortEarly: false,
 *   },
 * })
 * ```
 */

import * as Joi from 'joi';

/**
 * Joi validation schema for environment variables
 *
 * Validates all required environment variables and ensures they meet the expected format.
 * Optional variables have defaults defined in configuration.ts.
 *
 * @constant
 */
export const validationSchema = Joi.object({
  // Application Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(4000),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000,http://localhost:4000'),

  // Supabase Configuration (Required)
  SUPABASE_URL: Joi.string().uri().required().messages({
    'string.uri': 'SUPABASE_URL must be a valid URL',
    'any.required': 'SUPABASE_URL is required. Get it from Supabase Dashboard > Project Settings > API',
  }),
  SUPABASE_ANON_KEY: Joi.string().required().messages({
    'any.required': 'SUPABASE_ANON_KEY is required. Get it from Supabase Dashboard > Project Settings > API',
  }),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required().messages({
    'any.required':
      'SUPABASE_SERVICE_ROLE_KEY is required. Get it from Supabase Dashboard > Project Settings > API (service_role key)',
  }),
  SUPABASE_STORAGE_BUCKET: Joi.string().default('documents'),

  // JWT Configuration (Required in production)
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters long for security',
    'any.required': 'JWT_SECRET is required. Generate one using: openssl rand -base64 32',
  }),
  JWT_ACCESS_TOKEN_EXPIRATION: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('15m')
    .messages({
      'string.pattern.base':
        'JWT_ACCESS_TOKEN_EXPIRATION must be in format: 15m, 1h, 7d, etc.',
    }),
  JWT_REFRESH_TOKEN_EXPIRATION: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('7d')
    .messages({
      'string.pattern.base':
        'JWT_REFRESH_TOKEN_EXPIRATION must be in format: 15m, 1h, 7d, etc.',
    }),

  // Safepay Configuration (Optional for development, required for production)
  SAFEPAY_API_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  SAFEPAY_ENVIRONMENT: Joi.string()
    .valid('sandbox', 'production')
    .default('sandbox'),
  SAFEPAY_WEBHOOK_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // Email Configuration (Optional for development, required for production)
  SENDGRID_API_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  SENDGRID_FROM_EMAIL: Joi.string()
    .email()
    .default('noreply@example.com')
    .messages({
      'string.email': 'SENDGRID_FROM_EMAIL must be a valid email address',
    }),
  SENDGRID_FROM_NAME: Joi.string().default('AR&CO Law Firm'),

  // File Upload Configuration
  MAX_FILE_SIZE: Joi.number()
    .integer()
    .positive()
    .default(10485760)
    .messages({
      'number.base': 'MAX_FILE_SIZE must be a number (in bytes)',
      'number.positive': 'MAX_FILE_SIZE must be a positive number',
    }),
  ALLOWED_FILE_TYPES: Joi.string().default('.pdf,.doc,.docx,.jpg,.jpeg,.png'),
});

/**
 * Validation options for ConfigModule
 *
 * - allowUnknown: true - Allows additional environment variables not in schema
 * - abortEarly: false - Returns all validation errors, not just the first one
 */
export const validationOptions: Joi.ValidationOptions = {
  allowUnknown: true,
  abortEarly: false,
};
