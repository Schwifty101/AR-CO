# HEAD TASK 15: Audit & Activity Logs — Design

**Date:** 2026-03-03
**Status:** Approved

## Problem

Admin write operations across ~40 routes (clients, cases, complaints, users, service registrations, consultations, content) have no audit trail. The `activity_logs` table exists in Supabase but is only used for auth events (signup, signin, password reset). There is no frontend UI to view activity logs.

## Requirements

- **Scope:** Log all write operations (POST, PATCH, DELETE) on admin-accessible routes
- **Architecture:** NestJS Interceptor — automatic, zero changes to existing controllers
- **Frontend:** Full-featured table at `/admin/audit-logs` with filters (user, action, entity type, date range)
- **Auth migration:** Refactor AuthService to use the unified AuditService
- **Access:** Admin + Attorney roles only (hierarchy: Admin > Attorney > Staff)
- **Retention:** Keep indefinitely

## Existing Infrastructure

### `activity_logs` table (already exists, no migration needed)

```sql
CREATE TABLE "public"."activity_logs" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "action" text NOT NULL,
    "entity_type" text NOT NULL,
    "entity_id" uuid,
    "metadata" jsonb DEFAULT '{}',
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

### Current auth logging (AuthService.logAuthEvent)

Writes directly to `activity_logs` for: signup, signin, OAuth, email confirmation, password reset, token refresh, signout. Will be refactored to use AuditService.

## Architecture

### Component Overview

```
Request (POST/PATCH/DELETE)
    │
    ▼
JwtAuthGuard → RolesGuard → Controller Handler
    │                              │
    │                              ▼ (response)
    │                        AuditInterceptor
    │                              │
    │                        AuditService.log()
    │                              │
    │                        activity_logs table
    ▼
Response to client
```

### AuditInterceptor (Global NestJS Interceptor)

- Fires **after** the controller handler succeeds (in the `tap` operator of the Observable pipeline)
- Skips GET/OPTIONS/HEAD requests
- Skips routes decorated with `@SkipAudit()` (escape hatch)
- Extracts from request: user, HTTP method, route path, params (entity ID), body, IP, user agent
- Maps HTTP method + route to human-readable action and entity type
- Writes asynchronously — never blocks the response
- Errors in audit logging are caught and logged via NestJS Logger, never propagated

### AuditService

```typescript
@Injectable()
export class AuditService {
  log(entry: CreateAuditLogDto): Promise<void>     // Write single entry
  findAll(filters: AuditLogFiltersDto): Promise<PaginatedResponse<AuditLogResponse>>  // Query with filters
  getDistinctUsers(): Promise<{ id: string; name: string }[]>  // For filter dropdown
}
```

### AuditController

```
GET /api/audit-logs                    @Roles(ADMIN, ATTORNEY)
GET /api/audit-logs/users              @Roles(ADMIN, ATTORNEY)  — distinct users for filter dropdown
```

### Route-to-Action Mapping

The interceptor maps routes to semantic actions:

| HTTP Method | Route Pattern | Action | Entity Type |
|-------------|--------------|--------|-------------|
| POST | /api/users/invite | INVITE | user |
| DELETE | /api/users/:id | DELETE | user |
| POST | /api/clients | CREATE | client |
| PATCH | /api/clients/:id | UPDATE | client |
| DELETE | /api/clients/:id | DELETE | client |
| POST | /api/cases | CREATE | case |
| PATCH | /api/cases/:id | UPDATE | case |
| PATCH | /api/cases/:id/status | STATUS_CHANGE | case |
| PATCH | /api/cases/:id/assign | ASSIGN | case |
| DELETE | /api/cases/:id | DELETE | case |
| POST | /api/cases/:id/activities | ADD_ACTIVITY | case |
| PATCH | /api/complaints/:id/status | STATUS_CHANGE | complaint |
| PATCH | /api/complaints/:id/assign | ASSIGN | complaint |
| PATCH | /api/service-registrations/:id/status | STATUS_CHANGE | service_registration |
| PATCH | /api/service-registrations/:id/assign | ASSIGN | service_registration |
| PATCH | /api/consultations/:id/cancel | CANCEL | consultation |
| POST | /api/content/posts | CREATE | blog_post |
| PATCH | /api/content/posts/:id | UPDATE | blog_post |
| DELETE | /api/content/posts/:id | DELETE | blog_post |
| POST | /api/content/categories | CREATE | blog_category |
| PATCH | /api/content/categories/:id | UPDATE | blog_category |
| DELETE | /api/content/categories/:id | DELETE | blog_category |

### Metadata Captured

The `metadata` jsonb column stores:

```json
{
  "route": "/api/cases/uuid/assign",
  "method": "PATCH",
  "body": { "attorneyProfileId": "uuid" },
  "params": { "id": "uuid" },
  "response_status": 200
}
```

Sensitive fields (passwords, tokens) are stripped before storing.

### Auth Event Migration

Refactor `AuthService.logAuthEvent()` to call `AuditService.log()`:

| Auth Event | Action | Entity Type |
|-----------|--------|-------------|
| Signup | SIGNUP | auth |
| Signin | SIGNIN | auth |
| OAuth | OAUTH_LOGIN | auth |
| Email confirm | EMAIL_CONFIRM | auth |
| Password reset | PASSWORD_RESET | auth |
| Token refresh | TOKEN_REFRESH | auth |
| Signout | SIGNOUT | auth |

## Shared Package (Schemas & Types)

### Zod Schemas (`packages/shared/src/schemas/audit.schemas.ts`)

- `AuditLogResponseSchema` — shape of a single audit log entry
- `AuditLogFiltersSchema` — query params for filtering (userId, action, entityType, dateFrom, dateTo)
- `AuditLogListResponseSchema` — paginated list response
- `AuditActionEnum` — CREATE, UPDATE, DELETE, STATUS_CHANGE, ASSIGN, INVITE, CANCEL, ADD_ACTIVITY, SIGNUP, SIGNIN, OAUTH_LOGIN, EMAIL_CONFIRM, PASSWORD_RESET, TOKEN_REFRESH, SIGNOUT
- `AuditEntityTypeEnum` — user, client, case, complaint, service_registration, consultation, blog_post, blog_category, auth

### Types (`packages/shared/src/types/audit.types.ts`)

TypeScript interfaces inferred from Zod schemas.

## Frontend

### Page: `/admin/audit-logs`

- **Access:** Admin + Attorney only (sidebar link hidden for Staff)
- **Table columns:**
  - Timestamp (formatted relative + absolute on hover)
  - User (name, avatar/initials)
  - Action (color-coded badge: green=create, blue=update, red=delete, yellow=status change, purple=assign)
  - Entity Type (badge)
  - Entity ID (truncated UUID, links to entity detail page where applicable)
  - IP Address
- **Filters (above table):**
  - User dropdown (fetched from `/api/audit-logs/users`)
  - Action multi-select
  - Entity type multi-select
  - Date range picker (from/to)
- **Pagination:** Offset-based, 25 per page
- **Row expansion:** Click to expand and see full metadata JSON in a formatted code block

### API Client (`apps/web/lib/api/audit-logs.ts`)

- `getAuditLogs(filters)` — paginated query
- `getAuditLogUsers()` — distinct users for filter dropdown

### Sidebar Update

Add "Audit Logs" link in admin sidebar, visible when `userType === 'admin' || userType === 'attorney'`. Position after "Content" in the sidebar order.

## Database Indexes

Add index for common query patterns (if not already present):

```sql
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs (entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs (action);
```

## What This Does NOT Include

- Read (GET) request logging — only write operations
- Client-side activity tracking — only server-side admin actions
- Log retention/archival — keep indefinitely for now
- Real-time log streaming — standard request/response query
- Log export (CSV/JSON) — can be added later
