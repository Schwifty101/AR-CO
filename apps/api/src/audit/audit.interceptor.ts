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
 * Route-to-action mapping result
 */
interface RouteMapping {
  action: string;
  entityType: string;
}

/**
 * Map route patterns to audit actions and entity types
 *
 * @example
 * ```typescript
 * resolveRouteMapping('POST', '/api/cases') // { action: 'CREATE', entityType: 'case' }
 * resolveRouteMapping('PATCH', '/api/cases/uuid/status') // { action: 'STATUS_CHANGE', entityType: 'case' }
 * ```
 */
function resolveRouteMapping(method: string, path: string): RouteMapping {
  const normalized = path.replace(/^\/api\//, '').replace(/\/$/, '');

  const mappings: Array<{
    pattern: RegExp;
    action: string;
    entityType: string;
  }> = [
    // Users
    { pattern: /^users\/invite$/, action: 'INVITE', entityType: 'user' },
    {
      pattern: /^users\/[^/]+$/,
      action: method === 'DELETE' ? 'DELETE' : 'UPDATE',
      entityType: 'user',
    },

    // Cases
    {
      pattern: /^cases\/[^/]+\/activities$/,
      action: 'ADD_ACTIVITY',
      entityType: 'case',
    },
    {
      pattern: /^cases\/[^/]+\/status$/,
      action: 'STATUS_CHANGE',
      entityType: 'case',
    },
    { pattern: /^cases\/[^/]+\/assign$/, action: 'ASSIGN', entityType: 'case' },
    {
      pattern: /^cases\/[^/]+$/,
      action: method === 'DELETE' ? 'DELETE' : 'UPDATE',
      entityType: 'case',
    },
    { pattern: /^cases$/, action: 'CREATE', entityType: 'case' },

    // Clients
    {
      pattern: /^clients\/[^/]+$/,
      action: method === 'DELETE' ? 'DELETE' : 'UPDATE',
      entityType: 'client',
    },
    { pattern: /^clients$/, action: 'CREATE', entityType: 'client' },

    // Complaints
    {
      pattern: /^complaints\/[^/]+\/status$/,
      action: 'STATUS_CHANGE',
      entityType: 'complaint',
    },
    {
      pattern: /^complaints\/[^/]+\/assign$/,
      action: 'ASSIGN',
      entityType: 'complaint',
    },
    { pattern: /^complaints$/, action: 'CREATE', entityType: 'complaint' },

    // Service registrations
    {
      pattern: /^service-registrations\/[^/]+\/status$/,
      action: 'STATUS_CHANGE',
      entityType: 'service_registration',
    },
    {
      pattern: /^service-registrations\/[^/]+\/assign$/,
      action: 'ASSIGN',
      entityType: 'service_registration',
    },

    // Consultations
    {
      pattern: /^consultations\/[^/]+\/cancel$/,
      action: 'CANCEL',
      entityType: 'consultation',
    },

    // Content — blog posts
    {
      pattern: /^content\/posts\/[^/]+\/sync$/,
      action: 'UPDATE',
      entityType: 'blog_post',
    },
    {
      pattern: /^content\/posts\/[^/]+$/,
      action: method === 'DELETE' ? 'DELETE' : 'UPDATE',
      entityType: 'blog_post',
    },
    { pattern: /^content\/posts$/, action: 'CREATE', entityType: 'blog_post' },

    // Content — categories
    {
      pattern: /^content\/categories\/[^/]+$/,
      action: method === 'DELETE' ? 'DELETE' : 'UPDATE',
      entityType: 'blog_category',
    },
    {
      pattern: /^content\/categories$/,
      action: 'CREATE',
      entityType: 'blog_category',
    },

    // Subscriptions
    {
      pattern: /^subscriptions\/[^/]+\/cancel$/,
      action: 'CANCEL',
      entityType: 'subscription',
    },
  ];

  for (const mapping of mappings) {
    if (mapping.pattern.test(normalized)) {
      return { action: mapping.action, entityType: mapping.entityType };
    }
  }

  const fallbackAction =
    method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
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

    if (!AUDITABLE_METHODS.has(method)) {
      return next.handle();
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return next.handle();
    }

    const skipAudit = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUDIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipAudit) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        this.logAction(request).catch((err) => {
          this.logger.warn(`Audit log write failed: ${err}`);
        });
      }),
    );
  }

  private async logAction(request: Request): Promise<void> {
    const user = (request as unknown as { user?: AuthUser }).user;
    const path =
      (request as unknown as { route?: { path?: string } }).route?.path ||
      request.path;
    const { action, entityType } = resolveRouteMapping(
      request.method,
      request.path,
    );

    const params = request.params || {};
    const rawId = params.id;
    const entityId = typeof rawId === 'string' ? rawId : null;

    await this.auditService.log({
      userId: user?.id || null,
      action,
      entityType,
      entityId,
      metadata: {
        route: path,
        method: request.method,
        params,
        body: request.body
          ? sanitizeBody(request.body as Record<string, unknown>)
          : {},
      },
      ipAddress: getClientIp(request),
      userAgent: (request.headers['user-agent'] as string) || null,
    });
  }
}
