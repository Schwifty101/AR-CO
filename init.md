# AR-CO Database & Backend Setup - Task Initialization

## Overview

This document provides a granular 3-level task breakdown for transforming the AR-CO NestJS backend from minimal setup to a full-featured law firm management platform.

**Current State:**

- NestJS 11.0.1 at `apps/api` with only `GET /api/hello` endpoint
- Supabase project configured in `.mcp.json` (project_ref: pxqwdshlpuwxufudqude)
- NO database client, NO environment variables, NO authentication, NO business logic

**Goal:**
Complete database architecture with 20+ tables, Row-Level Security, comprehensive API endpoints for all features.

---

## HEAD TASK 1: Environment & Configuration Setup

### Sub-task 1.1: Install Dependencies

- [x] **1.1.1**: Install Supabase client (`@supabase/supabase-js`)
- [x] **1.1.2**: Install validation packages (`class-validator`, `class-transformer`, `joi`)
- [x]     **1.1.3**: Install authentication packages (`@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`)
- [x] **1.1.4**: Install security packages (`bcrypt`, `@types/bcrypt`)
- [x] **1.1.5**: Install file upload packages (`multer`, `@types/multer`, `@nestjs/platform-express`)
- [x] **1.1.6**: Install utility packages (`axios`, `dayjs`, `uuid`)
- [x] **1.1.7**: Install email service packages (`@sendgrid/mail`)
- [x] **1.1.8**: Install logging packages (`winston`, `nest-winston`)

### Sub-task 1.2: Create Environment Configuration

- [x] **1.2.1**: Create `.env` file with Supabase credentials (URL, anon key, service role key)
- [x] **1.2.2**: Add JWT configuration (secret, access token expiration, refresh token expiration)
- [x] **1.2.3**: Add Safepay configuration (API key, environment, webhook secret)
- [x] **1.2.4**: Add email service configuration (SendGrid API key, from email)
- [x] **1.2.5**: Add application configuration (PORT, NODE_ENV, CORS origins)
- [x] **1.2.6**: Create `.env.example` template file

### Sub-task 1.3: Setup Configuration Module

- [x] **1.3.1**: Create `apps/api/src/config/configuration.ts` with typed config object
- [x] **1.3.2**: Create `apps/api/src/config/validation.schema.ts` with Joi validation schema
- [x] **1.3.3**: Create `apps/api/src/config/config.module.ts` using NestJS ConfigModule
- [x] **1.3.4**: Import ConfigModule in `apps/api/src/app.module.ts`

---

## HEAD TASK 2: Database Schema & RLS Policies

### Sub-task 2.1: Create User Management Tables

- [x] **2.1.1**: Create `user_profiles` table (extends Supabase auth.users)
  - Columns: id (uuid, FK to auth.users), full_name, phone_number, user_type (enum), created_at, updated_at
- [x] **2.1.2**: Create `client_profiles` table with company info
  - Columns: id (uuid), user_profile_id (FK), company_name, company_type, tax_id, address, city, country, created_at, updated_at
- [x] **2.1.3**: Create `attorney_profiles` table with specializations
  - Columns: id (uuid), user_profile_id (FK), bar_number, specializations (text[]), education, experience_years, hourly_rate, created_at, updated_at

### Sub-task 2.2: Create Core Business Tables

- [x] **2.2.1**: Create `practice_areas` table
  - Columns: id (uuid), name, slug, description, icon, is_active, created_at, updated_at
- [x] **2.2.2**: Create `services` table
  - Columns: id (uuid), practice_area_id (FK), name, slug, description, base_fee, estimated_duration, is_active, created_at, updated_at
- [x] **2.2.3**: Create `cases` table with case_number auto-generation
  - Columns: id (uuid), case_number (auto-generated, unique), client_profile_id (FK), attorney_profile_id (FK), practice_area_id (FK), service_id (FK), title, description, status (enum), priority (enum), case_type, filing_date, closing_date, created_at, updated_at
- [x] **2.2.4**: Create `case_activities` table for timeline
  - Columns: id (uuid), case_id (FK), activity_type (enum), title, description, created_by (FK to user_profiles), attachments (jsonb), created_at

### Sub-task 2.3: Create Appointment Tables

- [x] **2.3.1**: Create `appointments` table with double-booking prevention
  - Columns: id (uuid), client_profile_id (FK), attorney_profile_id (FK), appointment_date, start_time, end_time, duration_minutes, appointment_type (enum), status (enum), subject, notes, meeting_link, created_at, updated_at
  - Unique constraint: (attorney_profile_id, appointment_date, start_time) to prevent double-booking
- [x] **2.3.2**: Create `availability_slots` table for attorney scheduling
  - Columns: id (uuid), attorney_profile_id (FK), day_of_week (int), start_time, end_time, is_available, created_at, updated_at

### Sub-task 2.4: Create Financial Tables

- [x] **2.4.1**: Create `invoices` table with auto invoice_number
  - Columns: id (uuid), invoice_number (auto-generated), client_profile_id (FK), case_id (FK, optional), issue_date, due_date, subtotal, tax_amount, discount_amount, total_amount, status (enum), payment_terms, notes, created_at, updated_at
- [x] **2.4.2**: Create `invoice_items` table
  - Columns: id (uuid), invoice_id (FK), description, quantity, unit_price, amount, created_at
- [x] **2.4.3**: Create `payments` table with Safepay integration
  - Columns: id (uuid), invoice_id (FK), client_profile_id (FK), amount, payment_method (enum), safepay_transaction_id, safepay_tracker_id, status (enum), payment_date, metadata (jsonb), created_at, updated_at

### Sub-task 2.5: Create Document Tables

- [x] **2.5.1**: Create `documents` table with encryption metadata
  - Columns: id (uuid), name, description, file_path (Supabase Storage path), file_size, file_type, uploaded_by (FK to user_profiles), case_id (FK, optional), client_profile_id (FK, optional), document_type (enum), is_encrypted, encryption_metadata (jsonb), created_at, updated_at

### Sub-task 2.6: Create Content Tables

- [x] **2.6.1**: Create `blog_categories` table
  - Columns: id (uuid), name, slug, description, created_at, updated_at
- [x] **2.6.2**: Create `blog_posts` table
  - Columns: id (uuid), title, slug, excerpt, content, featured_image, author_id (FK to user_profiles), category_id (FK), status (enum), published_at, view_count, created_at, updated_at
- [x] **2.6.3**: Create `testimonials` table
  - Columns: id (uuid), client_profile_id (FK), content, rating (int), is_approved, approved_by (FK to user_profiles), approved_at, created_at, updated_at
- [x] **2.6.4**: Create `legal_news` table for news ticker
  - Columns: id (uuid), title, source, url, published_at, created_at

### Sub-task 2.7: Create Admin & Tracking Tables

- [x] **2.7.1**: Create `client_interactions` table for CRM
  - Columns: id (uuid), client_profile_id (FK), staff_user_id (FK to user_profiles), interaction_type (enum), subject, notes, scheduled_at, completed_at, created_at, updated_at
- [x] **2.7.2**: Create `activity_logs` table for audit trail
  - Columns: id (uuid), user_id (FK to user_profiles), action, entity_type, entity_id, metadata (jsonb), ip_address, user_agent, created_at

### Sub-task 2.8: Create Private Schema Utility Functions

- [x] **2.8.1**: Create `private.get_user_type(user_id uuid)` function
  - Returns user_type from user_profiles table
- [x] **2.8.2**: Create `private.is_admin(user_id uuid)` function
  - Returns boolean, checks if user_type = 'admin'
- [x] **2.8.3**: Create `private.is_staff(user_id uuid)` function
  - Returns boolean, checks if user_type IN ('admin', 'attorney', 'staff')
- [x] **2.8.4**: Create `private.get_client_profile_id(user_id uuid)` function
  - Returns client_profile_id for given user_id
- [x] **2.8.5**: Create `private.get_attorney_profile_id(user_id uuid)` function
  - Returns attorney_profile_id for given user_id
- [x] **2.8.6**: Test all utility functions with sample data

### Sub-task 2.9: Apply RLS Policies

- [x] **2.9.1**: Enable RLS on all tables
- [x] **2.9.2**: Create RLS policies for `user_profiles`
  - Users can read their own profile
  - Staff can read all profiles
  - Users can update their own profile
  - Admin can update any profile
- [x] **2.9.3**: Create RLS policies for `client_profiles`
  - Clients can read their own profile
  - Staff can read all client profiles
  - Staff can update client profiles
- [x] **2.9.4**: Create RLS policies for `attorney_profiles`
  - Attorneys can read their own profile
  - Staff can read all attorney profiles
  - Admin can update attorney profiles
- [x] **2.9.5**: Create RLS policies for `cases`
  - Clients can read their own cases
  - Attorneys can read cases assigned to them
  - Staff can read all cases
  - Staff can create/update/delete cases
- [x] **2.9.6**: Create RLS policies for `documents`
  - Clients can read documents linked to their cases/profile
  - Attorneys can read documents for assigned cases
  - Staff can read all documents
  - Document uploader and staff can delete documents
- [x] **2.9.7**: Create RLS policies for `appointments`
  - Clients can read their own appointments
  - Attorneys can read their assigned appointments
  - Staff can read all appointments
  - Staff can create/update appointments
- [x] **2.9.8**: Create RLS policies for `invoices` and `payments`
  - Clients can read their own invoices/payments
  - Staff can read all invoices/payments
  - Staff can create/update invoices
- [x] **2.9.9**: Create RLS policies for content tables (blog_posts, testimonials)
  - All users can read published blog posts
  - Staff can create/update blog posts
  - Clients can submit testimonials
  - Admin can approve testimonials

### Sub-task 2.10: Create Database Triggers

- [x] **2.10.1**: Create `generate_case_number()` trigger function
  - Format: "CASE-YYYY-NNNN" (e.g., CASE-2025-0001)
  - Auto-increment per year
- [x] **2.10.2**: Apply case_number trigger to `cases` table
- [x] **2.10.3**: Create `generate_invoice_number()` trigger function
  - Format: "INV-YYYY-NNNN" (e.g., INV-2025-0001)
- [x] **2.10.4**: Apply invoice_number trigger to `invoices` table
- [x] **2.10.5**: Create `update_updated_at_column()` trigger function
  - Automatically updates updated_at timestamp
- [x] **2.10.6**: Apply updated_at trigger to all tables with updated_at column

---

## HEAD TASK 3: Database Service & Common Utilities ✅

### Sub-task 3.1: Create Database Module

- [x] **3.1.1**: Create `apps/api/src/database/supabase.service.ts` with SupabaseService class
  - Method: `getClient(accessToken?: string)` - Returns authenticated Supabase client
  - Method: `getAdminClient()` - Returns service role client (bypasses RLS)
  - Method: `getUserFromToken(token)` - Validates JWT and retrieves user profile
- [x] **3.1.2**: Create `apps/api/src/database/admin-whitelist.service.ts`
  - Method: `isAdminEmail(email)` - Checks admin whitelist
- [x] **3.1.3**: Create `apps/api/src/database/database.module.ts`
  - Register SupabaseService and AdminWhitelistService as global providers
- [x] **3.1.4**: Import DatabaseModule in `app.module.ts`

### Sub-task 3.2: Create Common Guards

- [x] **3.2.1**: Create `apps/api/src/common/guards/jwt-auth.guard.ts`
  - Extract JWT from Authorization header
  - Validate token with Supabase via getUserFromToken()
  - Attach user to request object
  - Respect @Public() decorator
- [x] **3.2.2**: Create `apps/api/src/common/guards/roles.guard.ts`
  - Check user_type against required roles from @Roles() decorator
  - Check admin whitelist for bypass
- [x] **3.2.3**: Register guards globally in `main.ts` with proper execution order

### Sub-task 3.3: Create Common Decorators

- [x] **3.3.1**: Create `apps/api/src/common/decorators/current-user.decorator.ts`
  - Extracts user from request object
  - Supports extracting specific properties
- [x] **3.3.2**: Create `apps/api/src/common/decorators/roles.decorator.ts`
  - Decorator to specify required roles for endpoints
- [x] **3.3.3**: Create `apps/api/src/common/decorators/public.decorator.ts`
  - Decorator to mark endpoints as public (skip authentication)

### Sub-task 3.4: Create Common DTOs and Interfaces

- [x] **3.4.1**: Create `apps/api/src/common/dto/pagination.dto.ts`
  - PaginationDto with page, limit, sort, order
  - Full class-validator validation
- [x] **3.4.2**: Create `apps/api/src/common/interfaces/auth-user.interface.ts`
  - AuthUser interface with id, email, userType, fullName, phoneNumber
  - Optional: clientProfileId, attorneyProfileId
- [x] **3.4.3**: Create `apps/api/src/common/enums/user-type.enum.ts`
  - UserType enum: CLIENT, ATTORNEY, STAFF, ADMIN

### Sub-task 3.5: Create Exception Filters

- [x] **3.5.1**: Create `apps/api/src/common/filters/http-exception.filter.ts`
  - Standardizes HTTP error responses
- [x] **3.5.2**: Create `apps/api/src/common/filters/supabase-exception.filter.ts`
  - Maps Supabase errors to HTTP status codes

### Sub-task 3.6: Application Integration

- [x] **3.6.1**: Update `main.ts` with global guards and filters
- [x] **3.6.2**: Extend `configuration.ts` with AdminConfig
- [x] **3.6.3**: Update `validation.schema.ts` with ADMIN_EMAILS
- [x] **3.6.4**: Update `.env` and `.env.example` with ADMIN_EMAILS

---

## HEAD TASK 4: Authentication Module ✅

### Sub-task 4.1: Create Auth DTOs & Validation (7/7) ✅

- [x] **4.1.1**: Create `apps/api/src/auth/dto/signup.dto.ts`
  - Fields: email (@IsEmail), password (@MinLength(8), @MaxLength(72), @Matches for complexity), fullName, phoneNumber (optional)
- [x] **4.1.2**: Create `apps/api/src/auth/dto/signin.dto.ts`
  - Fields: email, password
- [x] **4.1.3**: Create `apps/api/src/auth/dto/oauth-callback.dto.ts`
  - Fields: accessToken, refreshToken
- [x] **4.1.4**: Create `apps/api/src/auth/dto/refresh-token.dto.ts`
  - Fields: refreshToken
- [x] **4.1.5**: Create `apps/api/src/auth/dto/password-reset.dto.ts`
  - PasswordResetRequestDto (email), PasswordResetConfirmDto (accessToken, newPassword)
- [x] **4.1.6**: Create `apps/api/src/auth/dto/auth-response.dto.ts`
  - AuthResponseDto (user, accessToken, refreshToken), AuthMessageDto (message)
- [x] **4.1.7**: Create `apps/api/src/auth/dto/index.ts` (barrel export)

### Sub-task 4.2: Create Auth Service (1/1) ✅

- [x] **4.2.1**: Create `apps/api/src/auth/auth.service.ts`
  - `signup(dto)` - Email/password signup (clients only, blocks admin emails)
  - `signin(dto)` - Email/password signin
  - `processOAuthCallback(dto)` - Handle OAuth tokens, create/fetch profile, detect user type
  - `refreshToken(dto)` - Refresh access token via Supabase
  - `requestPasswordReset(dto)` - Send reset email (generic message prevents enumeration)
  - `confirmPasswordReset(dto)` - Reset password using admin.updateUserById
  - `signout(userId)` - Log event, return success
  - `getCurrentUser(userId, email)` - Fetch user profile

### Sub-task 4.3: Create Auth Controller (1/1) ✅

- [x] **4.3.1**: Create `apps/api/src/auth/auth.controller.ts`
  - POST /api/auth/signup, signin, oauth/callback, refresh, password-reset/request, password-reset/confirm (all @Public)
  - GET /api/auth/me, POST /api/auth/signout (protected)

### Sub-task 4.4: Create Auth Module & Integration (2/2) ✅

- [x] **4.4.1**: Create `apps/api/src/auth/auth.module.ts`
- [x] **4.4.2**: Import AuthModule in app.module.ts, add global ValidationPipe in main.ts

### Sub-task 4.5: Frontend Auth Infrastructure (5/5) ✅

- [x] **4.5.1**: Install @supabase/supabase-js and @supabase/ssr
- [x] **4.5.2**: Create Supabase client configuration (browser, server, middleware)
- [x] **4.5.3**: Create Auth Context & Hooks (AuthProvider, useAuth, auth-actions)
- [x] **4.5.4**: Create Next.js middleware (session refresh, route protection, user type routing)
- [x] **4.5.5**: Wrap root layout with AuthProvider

### Sub-task 4.6: Frontend Auth Pages (6/6) ✅

- [x] **4.6.1**: Create Sign-In Page (tabbed Google OAuth + email/password)
- [x] **4.6.2**: Create Sign-Up Page (client registration)
- [x] **4.6.3**: Create OAuth Callback Handler (code exchange + backend POST + redirect)
- [x] **4.6.4**: Create Password Reset Pages (request + confirm)
- [x] **4.6.5**: Create Dashboard Layouts & Pages (admin + client with sidebar/header)
- [x] **4.6.6**: Update .env.example with Supabase configuration

### Sub-task 4.7: Testing (1/1) ✅

- [x] **4.7.1**: Create auth.service.spec.ts (12 unit tests, all passing)

### Sub-task 4.8: Bug Fixes (1/1) ✅

- [x] **4.8.1**: Fix getUserFromToken() in supabase.service.ts (wrong column name + missing columns)

---

## HEAD TASK 5: Users & Profiles Module

### Sub-task 5.1: Create Users Service

- [x] **5.1.1**: Create `apps/api/src/users/users.service.ts`
- [x] **5.1.2**: Implement `getUserProfile(userId)` method with RLS
- [x] **5.1.3**: Implement `updateUserProfile(userId, updateDto)` method
- [x] **5.1.4**: Implement `deleteUser(userId)` method (admin only)
- [x] **5.1.5**: Implement `getAllUsers(paginationDto)` method (staff only)

### Sub-task 5.2: Create Users Controller

- [x] **5.2.1**: Create `apps/api/src/users/users.controller.ts`
- [x] **5.2.2**: Create endpoint: `GET /api/users/profile` (current user)
- [x] **5.2.3**: Create endpoint: `PATCH /api/users/profile` (update own profile)
- [x] **5.2.4**: Create endpoint: `GET /api/users` (staff only, with pagination)
- [x] **5.2.5**: Apply @UseGuards(AuthGuard, RolesGuard) and @Roles() decorators

### Sub-task 5.3: Create Profile DTOs

> **Note:** DTOs are implemented as Zod schemas in `packages/shared/src/schemas/users.schemas.ts` with types in `packages/shared/src/types/users.types.ts`, instead of class-validator DTOs in `apps/api/src/users/dto/`.

- [x] **5.3.1**: Create `apps/api/src/users/dto/update-user-profile.dto.ts`
  - Optional fields: fullName, phoneNumber
- [x] **5.3.2**: Create `apps/api/src/users/dto/create-client-profile.dto.ts`
  - Fields: companyName, companyType, taxId, address, city, country
- [x] **5.3.3**: Create `apps/api/src/users/dto/update-client-profile.dto.ts`
  - All fields optional
- [x] **5.3.4**: Create `apps/api/src/users/dto/create-attorney-profile.dto.ts`
  - Fields: barNumber, specializations, education, experienceYears, hourlyRate
- [x] **5.3.5**: Create `apps/api/src/users/dto/update-attorney-profile.dto.ts`
  - All fields optional

### Sub-task 5.4: Create Users Module

- [x] **5.4.1**: Create `apps/api/src/users/users.module.ts`
  - Register UsersService, UsersController

### Sub-task 5.5: Frontend Users & Profiles (web)

- [x] **5.5.1**: Add users API client helpers in `apps/web/lib` (get profile, update profile, list users)
- [x] **5.5.2**: Create profile page for authenticated users (client + attorney + staff) under dashboards
- [x] **5.5.3**: Build profile edit form (full_name, phone_number, client/attorney fields)
- [x] **5.5.4**: Create admin/staff users list page with pagination/search in admin dashboard
- [x] **5.5.5**: Add loading, empty, and error states + toast feedback for profile updates
- [x] **5.5.6**: Update dashboard sidebar navigation to include Profile and Users links

---

## HEAD TASK 6: Clients, Subscriptions, Complaints & Service Registrations Module

### Sub-task 6.1: Create Clients Service

- [ ] **6.1.1**: Create `apps/api/src/clients/clients.service.ts`
- [ ] **6.1.2**: Implement `createClient(createDto)` method
  - Creates user_profile + client_profile in transaction
- [ ] **6.1.3**: Implement `getClients(paginationDto, filters)` method (staff only)
  - Support filtering by company_type, city, status
- [ ] **6.1.4**: Implement `getClientById(clientId)` method with RLS
- [ ] **6.1.5**: Implement `updateClient(clientId, updateDto)` method
- [ ] **6.1.6**: Implement `deleteClient(clientId)` method (admin only)
- [ ] **6.1.7**: Implement `getClientCases(clientId)` method
- [ ] **6.1.8**: Implement `getClientDocuments(clientId)` method
- [ ] **6.1.9**: Implement `getClientInvoices(clientId)` method

### Sub-task 6.2: Create Clients Controller

- [ ] **6.2.1**: Create `apps/api/src/clients/clients.controller.ts`
- [ ] **6.2.2**: Create endpoint: `GET /api/clients` (staff only)
- [ ] **6.2.3**: Create endpoint: `POST /api/clients` (staff only)
- [ ] **6.2.4**: Create endpoint: `GET /api/clients/:id`
- [ ] **6.2.5**: Create endpoint: `PATCH /api/clients/:id`
- [ ] **6.2.6**: Create endpoint: `DELETE /api/clients/:id` (admin only)
- [ ] **6.2.7**: Create endpoint: `GET /api/clients/:id/cases`
- [ ] **6.2.8**: Create endpoint: `GET /api/clients/:id/documents`
- [ ] **6.2.9**: Create endpoint: `GET /api/clients/:id/invoices`

### Sub-task 6.3: Test RLS Enforcement

- [ ] **6.3.1**: Test that clients can only see their own profile
- [ ] **6.3.2**: Test that staff can see all client profiles
- [ ] **6.3.3**: Test that unauthorized users get 403 errors

### Sub-task 6.4: Create Clients Module

- [ ] **6.4.1**: Create `apps/api/src/clients/clients.module.ts`

### Sub-task 6.5: Subscriptions Database & Backend (Monthly Retainer - PKR 700/month)

**Context:** Civic advocacy subscription. Clients pay PKR 700/month to submit complaints against government organizations. AR&CO holds government bodies accountable.

- [ ] **6.5.1**: Create `subscriptions` table via Supabase migration
  - Columns: id (uuid, PK), client_profile_id (uuid, FK to client_profiles, UNIQUE), plan_name (text, default 'civic_retainer'), monthly_amount (decimal, default 700), currency (varchar(3), default 'PKR'), status (enum: pending, active, past_due, cancelled, expired), safepay_subscription_id (text), safepay_customer_id (text), current_period_start (timestamptz), current_period_end (timestamptz), cancelled_at (timestamptz), cancellation_reason (text), created_at (timestamptz), updated_at (timestamptz)
- [ ] **6.5.2**: Enable RLS on subscriptions (clients read own, staff read all, staff update status)
- [ ] **6.5.3**: Apply updated_at trigger
- [ ] **6.5.4**: Create `apps/api/src/subscriptions/subscriptions.service.ts`
- [ ] **6.5.5**: Implement `createSubscription(userId)` method
  - Calls SafepayService.createSubscription() for PKR 700/month recurring
  - Creates subscriptions record with status = 'pending'
  - Returns Safepay checkout URL
- [ ] **6.5.6**: Implement `getMySubscription(userId)` method
- [ ] **6.5.7**: Implement `handleSubscriptionActivated(safepayData)` method (webhook)
  - Sets status = 'active', sets billing cycle dates
- [ ] **6.5.8**: Implement `handleSubscriptionRenewal(safepayData)` method (webhook)
  - Extends current_period_end by 1 month
- [ ] **6.5.9**: Implement `handleSubscriptionCancelled(safepayData)` method
- [ ] **6.5.10**: Implement `cancelSubscription(userId)` method
- [ ] **6.5.11**: Implement `isSubscriptionActive(userId)` method (used by complaints guard)
- [ ] **6.5.12**: Create `apps/api/src/subscriptions/subscriptions.controller.ts`
  - `POST /api/subscriptions` - Create subscription + get Safepay URL
  - `GET /api/subscriptions/me` - Get my subscription
  - `POST /api/subscriptions/cancel` - Cancel subscription
  - `GET /api/subscriptions` (staff only) - List all subscriptions
- [ ] **6.5.13**: Create subscription DTOs and enums (subscription_status)
- [ ] **6.5.14**: Create `apps/api/src/subscriptions/subscriptions.module.ts`
  - Import PaymentsModule for SafepayService, export SubscriptionsService

### Sub-task 6.6: Complaints Database & Backend (Civic Complaints)

**Context:** Subscribers submit complaints against government orgs (e.g., "CDA is not cleaning sector F8"). Complaints get reference numbers (CMP-YYYY-NNNN) and are tracked: submitted → under_review → escalated → resolved.

- [ ] **6.6.1**: Create `complaints` table via Supabase migration
  - Columns: id (uuid, PK), complaint_number (text, unique, auto-gen: CMP-YYYY-NNNN), client_profile_id (uuid, FK), title (text), description (text), target_organization (text), location (text), category (text), evidence_urls (text[]), status (enum: submitted, under_review, escalated, resolved, closed), assigned_staff_id (uuid, FK, nullable), staff_notes (text), resolution_notes (text), resolved_at (timestamptz), created_at (timestamptz), updated_at (timestamptz)
- [ ] **6.6.2**: Create `generate_complaint_number()` trigger (CMP-YYYY-NNNN)
- [ ] **6.6.3**: Apply trigger + RLS (clients read/create own, staff read all + update status) + updated_at trigger
- [ ] **6.6.4**: Create `apps/api/src/complaints/complaints.service.ts`
- [ ] **6.6.5**: Implement `submitComplaint(userId, createDto)` method
  - Checks active subscription via SubscriptionsService.isSubscriptionActive()
  - Creates complaint record, auto-generates CMP-YYYY-NNNN
- [ ] **6.6.6**: Implement `getMyComplaints(userId, paginationDto)` method
- [ ] **6.6.7**: Implement `getComplaintById(complaintId, userId)` method
- [ ] **6.6.8**: Implement `getAllComplaints(paginationDto, filters)` method (staff only)
  - Filter by status, target_organization, date range
- [ ] **6.6.9**: Implement `updateComplaintStatus(complaintId, status, staffNotes)` method (staff only)
- [ ] **6.6.10**: Implement `assignComplaint(complaintId, staffId)` method (staff only)
- [ ] **6.6.11**: Create `apps/api/src/complaints/complaints.controller.ts`
  - `POST /api/complaints` - Submit complaint (requires active subscription)
  - `GET /api/complaints` - List complaints (client: own, staff: all)
  - `GET /api/complaints/:id` - Complaint detail
  - `PATCH /api/complaints/:id/status` (staff only) - Update status
  - `PATCH /api/complaints/:id/assign` (staff only) - Assign to staff
- [ ] **6.6.12**: Create complaint DTOs (create, update-status) and enums (complaint_status, complaint_category)
- [ ] **6.6.13**: Create `apps/api/src/complaints/complaints.module.ts`
  - Import SubscriptionsModule for active subscription check

### Sub-task 6.7: Service Registrations Database & Backend (Auto Account Creation)

**Context:** Each facilitation service has 1 generic form (name, contact, CNIC, docs upload). Payment + registration auto-creates a user account. No account needed to start the form. Account required only after payment completes.

- [ ] **6.7.1**: Create `service_registrations` table via Supabase migration
  - Columns: id (uuid, PK), reference_number (text, unique, auto-gen: SRV-YYYY-NNNN), service_id (uuid, FK to services), full_name (text), email (text), phone_number (text), cnic (text), address (text), description_of_need (text), payment_status (enum: pending, paid, failed, refunded), safepay_tracker_id (text), safepay_transaction_id (text), status (enum: pending_payment, paid, in_progress, completed, cancelled), client_profile_id (uuid, FK to client_profiles, nullable - set after auto account creation), assigned_staff_id (uuid, FK, nullable), staff_notes (text), created_at (timestamptz), updated_at (timestamptz)
- [ ] **6.7.2**: Add `registration_fee` column to existing `services` table (DECIMAL(10,2))
- [ ] **6.7.3**: Create `generate_service_registration_reference()` trigger (SRV-YYYY-NNNN)
- [ ] **6.7.4**: Apply trigger + RLS + updated_at trigger
  - Public can insert (guest submissions), public can read own by reference_number + email
  - Clients can read own registrations (after account creation), staff can read all + update
- [ ] **6.7.5**: Add `service_registration_id` nullable FK column to `documents` table
- [ ] **6.7.6**: Create `apps/api/src/service-registrations/service-registrations.service.ts`
- [ ] **6.7.7**: Implement `createRegistration(createDto)` method (@Public)
  - Validates service exists and is active, creates record with status = 'pending_payment'
- [ ] **6.7.8**: Implement `initiatePayment(registrationId)` method
  - Fetches service.registration_fee, calls SafepayService.createCheckoutSession()
- [ ] **6.7.9**: Implement `handlePaymentConfirmed(registrationId)` method (webhook)
  - Updates payment_status = 'paid', status = 'paid'
  - Calls createUserAccount() to auto-create user
- [ ] **6.7.10**: Implement `createUserAccount(registration)` method
  - Check if user exists by email → link to existing account if yes
  - If no: create Supabase auth user (auto-generated password) + user_profile (client) + client_profile
  - Link service_registration.client_profile_id
  - Send credentials email via SendGrid
- [ ] **6.7.11**: Implement `uploadDocuments(registrationId, files)` method
  - Uploads to Supabase Storage, creates documents records linked via service_registration_id
- [ ] **6.7.12**: Implement `getRegistrationStatus(referenceNumber, email)` method (@Public)
- [ ] **6.7.13**: Implement `getMyRegistrations(userId, paginationDto)` method
- [ ] **6.7.14**: Implement `getAllRegistrations(paginationDto, filters)` method (staff only)
- [ ] **6.7.15**: Implement `updateRegistrationStatus(registrationId, status, staffNotes)` method (staff only)
- [ ] **6.7.16**: Create `apps/api/src/service-registrations/service-registrations.controller.ts`
  - `POST /api/service-registrations` (@Public) - Submit registration
  - `POST /api/service-registrations/:id/pay` (@Public) - Initiate payment
  - `POST /api/service-registrations/:id/documents` (@Public) - Upload docs
  - `GET /api/service-registrations/status?ref=SRV-2026-0001&email=x` (@Public) - Guest status
  - `GET /api/service-registrations` - List (client: own, staff: all)
  - `GET /api/service-registrations/:id` - Detail
  - `PATCH /api/service-registrations/:id/status` (staff only) - Update status
  - `GET /api/services` (@Public) - List available services with fees
- [ ] **6.7.17**: Create service registration DTOs (create, response, update-status) and enums
- [ ] **6.7.18**: Create `apps/api/src/service-registrations/service-registrations.module.ts`
  - Import PaymentsModule for SafepayService, AuthModule for account creation

### Sub-task 6.8: Frontend - Subscribe Page & Complaints Dashboard

- [ ] **6.8.1**: Create `/subscribe` landing page
  - Explains civic retainer program (PKR 700/month), "Subscribe Now" button
  - If not logged in → redirect to signup, then back to /subscribe
  - If logged in → initiate Safepay subscription checkout
- [ ] **6.8.2**: Create subscription success/cancel return pages
- [ ] **6.8.3**: Create `/client/complaints` page - List complaints with status badges
- [ ] **6.8.4**: Create `/client/complaints/new` page - Complaint form (title, description, target org, location, category, evidence upload)
  - Gated: shows "Active subscription required" message if no subscription
- [ ] **6.8.5**: Create `/client/complaints/:id` page - Complaint detail + status timeline
- [ ] **6.8.6**: Create `/client/subscription` page - View subscription status, cancel button, payment history
- [ ] **6.8.7**: Create `apps/web/lib/api/subscriptions.ts` and `apps/web/lib/api/complaints.ts` API client helpers

### Sub-task 6.9: Frontend - Service Registration Pages

- [ ] **6.9.1**: Create `/services` page - List all services with fees and "Register" buttons
- [ ] **6.9.2**: Create `/services/:slug/register` multi-step form
  - Step 1: Client details (full name, email, phone, CNIC, address)
  - Step 2: Service auto-selected from URL, description of need textarea
  - Step 3: Document upload (drag & drop, multiple files)
  - Step 4: Review + Pay (shows fee from services table, "Pay" → Safepay)
- [ ] **6.9.3**: Create registration success page ("Account created - check email for credentials")
- [ ] **6.9.4**: Create `/client/services` page - List my service registrations + status
- [ ] **6.9.5**: Create `/client/services/:id` page - Registration detail + status timeline + docs
- [ ] **6.9.6**: Add "Register for Service" CTAs to practice area pages
- [ ] **6.9.7**: Create `apps/web/lib/api/service-registrations.ts` API client helpers

### Sub-task 6.10: Frontend - Client Dashboard Enhancements

- [ ] **6.10.1**: Update client dashboard stats to include: Active Subscription badge, Open Complaints count, Service Registrations in_progress count
- [ ] **6.10.2**: Update client sidebar: add Complaints, My Services, Subscription, Payment History links
- [ ] **6.10.3**: Create `/client/payments` page - Payment history across all sources

---

## HEAD TASK 7: Cases Module

### Sub-task 7.1: Create Cases Service

- [ ] **7.1.1**: Create `apps/api/src/cases/cases.service.ts`
- [ ] **7.1.2**: Implement `createCase(createDto)` method
  - Auto-generates case_number via DB trigger
- [ ] **7.1.3**: Implement `getCases(paginationDto, filters, currentUser)` method
  - RLS filtering based on user role
- [ ] **7.1.4**: Implement `getCaseById(caseId, currentUser)` method with RLS check
- [ ] **7.1.5**: Implement `updateCase(caseId, updateDto)` method
- [ ] **7.1.6**: Implement `deleteCase(caseId)` method (admin only)
- [ ] **7.1.7**: Implement `assignAttorney(caseId, attorneyId)` method

### Sub-task 7.2: Create Case Activities Service

- [ ] **7.2.1**: Implement `getCaseActivities(caseId)` method for timeline view
- [ ] **7.2.2**: Implement `addCaseActivity(caseId, activityDto)` method
- [ ] **7.2.3**: Implement auto-activity creation on case status change

### Sub-task 7.3: Create Cases Controller

- [ ] **7.3.1**: Create `apps/api/src/cases/cases.controller.ts`
- [ ] **7.3.2**: Create endpoint: `GET /api/cases`
- [ ] **7.3.3**: Create endpoint: `POST /api/cases` (staff only)
- [ ] **7.3.4**: Create endpoint: `GET /api/cases/:id`
- [ ] **7.3.5**: Create endpoint: `PATCH /api/cases/:id`
- [ ] **7.3.6**: Create endpoint: `DELETE /api/cases/:id` (admin only)
- [ ] **7.3.7**: Create endpoint: `GET /api/cases/:id/activities`
- [ ] **7.3.8**: Create endpoint: `POST /api/cases/:id/activities`
- [ ] **7.3.9**: Create endpoint: `POST /api/cases/:id/assign`

### Sub-task 7.4: Create DTOs

- [ ] **7.4.1**: Create `apps/api/src/cases/dto/create-case.dto.ts`
- [ ] **7.4.2**: Create `apps/api/src/cases/dto/update-case.dto.ts`
- [ ] **7.4.3**: Create `apps/api/src/cases/dto/create-case-activity.dto.ts`
- [ ] **7.4.4**: Create enums for case_status, case_priority, activity_type

### Sub-task 7.5: Create Cases Module

- [ ] **7.5.1**: Create `apps/api/src/cases/cases.module.ts`

---

## HEAD TASK 8: Appointments & Consultation Booking Module

### Sub-task 8.1: Create Appointments Service (Internal)

- [ ] **8.1.1**: Create `apps/api/src/appointments/appointments.service.ts`
- [ ] **8.1.2**: Implement `createAppointment(createDto)` method
- [ ] **8.1.3**: Implement `getAppointments(paginationDto, filters, currentUser)` method
- [ ] **8.1.4**: Implement `getAppointmentById(appointmentId, currentUser)` method
- [ ] **8.1.5**: Implement `updateAppointment(appointmentId, updateDto)` method
- [ ] **8.1.6**: Implement `cancelAppointment(appointmentId)` method
- [ ] **8.1.7**: Implement `confirmAppointment(appointmentId)` method

### Sub-task 8.2: Create Availability Service

- [ ] **8.2.1**: Implement `getAttorneyAvailability(attorneyId)` method
- [ ] **8.2.2**: Implement `getAvailableSlots(attorneyId, dateRange)` method
- [ ] **8.2.3**: Implement `setAvailability(attorneyId, availabilityDto)` method

### Sub-task 8.3: Create Appointments Controller

- [ ] **8.3.1**: Create `apps/api/src/appointments/appointments.controller.ts`
- [ ] **8.3.2**: Create endpoint: `GET /api/appointments`
- [ ] **8.3.3**: Create endpoint: `POST /api/appointments`
- [ ] **8.3.4**: Create endpoint: `GET /api/appointments/:id`
- [ ] **8.3.5**: Create endpoint: `PATCH /api/appointments/:id`
- [ ] **8.3.6**: Create endpoint: `DELETE /api/appointments/:id`
- [ ] **8.3.7**: Create endpoint: `POST /api/appointments/:id/confirm`
- [ ] **8.3.8**: Create endpoint: `GET /api/appointments/availability/:attorneyId`
- [ ] **8.3.9**: Create endpoint: `POST /api/appointments/availability/:attorneyId`

### Sub-task 8.4: Create Appointment DTOs

- [ ] **8.4.1**: Create `apps/api/src/appointments/dto/create-appointment.dto.ts`
- [ ] **8.4.2**: Create `apps/api/src/appointments/dto/update-appointment.dto.ts`
- [ ] **8.4.3**: Create `apps/api/src/appointments/dto/set-availability.dto.ts`
- [ ] **8.4.4**: Create enums for appointment_type, appointment_status

### Sub-task 8.5: Create Appointments Module

- [ ] **8.5.1**: Create `apps/api/src/appointments/appointments.module.ts`

### Sub-task 8.6: Consultation Bookings Database (Guest, No Account)

**Context:** Guest consultation booking flow. No user account created. Client fills intake form → pays PKR 50,000 → Cal.com embedded booking with Mr. Shoaib Razzaq (single event type). Cal.com only accessible after payment confirmed.

- [ ] **8.6.1**: Create `consultation_bookings` table via Supabase migration
  - Columns: id (uuid, PK), reference_number (text, unique, auto-gen: CON-YYYY-NNNN), full_name (text), email (text), phone_number (text), practice_area (text), urgency (enum: low, medium, high, urgent), issue_summary (text), relevant_dates (text), opposing_party (text), additional_notes (text), consultation_fee (decimal, default 50000), payment_status (enum: pending, paid, failed, refunded), safepay_tracker_id (text), safepay_transaction_id (text), calcom_booking_uid (text), calcom_booking_id (text), booking_date (date), booking_time (time), booking_status (enum: pending_payment, payment_confirmed, booked, completed, cancelled, no_show), created_at (timestamptz), updated_at (timestamptz)
- [ ] **8.6.2**: Create `generate_consultation_reference()` trigger (CON-YYYY-NNNN)
- [ ] **8.6.3**: Apply trigger + RLS + updated_at trigger
  - Public can insert (guest submissions), public can read own by reference_number + email
  - Staff can read all bookings

### Sub-task 8.7: Consultation Bookings Backend

- [ ] **8.7.1**: Create `apps/api/src/consultations/consultations.service.ts`
- [ ] **8.7.2**: Implement `createBooking(createDto)` method
  - Validates intake data, creates consultation_bookings record, returns reference_number
- [ ] **8.7.3**: Implement `initiatePayment(bookingId)` method
  - Calls SafepayService.createCheckoutSession() with metadata: `{ type: 'consultation', referenceId: bookingId }`
  - Stores safepay_tracker_id on booking record
- [ ] **8.7.4**: Implement `getBookingStatus(referenceNumber, email)` method (@Public)
  - Guest status polling, verified by email match
- [ ] **8.7.5**: Implement `handlePaymentConfirmed(bookingId)` method (called by Safepay webhook)
  - Updates payment_status = 'paid', booking_status = 'payment_confirmed'
- [ ] **8.7.6**: Implement `handleCalcomWebhook(payload)` method
  - Syncs Cal.com booking details (date, time, meeting link) back to consultation_bookings
  - Updates booking_status = 'booked'
- [ ] **8.7.7**: Implement `getAllBookings(paginationDto, filters)` method (staff only)
- [ ] **8.7.8**: Implement `cancelBooking(bookingId)` method (staff only)

### Sub-task 8.8: Consultation Bookings Controller

- [ ] **8.8.1**: Create `apps/api/src/consultations/consultations.controller.ts`
- [ ] **8.8.2**: Create endpoint: `POST /api/consultations` (@Public) - Create booking with intake data
- [ ] **8.8.3**: Create endpoint: `POST /api/consultations/:id/pay` (@Public) - Initiate Safepay checkout
- [ ] **8.8.4**: Create endpoint: `GET /api/consultations/status?ref=CON-2026-0001&email=x` (@Public) - Guest status
- [ ] **8.8.5**: Create endpoint: `POST /api/consultations/webhook/calcom` (@Public) - Cal.com webhook
- [ ] **8.8.6**: Create endpoint: `GET /api/consultations` (staff only) - List all bookings
- [ ] **8.8.7**: Create endpoint: `GET /api/consultations/:id` (staff only) - Booking detail
- [ ] **8.8.8**: Create endpoint: `PATCH /api/consultations/:id/cancel` (staff only) - Cancel booking

### Sub-task 8.9: Consultation DTOs & Module

- [ ] **8.9.1**: Create `apps/api/src/consultations/dto/create-consultation.dto.ts`
  - Fields: fullName, email, phoneNumber, practiceArea, urgency, issueSummary, relevantDates (opt), opposingParty (opt), additionalNotes (opt)
- [ ] **8.9.2**: Create `apps/api/src/consultations/dto/consultation-response.dto.ts`
- [ ] **8.9.3**: Create enums: consultation_booking_status, consultation_urgency
- [ ] **8.9.4**: Create `apps/api/src/consultations/dto/index.ts` barrel export
- [ ] **8.9.5**: Create `apps/api/src/consultations/consultations.module.ts`
  - Import PaymentsModule for SafepayService

### Sub-task 8.10: Frontend - Consultation Booking Page

- [ ] **8.10.1**: Install Cal.com embed SDK: `pnpm add @calcom/embed-react --filter web`
- [ ] **8.10.2**: Create `/consultation` page with multi-step form layout
- [ ] **8.10.3**: Implement Step 1: Client Details (full name, email, phone) - React Hook Form + Zod
- [ ] **8.10.4**: Implement Step 2: Qualification (practice area dropdown, urgency selector)
- [ ] **8.10.5**: Implement Step 3: Intake Questions (issue summary textarea, relevant dates, opposing party)
- [ ] **8.10.6**: Implement Step 4: Review + Pay ("Pay PKR 50,000" button → Safepay redirect)
- [ ] **8.10.7**: Implement Step 5: Cal.com Embedded Booking (only renders after payment confirmed)
  - Polls `/api/consultations/status`, then shows Cal.com widget
  - Single event type: "Consultation with Mr. Shoaib Razzaq" (no attorney routing)
- [ ] **8.10.8**: Implement Confirmation Page (reference number, booked date/time, email sent)
- [ ] **8.10.9**: Create `apps/web/lib/api/consultations.ts` API client helpers
- [ ] **8.10.10**: Update "BOOK CONSULTATION" button in Navigation.tsx to link to `/consultation`

---

## HEAD TASK 9: Documents Module

### Sub-task 9.1: Create Storage Service

- [ ] **9.1.1**: Create `apps/api/src/storage/storage.service.ts`
- [ ] **9.1.2**: Implement `uploadToStorage(file, bucket, path)` method
- [ ] **9.1.3**: Implement `downloadFromStorage(bucket, path)` method
- [ ] **9.1.4**: Implement `deleteFromStorage(bucket, path)` method
- [ ] **9.1.5**: Implement `getPublicUrl(bucket, path)` method

### Sub-task 9.2: Create Documents Service

- [ ] **9.2.1**: Create `apps/api/src/documents/documents.service.ts`
- [ ] **9.2.2**: Implement `uploadDocument(file, metadata, currentUser)` method
- [ ] **9.2.3**: Implement `getDocuments(paginationDto, filters, currentUser)` method
- [ ] **9.2.4**: Implement `getDocumentById(documentId, currentUser)` method
- [ ] **9.2.5**: Implement `updateDocument(documentId, updateDto)` method
- [ ] **9.2.6**: Implement `deleteDocument(documentId, currentUser)` method
- [ ] **9.2.7**: Implement `downloadDocument(documentId, currentUser)` method

### Sub-task 9.3: Create Documents Controller

- [ ] **9.3.1**: Create `apps/api/src/documents/documents.controller.ts`
- [ ] **9.3.2**: Create endpoint: `POST /api/documents/upload`
- [ ] **9.3.3**: Create endpoint: `GET /api/documents`
- [ ] **9.3.4**: Create endpoint: `GET /api/documents/:id`
- [ ] **9.3.5**: Create endpoint: `PATCH /api/documents/:id`
- [ ] **9.3.6**: Create endpoint: `GET /api/documents/:id/download`
- [ ] **9.3.7**: Create endpoint: `DELETE /api/documents/:id`

### Sub-task 9.4: Create DTOs

- [ ] **9.4.1**: Create `apps/api/src/documents/dto/upload-document.dto.ts`
- [ ] **9.4.2**: Create `apps/api/src/documents/dto/update-document.dto.ts`
- [ ] **9.4.3**: Create enum for document_type

### Sub-task 9.5: Create Documents Module

- [ ] **9.5.1**: Create `apps/api/src/documents/documents.module.ts`

---

## HEAD TASK 10: Payments & Safepay Integration Module

### Sub-task 10.1: Create Invoices Service

- [ ] **10.1.1**: Create `apps/api/src/payments/invoices.service.ts`
- [ ] **10.1.2**: Implement `createInvoice(createDto)` method
- [ ] **10.1.3**: Implement `getInvoices(paginationDto, filters, currentUser)` method
- [ ] **10.1.4**: Implement `getInvoiceById(invoiceId, currentUser)` method
- [ ] **10.1.5**: Implement `updateInvoice(invoiceId, updateDto)` method
- [ ] **10.1.6**: Implement `sendInvoice(invoiceId)` method
- [ ] **10.1.7**: Implement `addInvoiceItem(invoiceId, itemDto)` method
- [ ] **10.1.8**: Implement `calculateInvoiceTotals(invoiceId)` method

### Sub-task 10.2: Create Safepay Integration Service (Shared Layer)

**Context:** Safepay handles 3 payment types: consultation fee (PKR 50,000 one-time), monthly retainer (PKR 700/month recurring), service registration fee (variable one-time). Single webhook endpoint routes by metadata.type.

- [ ] **10.2.1**: Create `apps/api/src/payments/safepay.service.ts`
- [ ] **10.2.2**: Implement `createCheckoutSession(amount, currency, metadata, returnUrl, cancelUrl)` method
  - metadata: `{ type: 'consultation' | 'subscription' | 'service' | 'invoice', referenceId: string }`
  - Returns Safepay checkout URL for redirect
- [ ] **10.2.3**: Implement `createSubscription(planId, customerEmail, metadata)` method
  - For PKR 700/month recurring retainer payments
  - Returns Safepay subscription checkout URL
- [ ] **10.2.4**: Implement `verifyWebhookSignature(payload, signature)` method
  - Validate HMAC signature using SAFEPAY_WEBHOOK_SECRET
- [ ] **10.2.5**: Implement `getPaymentStatus(trackerId)` method
  - Poll Safepay API for current payment status
- [ ] **10.2.6**: Implement `cancelSubscription(safepaySubscriptionId)` method

### Sub-task 10.3: Create Webhook Controller (Central Payment Router)

- [ ] **10.3.1**: Create `apps/api/src/payments/webhook.controller.ts`
- [ ] **10.3.2**: Create endpoint: `POST /api/payments/webhook` (@Public)
  - Verify signature → extract metadata.type → route to correct handler:
    - `consultation` → ConsultationsService.handlePaymentConfirmed()
    - `subscription` → SubscriptionsService.handleSubscriptionActivated/Renewal()
    - `service` → ServiceRegistrationsService.handlePaymentConfirmed()
    - `invoice` → InvoicesService.handlePaymentReceived()
- [ ] **10.3.3**: Implement payment failure routing (same metadata.type dispatch)
- [ ] **10.3.4**: Implement subscription lifecycle handlers (cancelled, expired, renewal_failed)
- [ ] **10.3.5**: Add idempotency check (prevent duplicate webhook processing)

### Sub-task 10.4: Create Payments Controller

- [ ] **10.4.1**: Create `apps/api/src/payments/payments.controller.ts`
- [ ] **10.4.2**: Create endpoint: `GET /api/invoices`
- [ ] **10.4.3**: Create endpoint: `POST /api/invoices`
- [ ] **10.4.4**: Create endpoint: `GET /api/invoices/:id`
- [ ] **10.4.5**: Create endpoint: `PATCH /api/invoices/:id`
- [ ] **10.4.6**: Create endpoint: `POST /api/invoices/:id/send`
- [ ] **10.4.7**: Create endpoint: `POST /api/payments/checkout` - Generic checkout initiation
- [ ] **10.4.8**: Create endpoint: `GET /api/payments/:id` - Payment detail
- [ ] **10.4.9**: Create endpoint: `GET /api/payments/history` - Aggregated payment history across all sources (consultations, subscriptions, services, invoices)

### Sub-task 10.5: Create Payment DTOs

- [ ] **10.5.1**: Create `apps/api/src/payments/dto/create-invoice.dto.ts`
- [ ] **10.5.2**: Create `apps/api/src/payments/dto/update-invoice.dto.ts`
- [ ] **10.5.3**: Create `apps/api/src/payments/dto/create-invoice-item.dto.ts`
- [ ] **10.5.4**: Create `apps/api/src/payments/dto/create-checkout.dto.ts`
  - Fields: amount, currency (default 'PKR'), metadata (type + referenceId), returnUrl, cancelUrl
- [ ] **10.5.5**: Create `apps/api/src/payments/dto/webhook-payload.dto.ts`
  - Safepay webhook payload structure
- [ ] **10.5.6**: Create enums for invoice_status, payment_status, payment_method

### Sub-task 10.6: Create Payments Module

- [ ] **10.6.1**: Create `apps/api/src/payments/payments.module.ts`
  - Register SafepayService, WebhookController, PaymentsController, InvoicesService
  - Export SafepayService for use by ConsultationsModule, SubscriptionsModule, ServiceRegistrationsModule

### Sub-task 10.7: Frontend Payment Components

- [ ] **10.7.1**: Create `apps/web/lib/api/payments.ts` API client helpers
  - `createCheckoutSession(data)` → returns Safepay redirect URL
  - `pollPaymentStatus(trackerId)` → polls until completed/failed
  - `getPaymentHistory()` → aggregated payment list
- [ ] **10.7.2**: Create `apps/web/components/payment/payment-status.tsx`
  - Loading/polling state while awaiting payment confirmation
  - Success/failure display with next-step navigation
- [ ] **10.7.3**: Create `/payment/success` and `/payment/cancel` return pages
  - Parse URL params to determine which flow (consultation/subscription/service) and show appropriate next step

---

## HEAD TASK 11: Content Module

### Sub-task 11.1: Create Blog Service

- [ ] **11.1.1**: Create `apps/api/src/content/blog.service.ts`
- [ ] **11.1.2**: Implement `createBlogPost(createDto)` method
- [ ] **11.1.3**: Implement `updateBlogPost(postId, updateDto)` method
- [ ] **11.1.4**: Implement `deleteBlogPost(postId)` method
- [ ] **11.1.5**: Implement `getPublishedPosts(paginationDto, filters)` method
- [ ] **11.1.6**: Implement `getPostBySlug(slug)` method
- [ ] **11.1.7**: Implement `getAllPosts(paginationDto)` method

### Sub-task 11.2: Create Testimonials Service

- [ ] **11.2.1**: Create `apps/api/src/content/testimonials.service.ts`
- [ ] **11.2.2**: Implement `submitTestimonial(createDto, currentUser)` method
- [ ] **11.2.3**: Implement `getApprovedTestimonials(paginationDto)` method
- [ ] **11.2.4**: Implement `getAllTestimonials(paginationDto)` method
- [ ] **11.2.5**: Implement `approveTestimonial(testimonialId)` method
- [ ] **11.2.6**: Implement `rejectTestimonial(testimonialId)` method

### Sub-task 11.3: Create Legal News Service

- [ ] **11.3.1**: Create `apps/api/src/content/legal-news.service.ts`
- [ ] **11.3.2**: Implement `createNewsItem(createDto)` method
- [ ] **11.3.3**: Implement `getLatestNews(limit)` method
- [ ] **11.3.4**: Implement news ticker integration

### Sub-task 11.4: Create Content Controllers

- [ ] **11.4.1**: Create `apps/api/src/content/blog.controller.ts`
- [ ] **11.4.2**: Create endpoint: `GET /api/blog/posts`
- [ ] **11.4.3**: Create endpoint: `GET /api/blog/posts/:slug`
- [ ] **11.4.4**: Create endpoint: `POST /api/blog/posts`
- [ ] **11.4.5**: Create endpoint: `PATCH /api/blog/posts/:id`
- [ ] **11.4.6**: Create endpoint: `DELETE /api/blog/posts/:id`
- [ ] **11.4.7**: Create `apps/api/src/content/testimonials.controller.ts`
- [ ] **11.4.8**: Create endpoint: `GET /api/testimonials`
- [ ] **11.4.9**: Create endpoint: `POST /api/testimonials`
- [ ] **11.4.10**: Create endpoint: `POST /api/testimonials/:id/approve`
- [ ] **11.4.11**: Create endpoint: `POST /api/testimonials/:id/reject`

### Sub-task 11.5: Create DTOs

- [ ] **11.5.1**: Create `apps/api/src/content/dto/create-blog-post.dto.ts`
- [ ] **11.5.2**: Create `apps/api/src/content/dto/update-blog-post.dto.ts`
- [ ] **11.5.3**: Create `apps/api/src/content/dto/create-testimonial.dto.ts`
- [ ] **11.5.4**: Create enums for post_status

### Sub-task 11.6: Create Content Module

- [ ] **11.6.1**: Create `apps/api/src/content/content.module.ts`

---

## HEAD TASK 12: Admin Module

### Sub-task 12.1: Create Dashboard Service

- [ ] **12.1.1**: Create `apps/api/src/admin/dashboard.service.ts`
- [ ] **12.1.2**: Implement `getDashboardStats()` method
- [ ] **12.1.3**: Implement `getRecentActivities(limit)` method
- [ ] **12.1.4**: Implement `getRevenueAnalytics(dateRange)` method
- [ ] **12.1.5**: Implement `getCaseAnalytics()` method

### Sub-task 12.2: Create Client Interactions Service

- [ ] **12.2.1**: Create `apps/api/src/admin/client-interactions.service.ts`
- [ ] **12.2.2**: Implement `logInteraction(createDto, currentUser)` method
- [ ] **12.2.3**: Implement `getClientInteractions(clientId, paginationDto)` method
- [ ] **12.2.4**: Implement `getUpcomingInteractions(paginationDto)` method
- [ ] **12.2.5**: Implement `updateInteraction(interactionId, updateDto)` method
- [ ] **12.2.6**: Implement `completeInteraction(interactionId)` method

### Sub-task 12.3: Create Activity Logs Service

- [ ] **12.3.1**: Create `apps/api/src/admin/activity-logs.service.ts`
- [ ] **12.3.2**: Implement `createActivityLog()` method
- [ ] **12.3.3**: Implement `getActivityLogs(paginationDto, filters)` method
- [ ] **12.3.4**: Create middleware to auto-log API requests

### Sub-task 12.4: Create Admin Controllers

- [ ] **12.4.1**: Create `apps/api/src/admin/admin.controller.ts`
- [ ] **12.4.2**: Create endpoint: `GET /api/admin/dashboard`
- [ ] **12.4.3**: Create endpoint: `GET /api/admin/dashboard/revenue-analytics`
- [ ] **12.4.4**: Create endpoint: `GET /api/admin/dashboard/case-analytics`
- [ ] **12.4.5**: Create endpoint: `GET /api/admin/activity-logs`
- [ ] **12.4.6**: Create endpoint: `GET /api/admin/clients/:id/interactions`
- [ ] **12.4.7**: Create endpoint: `POST /api/admin/clients/:id/interactions`
- [ ] **12.4.8**: Create endpoint: `GET /api/admin/interactions/upcoming`
- [ ] **12.4.9**: Apply @Roles('admin', 'staff') to all endpoints

### Sub-task 12.5: Create DTOs

- [ ] **12.5.1**: Create `apps/api/src/admin/dto/create-interaction.dto.ts`
- [ ] **12.5.2**: Create `apps/api/src/admin/dto/update-interaction.dto.ts`
- [ ] **12.5.3**: Create enums for interaction_type

### Sub-task 12.6: Create Admin Module

- [ ] **12.6.1**: Create `apps/api/src/admin/admin.module.ts`

### Sub-task 12.7: Admin Dashboard Stats Enhancement

- [ ] **12.7.1**: Update DashboardService with new stat queries:
  - Total Subscribers count, Open Complaints count, Pending Service Registrations count, Pending Consultations count
- [ ] **12.7.2**: Update `GET /api/admin/dashboard` response to include new stats

### Sub-task 12.8: Frontend - Admin Management Views

- [ ] **12.8.1**: Create `/admin/complaints` page - All complaints list with filters (status, org, date range)
- [ ] **12.8.2**: Create `/admin/complaints/:id` page - Complaint detail + status update form + assign to staff
- [ ] **12.8.3**: Create `/admin/subscriptions` page - All subscriptions list with status
- [ ] **12.8.4**: Create `/admin/service-registrations` page - All registrations with filters
- [ ] **12.8.5**: Create `/admin/service-registrations/:id` page - Detail + status update + assign staff
- [ ] **12.8.6**: Create `/admin/consultations` page - All consultation bookings with filters
- [ ] **12.8.7**: Create `/admin/consultations/:id` page - Booking detail + status
- [ ] **12.8.8**: Update admin sidebar: add Complaints, Subscriptions, Service Registrations, Consultations links

---

## HEAD TASK 13: Testing & Validation

### Sub-task 13.1: Write Unit Tests

- [ ] **13.1.1**: Write tests for AuthService
- [ ] **13.1.2**: Write tests for CasesService
- [ ] **13.1.3**: Write tests for PaymentsService
- [ ] **13.1.4**: Write tests for DocumentsService
- [ ] **13.1.5**: Write tests for AppointmentsService

### Sub-task 13.2: Write Integration Tests

- [ ] **13.2.1**: Test complete auth flow
- [ ] **13.2.2**: Test case management flow
- [ ] **13.2.3**: Test appointment booking flow
- [ ] **13.2.4**: Test document upload flow
- [ ] **13.2.5**: Test invoice payment flow

### Sub-task 13.3: Test RLS Policies

- [ ] **13.3.1**: Verify clients can only access their own data
- [ ] **13.3.2**: Verify staff can access all client data
- [ ] **13.3.3**: Verify admin has full access
- [ ] **13.3.4**: Verify unauthorized users get 403 errors
- [ ] **13.3.5**: Test RLS on all tables

### Sub-task 13.4: Test API Endpoints

- [ ] **13.4.1**: Test all auth endpoints
- [ ] **13.4.2**: Test all CRUD endpoints
- [ ] **13.4.3**: Test pagination and filtering
- [ ] **13.4.4**: Test error handling
- [ ] **13.4.5**: Test validation errors

### Sub-task 13.5: Load Testing & Performance

- [ ] **13.5.1**: Test database query performance
- [ ] **13.5.2**: Test API response times
- [ ] **13.5.3**: Test file upload performance
- [ ] **13.5.4**: Test concurrent operations

---

## Verification Checklist

### Phase 1: Environment & Database

- [ ] All dependencies installed
- [ ] Backend starts without errors
- [ ] Supabase connection working
- [ ] All tables exist (including new: consultation_bookings, subscriptions, complaints, service_registrations)
- [ ] RLS enabled on all tables
- [ ] Triggers and functions created (including CON-YYYY-NNNN, CMP-YYYY-NNNN, SRV-YYYY-NNNN)

### Phase 2: Authentication

- [ ] Signup creates user and returns JWT
- [ ] Signin returns valid JWT
- [ ] Get current user works
- [ ] Invalid token returns 401

### Phase 3: Core Features

- [ ] Create client works
- [ ] Create case works (case_number generated)
- [ ] Create appointment works
- [ ] Upload document works
- [ ] Create invoice works (invoice_number generated)

### Phase 4: Client-Facing Features

- [ ] Consultation booking flow works end-to-end (guest → intake → pay → Cal.com → confirmation)
- [ ] Cal.com embed only shows after payment confirmed
- [ ] Subscription creation + Safepay recurring checkout works
- [ ] Complaint submission gated behind active subscription
- [ ] Complaint status tracking works (submitted → under_review → escalated → resolved)
- [ ] Service registration form works (guest → details → docs → pay)
- [ ] Auto account creation on service registration payment
- [ ] Credentials email sent after auto account creation

### Phase 5: Safepay Integration

- [ ] One-time checkout works (consultation, service fees)
- [ ] Recurring subscription works (monthly retainer)
- [ ] Webhook signature verification works
- [ ] Webhook routes correctly by metadata.type
- [ ] Payment failure handling works
- [ ] Subscription lifecycle (activate, renew, cancel) works
- [ ] Idempotency prevents duplicate webhook processing

### Phase 6: RLS & Security

- [ ] Clients see only own data
- [ ] Attorneys see assigned data
- [ ] Admin sees all data
- [ ] Access control enforced
- [ ] Guest endpoints (@Public) don't leak data (consultation status requires email match)
- [ ] Subscription check prevents unauthorized complaint submission

### Phase 7: Testing

- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Safepay webhook works for all payment types
- [ ] Cal.com webhook syncs booking data
- [ ] Email notifications work (credentials, confirmations)

---

## Critical Notes

1. **Database First**: Create tables before services
2. **RLS Critical**: All ops fail without RLS
3. **Service Role Key**: Backend only
4. **500 Line Limit**: Split large files
5. **JSDoc Required**: Document exports
6. **Test Alongside**: Don't test after
7. **No .env Commits**: Use .env.example
8. **Guest Endpoints**: Consultation + Service Registration endpoints are @Public - verify no data leaks
9. **Payment Before Access**: Cal.com embed must NEVER render before payment confirmation
10. **Subscription Guard**: Complaint submission must verify active subscription status on every request

---

## Estimated Timeline

- Phase 1-2 (Environment + Auth): 3-4 days ✅ DONE
- Phase 3-4 (Users, Clients, Cases): 4-5 days
- Phase 5-6 (Appointments + Consultation Booking): 4-5 days
- Phase 7-8 (Documents + Payments/Safepay): 5-6 days
- Phase 9 (Subscriptions + Complaints): 3-4 days
- Phase 10 (Service Registrations): 3-4 days
- Phase 11-12 (Content + Admin): 4-5 days
- Phase 13 (Testing): 3-4 days
- Frontend pages for all features: 5-7 days (parallel with backend)

**Total**: 30-40 days
