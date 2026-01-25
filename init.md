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

- [X] **1.1.1**: Install Supabase client (`@supabase/supabase-js`)
- [X] **1.1.2**: Install validation packages (`class-validator`, `class-transformer`, `joi`)
- [X] 
      **1.1.3**: Install authentication packages (`@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`)
- [X] **1.1.4**: Install security packages (`bcrypt`, `@types/bcrypt`)
- [X] **1.1.5**: Install file upload packages (`multer`, `@types/multer`, `@nestjs/platform-express`)
- [X] **1.1.6**: Install utility packages (`axios`, `dayjs`, `uuid`)
- [X] **1.1.7**: Install email service packages (`@sendgrid/mail`)
- [X] **1.1.8**: Install logging packages (`winston`, `nest-winston`)

### Sub-task 1.2: Create Environment Configuration

- [X] **1.2.1**: Create `.env` file with Supabase credentials (URL, anon key, service role key)
- [X] **1.2.2**: Add JWT configuration (secret, access token expiration, refresh token expiration)
- [X] **1.2.3**: Add Safepay configuration (API key, environment, webhook secret)
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
- [X] **2.4.3**: Create `payments` table with Safepay integration
  - Columns: id (uuid), invoice_id (FK), client_profile_id (FK), amount, payment_method (enum), safepay_transaction_id, safepay_tracker_id, status (enum), payment_date, metadata (jsonb), created_at, updated_at

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

## HEAD TASK 4: Authentication Module

### Sub-task 4.1: Create Auth Service

- [ ] **4.1.1**: Create `apps/api/src/auth/auth.service.ts`
- [ ] **4.1.2**: Implement `signUp(signUpDto)` method
  - Create user in Supabase Auth
  - Create user_profile record
  - Return JWT tokens
- [ ] **4.1.3**: Implement `signIn(signInDto)` method
  - Validate email/password with Supabase
  - Return JWT tokens
- [ ] **4.1.4**: Implement `signOut(userId)` method
  - Invalidate refresh token in Supabase
- [ ] **4.1.5**: Implement `refreshToken(refreshToken)` method
  - Exchange refresh token for new access token
- [ ] **4.1.6**: Implement `forgotPassword(email)` method
  - Send password reset email via Supabase
- [ ] **4.1.7**: Implement `resetPassword(token, newPassword)` method
  - Reset password with token

### Sub-task 4.2: Create Auth Controller

- [ ] **4.2.1**: Create `apps/api/src/auth/auth.controller.ts`
- [ ] **4.2.2**: Create endpoint: `POST /api/auth/signup`
- [ ] **4.2.3**: Create endpoint: `POST /api/auth/signin`
- [ ] **4.2.4**: Create endpoint: `POST /api/auth/signout`
- [ ] **4.2.5**: Create endpoint: `POST /api/auth/refresh-token`
- [ ] **4.2.6**: Create endpoint: `POST /api/auth/forgot-password`
- [ ] **4.2.7**: Create endpoint: `POST /api/auth/reset-password`
- [ ] **4.2.8**: Create endpoint: `GET /api/auth/me` (returns current user profile)

### Sub-task 4.3: Create DTOs & Validation

- [ ] **4.3.1**: Create `apps/api/src/auth/dto/sign-up.dto.ts`
  - Fields: email, password, fullName
  - Validators: IsEmail, MinLength(8) for password
- [ ] **4.3.2**: Create `apps/api/src/auth/dto/sign-in.dto.ts`
  - Fields: email, password
- [ ] **4.3.3**: Create `apps/api/src/auth/dto/reset-password.dto.ts`
  - Fields: token, newPassword
- [ ] **4.3.4**: Create `apps/api/src/auth/dto/refresh-token.dto.ts`
  - Fields: refreshToken

### Sub-task 4.4: Create Auth Module

- [ ] **4.4.1**: Create `apps/api/src/auth/auth.module.ts`
  - Import PassportModule, JwtModule
  - Register AuthService, AuthController

---

## HEAD TASK 5: Users & Profiles Module

### Sub-task 5.1: Create Users Service

- [ ] **5.1.1**: Create `apps/api/src/users/users.service.ts`
- [ ] **5.1.2**: Implement `getUserProfile(userId)` method with RLS
- [ ] **5.1.3**: Implement `updateUserProfile(userId, updateDto)` method
- [ ] **5.1.4**: Implement `deleteUser(userId)` method (admin only)
- [ ] **5.1.5**: Implement `getAllUsers(paginationDto)` method (staff only)

### Sub-task 5.2: Create Users Controller

- [ ] **5.2.1**: Create `apps/api/src/users/users.controller.ts`
- [ ] **5.2.2**: Create endpoint: `GET /api/users/profile` (current user)
- [ ] **5.2.3**: Create endpoint: `PATCH /api/users/profile` (update own profile)
- [ ] **5.2.4**: Create endpoint: `GET /api/users` (staff only, with pagination)
- [ ] **5.2.5**: Apply @UseGuards(AuthGuard, RolesGuard) and @Roles() decorators

### Sub-task 5.3: Create Profile DTOs

- [ ] **5.3.1**: Create `apps/api/src/users/dto/update-user-profile.dto.ts`
  - Optional fields: fullName, phoneNumber
- [ ] **5.3.2**: Create `apps/api/src/users/dto/create-client-profile.dto.ts`
  - Fields: companyName, companyType, taxId, address, city, country
- [ ] **5.3.3**: Create `apps/api/src/users/dto/update-client-profile.dto.ts`
  - All fields optional
- [ ] **5.3.4**: Create `apps/api/src/users/dto/create-attorney-profile.dto.ts`
  - Fields: barNumber, specializations, education, experienceYears, hourlyRate
- [ ] **5.3.5**: Create `apps/api/src/users/dto/update-attorney-profile.dto.ts`
  - All fields optional

### Sub-task 5.4: Create Users Module

- [ ] **5.4.1**: Create `apps/api/src/users/users.module.ts`
  - Register UsersService, UsersController

---

## HEAD TASK 6: Clients Module

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

## HEAD TASK 8: Appointments Module

### Sub-task 8.1: Create Appointments Service

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

### Sub-task 8.4: Create DTOs

- [ ] **8.4.1**: Create `apps/api/src/appointments/dto/create-appointment.dto.ts`
- [ ] **8.4.2**: Create `apps/api/src/appointments/dto/update-appointment.dto.ts`
- [ ] **8.4.3**: Create `apps/api/src/appointments/dto/set-availability.dto.ts`
- [ ] **8.4.4**: Create enums for appointment_type, appointment_status

### Sub-task 8.5: Create Appointments Module

- [ ] **8.5.1**: Create `apps/api/src/appointments/appointments.module.ts`

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

## HEAD TASK 10: Payments Module

### Sub-task 10.1: Create Invoices Service

- [ ] **10.1.1**: Create `apps/api/src/payments/invoices.service.ts`
- [ ] **10.1.2**: Implement `createInvoice(createDto)` method
- [ ] **10.1.3**: Implement `getInvoices(paginationDto, filters, currentUser)` method
- [ ] **10.1.4**: Implement `getInvoiceById(invoiceId, currentUser)` method
- [ ] **10.1.5**: Implement `updateInvoice(invoiceId, updateDto)` method
- [ ] **10.1.6**: Implement `sendInvoice(invoiceId)` method
- [ ] **10.1.7**: Implement `addInvoiceItem(invoiceId, itemDto)` method
- [ ] **10.1.8**: Implement `calculateInvoiceTotals(invoiceId)` method

### Sub-task 10.2: Create Safepay Integration Service

- [ ] **10.2.1**: Create `apps/api/src/payments/safepay.service.ts`
- [ ] **10.2.2**: Implement `createCheckoutSession(invoiceId, amount)` method
- [ ] **10.2.3**: Implement `verifyWebhookSignature(payload, signature)` method
- [ ] **10.2.4**: Implement `handlePaymentSuccess(safepayData)` method
- [ ] **10.2.5**: Implement `handlePaymentFailed(safepayData)` method
- [ ] **10.2.6**: Implement `getPaymentStatus(trackerId)` method

### Sub-task 10.3: Create Payments Controller

- [ ] **10.3.1**: Create `apps/api/src/payments/payments.controller.ts`
- [ ] **10.3.2**: Create endpoint: `GET /api/invoices`
- [ ] **10.3.3**: Create endpoint: `POST /api/invoices`
- [ ] **10.3.4**: Create endpoint: `GET /api/invoices/:id`
- [ ] **10.3.5**: Create endpoint: `PATCH /api/invoices/:id`
- [ ] **10.3.6**: Create endpoint: `POST /api/invoices/:id/send`
- [ ] **10.3.7**: Create endpoint: `POST /api/payments/checkout`
- [ ] **10.3.8**: Create endpoint: `POST /api/payments/webhook`
- [ ] **10.3.9**: Create endpoint: `GET /api/payments/:id`

### Sub-task 10.4: Create DTOs

- [ ] **10.4.1**: Create `apps/api/src/payments/dto/create-invoice.dto.ts`
- [ ] **10.4.2**: Create `apps/api/src/payments/dto/update-invoice.dto.ts`
- [ ] **10.4.3**: Create `apps/api/src/payments/dto/create-invoice-item.dto.ts`
- [ ] **10.4.4**: Create `apps/api/src/payments/dto/create-checkout.dto.ts`
- [ ] **10.4.5**: Create enums for invoice_status, payment_status, payment_method

### Sub-task 10.5: Create Payments Module

- [ ] **10.5.1**: Create `apps/api/src/payments/payments.module.ts`

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
- [ ] All tables exist
- [ ] RLS enabled on all tables
- [ ] Triggers and functions created

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

### Phase 4: RLS & Security

- [ ] Clients see only own data
- [ ] Attorneys see assigned data
- [ ] Admin sees all data
- [ ] Access control enforced

### Phase 5: Testing

- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Safepay webhook works
- [ ] Email notifications work

---

## Critical Notes

1. **Database First**: Create tables before services
2. **RLS Critical**: All ops fail without RLS
3. **Service Role Key**: Backend only
4. **500 Line Limit**: Split large files
5. **JSDoc Required**: Document exports
6. **Test Alongside**: Don't test after
7. **No .env Commits**: Use .env.example

---

## Estimated Timeline

- Phase 1-2: 3-4 days
- Phase 3-4: 2-3 days
- Phase 5-8: 6-8 days
- Phase 9-11: 4-5 days
- Phase 12-13: 3-4 days

**Total**: 18-24 days
