# AR-CO Database & Backend Setup - Task Initialization

## Overview

This document provides a granular 3-level task breakdown for transforming the AR-CO NestJS backend from minimal setup to a full-featured law firm management platform.

**Current State (as of 2026-03-03):**

- HEAD TASKs 1-9 complete (Environment, Schema, DB Service, Auth, Users, Clients/Subscriptions/Complaints/Service Registrations, Cases, Consultation Booking, Documents)
- **HEAD TASK 11 complete** (Content Module — Google Docs CMS, SEO, Blog/Case Studies, Testimonials, Legal News)
- HEAD TASK 12 nearly complete (backend done, frontend remaining):
  - **Backend complete:** Dashboard service (stats + analytics + case analytics + revenue placeholder), Dashboard controller (8 endpoints), Admin schemas/types/enum (InteractionType, 11 Zod schemas, 11 TS types), AdminModule (ClientInteractionsService, ActivityLogsService, AdminController with 6 CRM endpoints)
  - **Frontend complete:** All admin management views (12.7), Dashboard stats integration (12.8), Service Registrations → Cases (12.9)
  - **Frontend remaining:** Admin API client (`apps/web/lib/api/admin.ts` for analytics + interactions), Dashboard analytics cards + recent activity feed, Interactions tab on client detail page, final tsc verification
  - Activity logs page NOT needed — covered by HEAD TASK 15's `/admin/audit-logs` page
- Auth enhancement: Email confirmation flow implemented (signup defers profile creation, signin checks confirmation)
- **Auth fix: Invite redirect & RBAC** — invite magic link now redirects to `/auth/callback` for proper role-based routing; attorney added to admin-side redirects; role-based permission model implemented (see below)
- **Safepay payment code is LIVE but being replaced by Lemon Squeezy** — migration in progress
- **HEAD TASK 15 complete** (Audit & Activity Logs — global interceptor, AuditService, admin audit logs page)
- HEAD TASKs 10, 13-14 remain (Payments/Lemon Squeezy, Testing, RLS Optimization)

**Role-Based Access Control (Admin Dashboard):**

| Feature                     | Admin           | Attorney               | Staff     |
| --------------------------- | --------------- | ---------------------- | --------- |
| Dashboard stats             | Full            | View                   | View      |
| Users                       | Invite + Delete | View list              | View list |
| Clients                     | Full CRUD       | Create + Edit + View   | View only |
| Cases                       | Full CRUD       | Create + Edit + View   | View only |
| Complaints                  | Full            | Manage (status/assign) | View only |
| Consultations               | Full            | View + Cancel          | View only |
| Subscriptions               | Full            | Hidden                 | Hidden    |
| Content (Blog/Case Studies) | Full CRUD       | View only              | View only |
| Service Registrations       | Full            | View + Manage          | View only |

**Payment Provider:** [Lemon Squeezy](https://lemonsqueezy.com) (Merchant of Record) — replacing Safepay
**SDK:** `@lemonsqueezy/lemonsqueezy.js`
**Docs:** `docs/lemonsqueezy/` (API reference, SDK guide, webhooks, checkout, subscriptions, integration plan)

**Goal:**
Complete database architecture with 20+ tables, Row-Level Security, comprehensive API endpoints for all features.

---

## HEAD TASK 1: Environment & Configuration Setup

### Sub-task 1.1: Install Dependencies

- [X] **1.1.1**: Install Supabase client (`@supabase/supabase-js`)
- [X] **1.1.2**: Install validation packages (`class-validator`, `class-transformer`, `joi`)
- [X] **1.1.3**: Install authentication packages (`@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`)
- [X] **1.1.4**: Install security packages (`bcrypt`, `@types/bcrypt`)
- [X] **1.1.5**: Install file upload packages (`multer`, `@types/multer`, `@nestjs/platform-express`)
- [X] **1.1.6**: Install utility packages (`axios`, `dayjs`, `uuid`)
- [X] **1.1.7**: Install email service packages (`@sendgrid/mail`)
- [X] **1.1.8**: Install logging packages (`winston`, `nest-winston`)

### Sub-task 1.2: Create Environment Configuration

- [X] **1.2.1**: Create `.env` file with Supabase credentials (URL, anon key, service role key)
- [X] **1.2.2**: Add JWT configuration (secret, access token expiration, refresh token expiration)
- [X] **1.2.3**: Add Lemon Squeezy configuration (API key, store ID, webhook secret, variant IDs)
- [X] **1.2.4**: Add email service configuration (SendGrid API key, from email)
- [X] **1.2.5**: Add application configuration (PORT, NODE_ENV, CORS origins)
- [X] **1.2.6**: Create `.env.example` template file

### Sub-task 1.3: Setup Configuration Module

- [X] **1.3.1**: Create `apps/api/src/config/configuration.ts` with typed config object
- [X] **1.3.2**: Create `apps/api/src/config/validation.schema.ts` with Joi validation schema
- [X] **1.3.3**: Create `apps/api/src/config/config.module.ts` using NestJS ConfigModule
- [X] **1.3.4**: Import ConfigModule in `apps/api/src/app.module.ts`

---

## HEAD TASK 2: Database Schema & RLS Policies

### Sub-task 2.1: Create User Management Tables

- [X] **2.1.1**: Create `user_profiles` table (extends Supabase auth.users)
  - Columns: id (uuid, FK to auth.users), full_name, phone_number, user_type (enum), created_at, updated_at
- [X] **2.1.2**: Create `client_profiles` table with company info
  - Columns: id (uuid), user_profile_id (FK), company_name, company_type, tax_id, address, city, country, created_at, updated_at
- [X] **2.1.3**: Create `attorney_profiles` table with specializations
  - Columns: id (uuid), user_profile_id (FK), bar_number, specializations (text[]), education, experience_years, hourly_rate, created_at, updated_at

### Sub-task 2.2: Create Core Business Tables

- [X] **2.2.1**: Create `practice_areas` table
  - Columns: id (uuid), name, slug, description, icon, is_active, created_at, updated_at
- [X] **2.2.2**: Create `services` table
  - Columns: id (uuid), practice_area_id (FK), name, slug, description, base_fee, estimated_duration, is_active, created_at, updated_at
- [X] **2.2.3**: Create `cases` table with case_number auto-generation
  - Columns: id (uuid), case_number (auto-generated, unique), client_profile_id (FK), attorney_profile_id (FK), practice_area_id (FK), service_id (FK), title, description, status (enum), priority (enum), case_type, filing_date, closing_date, created_at, updated_at
- [X] **2.2.4**: Create `case_activities` table for timeline
  - Columns: id (uuid), case_id (FK), activity_type (enum), title, description, created_by (FK to user_profiles), attachments (jsonb), created_at

### Sub-task 2.3: Create Appointment Tables

- [X] **2.3.1**: Create `appointments` table with double-booking prevention
  - Columns: id (uuid), client_profile_id (FK), attorney_profile_id (FK), appointment_date, start_time, end_time, duration_minutes, appointment_type (enum), status (enum), subject, notes, meeting_link, created_at, updated_at
  - Unique constraint: (attorney_profile_id, appointment_date, start_time) to prevent double-booking
- [X] **2.3.2**: Create `availability_slots` table for attorney scheduling
  - Columns: id (uuid), attorney_profile_id (FK), day_of_week (int), start_time, end_time, is_available, created_at, updated_at

### Sub-task 2.4: Create Financial Tables

- [X] **2.4.1**: Create `invoices` table with auto invoice_number
  - Columns: id (uuid), invoice_number (auto-generated), client_profile_id (FK), case_id (FK, optional), issue_date, due_date, subtotal, tax_amount, discount_amount, total_amount, status (enum), payment_terms, notes, created_at, updated_at
- [X] **2.4.2**: Create `invoice_items` table
  - Columns: id (uuid), invoice_id (FK), description, quantity, unit_price, amount, created_at
- [X] **2.4.3**: Create `payments` table with Lemon Squeezy integration
  - Columns: id (uuid), invoice_id (FK), client_profile_id (FK), amount, payment_method (enum), lemonsqueezy_order_id, lemonsqueezy_checkout_id, status (enum), payment_date, metadata (jsonb), created_at, updated_at

### Sub-task 2.5: Create Document Tables

- [X] **2.5.1**: Create `documents` table with encryption metadata
  - Columns: id (uuid), name, description, file_path (Supabase Storage path), file_size, file_type, uploaded_by (FK to user_profiles), case_id (FK, optional), client_profile_id (FK, optional), document_type (enum), is_encrypted, encryption_metadata (jsonb), created_at, updated_at

### Sub-task 2.6: Create Content Tables

- [X] **2.6.1**: Create `blog_categories` table
  - Columns: id (uuid), name, slug, description, created_at, updated_at
- [X] **2.6.2**: Create `blog_posts` table
  - Columns: id (uuid), title, slug, excerpt, content, featured_image, author_id (FK to user_profiles), category_id (FK), status (enum), published_at, view_count, created_at, updated_at
- [X] **2.6.3**: Create `testimonials` table
  - Columns: id (uuid), client_profile_id (FK), content, rating (int), is_approved, approved_by (FK to user_profiles), approved_at, created_at, updated_at
- [X] **2.6.4**: Create `legal_news` table for news ticker
  - Columns: id (uuid), title, source, url, published_at, created_at

### Sub-task 2.7: Create Admin & Tracking Tables

- [X] **2.7.1**: Create `client_interactions` table for CRM
  - Columns: id (uuid), client_profile_id (FK), staff_user_id (FK to user_profiles), interaction_type (enum), subject, notes, scheduled_at, completed_at, created_at, updated_at
- [X] **2.7.2**: Create `activity_logs` table for audit trail
  - Columns: id (uuid), user_id (FK to user_profiles), action, entity_type, entity_id, metadata (jsonb), ip_address, user_agent, created_at

### Sub-task 2.8: Create Private Schema Utility Functions

- [X] **2.8.1**: Create `private.get_user_type(user_id uuid)` function
  - Returns user_type from user_profiles table
- [X] **2.8.2**: Create `private.is_admin(user_id uuid)` function
  - Returns boolean, checks if user_type = 'admin'
- [X] **2.8.3**: Create `private.is_staff(user_id uuid)` function
  - Returns boolean, checks if user_type IN ('admin', 'attorney', 'staff')
- [X] **2.8.4**: Create `private.get_client_profile_id(user_id uuid)` function
  - Returns client_profile_id for given user_id
- [X] **2.8.5**: Create `private.get_attorney_profile_id(user_id uuid)` function
  - Returns attorney_profile_id for given user_id
- [X] **2.8.6**: Test all utility functions with sample data

### Sub-task 2.9: Apply RLS Policies

- [X] **2.9.1**: Enable RLS on all tables
- [X] **2.9.2**: Create RLS policies for `user_profiles`
  - Users can read their own profile
  - Staff can read all profiles
  - Users can update their own profile
  - Admin can update any profile
- [X] **2.9.3**: Create RLS policies for `client_profiles`
  - Clients can read their own profile
  - Staff can read all client profiles
  - Staff can update client profiles
- [X] **2.9.4**: Create RLS policies for `attorney_profiles`
  - Attorneys can read their own profile
  - Staff can read all attorney profiles
  - Admin can update attorney profiles
- [X] **2.9.5**: Create RLS policies for `cases`
  - Clients can read their own cases
  - Attorneys can read cases assigned to them
  - Staff can read all cases
  - Staff can create/update/delete cases
- [X] **2.9.6**: Create RLS policies for `documents`
  - Clients can read documents linked to their cases/profile
  - Attorneys can read documents for assigned cases
  - Staff can read all documents
  - Document uploader and staff can delete documents
- [X] **2.9.7**: Create RLS policies for `appointments`
  - Clients can read their own appointments
  - Attorneys can read their assigned appointments
  - Staff can read all appointments
  - Staff can create/update appointments
- [X] **2.9.8**: Create RLS policies for `invoices` and `payments`
  - Clients can read their own invoices/payments
  - Staff can read all invoices/payments
  - Staff can create/update invoices
- [X] **2.9.9**: Create RLS policies for content tables (blog_posts, testimonials)
  - All users can read published blog posts
  - Staff can create/update blog posts
  - Clients can submit testimonials
  - Admin can approve testimonials

### Sub-task 2.10: Create Database Triggers

- [X] **2.10.1**: Create `generate_case_number()` trigger function
  - Format: "CASE-YYYY-NNNN" (e.g., CASE-2025-0001)
  - Auto-increment per year
- [X] **2.10.2**: Apply case_number trigger to `cases` table
- [X] **2.10.3**: Create `generate_invoice_number()` trigger function
  - Format: "INV-YYYY-NNNN" (e.g., INV-2025-0001)
- [X] **2.10.4**: Apply invoice_number trigger to `invoices` table
- [X] **2.10.5**: Create `update_updated_at_column()` trigger function
  - Automatically updates updated_at timestamp
- [X] **2.10.6**: Apply updated_at trigger to all tables with updated_at column

---

## HEAD TASK 3: Database Service & Common Utilities ✅

### Sub-task 3.1: Create Database Module

- [X] **3.1.1**: Create `apps/api/src/database/supabase.service.ts` with SupabaseService class
  - Method: `getClient(accessToken?: string)` - Returns authenticated Supabase client
  - Method: `getAdminClient()` - Returns service role client (bypasses RLS)
  - Method: `getUserFromToken(token)` - Validates JWT and retrieves user profile
- [X] **3.1.2**: Create `apps/api/src/database/admin-whitelist.service.ts`
  - Method: `isAdminEmail(email)` - Checks admin whitelist
- [X] **3.1.3**: Create `apps/api/src/database/database.module.ts`
  - Register SupabaseService and AdminWhitelistService as global providers
- [X] **3.1.4**: Import DatabaseModule in `app.module.ts`

### Sub-task 3.2: Create Common Guards

- [X] **3.2.1**: Create `apps/api/src/common/guards/jwt-auth.guard.ts`
  - Extract JWT from Authorization header
  - Validate token with Supabase via getUserFromToken()
  - Attach user to request object
  - Respect @Public() decorator
- [X] **3.2.2**: Create `apps/api/src/common/guards/roles.guard.ts`
  - Check user_type against required roles from @Roles() decorator
  - Check admin whitelist for bypass
- [X] **3.2.3**: Register guards globally in `main.ts` with proper execution order

### Sub-task 3.3: Create Common Decorators

- [X] **3.3.1**: Create `apps/api/src/common/decorators/current-user.decorator.ts`
  - Extracts user from request object
  - Supports extracting specific properties
- [X] **3.3.2**: Create `apps/api/src/common/decorators/roles.decorator.ts`
  - Decorator to specify required roles for endpoints
- [X] **3.3.3**: Create `apps/api/src/common/decorators/public.decorator.ts`
  - Decorator to mark endpoints as public (skip authentication)

### Sub-task 3.4: Create Common DTOs and Interfaces

- [X] **3.4.1**: Create `apps/api/src/common/dto/pagination.dto.ts`
  - PaginationDto with page, limit, sort, order
  - Full class-validator validation
- [X] **3.4.2**: Create `apps/api/src/common/interfaces/auth-user.interface.ts`
  - AuthUser interface with id, email, userType, fullName, phoneNumber
  - Optional: clientProfileId, attorneyProfileId
- [X] **3.4.3**: Create `apps/api/src/common/enums/user-type.enum.ts`
  - UserType enum: CLIENT, ATTORNEY, STAFF, ADMIN

### Sub-task 3.5: Create Exception Filters

- [X] **3.5.1**: Create `apps/api/src/common/filters/http-exception.filter.ts`
  - Standardizes HTTP error responses
- [X] **3.5.2**: Create `apps/api/src/common/filters/supabase-exception.filter.ts`
  - Maps Supabase errors to HTTP status codes

### Sub-task 3.6: Application Integration

- [X] **3.6.1**: Update `main.ts` with global guards and filters
- [X] **3.6.2**: Extend `configuration.ts` with AdminConfig
- [X] **3.6.3**: Update `validation.schema.ts` with ADMIN_EMAILS
- [X] **3.6.4**: Update `.env` and `.env.example` with ADMIN_EMAILS

---

## HEAD TASK 4: Authentication Module ✅

### Sub-task 4.1: Create Auth DTOs & Validation (7/7) ✅

- [X] **4.1.1**: Create `apps/api/src/auth/dto/signup.dto.ts`
  - Fields: email (@IsEmail), password (@MinLength(8), @MaxLength(72), @Matches for complexity), fullName, phoneNumber (optional)
- [X] **4.1.2**: Create `apps/api/src/auth/dto/signin.dto.ts`
  - Fields: email, password
- [X] **4.1.3**: Create `apps/api/src/auth/dto/oauth-callback.dto.ts`
  - Fields: accessToken, refreshToken
- [X] **4.1.4**: Create `apps/api/src/auth/dto/refresh-token.dto.ts`
  - Fields: refreshToken
- [X] **4.1.5**: Create `apps/api/src/auth/dto/password-reset.dto.ts`
  - PasswordResetRequestDto (email), PasswordResetConfirmDto (accessToken, newPassword)
- [X] **4.1.6**: Create `apps/api/src/auth/dto/auth-response.dto.ts`
  - AuthResponseDto (user, accessToken, refreshToken), AuthMessageDto (message)
- [X] **4.1.7**: Create `apps/api/src/auth/dto/index.ts` (barrel export)

### Sub-task 4.2: Create Auth Service (1/1) ✅

- [X] **4.2.1**: Create `apps/api/src/auth/auth.service.ts`
  - `signup(dto)` - Email/password signup (clients only, blocks admin emails)
  - `signin(dto)` - Email/password signin
  - `processOAuthCallback(dto)` - Handle OAuth tokens, create/fetch profile, detect user type
  - `refreshToken(dto)` - Refresh access token via Supabase
  - `requestPasswordReset(dto)` - Send reset email (generic message prevents enumeration)
  - `confirmPasswordReset(dto)` - Reset password using admin.updateUserById
  - `signout(userId)` - Log event, return success
  - `getCurrentUser(userId, email)` - Fetch user profile

### Sub-task 4.3: Create Auth Controller (1/1) ✅

- [X] **4.3.1**: Create `apps/api/src/auth/auth.controller.ts`
  - POST /api/auth/signup, signin, oauth/callback, refresh, password-reset/request, password-reset/confirm (all @Public)
  - GET /api/auth/me, POST /api/auth/signout (protected)

### Sub-task 4.4: Create Auth Module & Integration (2/2) ✅

- [X] **4.4.1**: Create `apps/api/src/auth/auth.module.ts`
- [X] **4.4.2**: Import AuthModule in app.module.ts, add global ValidationPipe in main.ts

### Sub-task 4.5: Frontend Auth Infrastructure (5/5) ✅

- [X] **4.5.1**: Install @supabase/supabase-js and @supabase/ssr
- [X] **4.5.2**: Create Supabase client configuration (browser, server, middleware)
- [X] **4.5.3**: Create Auth Context & Hooks (AuthProvider, useAuth, auth-actions)
- [X] **4.5.4**: Create Next.js middleware (session refresh, route protection, user type routing)
- [X] **4.5.5**: Wrap root layout with AuthProvider

### Sub-task 4.6: Frontend Auth Pages (6/6) ✅

- [X] **4.6.1**: Create Sign-In Page (tabbed Google OAuth + email/password)
- [X] **4.6.2**: Create Sign-Up Page (client registration)
- [X] **4.6.3**: Create OAuth Callback Handler (code exchange + backend POST + redirect)
- [X] **4.6.4**: Create Password Reset Pages (request + confirm)
- [X] **4.6.5**: Create Dashboard Layouts & Pages (admin + client with sidebar/header)
- [X] **4.6.6**: Update .env.example with Supabase configuration

### Sub-task 4.7: Testing (1/1) ✅

- [X] **4.7.1**: Create auth.service.spec.ts (12 unit tests, all passing)

### Sub-task 4.8: Bug Fixes (1/1) ✅

- [X] **4.8.1**: Fix getUserFromToken() in supabase.service.ts (wrong column name + missing columns)

---

## HEAD TASK 5: Users & Profiles Module

### Sub-task 5.1: Create Users Service

- [X] **5.1.1**: Create `apps/api/src/users/users.service.ts`
- [X] **5.1.2**: Implement `getUserProfile(userId)` method with RLS
- [X] **5.1.3**: Implement `updateUserProfile(userId, updateDto)` method
- [X] **5.1.4**: Implement `deleteUser(userId)` method (admin only)
- [X] **5.1.5**: Implement `getAllUsers(paginationDto)` method (staff only)

### Sub-task 5.2: Create Users Controller

- [X] **5.2.1**: Create `apps/api/src/users/users.controller.ts`
- [X] **5.2.2**: Create endpoint: `GET /api/users/profile` (current user)
- [X] **5.2.3**: Create endpoint: `PATCH /api/users/profile` (update own profile)
- [X] **5.2.4**: Create endpoint: `GET /api/users` (staff only, with pagination)
- [X] **5.2.5**: Apply @UseGuards(AuthGuard, RolesGuard) and @Roles() decorators

### Sub-task 5.3: Create Profile DTOs

> **Note:** DTOs are implemented as Zod schemas in `packages/shared/src/schemas/users.schemas.ts` with types in `packages/shared/src/types/users.types.ts`, instead of class-validator DTOs in `apps/api/src/users/dto/`.

- [X] **5.3.1**: Create `apps/api/src/users/dto/update-user-profile.dto.ts`
  - Optional fields: fullName, phoneNumber
- [X] **5.3.2**: Create `apps/api/src/users/dto/create-client-profile.dto.ts`
  - Fields: companyName, companyType, taxId, address, city, country
- [X] **5.3.3**: Create `apps/api/src/users/dto/update-client-profile.dto.ts`
  - All fields optional
- [X] **5.3.4**: Create `apps/api/src/users/dto/create-attorney-profile.dto.ts`
  - Fields: barNumber, specializations, education, experienceYears, hourlyRate
- [X] **5.3.5**: Create `apps/api/src/users/dto/update-attorney-profile.dto.ts`
  - All fields optional

### Sub-task 5.4: Create Users Module

- [X] **5.4.1**: Create `apps/api/src/users/users.module.ts`
  - Register UsersService, UsersController

### Sub-task 5.5: Frontend Users & Profiles (web)

- [X] **5.5.1**: Add users API client helpers in `apps/web/lib` (get profile, update profile, list users)
- [X] **5.5.2**: Create profile page for authenticated users (client + attorney + staff) under dashboards
- [X] **5.5.3**: Build profile edit form (full_name, phone_number, client/attorney fields)
- [X] **5.5.4**: Create admin/staff users list page with pagination/search in admin dashboard
- [X] **5.5.5**: Add loading, empty, and error states + toast feedback for profile updates
- [X] **5.5.6**: Update dashboard sidebar navigation to include Profile and Users links

---

## HEAD TASK 6: Clients, Subscriptions, Complaints & Service Registrations Module ✅

### Sub-task 6.1: Create Clients Service

- [X] **6.1.1**: Create `apps/api/src/clients/clients.service.ts`
- [X] **6.1.2**: Implement `createClient(createDto)` method
  - Creates user_profile + client_profile in transaction
- [X] **6.1.3**: Implement `getClients(paginationDto, filters)` method (staff only)
  - Support filtering by company_type, city, status
- [X] **6.1.4**: Implement `getClientById(clientId)` method with RLS
- [X] **6.1.5**: Implement `updateClient(clientId, updateDto)` method
- [X] **6.1.6**: Implement `deleteClient(clientId)` method (admin only)
- [X] **6.1.7**: Implement `getClientCases(clientId)` method
- [X] **6.1.8**: Implement `getClientDocuments(clientId)` method
- [X] **6.1.9**: Implement `getClientInvoices(clientId)` method

### Sub-task 6.2: Create Clients Controller

- [X] **6.2.1**: Create `apps/api/src/clients/clients.controller.ts`
- [X] **6.2.2**: Create endpoint: `GET /api/clients` (staff only)
- [X] **6.2.3**: Create endpoint: `POST /api/clients` (staff only)
- [X] **6.2.4**: Create endpoint: `GET /api/clients/:id`
- [X] **6.2.5**: Create endpoint: `PATCH /api/clients/:id`
- [X] **6.2.6**: Create endpoint: `DELETE /api/clients/:id` (admin only)
- [X] **6.2.7**: Create endpoint: `GET /api/clients/:id/cases`
- [X] **6.2.8**: Create endpoint: `GET /api/clients/:id/documents`
- [X] **6.2.9**: Create endpoint: `GET /api/clients/:id/invoices`

### Sub-task 6.3: Test RLS Enforcement

- [X] **6.3.1**: Test that clients can only see their own profile
- [X] **6.3.2**: Test that staff can see all client profiles
- [X] **6.3.3**: Test that unauthorized users get 403 errors

### Sub-task 6.4: Create Clients Module

- [X] **6.4.1**: Create `apps/api/src/clients/clients.module.ts`

### Sub-task 6.5: Subscriptions Database & Backend (Monthly Retainer - PKR 700/month)

**Context:** Civic advocacy subscription. Clients pay PKR 700/month to submit complaints against government organizations. AR&CO holds government bodies accountable.

- [X] **6.5.1**: Create `subscriptions` table via Supabase migration
  - Columns: id (uuid, PK), client_profile_id (uuid, FK to client_profiles, UNIQUE), plan_name (text, default 'civic_retainer'), monthly_amount (decimal, default 700), currency (varchar(3), default 'PKR'), status (enum: pending, on_trial, active, paused, past_due, unpaid, cancelled, expired), lemonsqueezy_subscription_id (text), lemonsqueezy_customer_id (text), lemonsqueezy_order_id (text), current_period_start (timestamptz), current_period_end (timestamptz), cancelled_at (timestamptz), ends_at (timestamptz), cancellation_reason (text), card_brand (text), card_last_four (varchar(4)), created_at (timestamptz), updated_at (timestamptz)
- [X] **6.5.2**: Enable RLS on subscriptions (clients read own, staff read all, staff update status)
- [X] **6.5.3**: Apply updated_at trigger
- [X] **6.5.4**: Create `apps/api/src/subscriptions/subscriptions.service.ts`
- [X] **6.5.5**: Implement `createSubscription(userId)` method
  - Calls LemonSqueezyService.createSubscriptionCheckout() for PKR 700/month recurring
  - Creates subscriptions record with status = 'pending'
  - Returns Lemon Squeezy checkout URL
- [X] **6.5.6**: Implement `getMySubscription(userId)` method
- [ ] **6.5.7**: Implement `handleSubscriptionCreated(webhookPayload)` method (webhook) — _deferred to HEAD TASK 10D_
  - Sets status = 'active', stores lemonsqueezy_subscription_id, sets billing cycle dates
- [ ] **6.5.8**: Implement `handleSubscriptionPaymentSuccess(webhookPayload)` method (webhook) — _deferred to HEAD TASK 10D_
  - Extends current_period_end to next renews_at
- [ ] **6.5.9**: Implement `handleSubscriptionCancelled(webhookPayload)` / `handleSubscriptionExpired(webhookPayload)` methods — _deferred to HEAD TASK 10D_
- [X] **6.5.10**: Implement `cancelSubscription(userId)` method
- [X] **6.5.11**: Implement `isSubscriptionActive(userId)` method (used by complaints guard)
- [X] **6.5.12**: Create `apps/api/src/subscriptions/subscriptions.controller.ts`
  - `POST /api/subscriptions` - Create subscription + get Lemon Squeezy checkout URL
  - `GET /api/subscriptions/me` - Get my subscription
  - `POST /api/subscriptions/cancel` - Cancel subscription
  - `GET /api/subscriptions` (staff only) - List all subscriptions
- [X] **6.5.13**: Create subscription DTOs and enums (subscription_status)
- [X] **6.5.14**: Create `apps/api/src/subscriptions/subscriptions.module.ts`
  - Import PaymentsModule for LemonSqueezyService, export SubscriptionsService

### Sub-task 6.6: Complaints Database & Backend (Civic Complaints)

**Context:** Subscribers submit complaints against government orgs (e.g., "CDA is not cleaning sector F8"). Complaints get reference numbers (CMP-YYYY-NNNN) and are tracked: submitted → under_review → escalated → resolved.

- [X] **6.6.1**: Create `complaints` table via Supabase migration
  - Columns: id (uuid, PK), complaint_number (text, unique, auto-gen: CMP-YYYY-NNNN), client_profile_id (uuid, FK), title (text), description (text), target_organization (text), location (text), category (text), evidence_urls (text[]), status (enum: submitted, under_review, escalated, resolved, closed), assigned_staff_id (uuid, FK, nullable), staff_notes (text), resolution_notes (text), resolved_at (timestamptz), created_at (timestamptz), updated_at (timestamptz)
- [X] **6.6.2**: Create `generate_complaint_number()` trigger (CMP-YYYY-NNNN)
- [X] **6.6.3**: Apply trigger + RLS (clients read/create own, staff read all + update status) + updated_at trigger
- [X] **6.6.4**: Create `apps/api/src/complaints/complaints.service.ts`
- [X] **6.6.5**: Implement `submitComplaint(userId, createDto)` method
  - Checks active subscription via SubscriptionsService.isSubscriptionActive()
  - Creates complaint record, auto-generates CMP-YYYY-NNNN
- [X] **6.6.6**: Implement `getMyComplaints(userId, paginationDto)` method
- [X] **6.6.7**: Implement `getComplaintById(complaintId, userId)` method
- [X] **6.6.8**: Implement `getAllComplaints(paginationDto, filters)` method (staff only)
  - Filter by status, target_organization, date range
- [X] **6.6.9**: Implement `updateComplaintStatus(complaintId, status, staffNotes)` method (staff only)
- [X] **6.6.10**: Implement `assignComplaint(complaintId, staffId)` method (staff only)
- [X] **6.6.11**: Create `apps/api/src/complaints/complaints.controller.ts`
  - `POST /api/complaints` - Submit complaint (requires active subscription)
  - `GET /api/complaints` - List complaints (client: own, staff: all)
  - `GET /api/complaints/:id` - Complaint detail
  - `PATCH /api/complaints/:id/status` (staff only) - Update status
  - `PATCH /api/complaints/:id/assign` (staff only) - Assign to staff
- [X] **6.6.12**: Create complaint DTOs (create, update-status) and enums (complaint_status, complaint_category)
- [X] **6.6.13**: Create `apps/api/src/complaints/complaints.module.ts`
  - Import SubscriptionsModule for active subscription check

### Sub-task 6.7: Service Registrations Database & Backend (Auto Account Creation)

**Context:** Each facilitation service has 1 generic form (name, contact, CNIC, docs upload). Payment + registration auto-creates a user account. No account needed to start the form. Account required only after payment completes.

- [X] **6.7.1**: Create `service_registrations` table via Supabase migration
  - Columns: id (uuid, PK), reference_number (text, unique, auto-gen: SRV-YYYY-NNNN), service_id (uuid, FK to services), full_name (text), email (text), phone_number (text), cnic (text), address (text), description_of_need (text), payment_status (enum: pending, paid, failed, refunded), lemonsqueezy_checkout_id (text), lemonsqueezy_order_id (text), status (enum: pending_payment, paid, in_progress, completed, cancelled), client_profile_id (uuid, FK to client_profiles, nullable - set after auto account creation), assigned_staff_id (uuid, FK, nullable), staff_notes (text), created_at (timestamptz), updated_at (timestamptz)
- [X] **6.7.2**: Add `registration_fee` column to existing `services` table (DECIMAL(10,2))
- [X] **6.7.3**: Create `generate_service_registration_reference()` trigger (SRV-YYYY-NNNN)
- [X] **6.7.4**: Apply trigger + RLS + updated_at trigger
  - Public can insert (guest submissions), public can read own by reference_number + email
  - Clients can read own registrations (after account creation), staff can read all + update
- [X] **6.7.5**: Add `service_registration_id` nullable FK column to `documents` table
- [X] **6.7.6**: Create `apps/api/src/service-registrations/service-registrations.service.ts`
- [X] **6.7.7**: Implement `createRegistration(createDto)` method (@Public)
  - Validates service exists and is active, creates record with status = 'pending_payment'
- [X] **6.7.8**: Implement `initiatePayment(registrationId)` method
  - Fetches service.registration_fee, calls LemonSqueezyService.createOneTimeCheckout()
- [ ] **6.7.9**: Implement `handlePaymentConfirmed(registrationId)` method (webhook) — _deferred to HEAD TASK 10F_
  - Updates payment_status = 'paid', status = 'paid'
  - Calls createUserAccount() to auto-create user
- [ ] **6.7.10**: Implement `createUserAccount(registration)` method — _deferred to HEAD TASK 10F_
  - Check if user exists by email → link to existing account if yes
  - If no: create Supabase auth user (auto-generated password) + user_profile (client) + client_profile
  - Link service_registration.client_profile_id
  - Send credentials email via SendGrid
- [X] **6.7.11**: Implement `uploadDocuments(registrationId, files)` method — _completed in HEAD TASK 9_
  - Uploads to Supabase Storage, creates documents records linked via service_registration_id
- [X] **6.7.12**: Implement `getRegistrationStatus(referenceNumber, email)` method (@Public)
- [X] **6.7.13**: Implement `getMyRegistrations(userId, paginationDto)` method
- [X] **6.7.14**: Implement `getAllRegistrations(paginationDto, filters)` method (staff only)
- [X] **6.7.15**: Implement `updateRegistrationStatus(registrationId, status, staffNotes)` method (staff only)
- [X] **6.7.16**: Create `apps/api/src/service-registrations/service-registrations.controller.ts`
  - `POST /api/service-registrations` (@Public) - Submit registration
  - `POST /api/service-registrations/:id/pay` (@Public) - Initiate payment
  - `POST /api/service-registrations/:id/documents` (@Public) - Upload docs
  - `GET /api/service-registrations/status?ref=SRV-2026-0001&email=x` (@Public) - Guest status
  - `GET /api/service-registrations` - List (client: own, staff: all)
  - `GET /api/service-registrations/:id` - Detail
  - `PATCH /api/service-registrations/:id/status` (staff only) - Update status
  - `GET /api/services` (@Public) - List available services with fees
- [X] **6.7.17**: Create service registration DTOs (create, response, update-status) and enums
- [X] **6.7.18**: Create `apps/api/src/service-registrations/service-registrations.module.ts`
  - Import PaymentsModule for LemonSqueezyService, AuthModule for account creation

### Sub-task 6.8: Frontend - Subscribe Page & Complaints Dashboard

- [X] **6.8.1**: Create `/subscribe` landing page
  - Explains civic retainer program (PKR 700/month), "Subscribe Now" button
  - If not logged in → redirect to signup, then back to /subscribe
  - If logged in → initiate Lemon Squeezy subscription checkout
- [X] **6.8.2**: Create subscription success/cancel return pages
- [X] **6.8.3**: Create `/client/complaints` page - List complaints with status badges
- [X] **6.8.4**: Create `/client/complaints/new` page - Complaint form (title, description, target org, location, category, evidence upload)
  - Gated: shows "Active subscription required" message if no subscription
- [X] **6.8.5**: Create `/client/complaints/:id` page - Complaint detail + status timeline
- [X] **6.8.6**: Create `/client/subscription` page - View subscription status, cancel button, payment history
- [X] **6.8.7**: Create `apps/web/lib/api/subscriptions.ts` and `apps/web/lib/api/complaints.ts` API client helpers

### Sub-task 6.9: Frontend - Service Registration Pages

- [X] **6.9.1**: Create `/services/[category]/[slug]` page - Service detail with overview, process, documents, FAQ tabs and "Register" CTA
  - Implemented at `app/(public)/services/[category]/[slug]/page.tsx` with layout + sub-pages
- [X] **6.9.2**: Create `/services/[category]/[slug]/form` multi-step form
  - Implemented at `app/(public)/services/[category]/[slug]/form/page.tsx`
  - Dynamic form fields per service category via `categoryDataMapper`
  - Country selector (countries-list), phone validation (react-phone-number-input), animated steps (framer-motion)
  - Dependencies added: `countries-list`, `react-phone-number-input`
- [ ] **6.9.3**: Create registration success page ("Account created - check email for credentials") — _deferred_
- [X] **6.9.4**: Create `/client/services` page - List my service registrations + status
- [X] **6.9.5**: Create `/client/services/:id` page - Registration detail + status timeline + docs
- [ ] **6.9.6**: Add "Register for Service" CTAs to practice area pages — _deferred_
- [X] **6.9.7**: Create `apps/web/lib/api/service-registrations.ts` API client helpers

### Sub-task 6.10: Frontend - Client Dashboard Enhancements

- [X] **6.10.1**: Update client dashboard stats to include: Active Subscription badge, Open Complaints count, Service Registrations in_progress count
- [X] **6.10.2**: Update client sidebar: add Complaints, My Services, Subscription, Payment History links
- [ ] **6.10.3**: Create `/client/payments` page - Payment history across all sources — _deferred to HEAD TASK 10_

---

## HEAD TASK 7: Cases Module ✅

### Sub-task 7.1: Create Cases Service

- [X] **7.1.1**: Create `apps/api/src/cases/cases.service.ts`
- [X] **7.1.2**: Implement `createCase(createDto)` method
  - Auto-generates case_number via DB trigger
- [X] **7.1.3**: Implement `getCases(paginationDto, filters, currentUser)` method
  - RLS filtering based on user role
- [X] **7.1.4**: Implement `getCaseById(caseId, currentUser)` method with RLS check
- [X] **7.1.5**: Implement `updateCase(caseId, updateDto)` method
- [X] **7.1.6**: Implement `deleteCase(caseId)` method (admin only)
- [X] **7.1.7**: Implement `assign(caseId, assignedToId)` method (uses `assigned_to_id` -> `user_profiles.id`)

### Sub-task 7.2: Create Case Activities Service

- [X] **7.2.1**: Implement `getCaseActivities(caseId)` method for timeline view
- [X] **7.2.2**: Implement `addCaseActivity(caseId, activityDto)` method
- [X] **7.2.3**: Implement auto-activity creation on case status change

### Sub-task 7.3: Create Cases Controller

- [X] **7.3.1**: Create `apps/api/src/cases/cases.controller.ts`
- [X] **7.3.2**: Create endpoint: `GET /api/cases`
- [X] **7.3.3**: Create endpoint: `POST /api/cases` (staff only)
- [X] **7.3.4**: Create endpoint: `GET /api/cases/:id`
- [X] **7.3.5**: Create endpoint: `PATCH /api/cases/:id`
- [X] **7.3.6**: Create endpoint: `DELETE /api/cases/:id` (admin only)
- [X] **7.3.7**: Create endpoint: `GET /api/cases/:id/activities`
- [X] **7.3.8**: Create endpoint: `POST /api/cases/:id/activities`
- [X] **7.3.9**: Create endpoint: `PATCH /api/cases/:id/assign` (changed from POST to PATCH for consistency)

### Sub-task 7.4: Create DTOs

> **Note:** DTOs are implemented as Zod schemas in `packages/shared/src/schemas/cases.schemas.ts` with types in `packages/shared/src/types/cases.types.ts`, using shared `AssignToSchema` from `common.schemas.ts`.

- [X] **7.4.1**: Create `packages/shared/src/schemas/cases.schemas.ts` (Zod schemas)
- [X] **7.4.2**: Create `packages/shared/src/types/cases.types.ts` (inferred types)
- [X] **7.4.3**: Create case activity schemas and types
- [X] **7.4.4**: Add CaseStatus, CasePriority, CaseActivityType enums to `packages/shared/src/enums.ts`

### Sub-task 7.5: Create Cases Module

- [X] **7.5.1**: Create `apps/api/src/cases/cases.module.ts`

### Sub-task 7.6: Shared Package (Cases Schemas, Types & Enums)

- [X] **7.6.1**: Add `CaseStatus`, `CasePriority`, `CaseActivityType` enums to `packages/shared/src/enums.ts`
- [X] **7.6.2**: Create `packages/shared/src/schemas/cases.schemas.ts`
  - CreateCaseSchema, UpdateCaseSchema, CaseFiltersSchema, CreateCaseActivitySchema
  - CaseResponseSchema, CaseActivityResponseSchema, PaginatedCasesResponseSchema, PaginatedCaseActivitiesResponseSchema
  - Assignment uses shared `AssignToSchema` from `common.schemas.ts` (replaces `AssignAttorneySchema`)
- [X] **7.6.3**: Create `packages/shared/src/types/cases.types.ts`
  - CreateCaseData, UpdateCaseData, CaseFilters, CreateCaseActivityData
  - CaseResponse, CaseActivityResponse, PaginatedCasesResponse, PaginatedCaseActivitiesResponse
  - Assignment uses shared `AssignToData` from `common.types.ts` (replaces `AssignAttorneyData`)
- [X] **7.6.4**: Update barrel exports (`index.ts` files for enums, schemas, types)

### Sub-task 7.7: Frontend - Cases API Client

- [X] **7.7.1**: Create `apps/web/lib/api/cases.ts` API client helpers
  - getCases, getCaseById, createCase, updateCase, deleteCase, assignCase, getCaseActivities, addCaseActivity

### Sub-task 7.8: Frontend - Admin Cases Pages

- [X] **7.8.1**: Create `/admin/cases` page - Case list with filters (status, priority, search), pagination, "New Case" button
- [X] **7.8.2**: Create `/admin/cases/new` page - Create case form (client dropdown, practice area, title, description, priority, case type, filing date)
- [X] **7.8.3**: Create `/admin/cases/:id` page - Case detail + activities timeline + status update + assign to staff/attorney + add activity form

### Sub-task 7.9: Frontend - Client Cases Pages

- [X] **7.9.1**: Create `/client/cases` page - Client's cases list with status filter, pagination
- [X] **7.9.2**: Create `/client/cases/:id` page - Case detail + activities timeline (read-only)

### Sub-task 7.10: Frontend - Navigation & Dashboard Updates

- [X] **7.10.1**: Update admin sidebar: add Cases link (Briefcase icon) after Clients
- [X] **7.10.2**: Update client sidebar: add My Cases link (Briefcase icon)
- [X] **7.10.3**: Make dashboard stats cards clickable (cases count links to cases list)

---

## HEAD TASK 8: Consultation Booking Module (Cal.com Integration) ✅

> **Architecture Decision:** "Consultation" and "Appointment" are the same concept. Cal.com is the sole scheduling backend — no internal appointments module. The `appointments` and `availability_slots` tables should be dropped. See `docs/plans/2026-02-28-calcom-consultation-unification-design.md`.

### ~~Sub-task 8.1-8.5: Internal Appointments System~~ — REMOVED

> Replaced by Cal.com. Cal.com handles scheduling, availability, double-booking prevention, and email notifications. No internal appointments service, controller, or DTOs needed.

### Sub-task 8.6: Consultation Bookings Database ✅

**Context:** Guest consultation booking flow. No user account created. Client fills intake form → pays PKR 50,000 via Safepay → Cal.com embedded booking with Mr. Shoaib Razzaq (single event type). Cal.com only accessible after payment confirmed. Logged-in clients can also book from their dashboard with pre-filled info.

- [X] **8.6.1**: Create `consultation_bookings` table via Supabase migration
  - Columns: id (uuid, PK), reference_number (text, unique, auto-gen: CON-YYYY-NNNN), full_name (text), email (text), phone_number (text), practice_area (text), urgency (enum: low, medium, high, urgent), issue_summary (text), relevant_dates (text), opposing_party (text), additional_notes (text), consultation_fee (decimal, default 50000), payment_status (enum: pending, paid, failed, refunded), safepay_tracker_token (text), safepay_transaction_ref (text), calcom_booking_uid (text), calcom_booking_id (text), booking_date (date), booking_time (time), meeting_link (text), booking_status (enum: pending_payment, payment_confirmed, booked, completed, cancelled, no_show), created_at (timestamptz), updated_at (timestamptz)
- [X] **8.6.2**: Create `generate_consultation_reference()` trigger (CON-YYYY-NNNN)
- [X] **8.6.3**: Apply trigger + RLS + updated_at trigger
  - Public can insert (guest submissions), public can read own by reference_number + email
  - Staff can read all bookings

### Sub-task 8.7: Consultation Bookings Backend ✅

- [X] **8.7.1**: Create `apps/api/src/consultations/consultations.service.ts`
- [X] **8.7.2**: Implement `createBooking(createDto)` method
  - Validates intake data, creates consultation_bookings record, returns reference_number
- [X] **8.7.3**: Implement `initiatePayment(bookingId)` method
  - Calls SafepayService.createPaymentSession() + generateCheckoutUrl() for PKR 50,000
  - Stores safepay_tracker_token on booking record
- [X] **8.7.4**: Implement `getBookingStatus(referenceNumber, email)` method (@Public)
  - Guest status polling, verified by email match
- [X] **8.7.5**: Implement `confirmPayment(bookingId, trackerToken)` method
  - Verifies payment via Safepay Reporter API, updates payment_status = 'paid', booking_status = 'payment_confirmed'
- [X] **8.7.6**: Implement `handleCalcomWebhook(payload)` method
  - Receives BOOKING_CREATED events from Cal.com
  - Matches by metadata.referenceNumber or fallback by email + payment_confirmed status
  - Stores calcom_booking_uid, calcom_booking_id, booking_date, booking_time, meeting_link
  - Updates booking_status = 'booked'
  - Idempotent: skips if already linked
- [X] **8.7.7**: Implement `getBookings(paginationDto, filters)` method (staff only)
- [X] **8.7.8**: Implement `cancelBooking(bookingId)` method (staff only)

### Sub-task 8.8: Consultation Bookings Controller ✅

- [X] **8.8.1**: Create `apps/api/src/consultations/consultations.controller.ts`
- [X] **8.8.2**: Create endpoint: `POST /api/consultations` (@Public) - Create booking with intake data
- [X] **8.8.3**: Create endpoint: `POST /api/consultations/:id/pay` (@Public) - Initiate Safepay checkout
- [X] **8.8.4**: Create endpoint: `GET /api/consultations/status?refNum=X&email=Y` (@Public) - Guest status
- [X] **8.8.5**: Create endpoint: `POST /api/consultations/webhook/calcom` (@Public) - Cal.com webhook
- [X] **8.8.6**: Create endpoint: `GET /api/consultations` (staff only) - List all bookings
- [X] **8.8.7**: Create endpoint: `GET /api/consultations/:id` (staff only) - Booking detail
- [X] **8.8.8**: Create endpoint: `PATCH /api/consultations/:id/cancel` (staff only) - Cancel booking
- [X] **8.8.9**: Create endpoint: `POST /api/consultations/:id/confirm-payment` (@Public) - Verify Safepay payment

### Sub-task 8.9: Consultation Schemas, Types & Module ✅

- [X] **8.9.1**: Create `packages/shared/src/schemas/consultations.schemas.ts` (Zod schemas)
  - CreateConsultationSchema, ConfirmConsultationPaymentSchema, ConsultationStatusCheckSchema
  - ConsultationResponseSchema, ConsultationStatusResponseSchema, PaginatedConsultationsResponseSchema
  - ConsultationFiltersSchema, ConsultationPaymentInitResponseSchema
- [X] **8.9.2**: Create `packages/shared/src/types/consultations.types.ts` (inferred types)
- [X] **8.9.3**: Add enums: ConsultationBookingStatus, ConsultationUrgency, ConsultationPaymentStatus
- [X] **8.9.4**: Create `apps/api/src/consultations/consultations.types.ts` (CalcomWebhookPayload, ConsultationRow interfaces)
- [X] **8.9.5**: Create `apps/api/src/consultations/consultations.module.ts`
  - Import PaymentsModule for SafepayService

### Sub-task 8.10: Frontend - Consultation Booking Overlay ✅

- [X] **8.10.1**: Install Cal.com embed SDK (`@calcom/embed-react`)
- [X] **8.10.2**: Create consultation overlay component (modal with 4-step flow)
- [X] **8.10.3**: Implement Step 1: Personal Info (full name, email, phone) with validation
- [X] **8.10.4**: Implement Step 2: Case Details (practice area, urgency, issue summary, optional fields)
- [X] **8.10.5**: Implement Step 3: Safepay Payment (popup checkout, postMessage callback, payment verification)
- [X] **8.10.6**: Implement Step 4: Cal.com Embedded Booking (only renders after payment confirmed)
  - Single event type: "Consultation with Mr. Shoaib Razzaq" (no attorney routing)
  - Pre-fills guest name, email, reference number
  - Subscribes to `bookingSuccessful` event
- [X] **8.10.7**: Implement success confirmation screen
- [X] **8.10.8**: Create `apps/web/lib/api/consultations.ts` API client helpers
- [X] **8.10.9**: Create ConsultationContext + useConsultationOverlay hook for global access
- [X] **8.10.10**: Create payment callback page at `/consultation/payment-callback`

### Sub-task 8.11: Frontend - Dashboard Integration (remaining work)

- [X] **8.11.1**: Create `ConsultationGuestsTable` admin component (filters, expandable details, pagination)
- [X] **8.11.2**: Create `/admin/consultations/page.tsx` rendering ConsultationGuestsTable
- [X] **8.11.3**: Add "Consultations" link to ADMIN_NAV in sidebar
- [X] **8.11.4**: Create `/client/consultations/page.tsx` with:
  - "Book a Consultation" button that opens overlay (pre-filled with client profile data)
  - "My Consultations" list showing bookings matched by client email
- [X] **8.11.5**: Add "Consultations" link to CLIENT_NAV in sidebar
- [X] **8.11.6**: Update consultation overlay to accept optional `prefillData` prop for logged-in clients
- [X] **8.11.7**: Add backend endpoint `GET /api/consultations/my` (authenticated, returns consultations by user email)

### Sub-task 8.12: Database Cleanup

- [X] **8.12.1**: Drop `appointments` table (replaced by Cal.com)
- [X] **8.12.2**: Drop `availability_slots` table (replaced by Cal.com)
- [X] **8.12.3**: Drop related RLS policies, triggers, and enum types

---

## HEAD TASK 9: Documents Module

### Sub-task 9.1: Create Storage Service

- [X] **9.1.1**: Create `apps/api/src/storage/storage.service.ts`
- [X] **9.1.2**: Implement `uploadToStorage(file, bucket, path)` method
- [X] **9.1.3**: Implement `downloadFromStorage(bucket, path)` method
- [X] **9.1.4**: Implement `deleteFromStorage(bucket, path)` method
- [X] **9.1.5**: Implement `getPublicUrl(bucket, path)` method

### Sub-task 9.2: Create Documents Service

- [X] **9.2.1**: Create `apps/api/src/documents/documents.service.ts`
- [X] **9.2.2**: Implement `uploadDocument(file, metadata, currentUser)` method
- [X] **9.2.3**: Implement `getDocuments(paginationDto, filters, currentUser)` method
- [X] **9.2.4**: Implement `getDocumentById(documentId, currentUser)` method
- [X] **9.2.5**: Implement `updateDocument(documentId, updateDto)` method
- [X] **9.2.6**: Implement `deleteDocument(documentId, currentUser)` method
- [X] **9.2.7**: Implement `downloadDocument(documentId, currentUser)` method

### Sub-task 9.3: Create Documents Controller

- [X] **9.3.1**: Create `apps/api/src/documents/documents.controller.ts`
- [X] **9.3.2**: Create endpoint: `POST /api/documents/upload`
- [X] **9.3.3**: Create endpoint: `GET /api/documents`
- [X] **9.3.4**: Create endpoint: `GET /api/documents/:id`
- [X] **9.3.5**: Create endpoint: `PATCH /api/documents/:id`
- [X] **9.3.6**: Create endpoint: `GET /api/documents/:id/download`
- [X] **9.3.7**: Create endpoint: `DELETE /api/documents/:id`

### Sub-task 9.4: Create DTOs

- [X] **9.4.1**: Create `apps/api/src/documents/dto/upload-document.dto.ts`
- [X] **9.4.2**: Create `apps/api/src/documents/dto/update-document.dto.ts`
- [X] **9.4.3**: Create enum for document_type

### Sub-task 9.5: Create Documents Module

- [X] **9.5.1**: Create `apps/api/src/documents/documents.module.ts`

---

## HEAD TASK 10A: Safepay Removal & Lemon Squeezy Preparation

> **Design Doc:** `docs/plans/2026-03-01-safepay-removal-lemonsqueezy-prep-design.md`
> **Prerequisite for:** HEAD TASKs 10B-10H

**Goal:** Remove all Safepay code, migrate DB columns to `lemonsqueezy_*`, create stub LemonSqueezyService, and add "Available Soon" badges on frontend payment CTAs.

### Sub-task 10A.1: Database Migration (Safepay → Lemon Squeezy columns)

Single atomic Supabase migration:

- [ ] **10A.1.1**: Rename `consultation_bookings` columns:
  - `safepay_tracker_token` → `lemonsqueezy_checkout_id`
  - `safepay_transaction_ref` → `lemonsqueezy_order_id`
- [ ] **10A.1.2**: Rename `service_registrations` columns:
  - `safepay_tracker_id` → `lemonsqueezy_checkout_id`
  - `safepay_transaction_id` → `lemonsqueezy_order_id`
- [ ] **10A.1.3**: Rename `payments` columns:
  - `safepay_transaction_id` → `lemonsqueezy_order_id`
  - `safepay_tracker_id` → `lemonsqueezy_checkout_id`
- [ ] **10A.1.4**: Rename `user_subscriptions` columns:
  - `safepay_subscription_id` → `lemonsqueezy_subscription_id`
  - `safepay_customer_id` → `lemonsqueezy_customer_id`
  - Add: `lemonsqueezy_order_id` (text), `card_brand` (text), `card_last_four` (varchar(4)), `ends_at` (timestamptz)
- [ ] **10A.1.5**: Update `subscription_plans`:
  - Drop `safepay_plan_token` column (Lemon Squeezy uses env-based variant IDs)
- [ ] **10A.1.6**: Rename `subscription_events`:
  - `safepay_event_data` → `webhook_event_data`

### Sub-task 10A.2: Backend — Remove Safepay Services

- [ ] **10A.2.1**: Delete `apps/api/src/payments/safepay.service.ts`
- [ ] **10A.2.2**: Delete `apps/api/src/payments/safepay-subscription.service.ts`
- [ ] **10A.2.3**: Create stub `apps/api/src/payments/lemonsqueezy.service.ts`
  - Method signatures: `createOneTimeCheckout()`, `createSubscriptionCheckout()`, `verifyWebhookSignature()`, `getSubscription()`, `cancelSubscription()`, `resumeSubscription()`, `getOrder()`
  - All throw `NotImplementedException('Lemon Squeezy integration not yet configured')`
- [ ] **10A.2.4**: Update `apps/api/src/payments/payments.module.ts`
  - Export `LemonSqueezyService` instead of `SafepayService`/`SafepaySubscriptionService`

### Sub-task 10A.3: Backend — Update Configuration

- [ ] **10A.3.1**: Replace `SafepayConfig` with `LemonSqueezyConfig` in `apps/api/src/config/configuration.ts`
  - Fields: `apiKey`, `storeId`, `webhookSecret`, `subscriptionVariantId`, `consultationVariantId`, `serviceVariantId`, `frontendUrl`
- [ ] **10A.3.2**: Update `apps/api/src/config/validation.schema.ts`
  - Add optional validation for `LEMONSQUEEZY_*` env vars (optional at this stage since stubs)
- [ ] **10A.3.3**: Update `apps/api/.env` and `.env.example`
  - Remove `SAFEPAY_*` vars, add `LEMONSQUEEZY_*` placeholder vars

### Sub-task 10A.4: Backend — Update Consuming Services

- [ ] **10A.4.1**: Update `consultations/consultations.service.ts`
  - Replace `SafepayService` injection with `LemonSqueezyService`
  - Update `initiatePayment()` to call `lemonsqueezyService.createOneTimeCheckout()` (stub)
  - Remove `confirmPayment()` method (Lemon Squeezy uses webhook-based confirmation)
  - Update column mappings: `safepay_tracker_token` → `lemonsqueezy_checkout_id`, `safepay_transaction_ref` → `lemonsqueezy_order_id`
- [ ] **10A.4.2**: Update `consultations/consultations.types.ts`
  - Rename row interface fields to match new column names
  - Update `mapConsultationRow()` mapper function
- [ ] **10A.4.3**: Update `consultations/consultations.controller.ts`
  - Remove `POST /api/consultations/:id/confirm-payment` endpoint (replaced by webhook)
- [ ] **10A.4.4**: Update `subscriptions/subscriptions.service.ts`
  - Replace `SafepaySubscriptionService` injection with `LemonSqueezyService`
  - Update `createSubscription()` to call `lemonsqueezyService.createSubscriptionCheckout()` (stub)
  - Update column mappings for renamed columns
  - Keep webhook handler method signatures (implementations deferred to 10D)
- [ ] **10A.4.5**: Update `subscriptions/subscriptions.types.ts`
  - Rename row interface fields, update mapper
- [ ] **10A.4.6**: Update `service-registrations/service-registrations.service.ts`
  - Update `initiatePayment()` to call `lemonsqueezyService.createOneTimeCheckout()` (stub)
  - Update column mappings for renamed columns

### Sub-task 10A.5: Shared Package — Update Schemas & Types

- [ ] **10A.5.1**: Update `packages/shared/src/schemas/consultations.schemas.ts`
  - `safepayTrackerToken` → `lemonsqueezyCheckoutId`
  - `safepayTransactionRef` → `lemonsqueezyOrderId`
  - Update `ConsultationPaymentInitResponseSchema` for Lemon Squeezy format (returns `checkoutUrl` only)
- [ ] **10A.5.2**: Update `packages/shared/src/schemas/subscriptions.schemas.ts`
  - Add: `lemonsqueezySubscriptionId`, `lemonsqueezyCustomerId`, `lemonsqueezyOrderId`, `cardBrand`, `cardLastFour`, `endsAt`
  - Remove any Safepay-specific field names
- [ ] **10A.5.3**: Update `packages/shared/src/schemas/service-registrations.schemas.ts`
  - Add: `lemonsqueezyCheckoutId`, `lemonsqueezyOrderId`
- [ ] **10A.5.4**: Rebuild shared package types (auto-inferred from Zod)
  - Update JSDoc comments referencing "Safepay" → "Lemon Squeezy"
  - Verify barrel exports in `index.ts`

### Sub-task 10A.6: Frontend — "Available Soon" Badges

- [ ] **10A.6.1**: Update `/subscribe` page (`app/(public)/subscribe/page.tsx`)
  - Replace "Subscribe Now" button with disabled button + "Available Soon" badge
  - Keep plan information visible (pricing, features)
  - Remove Safepay popup logic
- [ ] **10A.6.2**: Update consultation overlay payment step (`components/consultation/ConsultationPaymentStep.tsx`)
  - Replace Safepay popup with "Payment integration coming soon" message
  - Add "Skip to scheduling" button to proceed to Cal.com step directly
  - Keep fee summary card visible
- [ ] **10A.6.3**: Update service registration payment flow
  - Disable "Pay Now" / "Initiate Payment" buttons with "Available Soon" badge
  - Keep form submission functional (registration created, payment deferred)
- [ ] **10A.6.4**: Update client subscription page (`app/client/subscription/page.tsx`)
  - Hide payment-related actions, show "Payment integration coming soon" notice
  - Keep subscription status display functional
- [ ] **10A.6.5**: Update `usePaymentPopup.ts` hook
  - Replace `safepay-*` postMessage types with `lemonsqueezy-*` types
  - Or mark as deprecated with TODO comment
- [ ] **10A.6.6**: Update payment callback pages
  - `app/payment-callback/page.tsx` — update postMessage types
  - `app/consultation/payment-callback/page.tsx` — update postMessage types
- [ ] **10A.6.7**: Update API client helpers
  - `lib/api/subscriptions.ts` — remove `syncPlanToSafepay`, update response types
  - `lib/api/consultations.ts` — remove `confirmPayment`, update payment init response type
  - `lib/api/service-registrations.ts` — update payment response type

### Sub-task 10A.7: Verification

- [ ] **10A.7.1**: Run `pnpm tsc --noEmit` in all packages — zero errors
- [ ] **10A.7.2**: Run `pnpm --filter api build` — successful build
- [ ] **10A.7.3**: Run `pnpm --filter web build` — successful build
- [ ] **10A.7.4**: Grep entire codebase for "safepay" (case-insensitive) — zero results except docs/
- [ ] **10A.7.5**: Verify backend starts without errors (`pnpm --filter api start:dev`)
- [ ] **10A.7.6**: Run Supabase security advisors — no new warnings

---

## HEAD TASK 10B: Lemon Squeezy Core Service

> **Prerequisite:** HEAD TASK 10A complete
> **Docs:** `docs/lemonsqueezy/sdk-guide.md`, `docs/lemonsqueezy/arco-integration-plan.md`

**Goal:** Implement the real `LemonSqueezyService` with SDK setup, checkout creation, webhook verification, and subscription management methods.

### Sub-task 10B.1: SDK Installation & Setup

- [ ] **10B.1.1**: Install SDK: `pnpm add @lemonsqueezy/lemonsqueezy.js --filter api`
- [ ] **10B.1.2**: Update `LemonSqueezyService.onModuleInit()`
  - Call `lemonSqueezySetup({ apiKey })` from SDK
  - Load config: `storeId`, `subscriptionVariantId`, `consultationVariantId`, `serviceVariantId`
  - Log successful initialization

### Sub-task 10B.2: Checkout Methods

- [ ] **10B.2.1**: Implement `createOneTimeCheckout(params)` method
  - params: `{ variantId, customPrice?, email, name, customData, redirectUrl }`
  - customData includes `payment_type` and `reference_id`
  - Calls `createCheckout(storeId, variantId, { ... })` from SDK
  - Returns `{ checkoutUrl: string }`
- [ ] **10B.2.2**: Implement `createSubscriptionCheckout(params)` method
  - params: `{ email, name, customData, redirectUrl }`
  - Uses `subscriptionVariantId` from config
  - Returns `{ checkoutUrl: string }`

### Sub-task 10B.3: Webhook Signature Verification

- [ ] **10B.3.1**: Implement `verifyWebhookSignature(rawBody, signature)` method
  - HMAC-SHA256 of raw body string
  - Compare against `X-Signature` header
  - Throws `UnauthorizedException` on mismatch

### Sub-task 10B.4: Subscription & Order Management

- [ ] **10B.4.1**: Implement `getSubscription(subscriptionId)` method
- [ ] **10B.4.2**: Implement `cancelSubscription(subscriptionId)` method
- [ ] **10B.4.3**: Implement `resumeSubscription(subscriptionId)` method
- [ ] **10B.4.4**: Implement `getOrder(orderId)` method

### Sub-task 10B.5: Environment & Module Updates

- [ ] **10B.5.1**: Update `configuration.ts` — make Lemon Squeezy env vars required (not optional)
- [ ] **10B.5.2**: Update `validation.schema.ts` — require `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET`
- [ ] **10B.5.3**: Update `payments.module.ts` — ensure `LemonSqueezyService` is properly exported

---

## HEAD TASK 10C: Central Webhook Controller

> **Prerequisite:** HEAD TASK 10B complete
> **Docs:** `docs/lemonsqueezy/webhooks.md`

**Goal:** Single webhook endpoint that routes Lemon Squeezy events to the correct service handler.

### Sub-task 10C.1: Webhook Controller

- [ ] **10C.1.1**: Verify `rawBody: true` is set in `main.ts` (already done)
- [ ] **10C.1.2**: Create `apps/api/src/payments/webhook.controller.ts`
  - `POST /api/webhooks/lemonsqueezy` (@Public)
  - Extract raw body and `X-Signature` header
  - Call `LemonSqueezyService.verifyWebhookSignature()`
  - Parse payload JSON
- [ ] **10C.1.3**: Implement event routing by `meta.event_name`:
  - `order_created` → route by `meta.custom_data.payment_type`:
    - `consultation` → `ConsultationsService.handlePaymentConfirmed(payload)`
    - `service` → `ServiceRegistrationsService.handlePaymentConfirmed(payload)`
  - `order_refunded` → route by `payment_type` to respective refund handler
  - `subscription_created` → `SubscriptionsService.handleSubscriptionCreated(payload)`
  - `subscription_updated` → `SubscriptionsService.handleSubscriptionUpdated(payload)`
  - `subscription_cancelled` → `SubscriptionsService.handleSubscriptionCancelled(payload)`
  - `subscription_expired` → `SubscriptionsService.handleSubscriptionExpired(payload)`
  - `subscription_payment_success` → `SubscriptionsService.handlePaymentSuccess(payload)`
  - `subscription_payment_failed` → `SubscriptionsService.handlePaymentFailed(payload)`
  - `subscription_payment_recovered` → `SubscriptionsService.handlePaymentRecovered(payload)`
- [ ] **10C.1.4**: Return `{ received: true }` with 200 immediately

### Sub-task 10C.2: Idempotency & Logging

- [ ] **10C.2.1**: Create `webhook_events` table (or reuse `subscription_events`) for processed event tracking
  - Columns: `id`, `event_id` (from Lemon Squeezy), `event_name`, `processed_at`, `payload` (jsonb)
- [ ] **10C.2.2**: Add idempotency check — skip if `event_id` already processed
- [ ] **10C.2.3**: Log all incoming webhooks (event name, payment type, reference ID)

### Sub-task 10C.3: Webhook Payload Types

- [ ] **10C.3.1**: Create `apps/api/src/payments/types/webhook.types.ts`
  - `LemonSqueezyWebhookPayload` interface: `{ meta: { event_name, custom_data }, data: { type, id, attributes } }`
  - `LemonSqueezyOrderAttributes` interface
  - `LemonSqueezySubscriptionAttributes` interface
- [ ] **10C.3.2**: Create shared enums: `LemonSqueezyEventName`, `PaymentType`

---

## HEAD TASK 10D: Subscription Payment Integration

> **Prerequisite:** HEAD TASK 10C complete
> **Implements deferred:** 6.5.7, 6.5.8, 6.5.9

**Goal:** Wire up subscription checkout and webhook handlers so subscriptions activate, renew, and cancel via Lemon Squeezy.

### Sub-task 10D.1: Subscription Checkout Flow

- [ ] **10D.1.1**: Update `SubscriptionsService.createSubscription()` to call real `LemonSqueezyService.createSubscriptionCheckout()`
  - customData: `{ payment_type: 'subscription', user_id, client_profile_id }`
  - redirectUrl: `${frontendUrl}/subscribe/success`
  - Return checkout URL to frontend

### Sub-task 10D.2: Subscription Webhook Handlers

- [ ] **10D.2.1**: Implement `handleSubscriptionCreated(payload)`
  - Extract `subscription_id`, `customer_id`, `order_id` from payload
  - Match subscription by `custom_data.user_id` or `custom_data.client_profile_id`
  - Update: `status = 'active'`, store `lemonsqueezy_subscription_id`, `lemonsqueezy_customer_id`, `lemonsqueezy_order_id`
  - Set `current_period_start`, `current_period_end` from attributes
- [ ] **10D.2.2**: Implement `handleSubscriptionUpdated(payload)`
  - Sync status, billing dates, card info (`card_brand`, `card_last_four`)
- [ ] **10D.2.3**: Implement `handlePaymentSuccess(payload)`
  - Extend `current_period_end` to next `renews_at`
  - Log subscription event
- [ ] **10D.2.4**: Implement `handlePaymentFailed(payload)`
  - Update status to `past_due`
  - Log event with failure reason
- [ ] **10D.2.5**: Implement `handlePaymentRecovered(payload)`
  - Reset status to `active`
  - Update billing period
- [ ] **10D.2.6**: Implement `handleSubscriptionCancelled(payload)`
  - Set `cancelled_at`, `ends_at` (grace period until next renewal)
  - Status remains `active` until `ends_at`
- [ ] **10D.2.7**: Implement `handleSubscriptionExpired(payload)`
  - Set status to `expired`
  - Clear `ends_at`

### Sub-task 10D.3: Subscription Cancel/Resume via SDK

- [ ] **10D.3.1**: Update `cancelSubscription()` to call `LemonSqueezyService.cancelSubscription()`
- [ ] **10D.3.2**: Add `resumeSubscription()` method calling `LemonSqueezyService.resumeSubscription()`
- [ ] **10D.3.3**: Add `GET /api/subscriptions/me/status` endpoint for real-time status check via SDK

---

## HEAD TASK 10E: Consultation Payment Integration

> **Prerequisite:** HEAD TASK 10C complete

**Goal:** Wire up consultation payment checkout and webhook handler so consultations confirm payment via Lemon Squeezy order webhook.

### Sub-task 10E.1: Consultation Checkout Flow

- [ ] **10E.1.1**: Update `ConsultationsService.initiatePayment()` to call real `LemonSqueezyService.createOneTimeCheckout()`
  - variantId: `consultationVariantId` from config
  - customPrice: `5000000` (PKR 50,000 in cents)
  - customData: `{ payment_type: 'consultation', reference_id: booking.reference_number, booking_id: booking.id }`
  - redirectUrl: `${frontendUrl}/consultation/payment-callback`
  - Return checkout URL

### Sub-task 10E.2: Consultation Webhook Handler

- [ ] **10E.2.1**: Implement `handlePaymentConfirmed(payload)` on `ConsultationsService`
  - Extract `custom_data.booking_id` and `custom_data.reference_id` from webhook
  - Update `payment_status = 'paid'`, `booking_status = 'payment_confirmed'`
  - Store `lemonsqueezy_checkout_id` (from checkout), `lemonsqueezy_order_id` (from order)
- [ ] **10E.2.2**: Implement `handlePaymentRefunded(payload)` on `ConsultationsService`
  - Update `payment_status = 'refunded'`, `booking_status = 'cancelled'`

---

## HEAD TASK 10F: Service Registration Payment Integration

> **Prerequisite:** HEAD TASK 10C complete

**Goal:** Wire up service registration payment checkout, webhook handler, and auto-account creation on payment confirmation.

### Sub-task 10F.1: Service Registration Checkout Flow

- [ ] **10F.1.1**: Update `ServiceRegistrationsService.initiatePayment()` to call real `LemonSqueezyService.createOneTimeCheckout()`
  - variantId: `serviceVariantId` from config
  - customPrice: service `registration_fee` in cents (e.g., PKR 5,000 = 500000)
  - customData: `{ payment_type: 'service', reference_id: registration.reference_number, registration_id: registration.id }`
  - redirectUrl: `${frontendUrl}/payment/success?source=service`

### Sub-task 10F.2: Payment Webhook Handler

- [ ] **10F.2.1**: Implement `handlePaymentConfirmed(payload)` on `ServiceRegistrationsService`
  - Extract `custom_data.registration_id` from webhook
  - Update `payment_status = 'paid'`, `status = 'paid'`
  - Store `lemonsqueezy_checkout_id`, `lemonsqueezy_order_id`
  - Trigger `createUserAccount(registration)`

### Sub-task 10F.3: Auto-Account Creation

- [ ] **10F.3.1**: Implement `createUserAccount(registration)` method
  - Check if user exists by email → link to existing account if yes
  - If no: create Supabase auth user (auto-generated password) + `user_profile` (client) + `client_profile`
  - Link `service_registration.client_profile_id`
- [ ] **10F.3.2**: Send credentials email via SendGrid
  - Include: login URL, email, temporary password, service reference number

---

## HEAD TASK 10G: Invoices Module

> **Prerequisite:** HEAD TASK 10B complete (LemonSqueezyService available)

**Goal:** Create invoices service with CRUD, line items, and totals calculation.

### Sub-task 10G.1: Invoices Service

- [ ] **10G.1.1**: Create `apps/api/src/payments/invoices.service.ts`
- [ ] **10G.1.2**: Implement `createInvoice(createDto)` — auto-generates INV-YYYY-NNNN
- [ ] **10G.1.3**: Implement `getInvoices(paginationDto, filters, currentUser)` — RLS-aware
- [ ] **10G.1.4**: Implement `getInvoiceById(invoiceId, currentUser)`
- [ ] **10G.1.5**: Implement `updateInvoice(invoiceId, updateDto)`
- [ ] **10G.1.6**: Implement `addInvoiceItem(invoiceId, itemDto)`
- [ ] **10G.1.7**: Implement `calculateInvoiceTotals(invoiceId)` — sum items, apply tax/discount
- [ ] **10G.1.8**: Implement `sendInvoice(invoiceId)` — email via SendGrid

### Sub-task 10G.2: Invoices Controller

- [ ] **10G.2.1**: Create `apps/api/src/payments/invoices.controller.ts`
- [ ] **10G.2.2**: `GET /api/invoices` — list (client: own, staff: all)
- [ ] **10G.2.3**: `POST /api/invoices` — create (staff only)
- [ ] **10G.2.4**: `GET /api/invoices/:id` — detail
- [ ] **10G.2.5**: `PATCH /api/invoices/:id` — update (staff only)
- [ ] **10G.2.6**: `POST /api/invoices/:id/send` — send email (staff only)

### Sub-task 10G.3: Payments Controller (Aggregated History)

- [ ] **10G.3.1**: Create `apps/api/src/payments/payments.controller.ts`
- [ ] **10G.3.2**: `POST /api/payments/checkout` — generic checkout initiation (routes to LS by payment type)
- [ ] **10G.3.3**: `GET /api/payments/history` — aggregated payment history across consultations, subscriptions, services, invoices
- [ ] **10G.3.4**: `GET /api/payments/:id` — payment detail

### Sub-task 10G.4: Payment DTOs & Schemas

- [ ] **10G.4.1**: Create Zod schemas in `packages/shared/src/schemas/payments.schemas.ts`
  - `CreateInvoiceSchema`, `UpdateInvoiceSchema`, `InvoiceResponseSchema`, `InvoiceItemSchema`
  - `CreateCheckoutSchema`, `PaymentHistoryResponseSchema`
  - `LemonSqueezyWebhookPayloadSchema`
- [ ] **10G.4.2**: Create types in `packages/shared/src/types/payments.types.ts`
- [ ] **10G.4.3**: Add enums: `InvoiceStatus`, `PaymentMethod` to `packages/shared/src/enums.ts`

---

## HEAD TASK 10H: Frontend Payment Components

> **Prerequisite:** HEAD TASKs 10D, 10E, 10F complete (webhook handlers working)

**Goal:** Replace "Available Soon" badges with real Lemon Squeezy checkout flows. Create payment success/cancel pages and payment history.

### Sub-task 10H.1: Core Payment Infrastructure

- [ ] **10H.1.1**: Create `apps/web/lib/api/payments.ts` API client helpers
  - `createCheckoutSession(data)` → returns Lemon Squeezy checkout URL
  - `getPaymentHistory(params)` → aggregated payment list
  - `getInvoices(params)`, `getInvoiceById(id)`
- [ ] **10H.1.2**: Update `usePaymentPopup.ts` hook for Lemon Squeezy redirect flow
  - Lemon Squeezy uses hosted checkout (full redirect, not popup)
  - Consider: popup with Lemon Squeezy URL vs full-page redirect
- [ ] **10H.1.3**: Create `apps/web/components/payment/payment-status.tsx`
  - Loading/polling state while awaiting webhook confirmation
  - Success/failure display with next-step navigation

### Sub-task 10H.2: Payment Return Pages

- [ ] **10H.2.1**: Create `/payment/success` page
  - Parse URL params (`source=subscription|consultation|service`, `reference_id`)
  - Show success message with next-step navigation per source
  - Poll for webhook confirmation if payment status not yet confirmed
- [ ] **10H.2.2**: Create `/payment/cancel` page
  - Show cancellation message with "Try Again" link per source
- [ ] **10H.2.3**: Update `/consultation/payment-callback/page.tsx` for Lemon Squeezy redirect pattern

### Sub-task 10H.3: Subscription Payment UI

- [ ] **10H.3.1**: Update `/subscribe` page — replace "Available Soon" with real checkout
  - Call `createCheckoutSession({ paymentType: 'subscription' })`
  - Redirect to Lemon Squeezy hosted checkout
  - Return to `/payment/success?source=subscription`
- [ ] **10H.3.2**: Update client subscription page — restore cancel/resume actions
- [ ] **10H.3.3**: Update subscribe success/cancel return pages

### Sub-task 10H.4: Consultation Payment UI

- [ ] **10H.4.1**: Update `ConsultationPaymentStep.tsx` — replace "Available Soon" with real checkout
  - Call `initiatePayment(bookingId)` → get checkout URL
  - Redirect to Lemon Squeezy (or open in popup)
  - On return/callback → check payment status → advance to Cal.com step
- [ ] **10H.4.2**: Update `ConsultationOverlay.tsx` — restore payment step flow

### Sub-task 10H.5: Service Registration Payment UI

- [ ] **10H.5.1**: Restore `initiatePayment` button on service registration pages
  - Call `initiatePayment(registrationId)` → get checkout URL → redirect
- [ ] **10H.5.2**: Create registration success page (account created, check email for credentials)

### Sub-task 10H.6: Payment History Page

- [ ] **10H.6.1**: Create `/client/payments` page — unified payment history across all sources
  - Table with: date, description, amount, source (consultation/subscription/service/invoice), status
  - Filters by date range and source type

---

## HEAD TASK 10I: Lemon Squeezy Dashboard Setup (Manual)

> **Non-code task — done in Lemon Squeezy admin dashboard**

- [ ] **10I.1**: Create store in Lemon Squeezy dashboard
- [ ] **10I.2**: Create "Civic Retainer" subscription product (PKR 700/month)
- [ ] **10I.3**: Create "Legal Consultation" one-time product (PKR 50,000)
- [ ] **10I.4**: Create "Facilitation Service" one-time product (PKR 0 base, enable custom_price)
- [ ] **10I.5**: Configure webhook endpoint: `POST /api/webhooks/lemonsqueezy`
  - Select events: `order_created`, `order_refunded`, `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`, `subscription_payment_success`, `subscription_payment_failed`, `subscription_payment_recovered`
- [ ] **10I.6**: Store variant IDs and webhook secret in `.env`

---

## HEAD TASK 11: Content Module (Google Docs CMS + Auto SEO) ✅

> **Design doc:** `docs/plans/2026-03-01-content-module-design.md`
> **Content types:** Blog posts and Case Studies via `content_type` enum on single `blog_posts` table
> **Google Docs:** Service account integration — admin pastes Doc URL, backend fetches/converts/generates SEO
> **Templates:** Google Doc skeleton templates for consistent blog and case study structure

### Sub-task 11.1: Database Migration — Add Content Columns ✅

- [X] **11.1.1**: Add `content_type` (text NOT NULL DEFAULT 'blog'), `metadata` (jsonb DEFAULT '{}') columns to `blog_posts`
- [X] **11.1.2**: Add `meta_title` (text), `meta_description` (text), `read_time` (text) columns to `blog_posts`
- [X] **11.1.3**: Add `is_featured` (boolean DEFAULT false), `google_doc_id` (text), `google_doc_url` (text) columns to `blog_posts`

### Sub-task 11.2: Shared Package — Enums, Schemas & Types ✅

- [X] **11.2.1**: Add enums to `packages/shared/src/enums.ts`: `ContentType` (BLOG, CASE_STUDY), `PostStatus` (DRAFT, PUBLISHED, ARCHIVED)
- [X] **11.2.2**: Create `packages/shared/src/schemas/content.schemas.ts`
  - `CreateContentPostSchema` — googleDocUrl, contentType, categoryId, isFeatured, metadata
  - `UpdateContentPostSchema` — partial: title, slug, excerpt, metaTitle, metaDescription, status, featuredImage, metadata
  - `ContentPostResponseSchema`, `ContentFiltersSchema` (contentType, categoryId, status, search)
  - `CreateCategorySchema`, `UpdateCategorySchema`, `CategoryResponseSchema`
  - `CreateTestimonialSchema`, `TestimonialResponseSchema`
  - `CreateLegalNewsSchema`, `LegalNewsResponseSchema`
- [X] **11.2.3**: Create `packages/shared/src/types/content.types.ts`

### Sub-task 11.3: Backend — Google Docs Service ✅

- [X] **11.3.1**: Install `googleapis` package in `apps/api`
- [X] **11.3.2**: Add `GOOGLE_SERVICE_ACCOUNT_KEY` to config module + `.env.example`
- [X] **11.3.3**: Create `apps/api/src/content/google-docs.service.ts`
  - `extractDocId(url: string)` — parse Google Doc URL to document ID
  - `fetchDocument(docId: string)` — fetch via Docs API v1
  - `convertToHtml(document)` — convert Google Docs JSON to HTML (headings, paragraphs, lists, bold/italic, links, images, tables)
  - `extractCaseStudyMetadata(html)` — parse "Key Facts" and "Outcome" sections from case study template (supports inline + table format)

### Sub-task 11.4: Backend — SEO Service ✅

- [X] **11.4.1**: Create `apps/api/src/content/seo.service.ts`
  - `generateSlug(title: string)` — kebab-case, deduplicate with `-2`, `-3` suffix (uniqueness check against DB)
  - `generateMetaTitle(title: string)` — append " | AR&CO Law", truncate to 60 chars
  - `generateMetaDescription(excerpt: string)` — first 155 chars
  - `generateReadTime(content: string)` — `Math.ceil(wordCount / 200) + " min read"` (min 1 minute)
  - `generateSeoFields(title, content, excerpt?)` — returns all fields at once
  - `generateExcerpt(content: string)` — first paragraph, 300 chars max

### Sub-task 11.5: Backend — Blog Service (Posts + Case Studies) ✅

- [X] **11.5.1**: Create `apps/api/src/content/blog.service.ts` (626 lines)
- [X] **11.5.2**: Implement `createPost(createDto, currentUser)` — fetch Google Doc, generate SEO, save to DB
- [X] **11.5.3**: Implement `updatePost(postId, updateDto)` — update fields, re-generate SEO if title/content changed
- [X] **11.5.4**: Implement `syncFromGoogleDoc(postId)` — re-fetch doc, update content + SEO
- [X] **11.5.5**: Implement `deletePost(postId)` method
- [X] **11.5.6**: Implement `getPublishedPosts(paginationDto, filters)` — filter by contentType, categoryId, search
- [X] **11.5.7**: Implement `getPostBySlug(slug)` — single post with author + category joined
- [X] **11.5.8**: Implement `getAllPosts(paginationDto)` — all statuses for admin
- [X] **11.5.9**: Implement `incrementViewCount(postId)` method
- [X] **11.5.10**: Implement category CRUD: `createCategory`, `updateCategory`, `deleteCategory`, `getCategories`

### Sub-task 11.6: Backend — Testimonials Service ✅

- [X] **11.6.1**: Create `apps/api/src/content/testimonials.service.ts`
- [X] **11.6.2**: Implement `submitTestimonial(createDto, currentUser)` method
- [X] **11.6.3**: Implement `getApprovedTestimonials(paginationDto)` method
- [X] **11.6.4**: Implement `getAllTestimonials(paginationDto)` method (staff only)
- [X] **11.6.5**: Implement `approveTestimonial(testimonialId, approverId)` method (admin only)
- [X] **11.6.6**: Implement `rejectTestimonial(testimonialId)` method (admin only — deletes testimonial)

### Sub-task 11.7: Backend — Legal News Service ✅

- [X] **11.7.1**: Create `apps/api/src/content/legal-news.service.ts`
- [X] **11.7.2**: Implement `createNewsItem(createDto)` method
- [X] **11.7.3**: Implement `getLatestNews(limit)` method

### Sub-task 11.8: Backend — Content Controllers ✅

- [X] **11.8.1**: Create `apps/api/src/content/blog.controller.ts`
  - `GET /api/content/posts` (@Public) — published posts, filter by contentType/category
  - `GET /api/content/posts/:slug` (@Public) — single post by slug
  - `POST /api/content/posts/:id/view` (@Public) — increment view count
  - `GET /api/content/posts/admin` (staff) — all posts including drafts
  - `POST /api/content/posts` (staff) — create from Google Doc URL
  - `PATCH /api/content/posts/:id` (staff) — update post + SEO fields
  - `POST /api/content/posts/:id/sync` (staff) — re-sync from Google Doc
  - `DELETE /api/content/posts/:id` (admin) — delete post
  - `GET /api/content/categories` (@Public), `POST /api/content/categories` (staff)
  - `PATCH /api/content/categories/:id` (staff), `DELETE /api/content/categories/:id` (admin)
- [X] **11.8.2**: Create `apps/api/src/content/testimonials.controller.ts`
  - `GET /api/testimonials` (@Public — approved only), `POST /api/testimonials` (client)
  - `GET /api/testimonials/all` (staff), `POST /api/testimonials/:id/approve` (admin), `POST /api/testimonials/:id/reject` (admin)
- [X] **11.8.3**: Create `apps/api/src/content/legal-news.controller.ts`
  - `GET /api/legal-news` (@Public), `POST /api/legal-news` (staff)

### Sub-task 11.9: Backend — Content Module ✅

- [X] **11.9.1**: Create `apps/api/src/content/content.module.ts`
  - Register GoogleDocsService, SeoService, BlogService, TestimonialsService, LegalNewsService, all controllers
- [X] **11.9.2**: Register ContentModule in `app.module.ts`

### Sub-task 11.10: Frontend — API Client & Types ✅

- [X] **11.10.1**: Create `apps/web/lib/api/content.ts` (891 lines, fully documented with JSDoc)
  - `getPublishedPosts(params)`, `getPostBySlug(slug)`, `getAdminPosts(params)`, `createPost(data)`, `updatePost(id, data)`, `syncPost(id)`, `deletePost(id)`, `incrementView(id)`
  - `getCategories()`, `createCategory(data)`, `updateCategory(id, data)`, `deleteCategory(id)`
  - `getApprovedTestimonials()`, `submitTestimonial()`, `getAllTestimonials()`, `approveTestimonial()`, `rejectTestimonial()`
  - `getLatestNews()`, `createNewsItem()`
- [X] **11.10.2**: Testimonials API functions included in `content.ts` (no separate file needed)
- [X] **11.10.3**: Legal news API functions included in `content.ts` (no separate file needed)

### Sub-task 11.11: Frontend — Admin Content Pages ✅

- [X] **11.11.1**: Create `/admin/content` page — Paginated table, filters by type/status/category/search, category management dialog, delete functionality
- [X] **11.11.2**: Create `/admin/content/new` page — Google Doc URL input, content type selector, category picker, featured toggle, service account email with copy-to-clipboard
- [X] **11.11.3**: Create `/admin/content/[id]` page — SEO field editing, status change, sync from Google Doc button, delete option, category management, featured toggle
- [X] **11.11.4**: Update admin sidebar to add "Content" link (FileText icon)

### Sub-task 11.12: Frontend — Update Public Blog Pages ✅

- [X] **11.12.1**: Convert `/blogs/page.tsx` to fetch from API (`GET /api/content/posts`) — tab navigation (Insights/Case Studies), featured posts carousel, category filtering, animated UI
- [X] **11.12.2**: Convert `/blogs/[slug]/page.tsx` to server component with `generateMetadata()` for SSR SEO (SSG with 60s revalidation)
- [X] **11.12.3**: Add JSON-LD structured data (Article schema) to `/blogs/[slug]/page.tsx`
- [X] **11.12.4**: Add Open Graph + Twitter Card meta tags via `generateMetadata()`
- [X] **11.12.5**: Remove static data files (`blogData.ts`, `caseStudyData.ts`) after API integration complete

### Sub-task 11.13: Google Doc Templates

- [ ] **11.13.1**: Create Blog Post template Google Doc skeleton in shared Drive folder
- [ ] **11.13.2**: Create Case Study template Google Doc skeleton in shared Drive folder
- [X] **11.13.3**: Add template links to admin "New Post" page for reference (service account email displayed with copy button)

---

## HEAD TASK 12: Admin Module (Partial ✅)

### Sub-task 12.1: Create Dashboard Service ✅

- [X] **12.1.1**: Create `apps/api/src/dashboard/dashboard.service.ts`
- [X] **12.1.2**: Implement `getAdminDashboardStats()` method
  - Total clients, active cases, pending appointments
- [X] **12.1.3**: Implement `getClientDashboardStats(clientProfileId)` method
  - Open cases, upcoming appointments, pending invoices
- [X] **12.1.4**: Implement `getRecentActivities(limit)` method
  - Queries activity_logs with user_profiles join, returns camelCase mapped entries
- [X] **12.1.5**: Implement `getRevenueAnalytics(dateRange)` method
  - Placeholder returning zeroed structure — TODO comments for Task 10 integration
- [X] **12.1.6**: Implement `getCaseAnalytics()` method
  - byStatus, byPriority breakdowns, resolutionRate, avgResolutionDays
- [X] **12.1.7**: Implement `getAnalyticsStats()` method
  - activeSubscribers, openComplaints, pendingRegistrations counts

### Sub-task 12.2: Create Client Interactions Service (CRM) ✅

- [X] **12.2.1**: Create `apps/api/src/admin/client-interactions.service.ts`
- [X] **12.2.2**: Implement `logInteraction(clientProfileId, createDto, currentUser)` method
- [X] **12.2.3**: Implement `getClientInteractions(clientId, paginationDto)` method
- [X] **12.2.4**: Implement `getUpcomingInteractions(paginationDto)` method
- [X] **12.2.5**: Implement `updateInteraction(interactionId, updateDto)` method
- [X] **12.2.6**: Implement `completeInteraction(interactionId)` method

### Sub-task 12.3: Create Activity Logs Service ✅

- [X] **12.3.1**: Create `apps/api/src/admin/activity-logs.service.ts`
- [X] **12.3.2**: Implement `createLog(dto, userId?)` method (fire-and-forget, non-blocking)
- [X] **12.3.3**: Implement `getLogs(pagination, filters)` method (paginated, filterable)

> Note: HEAD TASK 15's AuditService provides the primary audit trail via global interceptor. This ActivityLogsService is a simpler complement for programmatic log creation.

### Sub-task 12.4: Create Admin Controllers ✅

- [X] **12.4.1**: Create `apps/api/src/dashboard/dashboard.controller.ts`
  - `GET /api/dashboard/admin/stats` (admin/attorney/staff) — primary stats
  - `GET /api/dashboard/client/stats` (client) — client stats
  - `GET /api/dashboard/admin/analytics` — secondary analytics stats
  - `GET /api/dashboard/admin/recent-activities?limit=N` — recent activity feed
  - `GET /api/dashboard/admin/case-analytics` — case breakdown
  - `GET /api/dashboard/admin/revenue-analytics` — placeholder
- [X] **12.4.2**: Create `apps/api/src/admin/admin.controller.ts`
  - `GET /api/admin/activity-logs` (admin/attorney/staff) — query with filters
  - `GET /api/admin/clients/:clientProfileId/interactions` — list
  - `POST /api/admin/clients/:clientProfileId/interactions` — create (Zod-validated)
  - `GET /api/admin/interactions/upcoming` — upcoming scheduled
  - `PATCH /api/admin/interactions/:id` — update (Zod-validated)
  - `PATCH /api/admin/interactions/:id/complete` — mark complete

### Sub-task 12.5: Admin Schemas & Types ✅

- [X] **12.5.1a**: Dashboard schemas (`AdminDashboardStatsSchema`, `ClientDashboardStatsSchema`)
- [X] **12.5.1b**: Dashboard types exported
- [X] **12.5.1c**: Create `packages/shared/src/schemas/admin.schemas.ts`
  - Interaction: `CreateInteractionSchema`, `UpdateInteractionSchema`, `InteractionResponseSchema`, `PaginatedInteractionsResponseSchema`
  - Activity Logs: `CreateActivityLogSchema`, `ActivityLogResponseSchema`, `ActivityLogFiltersSchema`, `PaginatedActivityLogsResponseSchema`
  - Analytics: `AdminAnalyticsStatsSchema`, `CaseAnalyticsSchema`, `RevenueAnalyticsSchema`
- [X] **12.5.2**: Create `packages/shared/src/types/admin.types.ts` (11 types inferred from schemas)
- [X] **12.5.3**: Add `InteractionType` enum (CALL, EMAIL, MEETING, WHATSAPP, OTHER) — matches DB `interaction_type` enum

### Sub-task 12.6: Admin Module ✅

- [X] **12.6.1**: Create `apps/api/src/admin/admin.module.ts` (providers: ClientInteractionsService, ActivityLogsService; exports: ActivityLogsService)
- [X] **12.6.2**: Create `apps/api/src/dashboard/dashboard.module.ts` (registered in `app.module.ts`)

### Sub-task 12.7: Frontend — Admin Management Views ✅

- [X] **12.7.1**: Create `/admin/complaints` page — list with filters (status, category, search)
- [X] **12.7.2**: Create `/admin/complaints/:id` page — detail + status update + assign to staff
- [X] **12.7.3**: Create `/admin/subscriptions` page — list with status filters + cancel capability
- [X] **12.7.4**: Update admin sidebar: all links present (Dashboard, Clients, Users, Cases, Complaints, Subscriptions, Service Registrations, Consultations, Documents, Content, Profile)

> **Additional admin pages implemented beyond original scope:**
>
> - `/admin/clients` — Tabbed page (Registered Clients + Consultation Guests)
> - `/admin/clients/[id]` — Client detail with Cases/Documents/Invoices tabs
> - `/admin/users` — User management with invite dialog, delete, search, filters
> - `/admin/cases` — Case list with filters (status, priority, search)
> - `/admin/cases/[id]` — Case detail with activity timeline
> - `/admin/cases/new` — Create case page
> - `/admin/service-registrations` — Service registration list
> - `/admin/service-registrations/[id]` — Detail with case creation (Sub-task 12.9)
> - `/admin/consultations` — Consultation bookings list
> - `/admin/documents` — Document management with type/case filters, download/delete
> - `/admin/content` — Blog posts and case studies management (HEAD TASK 11)
> - `/admin/profile` — Admin profile page

### Sub-task 12.8: Frontend — Dashboard Stats (Partial ✅)

- [X] **12.8.1**: Create `apps/web/lib/api/dashboard.ts` API client helpers (`getAdminDashboardStats()`, `getClientDashboardStats()`)
- [X] **12.8.2**: Update admin dashboard page to fetch real stats from `GET /api/dashboard/admin/stats`
- [X] **12.8.3**: Update client dashboard page to fetch real stats from `GET /api/dashboard/client/stats`
- [ ] **12.8.6**: Create `apps/web/lib/api/admin.ts` — frontend API client for analytics + CRM interactions
  - Analytics: `getAnalyticsStats()`, `getRecentActivities()`, `getCaseAnalytics()`
  - Interactions: `getClientInteractions()`, `createInteraction()`, `updateInteraction()`, `completeInteraction()`, `getUpcomingInteractions()`
- [ ] **12.8.7**: Update admin dashboard page — enable 3 disabled analytics cards (Active Subscribers, Open Complaints, Pending Registrations) with real data from `getAnalyticsStats()`, add "Recent Activity" feed section
- [ ] **12.8.8**: Add "Interactions" tab to `/admin/clients/[id]` page
  - Interaction list (type icon, subject, staff name, date, completion badge)
  - "Log Interaction" dialog (type select, subject, notes, scheduled date)
  - "Complete" action per row
- [ ] **12.8.9**: Final `pnpm tsc --noEmit` verification on both apps

> Note: Activity logs page NOT needed here — covered by HEAD TASK 15's `/admin/audit-logs` page

---

## HEAD TASK 13: Testing & Validation

### Sub-task 13.1: Unit Tests

- [X] **13.1.1**: Write tests for `LemonSqueezyService` (checkout, webhook verification, subscription management)
- [X] **13.1.2**: Write tests for `ConsultationsService` (booking, payment webhook handler)
- [X] **13.1.3**: Write tests for `SubscriptionsService` (checkout, all webhook handlers)
- [X] **13.1.4**: Write tests for `ServiceRegistrationsService` (registration, payment, auto-account)
- [X] **13.1.5**: Write tests for `CasesService` (CRUD, assignment, from-registration)
- [X] **13.1.6**: Write tests for `InvoicesService` (CRUD, totals, send)

### Sub-task 13.2: Integration Tests

- [X] **13.2.1**: Test complete auth flow (signup → signin → refresh → signout)
- [X] **13.2.2**: Test consultation booking flow (guest intake → Lemon Squeezy checkout → webhook → Cal.com)
- [X] **13.2.3**: Test subscription flow (checkout → webhook → renewal → cancellation)
- [X] **13.2.4**: Test service registration flow (register → pay → webhook → auto-account)
- [X] **13.2.5**: Test case management flow (create → assign → activities → close)

### Sub-task 13.3: Test RLS Policies

- [X] **13.3.1**: Verify clients can only access their own data
- [X] **13.3.2**: Verify staff can access all client data
- [X] **13.3.3**: Verify admin has full access
- [X] **13.3.4**: Verify unauthorized users get 403 errors
- [X] **13.3.5**: Verify @Public endpoints don't leak data

### Sub-task 13.4: Test API Endpoints

- [X] **13.4.1**: Test all auth endpoints
- [X] **13.4.2**: Test all CRUD endpoints with pagination and filtering
- [X] **13.4.3**: Test validation errors (bad input, missing required fields)
- [X] **13.4.4**: Test error handling (not found, unauthorized, forbidden)

---

## HEAD TASK 14: Database RLS Optimization

> **Reference:** `docs/database/problem.md`, `docs/database/brainstorm.md`, `docs/database/plan.md`

**Goal:** Fix 130+ Supabase linter warnings: 62 auth_rls_initplan, 63+ multiple_permissive_policies, 5 duplicate indexes.

### Sub-task 14.1: Drop Duplicate Indexes

- [ ] **14.1.1**: Identify 5 duplicate indexes (where `idx_*` duplicates `*_key` constraint)
- [ ] **14.1.2**: Apply migration to drop redundant `idx_*` indexes

### Sub-task 14.2: Fix auth_rls_initplan Warnings

- [ ] **14.2.1**: Audit all RLS policies using `auth.uid()` directly
- [ ] **14.2.2**: Rewrite to use `(select auth.uid())` pattern (evaluated once per query, not per row)
- [ ] **14.2.3**: Apply migration (drop old policies, create optimized ones)

### Sub-task 14.3: Consolidate Multiple Permissive Policies

- [ ] **14.3.1**: Audit all tables with multiple permissive policies for same role+action
- [ ] **14.3.2**: Consolidate into single policy with OR conditions
  - Naming convention: `{action}_{table_name}` (e.g., `select_user_profiles`)
- [ ] **14.3.3**: Apply migration (drop 88 old policies, create 79 consolidated)

### Sub-task 14.4: Verification

- [ ] **14.4.1**: Run Supabase security advisors — zero auth_rls_initplan warnings
- [ ] **14.4.2**: Run Supabase performance advisors — zero duplicate_index warnings
- [ ] **14.4.3**: Verify all API endpoints still work (no RLS regressions)

---

## HEAD TASK 15: Audit & Activity Logs

### Sub-task 15.1: Shared Package (Enums, Schemas, Types)

- [X] **15.1.1**: Add `AuditAction` and `AuditEntityType` enums to `packages/shared/src/enums.ts`
- [X] **15.1.2**: Create `packages/shared/src/schemas/audit.schemas.ts` (AuditLogResponseSchema, AuditLogFiltersSchema, PaginatedAuditLogsResponseSchema, AuditLogUserSchema)
- [X] **15.1.3**: Create `packages/shared/src/types/audit.types.ts` (inferred from schemas)
- [X] **15.1.4**: Add barrel exports in `schemas/index.ts` and `types/index.ts`

### Sub-task 15.2: Database Indexes

- [X] **15.2.1**: Add indexes on `activity_logs` table (created_at DESC, user_id, entity_type, action)

### Sub-task 15.3: Backend — AuditService

- [X] **15.3.1**: Create `apps/api/src/audit/audit.service.ts` with `log()`, `findAll()`, `getDistinctUsers()` methods
- [X] **15.3.2**: Create `@SkipAudit()` decorator at `apps/api/src/common/decorators/skip-audit.decorator.ts`

### Sub-task 15.4: Backend — AuditInterceptor

- [X] **15.4.1**: Create `apps/api/src/audit/audit.interceptor.ts` — global interceptor for POST/PATCH/DELETE
  - Route-to-action mapping for ~25 admin routes
  - Sensitive field redaction (passwords, tokens)
  - IP address and user agent extraction
  - Fire-and-forget pattern (never blocks response)

### Sub-task 15.5: Backend — AuditController

- [X] **15.5.1**: Create `apps/api/src/audit/audit.controller.ts`
  - `GET /api/audit-logs` — paginated list with filters (`@Roles(ADMIN, ATTORNEY)`)
  - `GET /api/audit-logs/users` — distinct users for filter dropdown

### Sub-task 15.6: Backend — AuditModule + Registration

- [X] **15.6.1**: Create `apps/api/src/audit/audit.module.ts` (`@Global()`, exports AuditService)
- [X] **15.6.2**: Register AuditModule in `app.module.ts`
- [X] **15.6.3**: Register AuditInterceptor globally in `main.ts`

### Sub-task 15.7: Backend — Auth Event Migration

- [X] **15.7.1**: Inject AuditService into AuthService, replace `logAuthEvent()` with `auditService.log()`
- [X] **15.7.2**: Remove `ActivityLogMetadata` interface (replaced by `Record<string, unknown>`)

### Sub-task 15.8: Frontend — API Client & Page

- [X] **15.8.1**: Create `apps/web/lib/api/audit-logs.ts` (getAuditLogs, getAuditLogUsers)
- [X] **15.8.2**: Create `/admin/audit-logs` page with filterable table
  - Filters: user, action, entity type, date range
  - Color-coded action badges
  - Expandable rows with metadata JSON
  - Loading skeletons and empty state
  - Pagination (25 per page)

### Sub-task 15.9: Frontend — Sidebar Update

- [X] **15.9.1**: Add "Audit Logs" link to admin sidebar (visible to Admin + Attorney only)

---

## Verification Checklist

### Phase 1: Environment & Database ✅

- [X] All dependencies installed
- [X] Backend starts without errors
- [X] Supabase connection working
- [X] All tables exist (consultation_bookings, subscriptions, complaints, service_registrations)
- [X] RLS enabled on all tables
- [X] Triggers and functions created (CON-YYYY-NNNN, CMP-YYYY-NNNN, SRV-YYYY-NNNN)

### Phase 2: Authentication ✅

- [X] Signup creates user and returns JWT (now returns `SignupPendingResponse` — email confirmation required before profile creation)
- [X] Signin returns valid JWT (enhanced: checks email confirmation status)
- [X] OAuth callback creates profile on first login (reads phone_number from user_metadata)
- [X] Get current user works
- [X] Invalid token returns 401

### Phase 3: Core Features (Partial)

- [X] Create client works
- [X] Create case works (case_number generated)
- [X] Upload document works (HEAD TASK 9)
- [ ] Create invoice works (HEAD TASK 10G)

### Phase 4: Client-Facing Features (Partial)

- [X] Consultation booking form + Cal.com scheduling works
- [ ] Consultation payment flow end-to-end (HEAD TASK 10E + 10H)
- [X] Logged-in clients can book consultations from dashboard (pre-filled overlay)
- [ ] Subscription checkout works end-to-end (HEAD TASK 10D + 10H)
- [X] Complaint submission gated behind active subscription
- [X] Complaint status tracking works
- [X] Service registration form works (guest → details)
- [ ] Service registration payment end-to-end (HEAD TASK 10F + 10H)
- [ ] Auto account creation on service registration payment (HEAD TASK 10F)

### Phase 5: Lemon Squeezy Integration

- [ ] Lemon Squeezy SDK initialized and configured (HEAD TASK 10B)
- [ ] One-time checkout works: consultation (PKR 50,000), service registration (variable)
- [ ] Subscription checkout works: Civic Retainer (PKR 700/month)
- [ ] Webhook signature verification (HMAC-SHA256) works
- [ ] Central webhook router correctly dispatches events
- [ ] Order webhooks update consultation and service registration statuses
- [ ] Subscription lifecycle webhooks (created, updated, cancelled, expired) work
- [ ] Subscription payment webhooks (success, failed, recovered) work
- [ ] Idempotency prevents duplicate webhook processing

### Phase 5b: Cal.com Integration ✅

- [X] Cal.com webhook receives BOOKING_CREATED events
- [X] Webhook matches booking by metadata.referenceNumber (or fallback by email)
- [X] Meeting link, date, time stored in consultation_bookings
- [X] Booking status updated to 'booked' after Cal.com scheduling

### Phase 6: RLS & Security

- [X] Clients see only own data
- [X] Attorneys see assigned data
- [X] Admin sees all data
- [X] Access control enforced
- [X] Guest endpoints (@Public) don't leak data
- [X] Subscription check prevents unauthorized complaint submission
- [ ] Database RLS optimized (HEAD TASK 14)

### Phase 7: Testing

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Lemon Squeezy webhooks work for all payment types
- [ ] Cal.com webhook syncs booking data

---

## Critical Notes

1. **Database First**: Create tables before services
2. **RLS Critical**: All ops fail without RLS
3. **Service Role Key**: Backend only
4. **500 Line Limit**: Split large files
5. **JSDoc Required**: Document exports
6. **Test Alongside**: Don't test after
7. **No .env Commits**: Use .env.example
8. **Guest Endpoints**: Consultation + Service Registration endpoints are @Public — verify no data leaks
9. **Payment Before Access**: Cal.com embed must NEVER render before payment confirmation
10. **Subscription Guard**: Complaint submission must verify active subscription on every request
11. **Lemon Squeezy Prices in Cents**: PKR 700 = 70000, PKR 50,000 = 5000000
12. **Webhook-Based Confirmation**: Lemon Squeezy uses webhooks (not two-step tracker flow like Safepay)

---

## Task Dependency Graph

```
10A (Safepay Removal) ─┬─→ 10B (LS Core Service) ─┬─→ 10C (Webhook Controller) ─┬─→ 10D (Subscriptions)
                       │                           │                              ├─→ 10E (Consultations)
                       │                           │                              └─→ 10F (Service Regs)
                       │                           └─→ 10G (Invoices)
                       │
                       └─→ 10I (Dashboard Setup — manual, can be parallel)

10D + 10E + 10F ──→ 10H (Frontend Payment Components)

9 (Documents) ── COMPLETE
11 (Content) ── independent, can run in parallel with 10
12 (Admin) ── depends on 10G for revenue analytics, otherwise independent
13 (Testing) ── runs after all feature tasks
14 (DB Optimization) ── independent, can run anytime
```
