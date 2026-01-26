/**
 * Auth Service Unit Tests
 *
 * Tests authentication flows including signup, signin, OAuth callback,
 * token refresh, password reset, and signout.
 *
 * @module AuthServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from '../database/supabase.service';
import { AdminWhitelistService } from '../database/admin-whitelist.service';

/** Mock Supabase client returned by getAdminClient() */
const mockAdminClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    getUser: jest.fn(),
    refreshSession: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    admin: {
      updateUserById: jest.fn(),
    },
  },
  from: jest.fn(),
};

/** Helper to set up chained query builder mock */
function mockQueryBuilder(data: unknown, error: unknown = null) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data, error }),
      }),
    }),
    insert: jest.fn().mockResolvedValue({ data: null, error }),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: jest.Mocked<SupabaseService>;
  let adminWhitelistService: jest.Mocked<AdminWhitelistService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(),
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
            getUserFromToken: jest.fn(),
          },
        },
        {
          provide: AdminWhitelistService,
          useValue: {
            isAdminEmail: jest.fn().mockReturnValue(false),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    supabaseService = module.get(SupabaseService);
    adminWhitelistService = module.get(AdminWhitelistService);

    // Reset all mocks
    jest.clearAllMocks();
    supabaseService.getAdminClient.mockReturnValue(mockAdminClient as any);
  });

  describe('signup', () => {
    it('should block admin emails from email/password signup', async () => {
      adminWhitelistService.isAdminEmail.mockReturnValue(true);

      await expect(
        service.signup({
          email: 'admin@example.com',
          password: 'SecureP@ss1',
          fullName: 'Admin User',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create a client user with email/password', async () => {
      const userId = 'test-uuid-123';
      mockAdminClient.auth.signUp.mockResolvedValue({
        data: {
          user: { id: userId },
          session: { access_token: 'at', refresh_token: 'rt' },
        },
        error: null,
      });

      // Mock user_profiles insert
      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        if (table === 'client_profiles') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        if (table === 'activity_logs') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        return mockQueryBuilder(null);
      });

      const result = await service.signup({
        email: 'client@example.com',
        password: 'SecureP@ss1',
        fullName: 'Client User',
      });

      expect(result.user.email).toBe('client@example.com');
      expect(result.user.userType).toBe('client');
      expect(result.accessToken).toBe('at');
    });

    it('should throw UnauthorizedException on signup failure', async () => {
      mockAdminClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already exists' },
      });

      await expect(
        service.signup({
          email: 'existing@example.com',
          password: 'SecureP@ss1',
          fullName: 'Existing User',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signin', () => {
    it('should sign in with valid credentials', async () => {
      const userId = 'test-uuid-456';
      mockAdminClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: userId, email: 'user@example.com' },
          session: { access_token: 'at', refresh_token: 'rt' },
        },
        error: null,
      });

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { full_name: 'Test User', user_type: 'client' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'activity_logs') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        return mockQueryBuilder(null);
      });

      const result = await service.signin({
        email: 'user@example.com',
        password: 'SecureP@ss1',
      });

      expect(result.user.email).toBe('user@example.com');
      expect(result.user.fullName).toBe('Test User');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockAdminClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        service.signin({
          email: 'user@example.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('processOAuthCallback', () => {
    it('should create admin profile for whitelisted email', async () => {
      const userId = 'oauth-uuid-789';
      adminWhitelistService.isAdminEmail.mockReturnValue(true);

      mockAdminClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: 'admin@gmail.com',
            user_metadata: { full_name: 'Admin User' },
          },
        },
        error: null,
      });

      // First call: fetchUserProfileOrNull returns null (no profile yet)
      // Then insert calls for profile creation
      // Then activity_logs insert
      const fromCalls: string[] = [];
      mockAdminClient.from.mockImplementation((table: string) => {
        fromCalls.push(table);
        if (
          table === 'user_profiles' &&
          fromCalls.filter((t) => t === 'user_profiles').length === 1
        ) {
          // First call: select (profile lookup) - returns null
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
          };
        }
        if (table === 'user_profiles') {
          // Second call: insert
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        if (table === 'activity_logs') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        return mockQueryBuilder(null);
      });

      const result = await service.processOAuthCallback({
        accessToken: 'oauth-at',
        refreshToken: 'oauth-rt',
      });

      expect(result.user.userType).toBe('admin');
      expect(result.user.email).toBe('admin@gmail.com');
    });

    it('should create client profile for non-whitelisted email', async () => {
      const userId = 'oauth-uuid-101';
      adminWhitelistService.isAdminEmail.mockReturnValue(false);

      mockAdminClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: 'client@gmail.com',
            user_metadata: { full_name: 'Client User' },
          },
        },
        error: null,
      });

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          // Check if it's a select or insert
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'client_profiles') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        if (table === 'activity_logs') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        return mockQueryBuilder(null);
      });

      const result = await service.processOAuthCallback({
        accessToken: 'oauth-at',
        refreshToken: 'oauth-rt',
      });

      expect(result.user.userType).toBe('client');
    });

    it('should return existing profile if user already exists', async () => {
      mockAdminClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'existing-uuid',
            email: 'existing@gmail.com',
            user_metadata: {},
          },
        },
        error: null,
      });

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { full_name: 'Existing User', user_type: 'client' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'activity_logs') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        return mockQueryBuilder(null);
      });

      const result = await service.processOAuthCallback({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      expect(result.user.fullName).toBe('Existing User');
    });

    it('should throw UnauthorizedException for invalid OAuth token', async () => {
      mockAdminClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(
        service.processOAuthCallback({
          accessToken: 'invalid',
          refreshToken: 'invalid',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh a valid token', async () => {
      mockAdminClient.auth.refreshSession.mockResolvedValue({
        data: {
          session: { access_token: 'new-at', refresh_token: 'new-rt' },
          user: { id: 'uuid', email: 'user@example.com' },
        },
        error: null,
      });

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { full_name: 'User', user_type: 'client' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockQueryBuilder(null);
      });

      const result = await service.refreshToken({ refreshToken: 'old-rt' });

      expect(result.accessToken).toBe('new-at');
      expect(result.refreshToken).toBe('new-rt');
    });
  });

  describe('requestPasswordReset', () => {
    it('should return a generic message regardless of email existence', async () => {
      mockAdminClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const result = await service.requestPasswordReset({
        email: 'anyone@example.com',
      });

      expect(result.message).toContain('password reset link');
    });
  });

  describe('signout', () => {
    it('should log signout event and return success', async () => {
      mockAdminClient.from.mockImplementation(() => ({
        insert: jest.fn().mockResolvedValue({ error: null }),
      }));

      const result = await service.signout('user-uuid');

      expect(result.message).toBe('Signed out successfully.');
    });
  });
});
