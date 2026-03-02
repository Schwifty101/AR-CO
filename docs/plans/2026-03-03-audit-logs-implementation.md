# Audit & Activity Logs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive audit logging system that automatically captures all admin write operations via NestJS interceptor, provides a filterable frontend viewer, and unifies existing auth event logging.

**Architecture:** Global NestJS interceptor fires after successful POST/PATCH/DELETE handlers, extracts user/action/entity/IP/UA metadata, writes to existing `activity_logs` table via a centralized `AuditService`. Frontend table at `/admin/audit-logs` with filters for user, action, entity type, and date range.

**Tech Stack:** NestJS interceptor + service, Supabase (existing `activity_logs` table), Zod schemas in `@repo/shared`, Next.js page with shadcn/ui Table + Select + DatePicker components.

**Design doc:** `docs/plans/2026-03-03-audit-logs-design.md`

---

## Task 1: Shared Package — Audit Enums

**Files:**
- Modify: `packages/shared/src/enums.ts`

**Step 1: Add AuditAction enum**

Add to the bottom of `packages/shared/src/enums.ts`:

```typescript
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
```

**Step 2: Verify shared package builds**

Run: `cd "/Users/sobanahmad/Work/AR&CO/AR-CO" && pnpm --filter shared build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/shared/src/enums.ts
git commit -m "feat(shared): add AuditAction and AuditEntityType enums"
```

---

## Task 2: Shared Package — Audit Zod Schemas & Types

**Files:**
- Create: `packages/shared/src/schemas/audit.schemas.ts`
- Create: `packages/shared/src/types/audit.types.ts`
- Modify: `packages/shared/src/schemas/index.ts`
- Modify: `packages/shared/src/types/index.ts`

**Step 1: Create audit schemas**

Create `packages/shared/src/schemas/audit.schemas.ts`:

```typescript
import { z } from 'zod';

/**
 * Schema for a single audit log entry response
 *
 * @example
 * ```typescript
 * const log = AuditLogResponseSchema.parse(data);
 * console.log(log.action, log.entityType);
 * ```
 */
export const AuditLogResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().uuid().nullable(),
  metadata: z.record(z.unknown()).default({}),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
  /** Joined user info — only present in list queries */
  userName: z.string().nullable().optional(),
  userEmail: z.string().nullable().optional(),
});

/**
 * Schema for audit log query filters
 *
 * @example
 * ```typescript
 * const filters = AuditLogFiltersSchema.parse(req.query);
 * ```
 */
export const AuditLogFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

/**
 * Schema for paginated audit log list response
 *
 * @example
 * ```typescript
 * const response = PaginatedAuditLogsResponseSchema.parse(data);
 * ```
 */
export const PaginatedAuditLogsResponseSchema = z.object({
  data: z.array(AuditLogResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

/**
 * Schema for audit log user dropdown response
 *
 * @example
 * ```typescript
 * const users = AuditLogUserSchema.array().parse(data);
 * ```
 */
export const AuditLogUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().nullable(),
});
```

**Step 2: Create audit types**

Create `packages/shared/src/types/audit.types.ts`:

```typescript
import { z } from 'zod';
import type {
  AuditLogResponseSchema,
  AuditLogFiltersSchema,
  PaginatedAuditLogsResponseSchema,
  AuditLogUserSchema,
} from '../schemas/audit.schemas';

/** Single audit log entry */
export type AuditLogResponse = z.infer<typeof AuditLogResponseSchema>;

/** Audit log query filters */
export type AuditLogFilters = z.infer<typeof AuditLogFiltersSchema>;

/** Paginated audit log list */
export type PaginatedAuditLogsResponse = z.infer<typeof PaginatedAuditLogsResponseSchema>;

/** User option for audit log filter dropdown */
export type AuditLogUser = z.infer<typeof AuditLogUserSchema>;
```

**Step 3: Add barrel exports**

Add to the bottom of `packages/shared/src/schemas/index.ts`:

```typescript
// Audit
export {
  AuditLogResponseSchema,
  AuditLogFiltersSchema,
  PaginatedAuditLogsResponseSchema,
  AuditLogUserSchema,
} from './audit.schemas';
```

Add to the bottom of `packages/shared/src/types/index.ts`:

```typescript
// Audit
export type {
  AuditLogResponse,
  AuditLogFilters,
  PaginatedAuditLogsResponse,
  AuditLogUser,
} from './audit.types';
```

**Step 4: Verify shared package builds**

Run: `cd "/Users/sobanahmad/Work/AR&CO/AR-CO" && pnpm --filter shared build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add packages/shared/src/schemas/audit.schemas.ts packages/shared/src/types/audit.types.ts packages/shared/src/schemas/index.ts packages/shared/src/types/index.ts
git commit -m "feat(shared): add audit log Zod schemas and TypeScript types"
```

---

## Task 3: Backend — Database Indexes Migration

**Files:**
- Apply via Supabase MCP tool

**Step 1: Add indexes for common query patterns**

Use `mcp__supabase__apply_migration` to add indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs (entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs (action);
```

**Step 2: Verify indexes exist**

Run `mcp__supabase__execute_sql`:
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'activity_logs';
```
Expected: All 4 indexes listed

**Step 3: Commit** (if migration file was created locally)

```bash
git commit -m "feat(db): add indexes on activity_logs for audit log queries"
```

---

## Task 4: Backend — AuditService

**Files:**
- Create: `apps/api/src/audit/audit.service.ts`

**Step 1: Create the audit service**

Create `apps/api/src/audit/audit.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

/**
 * Data required to create an audit log entry
 *
 * @example
 * ```typescript
 * await auditService.log({
 *   userId: 'uuid',
 *   action: 'CREATE',
 *   entityType: 'case',
 *   entityId: 'uuid',
 *   metadata: { title: 'New Case' },
 *   ipAddress: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...',
 * });
 * ```
 */
export interface CreateAuditLogEntry {
  /** UUID of the user who performed the action */
  userId: string | null;
  /** Action performed (CREATE, UPDATE, DELETE, etc.) */
  action: string;
  /** Type of entity affected */
  entityType: string;
  /** UUID of the affected entity */
  entityId?: string | null;
  /** Additional context — request body, old/new values */
  metadata?: Record<string, unknown>;
  /** Client IP address */
  ipAddress?: string | null;
  /** Client user agent string */
  userAgent?: string | null;
}

/**
 * Centralized audit logging service
 *
 * Writes to the `activity_logs` table using admin client (bypasses RLS).
 * All failures are caught and logged — never blocks the calling operation.
 *
 * @example
 * ```typescript
 * constructor(private readonly auditService: AuditService) {}
 *
 * await this.auditService.log({
 *   userId: user.id,
 *   action: AuditAction.CREATE,
 *   entityType: AuditEntityType.CASE,
 *   entityId: newCase.id,
 * });
 * ```
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Write a single audit log entry
   *
   * Uses admin client to bypass RLS. Failures are caught silently.
   */
  async log(entry: CreateAuditLogEntry): Promise<void> {
    try {
      const adminClient = this.supabaseService.getAdminClient();
      await adminClient.from('activity_logs').insert({
        user_id: entry.userId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId || null,
        metadata: entry.metadata || {},
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to write audit log: ${entry.action} ${entry.entityType}`,
        error,
      );
    }
  }

  /**
   * Query audit logs with filters and pagination
   *
   * Joins user_profiles to include user name/email in results.
   */
  async findAll(filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    limit: number;
  }): Promise<{ data: Record<string, unknown>[]; total: number }> {
    const adminClient = this.supabaseService.getAdminClient();
    const offset = (filters.page - 1) * filters.limit;

    let query = adminClient
      .from('activity_logs')
      .select(
        '*, user_profiles!activity_logs_user_id_fkey(full_name, email:user_id)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + filters.limit - 1);

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error, count } = await query;

    if (error) {
      this.logger.error(`Failed to query audit logs: ${error.message}`);
      return { data: [], total: 0 };
    }

    return { data: data || [], total: count || 0 };
  }

  /**
   * Get distinct users who have audit log entries (for filter dropdown)
   */
  async getDistinctUsers(): Promise<{ id: string; fullName: string | null }[]> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient
      .from('activity_logs')
      .select('user_id')
      .not('user_id', 'is', null);

    if (error || !data) {
      this.logger.error(`Failed to get distinct audit log users: ${error?.message}`);
      return [];
    }

    // Get unique user IDs
    const uniqueIds = [...new Set(data.map((row) => row.user_id as string))];

    if (uniqueIds.length === 0) return [];

    const { data: profiles, error: profileError } = await adminClient
      .from('user_profiles')
      .select('id, full_name')
      .in('id', uniqueIds);

    if (profileError || !profiles) {
      return uniqueIds.map((id) => ({ id, fullName: null }));
    }

    return profiles.map((p) => ({
      id: p.id as string,
      fullName: p.full_name as string | null,
    }));
  }
}
```

**Step 2: Verify backend type-checks**

Run: `cd "/Users/sobanahmad/Work/AR&CO/AR-CO/apps/api" && pnpm tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add apps/api/src/audit/audit.service.ts
git commit -m "feat(api): add centralized AuditService for activity_logs"
```

---

## Task 5: Backend — SkipAudit Decorator

**Files:**
- Create: `apps/api/src/common/decorators/skip-audit.decorator.ts`

**Step 1: Create the decorator**

Create `apps/api/src/common/decorators/skip-audit.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for skipping audit logging
 * @constant
 */
export const SKIP_AUDIT_KEY = 'skipAudit';

/**
 * SkipAudit decorator
 *
 * Marks a route handler to skip automatic audit logging via AuditInterceptor.
 * Use for routes that handle their own logging or should not be audited.
 *
 * @decorator
 * @returns {MethodDecorator} NestJS method decorator
 *
 * @example
 * ```typescript
 * @Patch(':id/status')
 * @SkipAudit() // This route logs manually with custom metadata
 * async updateStatus(@Param('id') id: string) { ... }
 * ```
 */
export const SkipAudit = () => SetMetadata(SKIP_AUDIT_KEY, true);
```

**Step 2: Commit**

```bash
git add apps/api/src/common/decorators/skip-audit.decorator.ts
git commit -m "feat(api): add @SkipAudit() decorator for audit interceptor escape hatch"
```

---

## Task 6: Backend — AuditInterceptor

**Files:**
- Create: `apps/api/src/audit/audit.interceptor.ts`

**Step 1: Create the interceptor**

Create `apps/api/src/audit/audit.interceptor.ts`:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { SKIP_AUDIT_KEY } from '../common/decorators/skip-audit.decorator';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';

/** HTTP methods that should be audited */
const AUDITABLE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/** Fields to strip from metadata to avoid logging sensitive data */
const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'currentPassword',
  'newPassword',
  'confirmPassword',
]);

/**
 * Route-to-action mapping
 *
 * Maps HTTP method + route pattern to a human-readable audit action.
 * Falls back to the HTTP method name if no specific mapping exists.
 */
interface RouteMapping {
  action: string;
  entityType: string;
}

/**
 * Map route patterns to audit actions and entity types
 */
function resolveRouteMapping(method: string, path: string): RouteMapping {
  // Normalize: remove /api/ prefix, trailing slashes
  const normalized = path.replace(/^\/api\//, '').replace(/\/$/, '');

  // Pattern matching from most specific to least
  const mappings: Array<{ pattern: RegExp; action: string; entityType: string }> = [
    // Users
    { pattern: /^users\/invite$/, action: 'INVITE', entityType: 'user' },
    { pattern: /^users\/[^/]+$/, action: method === 'DELETE' ? 'DELETE' : 'UPDATE', entityType: 'user' },

    // Cases
    { pattern: /^cases\/[^/]+\/activities$/, action: 'ADD_ACTIVITY', entityType: 'case' },
    { pattern: /^cases\/[^/]+\/status$/, action: 'STATUS_CHANGE', entityType: 'case' },
    { pattern: /^cases\/[^/]+\/assign$/, action: 'ASSIGN', entityType: 'case' },
    { pattern: /^cases\/[^/]+$/, action: method === 'DELETE' ? 'DELETE' : 'UPDATE', entityType: 'case' },
    { pattern: /^cases$/, action: 'CREATE', entityType: 'case' },

    // Clients
    { pattern: /^clients\/[^/]+$/, action: method === 'DELETE' ? 'DELETE' : 'UPDATE', entityType: 'client' },
    { pattern: /^clients$/, action: 'CREATE', entityType: 'client' },

    // Complaints
    { pattern: /^complaints\/[^/]+\/status$/, action: 'STATUS_CHANGE', entityType: 'complaint' },
    { pattern: /^complaints\/[^/]+\/assign$/, action: 'ASSIGN', entityType: 'complaint' },
    { pattern: /^complaints$/, action: 'CREATE', entityType: 'complaint' },

    // Service registrations
    { pattern: /^service-registrations\/[^/]+\/status$/, action: 'STATUS_CHANGE', entityType: 'service_registration' },
    { pattern: /^service-registrations\/[^/]+\/assign$/, action: 'ASSIGN', entityType: 'service_registration' },

    // Consultations
    { pattern: /^consultations\/[^/]+\/cancel$/, action: 'CANCEL', entityType: 'consultation' },

    // Content — blog posts
    { pattern: /^content\/posts\/[^/]+\/sync$/, action: 'UPDATE', entityType: 'blog_post' },
    { pattern: /^content\/posts\/[^/]+$/, action: method === 'DELETE' ? 'DELETE' : 'UPDATE', entityType: 'blog_post' },
    { pattern: /^content\/posts$/, action: 'CREATE', entityType: 'blog_post' },

    // Content — categories
    { pattern: /^content\/categories\/[^/]+$/, action: method === 'DELETE' ? 'DELETE' : 'UPDATE', entityType: 'blog_category' },
    { pattern: /^content\/categories$/, action: 'CREATE', entityType: 'blog_category' },

    // Subscriptions
    { pattern: /^subscriptions\/[^/]+\/cancel$/, action: 'CANCEL', entityType: 'subscription' },
  ];

  for (const mapping of mappings) {
    if (mapping.pattern.test(normalized)) {
      return { action: mapping.action, entityType: mapping.entityType };
    }
  }

  // Fallback: derive from HTTP method
  const fallbackAction = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
  const entityType = normalized.split('/')[0] || 'unknown';
  return { action: fallbackAction, entityType };
}

/**
 * Strip sensitive fields from an object before storing in audit metadata
 */
function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Extract client IP from request, respecting X-Forwarded-For
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/**
 * Global interceptor that automatically logs all write operations to activity_logs
 *
 * Fires after the controller handler succeeds. Skips GET/OPTIONS/HEAD requests,
 * @Public() routes, and @SkipAudit() routes.
 *
 * @example
 * ```typescript
 * // In main.ts:
 * const auditService = app.get(AuditService);
 * app.useGlobalInterceptors(new AuditInterceptor(reflector, auditService));
 * ```
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // Skip non-write methods
    if (!AUDITABLE_METHODS.has(method)) {
      return next.handle();
    }

    // Skip @Public() routes (unauthenticated — no user to log)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return next.handle();
    }

    // Skip @SkipAudit() routes
    const skipAudit = this.reflector.getAllAndOverride<boolean>(SKIP_AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAudit) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Fire-and-forget: don't await, don't block response
        this.logAction(request).catch((err) => {
          this.logger.warn(`Audit log write failed: ${err}`);
        });
      }),
    );
  }

  private async logAction(request: Request): Promise<void> {
    const user = (request as unknown as { user?: AuthUser }).user;
    const path = request.route?.path || request.path;
    const { action, entityType } = resolveRouteMapping(request.method, request.path);

    // Extract entity ID from route params (usually :id)
    const params = request.params || {};
    const entityId = params.id || null;

    await this.auditService.log({
      userId: user?.id || null,
      action,
      entityType,
      entityId,
      metadata: {
        route: path,
        method: request.method,
        params,
        body: request.body ? sanitizeBody(request.body as Record<string, unknown>) : {},
      },
      ipAddress: getClientIp(request),
      userAgent: request.headers['user-agent'] || null,
    });
  }
}
```

**Step 2: Verify backend type-checks**

Run: `cd "/Users/sobanahmad/Work/AR&CO/AR-CO/apps/api" && pnpm tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add apps/api/src/audit/audit.interceptor.ts
git commit -m "feat(api): add global AuditInterceptor for automatic write-operation logging"
```

---

## Task 7: Backend — AuditController

**Files:**
- Create: `apps/api/src/audit/audit.controller.ts`

**Step 1: Create the controller**

Create `apps/api/src/audit/audit.controller.ts`:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '@repo/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuditLogFiltersSchema } from '@repo/shared';
import type { AuditLogFilters, PaginatedAuditLogsResponse, AuditLogUser } from '@repo/shared';

/**
 * Audit Logs Controller
 *
 * Provides read access to audit logs for Admin and Attorney roles.
 *
 * @example
 * ```
 * GET /api/audit-logs?page=1&limit=25&action=CREATE&entityType=case
 * GET /api/audit-logs/users
 * ```
 */
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Get paginated audit logs with optional filters
   */
  @Get()
  @Roles(UserType.ADMIN, UserType.ATTORNEY)
  async getAuditLogs(
    @Query(new ZodValidationPipe(AuditLogFiltersSchema)) filters: AuditLogFilters,
  ): Promise<PaginatedAuditLogsResponse> {
    const result = await this.auditService.findAll(filters);

    return {
      data: result.data.map((row) => this.mapToResponse(row)),
      total: result.total,
      page: filters.page,
      limit: filters.limit,
    };
  }

  /**
   * Get distinct users who appear in audit logs (for filter dropdown)
   */
  @Get('users')
  @Roles(UserType.ADMIN, UserType.ATTORNEY)
  async getAuditLogUsers(): Promise<AuditLogUser[]> {
    const users = await this.auditService.getDistinctUsers();
    return users.map((u) => ({ id: u.id, fullName: u.fullName }));
  }

  /** Map DB row to response schema shape (snake_case → camelCase) */
  private mapToResponse(row: Record<string, unknown>): Record<string, unknown> {
    const profile = row.user_profiles as Record<string, unknown> | null;
    return {
      id: row.id,
      userId: row.user_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      metadata: row.metadata || {},
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
      userName: profile?.full_name || null,
      userEmail: profile?.email || null,
    };
  }
}
```

**Step 2: Verify backend type-checks**

Run: `cd "/Users/sobanahmad/Work/AR&CO/AR-CO/apps/api" && pnpm tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add apps/api/src/audit/audit.controller.ts
git commit -m "feat(api): add AuditController with filtered list and users endpoints"
```

---

## Task 8: Backend — AuditModule + Registration

**Files:**
- Create: `apps/api/src/audit/audit.module.ts`
- Modify: `apps/api/src/app.module.ts` (add AuditModule to imports)
- Modify: `apps/api/src/main.ts` (register AuditInterceptor globally)

**Step 1: Create the module**

Create `apps/api/src/audit/audit.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

/**
 * Audit Module
 *
 * Provides centralized audit logging. Marked @Global() so AuditService
 * is injectable everywhere (needed by AuthService for auth event migration).
 *
 * @example
 * ```typescript
 * // In app.module.ts:
 * imports: [AuditModule]
 * ```
 */
@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
```

**Step 2: Register module in app.module.ts**

In `apps/api/src/app.module.ts`, add import and module:

Add to imports at top:
```typescript
import { AuditModule } from './audit/audit.module';
```

Add `AuditModule` to the `imports` array (after `ContentModule`).

**Step 3: Register interceptor in main.ts**

In `apps/api/src/main.ts`:

Add import at top:
```typescript
import { AuditInterceptor } from './audit/audit.interceptor';
import { AuditService } from './audit/audit.service';
```

After the guards registration (after line 33), add:
```typescript
  // Register global audit interceptor
  const auditService = app.get(AuditService);
  app.useGlobalInterceptors(new AuditInterceptor(reflector, auditService));
```

**Step 4: Verify backend type-checks**

Run: `cd "/Users/sobanahmad/Work/AR&CO/AR-CO/apps/api" && pnpm tsc --noEmit`
Expected: No type errors

**Step 5: Commit**

```bash
git add apps/api/src/audit/audit.module.ts apps/api/src/app.module.ts apps/api/src/main.ts
git commit -m "feat(api): register AuditModule and global AuditInterceptor"
```

---

## Task 9: Backend — Migrate Auth Event Logging

**Files:**
- Modify: `apps/api/src/auth/auth.service.ts`

**Step 1: Inject AuditService into AuthService**

In `apps/api/src/auth/auth.service.ts`:

Add import:
```typescript
import { AuditService } from '../audit/audit.service';
```

Add to constructor parameters:
```typescript
private readonly auditService: AuditService,
```

**Step 2: Replace logAuthEvent with AuditService calls**

Replace the private `logAuthEvent` method body with:

```typescript
private async logAuthEvent(
  userId: string,
  action: string,
  entityType: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await this.auditService.log({
    userId,
    action,
    entityType,
    entityId: userId,
    metadata,
  });
}
```

Remove the `ActivityLogMetadata` interface (no longer needed — AuditService accepts `Record<string, unknown>`).

**Step 3: Verify backend type-checks**

Run: `cd "/Users/sobanahmad/Work/AR&CO/AR-CO/apps/api" && pnpm tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add apps/api/src/auth/auth.service.ts
git commit -m "refactor(api): migrate auth event logging to centralized AuditService"
```

---

## Task 10: Frontend — Audit Logs API Client

**Files:**
- Create: `apps/web/lib/api/audit-logs.ts`

**Step 1: Create API client**

Create `apps/web/lib/api/audit-logs.ts`:

```typescript
import { getSessionToken, type PaginationParams } from './auth-helpers';
import type {
  PaginatedAuditLogsResponse,
  AuditLogUser,
  AuditLogFilters,
} from '@repo/shared';

/**
 * Fetch paginated audit logs with optional filters
 *
 * @example
 * ```typescript
 * const logs = await getAuditLogs({ page: 1, limit: 25, action: 'CREATE' });
 * ```
 */
export async function getAuditLogs(
  params?: Partial<AuditLogFilters>,
): Promise<PaginatedAuditLogsResponse> {
  const token = await getSessionToken();
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.userId) queryParams.set('userId', params.userId);
  if (params?.action) queryParams.set('action', params.action);
  if (params?.entityType) queryParams.set('entityType', params.entityType);
  if (params?.dateFrom) queryParams.set('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.set('dateTo', params.dateTo);

  const url = `/api/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch audit logs');
  }

  return (await response.json()) as PaginatedAuditLogsResponse;
}

/**
 * Fetch distinct users who appear in audit logs (for filter dropdown)
 *
 * @example
 * ```typescript
 * const users = await getAuditLogUsers();
 * ```
 */
export async function getAuditLogUsers(): Promise<AuditLogUser[]> {
  const token = await getSessionToken();

  const response = await fetch('/api/audit-logs/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || 'Failed to fetch audit log users');
  }

  return (await response.json()) as AuditLogUser[];
}
```

**Step 2: Commit**

```bash
git add apps/web/lib/api/audit-logs.ts
git commit -m "feat(web): add audit logs API client helpers"
```

---

## Task 11: Frontend — Audit Logs Page

**Files:**
- Create: `apps/web/app/admin/audit-logs/page.tsx`

**Step 1: Create the audit logs page**

Create `apps/web/app/admin/audit-logs/page.tsx` following the existing table pattern from `apps/web/app/admin/complaints/page.tsx`. The page should include:

- Title "Audit Logs" with description
- Filter row: User dropdown (from `/api/audit-logs/users`), Action select (from AuditAction enum values), Entity Type select (from AuditEntityType enum values), Date From input, Date To input, Reset button
- Table with columns: Timestamp (relative with absolute tooltip), User (name or "System"), Action (color-coded badge), Entity Type (badge), Entity ID (truncated UUID), IP Address
- Loading skeletons (same pattern as complaints page)
- Empty state when no logs found
- Pagination at bottom (Previous/Next with page count)
- Expandable row detail showing full metadata JSON

Use these shadcn/ui components (already installed): `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `Badge`, `Button`, `Skeleton`, `Input`, `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`.

**Color mapping for action badges:**
- CREATE/INVITE → green (bg-green-100 text-green-800 / dark variants)
- UPDATE/ADD_ACTIVITY → blue
- DELETE → red (bg-red-100 text-red-800)
- STATUS_CHANGE/CANCEL → yellow/amber
- ASSIGN → purple
- SIGNIN/SIGNUP/OAUTH_LOGIN → slate/default
- PASSWORD_RESET/SIGNOUT → orange

**Key implementation notes:**
- Use `'use client'` directive
- Fetch data with `useEffect` + `useState` pattern (same as complaints page)
- Use `useAuth()` to verify user is admin or attorney
- Format timestamps with `new Date(createdAt).toLocaleDateString()` + `toLocaleTimeString()`
- Truncate UUIDs to first 8 chars for display
- Show metadata as `JSON.stringify(metadata, null, 2)` in a `<pre>` block when row is expanded

**Step 2: Verify the page renders**

Run: `cd "/Users/sobanahmad/Work/AR&CO/AR-CO" && pnpm --filter web build`
Expected: Build succeeds (or check with dev server)

**Step 3: Commit**

```bash
git add apps/web/app/admin/audit-logs/page.tsx
git commit -m "feat(web): add /admin/audit-logs page with filters and expandable rows"
```

---

## Task 12: Frontend — Add Sidebar Link

**Files:**
- Modify: `apps/web/components/dashboard/sidebar.tsx`

**Step 1: Add Audit Logs to ADMIN_NAV**

In `apps/web/components/dashboard/sidebar.tsx`:

Add `ShieldCheck` (or `ScrollText`) to the lucide-react import.

Add to `ADMIN_NAV` array (after the Content entry):
```typescript
{ label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
```

**Step 2: Add to role-restricted paths**

The `ADMIN_ONLY_PATHS` Set currently contains only `/admin/subscriptions`. The requirement is Admin + Attorney can view audit logs, but Staff cannot. Update the filtering logic:

Change `ADMIN_ONLY_PATHS` to `STAFF_HIDDEN_PATHS`:
```typescript
const STAFF_HIDDEN_PATHS = new Set(['/admin/subscriptions', '/admin/audit-logs']);
```

Update the filter logic to also allow attorneys:
```typescript
const isAdminOrAttorney = actualUserType === 'admin' || actualUserType === 'attorney';

const navItems = userType === 'admin'
  ? ADMIN_NAV.filter((item) => isAdminOrAttorney || !STAFF_HIDDEN_PATHS.has(item.href))
  : CLIENT_NAV;
```

Note: Subscriptions was admin-only before. If attorney should now also see subscriptions, keep both in the same set. If subscriptions should remain admin-only, use two separate sets. Verify the RBAC table in init.md — subscriptions are "Hidden" for both Attorney and Staff, so create separate sets:

```typescript
const ADMIN_ONLY_PATHS = new Set(['/admin/subscriptions']);
const ADMIN_ATTORNEY_PATHS = new Set(['/admin/audit-logs']);
```

And update filter:
```typescript
const navItems = userType === 'admin'
  ? ADMIN_NAV.filter((item) => {
      if (ADMIN_ONLY_PATHS.has(item.href)) return isAdminRole;
      if (ADMIN_ATTORNEY_PATHS.has(item.href)) return isAdminRole || actualUserType === 'attorney';
      return true;
    })
  : CLIENT_NAV;
```

**Step 3: Commit**

```bash
git add apps/web/components/dashboard/sidebar.tsx
git commit -m "feat(web): add Audit Logs link to admin sidebar (admin + attorney only)"
```

---

## Task 13: Update init.md — Add HEAD TASK 15

**Files:**
- Modify: `init.md` (at root)

**Step 1: Add HEAD TASK 15 after HEAD TASK 14**

Add the following section at the end of init.md (before any closing content):

```markdown
## HEAD TASK 15: Audit & Activity Logs

### Sub-task 15.1: Shared Package (Enums, Schemas, Types)

- [ ] **15.1.1**: Add `AuditAction` and `AuditEntityType` enums to `packages/shared/src/enums.ts`
- [ ] **15.1.2**: Create `packages/shared/src/schemas/audit.schemas.ts` (AuditLogResponseSchema, AuditLogFiltersSchema, PaginatedAuditLogsResponseSchema, AuditLogUserSchema)
- [ ] **15.1.3**: Create `packages/shared/src/types/audit.types.ts` (inferred from schemas)
- [ ] **15.1.4**: Add barrel exports in `schemas/index.ts` and `types/index.ts`

### Sub-task 15.2: Database Indexes

- [ ] **15.2.1**: Add indexes on `activity_logs` table (created_at DESC, user_id, entity_type, action)

### Sub-task 15.3: Backend — AuditService

- [ ] **15.3.1**: Create `apps/api/src/audit/audit.service.ts` with `log()`, `findAll()`, `getDistinctUsers()` methods
- [ ] **15.3.2**: Create `@SkipAudit()` decorator at `apps/api/src/common/decorators/skip-audit.decorator.ts`

### Sub-task 15.4: Backend — AuditInterceptor

- [ ] **15.4.1**: Create `apps/api/src/audit/audit.interceptor.ts` — global interceptor for POST/PATCH/DELETE
  - Route-to-action mapping for ~25 admin routes
  - Sensitive field redaction (passwords, tokens)
  - IP address and user agent extraction
  - Fire-and-forget pattern (never blocks response)

### Sub-task 15.5: Backend — AuditController

- [ ] **15.5.1**: Create `apps/api/src/audit/audit.controller.ts`
  - `GET /api/audit-logs` — paginated list with filters (`@Roles(ADMIN, ATTORNEY)`)
  - `GET /api/audit-logs/users` — distinct users for filter dropdown

### Sub-task 15.6: Backend — AuditModule + Registration

- [ ] **15.6.1**: Create `apps/api/src/audit/audit.module.ts` (`@Global()`, exports AuditService)
- [ ] **15.6.2**: Register AuditModule in `app.module.ts`
- [ ] **15.6.3**: Register AuditInterceptor globally in `main.ts`

### Sub-task 15.7: Backend — Auth Event Migration

- [ ] **15.7.1**: Inject AuditService into AuthService, replace `logAuthEvent()` with `auditService.log()`
- [ ] **15.7.2**: Remove `ActivityLogMetadata` interface (replaced by `Record<string, unknown>`)

### Sub-task 15.8: Frontend — API Client & Page

- [ ] **15.8.1**: Create `apps/web/lib/api/audit-logs.ts` (getAuditLogs, getAuditLogUsers)
- [ ] **15.8.2**: Create `/admin/audit-logs` page with filterable table
  - Filters: user, action, entity type, date range
  - Color-coded action badges
  - Expandable rows with metadata JSON
  - Loading skeletons and empty state
  - Pagination (25 per page)

### Sub-task 15.9: Frontend — Sidebar Update

- [ ] **15.9.1**: Add "Audit Logs" link to admin sidebar (visible to Admin + Attorney only)
```

**Step 2: Update the "Current State" section at the top of init.md**

Add a bullet point mentioning HEAD TASK 15 is pending.

**Step 3: Commit**

```bash
git add init.md
git commit -m "docs: add HEAD TASK 15 (Audit & Activity Logs) to init.md"
```

---

## Verification Checklist

After all tasks are complete:

1. **Backend type-check:** `cd "/Users/sobanahmad/Work/AR&CO/AR-CO/apps/api" && pnpm tsc --noEmit`
2. **Frontend build:** `cd "/Users/sobanahmad/Work/AR&CO/AR-CO" && pnpm --filter web build`
3. **Shared build:** `cd "/Users/sobanahmad/Work/AR&CO/AR-CO" && pnpm --filter shared build`
4. **Manual test:** Start dev servers (`pnpm dev`), perform an admin action (e.g., create a client), check `/admin/audit-logs` page for the new entry
5. **Auth events still logged:** Sign out and sign back in, verify auth events appear in audit logs
