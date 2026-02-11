# HEAD TASK 5: Users & Profiles - Completion Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete HEAD TASK 5 by fixing the broken stale test, adding UsersService unit tests, and marking init.md as done.

**Architecture:** Backend (NestJS) users module is fully implemented with 6 endpoints. Frontend (Next.js) has admin + client profile pages, users list, and API helpers. Shared Zod schemas in `packages/shared/` handle validation on both sides. Gap: no unit tests for UsersService, one stale test failing.

**Tech Stack:** NestJS 11, Jest 30, Supabase, TypeScript 5.7, Zod, React Hook Form

---

## Status Assessment

Everything in HEAD TASK 5 is implemented. Here's what exists:

**Backend (DONE):**
- `apps/api/src/users/users.service.ts` - 6 methods (getUserProfile, updateUserProfile, updateClientProfile, updateAttorneyProfile, getAllUsers, deleteUser)
- `apps/api/src/users/users.controller.ts` - 6 endpoints (GET/PATCH profile, PATCH client-profile, PATCH attorney-profile, GET users, DELETE users/:id)
- `apps/api/src/users/users.module.ts` - Module registration with exports
- `packages/shared/src/schemas/users.schemas.ts` - 9 Zod schemas for validation + response types
- `packages/shared/src/types/users.types.ts` - TypeScript types inferred from Zod

**Frontend (DONE):**
- `apps/web/lib/api/users.ts` - 6 API client functions
- `apps/web/app/admin/profile/page.tsx` - Admin profile edit (personal + attorney info)
- `apps/web/app/client/profile/page.tsx` - Client profile edit (personal + business info)
- `apps/web/app/admin/users/page.tsx` - Paginated users list with delete
- `apps/web/components/dashboard/sidebar.tsx` - Sidebar with Dashboard, Profile, Users links
- Loading/error/empty states + Sonner toasts throughout

**Issues:**
1. `app.controller.spec.ts` expects `"Hello World!"` but `AppService.getHello()` returns `{ message: "Hello from NestJS API on port 4000!" }` - stale scaffolding test
2. No `users.service.spec.ts` unit tests
3. Init.md checkboxes unchecked

---

### Task 1: Fix stale app.controller.spec.ts

**Files:**
- Modify: `apps/api/src/app.controller.spec.ts`

**Step 1: Fix the test expectation**

The test expects `"Hello World!"` but `AppService.getHello()` returns `{ message: 'Hello from NestJS API on port 4000!' }`. Fix:

```typescript
// apps/api/src/app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return hello message', () => {
      expect(appController.getHello()).toEqual({
        message: 'Hello from NestJS API on port 4000!',
      });
    });
  });
});
```

**Step 2: Run test to verify it passes**

Run: `cd apps/api && pnpm test -- --testPathPattern=app.controller.spec.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/api/src/app.controller.spec.ts
git commit -m "fix: update stale app.controller.spec.ts test expectation"
```

---

### Task 2: Write UsersService unit tests

**Files:**
- Create: `apps/api/src/users/users.service.spec.ts`

**Step 1: Write the test file**

Follow the same pattern as `auth.service.spec.ts` - mock SupabaseService, test each service method.

```typescript
// apps/api/src/users/users.service.spec.ts
/**
 * UsersService Unit Tests
 *
 * Tests user profile CRUD operations including:
 * - getUserProfile (with client/attorney profile joins)
 * - updateUserProfile
 * - updateClientProfile
 * - updateAttorneyProfile
 * - getAllUsers (with pagination)
 * - deleteUser
 *
 * @module UsersServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseService } from '../database/supabase.service';

/** Mock Supabase admin client */
const mockAdminClient = {
  from: jest.fn(),
  auth: {
    admin: {
      getUserById: jest.fn(),
      deleteUser: jest.fn(),
    },
  },
};

/** Helper to set up chained query builder for select().eq().single() */
function mockSelectEqSingle(data: unknown, error: unknown = null) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data, error }),
      }),
    }),
  };
}

/** Helper to set up chained query builder for select with count */
function mockSelectCount(count: number | null, error: unknown = null) {
  return {
    select: jest.fn().mockResolvedValue({ count, error }),
  };
}

/** Helper to set up chained query builder for select with order and range */
function mockSelectOrderRange(data: unknown[], error: unknown = null) {
  return {
    select: jest.fn().mockReturnValue({
      order: jest.fn().mockReturnValue({
        range: jest.fn().mockResolvedValue({ data, error }),
      }),
    }),
  };
}

/** Helper for update().eq() */
function mockUpdateEq(error: unknown = null) {
  return {
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error }),
    }),
  };
}

/** Helper for delete().eq() */
function mockDeleteEq(error: unknown = null) {
  return {
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error }),
    }),
  };
}

/** Sample user profile data from DB */
const mockUserProfile = {
  id: 'user-uuid-123',
  full_name: 'John Doe',
  phone_number: '+923001234567',
  user_type: 'client',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-20T14:00:00Z',
};

/** Sample client profile data from DB */
const mockClientProfile = {
  id: 'client-uuid-456',
  company_name: 'Test Corp',
  company_type: 'llc',
  tax_id: '1234567',
  address: '123 Main St',
  city: 'Karachi',
  country: 'Pakistan',
};

/** Sample attorney profile data from DB */
const mockAttorneyProfile = {
  id: 'attorney-uuid-789',
  bar_number: 'BAR-12345',
  specializations: ['Corporate Law', 'Tax Law'],
  education: 'LLB from University of Karachi',
  experience_years: 10,
  hourly_rate: 15000,
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('getUserProfile', () => {
    it('should return user profile with email passed in', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      // For client_profiles (user_type is 'client')
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.getUserProfile(
        'user-uuid-123',
        'john@example.com',
      );

      expect(result.id).toBe('user-uuid-123');
      expect(result.email).toBe('john@example.com');
      expect(result.fullName).toBe('John Doe');
      expect(result.userType).toBe('client');
      expect(result.clientProfile).toBeDefined();
      expect(result.clientProfile?.companyName).toBe('Test Corp');
    });

    it('should fetch email from auth if not provided', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      mockAdminClient.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user: { email: 'fetched@example.com' } },
        error: null,
      });
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.getUserProfile('user-uuid-123');

      expect(result.email).toBe('fetched@example.com');
      expect(mockAdminClient.auth.admin.getUserById).toHaveBeenCalledWith(
        'user-uuid-123',
      );
    });

    it('should include attorney profile for attorney users', async () => {
      const attorneyUser = { ...mockUserProfile, user_type: 'attorney' };
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(attorneyUser),
      );
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockAttorneyProfile),
      );

      const result = await service.getUserProfile(
        'user-uuid-123',
        'attorney@example.com',
      );

      expect(result.attorneyProfile).toBeDefined();
      expect(result.attorneyProfile?.barNumber).toBe('BAR-12345');
      expect(result.attorneyProfile?.specializations).toEqual([
        'Corporate Law',
        'Tax Law',
      ]);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(null, { code: 'PGRST116' }),
      );

      await expect(
        service.getUserProfile('nonexistent-uuid', 'x@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserProfile', () => {
    it('should update full name and return updated profile', async () => {
      // Mock the update call
      mockAdminClient.from.mockReturnValueOnce(mockUpdateEq());
      // Mock the subsequent getUserProfile call (user_profiles query)
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle({ ...mockUserProfile, full_name: 'Jane Doe' }),
      );
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.updateUserProfile('user-uuid-123', {
        fullName: 'Jane Doe',
      });

      expect(result.fullName).toBe('Jane Doe');
    });

    it('should return current profile if no fields to update', async () => {
      // Empty update object - should just call getUserProfile
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.updateUserProfile('user-uuid-123', {});

      expect(result.id).toBe('user-uuid-123');
    });

    it('should throw InternalServerErrorException on update failure', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockUpdateEq({ message: 'DB error', code: 'UNKNOWN' }),
      );

      await expect(
        service.updateUserProfile('user-uuid-123', {
          fullName: 'Fail',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateClientProfile', () => {
    it('should update company name and return updated profile', async () => {
      mockAdminClient.from.mockReturnValueOnce(mockUpdateEq());
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle({
          ...mockClientProfile,
          company_name: 'New Corp',
        }),
      );

      const result = await service.updateClientProfile('user-uuid-123', {
        companyName: 'New Corp',
      });

      expect(result.clientProfile?.companyName).toBe('New Corp');
    });

    it('should return current profile if no fields to update', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.updateClientProfile('user-uuid-123', {});

      expect(result.clientProfile?.companyName).toBe('Test Corp');
    });
  });

  describe('updateAttorneyProfile', () => {
    it('should update bar number and return updated profile', async () => {
      const attorneyUser = { ...mockUserProfile, user_type: 'attorney' };
      mockAdminClient.from.mockReturnValueOnce(mockUpdateEq());
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(attorneyUser),
      );
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle({
          ...mockAttorneyProfile,
          bar_number: 'BAR-99999',
        }),
      );

      const result = await service.updateAttorneyProfile('user-uuid-123', {
        barNumber: 'BAR-99999',
      });

      expect(result.attorneyProfile?.barNumber).toBe('BAR-99999');
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      // Mock count query
      mockAdminClient.from.mockReturnValueOnce(mockSelectCount(2));
      // Mock paginated select
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectOrderRange([mockUserProfile]),
      );
      // Mock getUserProfile for the user in the list
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockUserProfile),
      );
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(mockClientProfile),
      );

      const result = await service.getAllUsers({
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should throw InternalServerErrorException on count failure', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectCount(null, { message: 'Count error' }),
      );

      await expect(
        service.getAllUsers({
          page: 1,
          limit: 20,
          sort: 'created_at',
          order: 'desc',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and auth record successfully', async () => {
      // Mock exists check
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle({ id: 'user-uuid-123' }),
      );
      // Mock profile delete
      mockAdminClient.from.mockReturnValueOnce(mockDeleteEq());
      // Mock auth delete
      mockAdminClient.auth.admin.deleteUser.mockResolvedValueOnce({
        error: null,
      });

      const result = await service.deleteUser('user-uuid-123');

      expect(result.message).toBe('User deleted successfully');
      expect(mockAdminClient.auth.admin.deleteUser).toHaveBeenCalledWith(
        'user-uuid-123',
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle(null, { code: 'PGRST116' }),
      );

      await expect(service.deleteUser('nonexistent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should succeed even if auth user deletion fails', async () => {
      mockAdminClient.from.mockReturnValueOnce(
        mockSelectEqSingle({ id: 'user-uuid-123' }),
      );
      mockAdminClient.from.mockReturnValueOnce(mockDeleteEq());
      mockAdminClient.auth.admin.deleteUser.mockResolvedValueOnce({
        error: { message: 'Auth delete failed' },
      });

      const result = await service.deleteUser('user-uuid-123');

      // Should still succeed - profile is deleted, auth failure logged
      expect(result.message).toBe('User deleted successfully');
    });
  });
});
```

**Step 2: Run tests to verify they pass**

Run: `cd apps/api && pnpm test -- --testPathPattern=users.service.spec.ts`
Expected: All 12 tests PASS

**Step 3: Run all tests to confirm nothing is broken**

Run: `cd apps/api && pnpm test`
Expected: All test suites PASS (app.controller + auth.service + users.service)

**Step 4: Commit**

```bash
git add apps/api/src/users/users.service.spec.ts
git commit -m "test: add UsersService unit tests (12 tests)"
```

---

### Task 3: Update init.md checkboxes

**Files:**
- Modify: `init.md`

**Step 1: Mark all HEAD TASK 5 sub-tasks as complete**

Change all `- [ ]` to `- [x]` for HEAD TASK 5 items (5.1.1 through 5.5.6).

Also add a note that DTOs are implemented as Zod schemas in `packages/shared/` instead of class-validator DTOs in `apps/api/src/users/dto/`.

**Step 2: Commit**

```bash
git add init.md
git commit -m "docs: mark HEAD TASK 5 (Users & Profiles) as complete in init.md"
```

---

### Task 4: Final verification

**Step 1: Type check backend**

Run: `cd apps/api && pnpm tsc --noEmit`
Expected: Clean (no errors)

**Step 2: Run all backend tests**

Run: `cd apps/api && pnpm test`
Expected: 3 suites, ~25 tests, all PASS

**Step 3: Verify lint passes**

Run: `cd apps/api && pnpm lint`
Expected: No errors

---

## Consistency Notes

The following patterns are consistently applied across HEAD TASK 5:

**Backend:**
- Thin controller pattern: all business logic in UsersService
- camelCase DTOs → snake_case DB columns mapped manually in service
- Admin client used for all queries (cross-user access for admin endpoints)
- @Roles(UserType.ADMIN, UserType.STAFF) for admin endpoints, @Roles(UserType.ADMIN) for destructive ops
- ZodValidationPipe for input validation
- NotFoundException / InternalServerErrorException for error handling
- Logger used for all error/warn cases

**Frontend:**
- React Hook Form + Zod for form validation
- Sonner toasts for success/error feedback
- Skeleton components for loading states
- `bg-destructive/15 text-destructive` for error banners
- API helpers in `lib/api/users.ts` with `getSessionToken()` pattern
- Types re-exported from `@repo/shared`

**Shared:**
- Zod schemas in `packages/shared/src/schemas/users.schemas.ts`
- TypeScript types inferred via `z.infer<>` in `packages/shared/src/types/users.types.ts`
- Barrel exports through index.ts files
