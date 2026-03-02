import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { SupabaseService } from '../src/database/supabase.service';
import { AdminWhitelistService } from '../src/database/admin-whitelist.service';
import { AuditService } from '../src/audit/audit.service';
import { UserType } from '../src/common/enums/user-type.enum';
import type { AuthUser } from '../src/common/interfaces/auth-user.interface';

/**
 * Mock AuthUser used for protected-endpoint tests.
 * Represents a client user for realistic auth flow testing.
 */
const mockUser: AuthUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'client@example.com',
  userType: UserType.CLIENT,
  fullName: 'Test Client',
  phoneNumber: null,
};

/** Mock auth response returned by mocked AuthService methods */
const mockAuthResponse = {
  user: {
    id: mockUser.id,
    email: mockUser.email,
    fullName: mockUser.fullName,
    userType: 'client',
  },
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

/** Mock signup pending response */
const mockSignupPendingResponse = {
  message: 'Please check your email to confirm your account.',
  email: 'newuser@example.com',
};

/** Mock auth message response */
const mockAuthMessage = {
  message: 'If an account with that email exists, a password reset link has been sent.',
};

/** Mock current user response */
const mockCurrentUserResponse = {
  id: mockUser.id,
  email: mockUser.email,
  fullName: mockUser.fullName,
  userType: 'client',
};

/** Mock signout message */
const mockSignoutMessage = {
  message: 'Signed out successfully.',
};

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  const mockAuthService = {
    signup: jest.fn().mockResolvedValue(mockSignupPendingResponse),
    signin: jest.fn().mockResolvedValue(mockAuthResponse),
    processOAuthCallback: jest.fn().mockResolvedValue(mockAuthResponse),
    refreshToken: jest.fn().mockResolvedValue(mockAuthResponse),
    requestPasswordReset: jest.fn().mockResolvedValue(mockAuthMessage),
    confirmPasswordReset: jest.fn().mockResolvedValue({ message: 'Password has been reset successfully.' }),
    getCurrentUser: jest.fn().mockResolvedValue(mockCurrentUserResponse),
    signout: jest.fn().mockResolvedValue(mockSignoutMessage),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideProvider(SupabaseService)
      .useValue({})
      .overrideProvider(AdminWhitelistService)
      .useValue({ isAdminEmail: jest.fn().mockReturnValue(false) })
      .overrideProvider(AuditService)
      .useValue({ log: jest.fn().mockResolvedValue(undefined) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    // Register mock guards globally (mimics main.ts global guard registration).
    // The JwtAuthGuard mock sets request.user so @CurrentUser() works on protected routes.
    app.useGlobalGuards(
      {
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      } as unknown as JwtAuthGuard,
      { canActivate: () => true } as unknown as RolesGuard,
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/signup — register new client
  // ──────────────────────────────────────────────
  it('POST /api/auth/signup → 201 (signup)', async () => {
    const body = {
      email: 'newuser@example.com',
      password: 'SecureP@ss123',
      fullName: 'New User',
    };

    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(body)
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(mockSignupPendingResponse);
    expect(mockAuthService.signup).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/signin — email/password login
  // ──────────────────────────────────────────────
  it('POST /api/auth/signin → 200 (signin)', async () => {
    const body = {
      email: 'client@example.com',
      password: 'SecureP@ss123',
    };

    const res = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send(body)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockAuthResponse);
    expect(mockAuthService.signin).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/oauth/callback — OAuth token processing
  // ──────────────────────────────────────────────
  it('POST /api/auth/oauth/callback → 200 (OAuth callback)', async () => {
    const body = {
      accessToken: 'mock-oauth-access-token',
      refreshToken: 'mock-oauth-refresh-token',
    };

    const res = await request(app.getHttpServer())
      .post('/api/auth/oauth/callback')
      .send(body)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockAuthResponse);
    expect(mockAuthService.processOAuthCallback).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/refresh — refresh access token
  // ──────────────────────────────────────────────
  it('POST /api/auth/refresh → 200 (token refresh)', async () => {
    const body = {
      refreshToken: 'mock-refresh-token',
    };

    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send(body)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockAuthResponse);
    expect(mockAuthService.refreshToken).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/password-reset/request — request reset email
  // ──────────────────────────────────────────────
  it('POST /api/auth/password-reset/request → 200 (password reset request)', async () => {
    const body = {
      email: 'client@example.com',
    };

    const res = await request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send(body)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockAuthMessage);
    expect(mockAuthService.requestPasswordReset).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // GET /api/auth/me — get current user (protected)
  // ──────────────────────────────────────────────
  it('GET /api/auth/me → 200 (get current user)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockCurrentUserResponse);
    expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(
      mockUser.id,
      mockUser.email,
    );
  });

  // ──────────────────────────────────────────────
  // POST /api/auth/signout — sign out (protected)
  // ──────────────────────────────────────────────
  it('POST /api/auth/signout → 200 (signout)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signout')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(mockSignoutMessage);
    expect(mockAuthService.signout).toHaveBeenCalledWith(mockUser.id);
  });
});
