# HEAD TASK 13: Testing & Validation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Write comprehensive unit tests and e2e tests for untested backend services, achieving ~62 new tests across 7 new files.

**Architecture:** Mock-based unit tests with mocked Supabase clients following established patterns (auth.service.spec.ts). E2E tests using supertest with overridden guards and mocked services. All tests run via `pnpm --filter api test`.

**Tech Stack:** Jest, @nestjs/testing, supertest, ts-jest

---

## Batch 1: Cases Module Unit Tests

### Task 1: CasesService unit tests

**Files:**
- Create: `apps/api/src/cases/cases.service.spec.ts`
- Reference: `apps/api/src/cases/cases.service.ts`
- Reference: `apps/api/src/cases/case-activities.service.ts`
- Reference: `apps/api/src/common/constants/roles.ts` (STAFF_ROLES)
- Reference: `apps/api/src/complaints/complaints.service.spec.ts` (pattern example)

**Step 1: Write the full test file**

```typescript
/**
 * CasesService Unit Tests
 *
 * Tests case CRUD operations including:
 * - createCase (with auto-activity)
 * - getCases (role-filtered, paginated, filtered)
 * - getCaseById (access control)
 * - updateCase
 * - updateCaseStatus (with auto closing_date)
 * - deleteCase
 * - assign (with auto-activity)
 * - createCaseFromRegistration
 *
 * @module CasesServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CaseActivitiesService } from './case-activities.service';
import { SupabaseService } from '../database/supabase.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  CaseStatus,
  CasePriority,
  ServiceRegistrationStatus,
} from '@repo/shared';

/** Mock Supabase admin client */
const mockAdminClient = {
  from: jest.fn(),
};

/** Staff user fixture */
const staffUser: AuthUser = {
  id: 'staff-uuid',
  email: 'staff@arco.com',
  userType: UserType.STAFF,
  fullName: 'Staff User',
  phoneNumber: null,
};

/** Client user fixture */
const clientUser: AuthUser = {
  id: 'client-user-uuid',
  email: 'client@example.com',
  userType: UserType.CLIENT,
  fullName: 'Test Client',
  phoneNumber: null,
  clientProfileId: 'client-profile-uuid',
};

/** Another client for forbidden access tests */
const otherClient: AuthUser = {
  id: 'other-user-uuid',
  email: 'other@example.com',
  userType: UserType.CLIENT,
  fullName: 'Other Client',
  phoneNumber: null,
  clientProfileId: 'other-profile-uuid',
};

/** Mock case row from DB with joins */
const mockCaseRow = {
  id: 'case-uuid-1',
  case_number: 'CASE-2026-0001',
  client_profile_id: 'client-profile-uuid',
  assigned_to_id: null,
  practice_area_id: 'pa-uuid',
  service_id: null,
  title: 'Contract Dispute',
  description: 'Description of case',
  status: 'pending',
  priority: 'medium',
  case_type: null,
  filing_date: null,
  closing_date: null,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  client_profile: { user_profile: { full_name: 'Test Client' } },
  assigned_to: null,
  practice_area: { name: 'Corporate Law' },
  service: null,
  service_registration_id: null,
  service_registration: null,
};

/** Mock CaseActivitiesService */
const mockCaseActivitiesService = {
  createAutoActivity: jest.fn().mockResolvedValue(undefined),
};

describe('CasesService', () => {
  let service: CasesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAdminClient.from.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasesService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
        {
          provide: CaseActivitiesService,
          useValue: mockCaseActivitiesService,
        },
      ],
    }).compile();

    service = module.get<CasesService>(CasesService);
  });

  describe('createCase', () => {
    it('should create a case and log activity', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCaseRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createCase(
        {
          clientProfileId: 'client-profile-uuid',
          practiceAreaId: 'pa-uuid',
          title: 'Contract Dispute',
        },
        staffUser,
      );

      expect(result.caseNumber).toBe('CASE-2026-0001');
      expect(result.title).toBe('Contract Dispute');
      expect(mockCaseActivitiesService.createAutoActivity).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      });

      await expect(
        service.createCase(
          {
            clientProfileId: 'client-profile-uuid',
            practiceAreaId: 'pa-uuid',
            title: 'Fail Case',
          },
          staffUser,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getCases', () => {
    const pagination = { page: 1, limit: 20, sort: 'created_at', order: 'desc' as const };

    it('should return paginated cases for staff', async () => {
      // Count query
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          then: undefined,
          [Symbol.toStringTag]: 'Promise',
          ...Promise.resolve({ count: 1, error: null }),
        }),
      });

      // We need a simpler approach: mock from() to return chainable
      mockAdminClient.from.mockReset();

      const mockCountResult = { count: 1, error: null };
      const mockDataResult = {
        data: [mockCaseRow],
        error: null,
      };

      // Count query mock
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockCountResult),
      });

      // Data query mock
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue(mockDataResult),
          }),
        }),
      });

      const result = await service.getCases(pagination, {}, staffUser);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].caseNumber).toBe('CASE-2026-0001');
      expect(result.meta.total).toBe(1);
    });

    it('should throw BadRequestException for client without profile', async () => {
      const noProfileClient: AuthUser = {
        id: 'no-profile-uuid',
        email: 'noprofile@example.com',
        userType: UserType.CLIENT,
        fullName: 'No Profile',
        phoneNumber: null,
      };

      await expect(
        service.getCases(pagination, {}, noProfileClient),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on count error', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          count: null,
          error: { message: 'Count failed' },
        }),
      });

      await expect(
        service.getCases(pagination, {}, staffUser),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getCaseById', () => {
    it('should return case for staff user', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCaseRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getCaseById('case-uuid-1', staffUser);
      expect(result.id).toBe('case-uuid-1');
    });

    it('should return case for own client', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCaseRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getCaseById('case-uuid-1', clientUser);
      expect(result.id).toBe('case-uuid-1');
    });

    it('should throw ForbiddenException for other client', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCaseRow,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.getCaseById('case-uuid-1', otherClient),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when not found', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(
        service.getCaseById('nonexistent', staffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCase', () => {
    it('should update case fields', async () => {
      const updatedRow = { ...mockCaseRow, title: 'Updated Title' };
      mockAdminClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedRow,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateCase(
        'case-uuid-1',
        { title: 'Updated Title' },
        staffUser,
      );

      expect(result.title).toBe('Updated Title');
    });

    it('should throw BadRequestException when no fields provided', async () => {
      await expect(
        service.updateCase('case-uuid-1', {}, staffUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when case not found', async () => {
      mockAdminClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.updateCase('nonexistent', { title: 'X' }, staffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCaseStatus', () => {
    it('should update status and log activity', async () => {
      // Fetch current status
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { status: 'pending' },
              error: null,
            }),
          }),
        }),
      });

      // Update query
      const updatedRow = { ...mockCaseRow, status: 'active' };
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedRow,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateCaseStatus(
        'case-uuid-1',
        { status: CaseStatus.ACTIVE },
        staffUser,
      );

      expect(result.status).toBe(CaseStatus.ACTIVE);
      expect(mockCaseActivitiesService.createAutoActivity).toHaveBeenCalled();
    });

    it('should auto-set closing_date when status is RESOLVED', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { status: 'active' },
              error: null,
            }),
          }),
        }),
      });

      const resolvedRow = {
        ...mockCaseRow,
        status: 'resolved',
        closing_date: '2026-03-03',
      };
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: resolvedRow,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateCaseStatus(
        'case-uuid-1',
        { status: CaseStatus.RESOLVED },
        staffUser,
      );

      expect(result.closingDate).toBe('2026-03-03');
    });

    it('should throw NotFoundException when case not found for status fetch', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(
        service.updateCaseStatus(
          'nonexistent',
          { status: CaseStatus.ACTIVE },
          staffUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCase', () => {
    it('should delete case successfully', async () => {
      mockAdminClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await expect(service.deleteCase('case-uuid-1')).resolves.toBeUndefined();
    });

    it('should throw InternalServerErrorException on delete error', async () => {
      mockAdminClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'FK constraint' },
          }),
        }),
      });

      await expect(service.deleteCase('case-uuid-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('assign', () => {
    it('should assign user and log activity', async () => {
      const assignedRow = {
        ...mockCaseRow,
        assigned_to_id: 'attorney-uuid',
        assigned_to: { full_name: 'Attorney Name' },
      };

      mockAdminClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: assignedRow,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.assign(
        'case-uuid-1',
        { assignedToId: 'attorney-uuid' },
        staffUser,
      );

      expect(result.assignedToId).toBe('attorney-uuid');
      expect(result.assignedToName).toBe('Attorney Name');
      expect(mockCaseActivitiesService.createAutoActivity).toHaveBeenCalled();
    });

    it('should throw NotFoundException when case not found', async () => {
      mockAdminClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.assign('nonexistent', { assignedToId: 'x' }, staffUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCaseFromRegistration', () => {
    const mockRegistration = {
      id: 'reg-uuid',
      case_id: null,
      client_profile_id: 'client-profile-uuid',
      service_id: 'service-uuid',
      assigned_to_id: 'attorney-uuid',
      status: ServiceRegistrationStatus.PAID,
      full_name: 'Client Name',
      description_of_need: 'Need NTN registration',
      reference_number: 'SR-2026-0001',
      service: { name: 'NTN Registration', practice_area_id: 'pa-uuid' },
    };

    it('should create case from registration and link it', async () => {
      // Fetch registration
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockRegistration,
              error: null,
            }),
          }),
        }),
      });

      // Insert case
      mockAdminClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockCaseRow, id: 'new-case-uuid' },
              error: null,
            }),
          }),
        }),
      });

      // Link registration (update case_id)
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      // Update registration status
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await service.createCaseFromRegistration(
        'reg-uuid',
        {},
        staffUser,
      );

      expect(result.id).toBe('new-case-uuid');
      expect(mockCaseActivitiesService.createAutoActivity).toHaveBeenCalled();
    });

    it('should throw NotFoundException when registration not found', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(
        service.createCaseFromRegistration('nonexistent', {}, staffUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw HttpException when registration already has case', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockRegistration, case_id: 'existing-case' },
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.createCaseFromRegistration('reg-uuid', {}, staffUser),
      ).rejects.toThrow(HttpException);
    });

    it('should throw when registration has invalid status', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                ...mockRegistration,
                status: ServiceRegistrationStatus.PENDING_PAYMENT,
              },
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.createCaseFromRegistration('reg-uuid', {}, staffUser),
      ).rejects.toThrow(HttpException);
    });

    it('should throw when registration has no client profile', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockRegistration, client_profile_id: null },
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.createCaseFromRegistration('reg-uuid', {}, staffUser),
      ).rejects.toThrow(HttpException);
    });
  });
});
```

**Step 2: Run tests to verify they pass**

Run: `cd apps/api && pnpm jest src/cases/cases.service.spec.ts --verbose`
Expected: All ~18 tests PASS

**Step 3: Commit**

```bash
git add apps/api/src/cases/cases.service.spec.ts
git commit -m "test(cases): add CasesService unit tests (18 tests)"
```

---

### Task 2: CaseActivitiesService unit tests

**Files:**
- Create: `apps/api/src/cases/case-activities.service.spec.ts`
- Reference: `apps/api/src/cases/case-activities.service.ts`

**Step 1: Write the full test file**

```typescript
/**
 * CaseActivitiesService Unit Tests
 *
 * Tests case activity timeline operations including:
 * - getCaseActivities (paginated)
 * - addCaseActivity (manual entry)
 * - createAutoActivity (silent failure on error)
 *
 * @module CaseActivitiesServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { CaseActivitiesService } from './case-activities.service';
import { SupabaseService } from '../database/supabase.service';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { CaseActivityType } from '@repo/shared';

const mockAdminClient = {
  from: jest.fn(),
};

const staffUser: AuthUser = {
  id: 'staff-uuid',
  email: 'staff@arco.com',
  userType: UserType.STAFF,
  fullName: 'Staff User',
  phoneNumber: null,
};

const mockActivityRow = {
  id: 'activity-uuid-1',
  case_id: 'case-uuid-1',
  activity_type: 'note_added',
  title: 'Filed motion',
  description: 'Motion filed with court',
  created_by: 'staff-uuid',
  attachments: null,
  created_at: '2026-01-15T10:00:00Z',
  creator: { full_name: 'Staff User' },
};

describe('CaseActivitiesService', () => {
  let service: CaseActivitiesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAdminClient.from.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaseActivitiesService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<CaseActivitiesService>(CaseActivitiesService);
  });

  describe('getCaseActivities', () => {
    it('should return paginated activities', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [mockActivityRow],
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      });

      const result = await service.getCaseActivities('case-uuid-1', {
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Filed motion');
      expect(result.data[0].createdByName).toBe('Staff User');
      expect(result.meta.total).toBe(1);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Query failed' },
                count: null,
              }),
            }),
          }),
        }),
      });

      await expect(
        service.getCaseActivities('case-uuid-1', {
          page: 1,
          limit: 20,
          sort: 'created_at',
          order: 'desc',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('addCaseActivity', () => {
    it('should add activity and return mapped response', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockActivityRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.addCaseActivity(
        'case-uuid-1',
        {
          activityType: CaseActivityType.NOTE_ADDED,
          title: 'Filed motion',
          description: 'Motion filed with court',
        },
        staffUser,
      );

      expect(result.title).toBe('Filed motion');
      expect(result.caseId).toBe('case-uuid-1');
    });

    it('should throw InternalServerErrorException on insert failure', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      });

      await expect(
        service.addCaseActivity(
          'case-uuid-1',
          {
            activityType: CaseActivityType.NOTE_ADDED,
            title: 'Fail',
          },
          staffUser,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createAutoActivity', () => {
    it('should insert activity without throwing', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      await expect(
        service.createAutoActivity(
          'case-uuid-1',
          CaseActivityType.CASE_CREATED,
          'Case created',
          'Description',
          'staff-uuid',
        ),
      ).resolves.toBeUndefined();
    });

    it('should not throw on DB error (logs warning instead)', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Insert failed' },
        }),
      });

      await expect(
        service.createAutoActivity(
          'case-uuid-1',
          CaseActivityType.CASE_CREATED,
          'Case created',
          null,
          'staff-uuid',
        ),
      ).resolves.toBeUndefined();
    });

    it('should not throw on exception (catches silently)', async () => {
      mockAdminClient.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(
        service.createAutoActivity(
          'case-uuid-1',
          CaseActivityType.CASE_CREATED,
          'Case created',
          null,
          'staff-uuid',
        ),
      ).resolves.toBeUndefined();
    });
  });
});
```

**Step 2: Run tests**

Run: `cd apps/api && pnpm jest src/cases/case-activities.service.spec.ts --verbose`
Expected: All 6 tests PASS

**Step 3: Commit**

```bash
git add apps/api/src/cases/case-activities.service.spec.ts
git commit -m "test(cases): add CaseActivitiesService unit tests (6 tests)"
```

---

## Batch 2: Dashboard Module Unit Tests

### Task 3: DashboardService unit tests

**Files:**
- Create: `apps/api/src/dashboard/dashboard.service.spec.ts`
- Reference: `apps/api/src/dashboard/dashboard.service.ts`

**Step 1: Write the full test file**

```typescript
/**
 * DashboardService Unit Tests
 *
 * Tests dashboard statistics including:
 * - getAdminStats (totalClients, activeCases, pendingAppointments)
 * - getClientStats (myCases, upcomingAppointments, pendingInvoices)
 * - getAnalyticsStats (activeSubscribers, openComplaints, pendingRegistrations)
 * - getRecentActivities (activity feed with user names)
 * - getCaseAnalytics (breakdown by status/priority, resolution rate)
 *
 * @module DashboardServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { SupabaseService } from '../database/supabase.service';

const mockAdminClient = {
  from: jest.fn(),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAdminClient.from.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getAdminStats', () => {
    it('should return admin stats with correct counts', async () => {
      // Mock 3 parallel queries via Promise.all
      const mockSelectHead = (count: number) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({ count, error: null }),
            }),
          }),
          in: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({ count, error: null }),
          }),
        }),
      });

      // user_profiles count
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 42, error: null }),
        }),
      });

      // cases count
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ count: 15, error: null }),
        }),
      });

      // appointments count
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({ count: 7, error: null }),
          }),
        }),
      });

      const result = await service.getAdminStats();

      expect(result.totalClients).toBe(42);
      expect(result.activeCases).toBe(15);
      expect(result.pendingAppointments).toBe(7);
    });

    it('should return 0 on DB errors', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            count: null,
            error: { message: 'Error' },
          }),
        }),
      });
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({
            count: null,
            error: { message: 'Error' },
          }),
        }),
      });
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({
              count: null,
              error: { message: 'Error' },
            }),
          }),
        }),
      });

      const result = await service.getAdminStats();

      expect(result.totalClients).toBe(0);
      expect(result.activeCases).toBe(0);
      expect(result.pendingAppointments).toBe(0);
    });
  });

  describe('getClientStats', () => {
    it('should return client stats for given profile', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 3, error: null }),
        }),
      });
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({ count: 1, error: null }),
            }),
          }),
        }),
      });
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ count: 2, error: null }),
          }),
        }),
      });

      const result = await service.getClientStats('client-profile-uuid');

      expect(result.myCases).toBe(3);
      expect(result.upcomingAppointments).toBe(1);
      expect(result.pendingInvoices).toBe(2);
    });
  });

  describe('getAnalyticsStats', () => {
    it('should return analytics counts', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 10, error: null }),
        }),
      });
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ count: 5, error: null }),
        }),
      });
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ count: 8, error: null }),
        }),
      });

      const result = await service.getAnalyticsStats();

      expect(result.activeSubscribers).toBe(10);
      expect(result.openComplaints).toBe(5);
      expect(result.pendingRegistrations).toBe(8);
    });
  });

  describe('getRecentActivities', () => {
    it('should return mapped activities with user names', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'log-1',
                  user_id: 'user-uuid',
                  action: 'signin',
                  entity_type: 'auth',
                  entity_id: null,
                  metadata: {},
                  ip_address: '127.0.0.1',
                  user_agent: 'Chrome',
                  created_at: '2026-01-15T10:00:00Z',
                  user_profiles: { full_name: 'John Doe' },
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getRecentActivities(10);

      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe('John Doe');
      expect(result[0].action).toBe('signin');
    });

    it('should return empty array on DB error', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Query failed' },
            }),
          }),
        }),
      });

      const result = await service.getRecentActivities();
      expect(result).toEqual([]);
    });
  });

  describe('getCaseAnalytics', () => {
    it('should compute analytics with resolution rate', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            {
              status: 'active',
              priority: 'high',
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-10T00:00:00Z',
            },
            {
              status: 'resolved',
              priority: 'medium',
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-11T00:00:00Z',
            },
          ],
          error: null,
        }),
      });

      const result = await service.getCaseAnalytics();

      expect(result.totalCases).toBe(2);
      expect(result.byStatus.active).toBe(1);
      expect(result.byStatus.resolved).toBe(1);
      expect(result.byPriority.high).toBe(1);
      expect(result.byPriority.medium).toBe(1);
      expect(result.resolutionRate).toBe(50);
      expect(result.avgResolutionDays).toBe(10);
    });

    it('should return defaults on DB error', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed' },
        }),
      });

      const result = await service.getCaseAnalytics();

      expect(result.totalCases).toBe(0);
      expect(result.resolutionRate).toBe(0);
    });
  });
});
```

**Step 2: Run tests**

Run: `cd apps/api && pnpm jest src/dashboard/dashboard.service.spec.ts --verbose`
Expected: All ~8 tests PASS

**Step 3: Commit**

```bash
git add apps/api/src/dashboard/dashboard.service.spec.ts
git commit -m "test(dashboard): add DashboardService unit tests (8 tests)"
```

---

## Batch 3: Consultations Module Unit Tests (Non-Payment)

### Task 4: ConsultationsService unit tests (non-payment methods)

**Files:**
- Create: `apps/api/src/consultations/consultations.service.spec.ts`
- Reference: `apps/api/src/consultations/consultations.service.ts`
- Reference: `apps/api/src/consultations/consultations.types.ts`

**Step 1: Write the full test file**

```typescript
/**
 * ConsultationsService Unit Tests (Non-Payment)
 *
 * Tests consultation booking operations excluding payment methods:
 * - createBooking
 * - getBookingStatus
 * - getMyConsultations
 * - getBookings (staff)
 * - getBookingById
 * - cancelBooking
 * - handleCalcomWebhook
 *
 * Payment methods (initiatePayment, confirmPayment) are skipped
 * because Safepay will be replaced with Lemon Squeezy.
 *
 * @module ConsultationsServiceSpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { SupabaseService } from '../database/supabase.service';
import { SafepayService } from '../payments/safepay.service';
import {
  ConsultationBookingStatus,
  ConsultationPaymentStatus,
} from '@repo/shared';

const mockAdminClient = {
  from: jest.fn(),
};

const mockBookingRow = {
  id: 'booking-uuid-1',
  reference_number: 'CON-2026-0001',
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  phone_number: '+923001234567',
  practice_area: 'Corporate Law',
  urgency: 'high',
  issue_summary: 'Need advice on partnership agreement',
  relevant_dates: null,
  opposing_party: null,
  additional_notes: null,
  consultation_fee: 50000,
  payment_status: 'pending',
  safepay_tracker_token: null,
  safepay_transaction_ref: null,
  calcom_booking_uid: null,
  calcom_booking_id: null,
  booking_date: null,
  booking_time: null,
  meeting_link: null,
  booking_status: 'pending_payment',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
};

describe('ConsultationsService', () => {
  let service: ConsultationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAdminClient.from.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationsService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
          },
        },
        {
          provide: SafepayService,
          useValue: {
            createPaymentSession: jest.fn(),
            generateCheckoutUrl: jest.fn(),
            verifyPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConsultationsService>(ConsultationsService);
  });

  describe('createBooking', () => {
    it('should create booking successfully', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockBookingRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createBooking({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '+923001234567',
        practiceArea: 'Corporate Law',
        urgency: 'high' as never,
        issueSummary: 'Need advice on partnership agreement',
      });

      expect(result.referenceNumber).toBe('CON-2026-0001');
      expect(result.fullName).toBe('Jane Doe');
    });

    it('should throw BadRequestException on insert failure', async () => {
      mockAdminClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      });

      await expect(
        service.createBooking({
          fullName: 'Fail',
          email: 'fail@example.com',
          phoneNumber: '+923001234567',
          practiceArea: 'Corporate Law',
          urgency: 'high' as never,
          issueSummary: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBookingStatus', () => {
    it('should return status for valid ref + email', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  reference_number: 'CON-2026-0001',
                  booking_status: 'pending_payment',
                  payment_status: 'pending',
                  booking_date: null,
                  booking_time: null,
                  meeting_link: null,
                  created_at: '2026-01-15T10:00:00Z',
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.getBookingStatus({
        referenceNumber: 'CON-2026-0001',
        email: 'jane@example.com',
      });

      expect(result.referenceNumber).toBe('CON-2026-0001');
    });

    it('should throw NotFoundException for invalid ref/email', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.getBookingStatus({
          referenceNumber: 'CON-9999-9999',
          email: 'wrong@example.com',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBookings', () => {
    it('should return paginated bookings', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [mockBookingRow],
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const result = await service.getBookings({
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getBookingById', () => {
    it('should return booking by ID', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockBookingRow,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getBookingById('booking-uuid-1');
      expect(result.id).toBe('booking-uuid-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockAdminClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(service.getBookingById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      // Fetch booking status
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { booking_status: 'pending_payment' },
              error: null,
            }),
          }),
        }),
      });

      // Update to cancelled
      const cancelledRow = {
        ...mockBookingRow,
        booking_status: ConsultationBookingStatus.CANCELLED,
      };
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: cancelledRow,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.cancelBooking('booking-uuid-1');
      expect(result.bookingStatus).toBe(ConsultationBookingStatus.CANCELLED);
    });

    it('should throw NotFoundException when not found', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await expect(service.cancelBooking('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException for completed booking', async () => {
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { booking_status: ConsultationBookingStatus.COMPLETED },
              error: null,
            }),
          }),
        }),
      });

      await expect(service.cancelBooking('booking-uuid-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('handleCalcomWebhook', () => {
    it('should link Cal.com booking by reference number', async () => {
      // Match by reference_number
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                ...mockBookingRow,
                booking_status: ConsultationBookingStatus.PAYMENT_CONFIRMED,
                payment_status: ConsultationPaymentStatus.PAID,
                calcom_booking_uid: null,
              },
              error: null,
            }),
          }),
        }),
      });

      // Update with Cal.com data
      const updatedRow = {
        ...mockBookingRow,
        calcom_booking_uid: 'calcom-uid-123',
        calcom_booking_id: 12345,
        booking_date: '2026-03-15',
        booking_time: '10:00',
        booking_status: ConsultationBookingStatus.BOOKED,
      };
      mockAdminClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedRow,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.handleCalcomWebhook({
        triggerEvent: 'BOOKING_CREATED',
        payload: {
          uid: 'calcom-uid-123',
          id: 12345,
          startTime: '2026-03-15T10:00:00Z',
          metadata: { referenceNumber: 'CON-2026-0001' },
        },
      });

      expect(result).not.toBeNull();
      expect(result!.bookingStatus).toBe(ConsultationBookingStatus.BOOKED);
    });

    it('should ignore non-BOOKING_CREATED events', async () => {
      const result = await service.handleCalcomWebhook({
        triggerEvent: 'BOOKING_CANCELLED',
        payload: { uid: 'x', id: 1, startTime: '2026-01-01T00:00:00Z' },
      });

      expect(result).toBeNull();
    });

    it('should return null when no matching booking', async () => {
      // Match by reference fails
      mockAdminClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.handleCalcomWebhook({
        triggerEvent: 'BOOKING_CREATED',
        payload: {
          uid: 'x',
          id: 1,
          startTime: '2026-01-01T00:00:00Z',
          metadata: { referenceNumber: 'NONEXISTENT' },
        },
      });

      expect(result).toBeNull();
    });
  });
});
```

**Step 2: Run tests**

Run: `cd apps/api && pnpm jest src/consultations/consultations.service.spec.ts --verbose`
Expected: All ~12 tests PASS

**Step 3: Commit**

```bash
git add apps/api/src/consultations/consultations.service.spec.ts
git commit -m "test(consultations): add ConsultationsService unit tests, non-payment (12 tests)"
```

---

## Batch 4: E2E Tests — Cases Endpoints

### Task 5: Cases e2e tests

**Files:**
- Create: `apps/api/test/cases.e2e-spec.ts`
- Reference: `apps/api/src/cases/cases.controller.ts`
- Reference: `apps/api/src/cases/cases.module.ts`

**Step 1: Write the full e2e test file**

```typescript
/**
 * Cases Controller E2E Tests
 *
 * Tests full HTTP request pipeline for cases endpoints.
 * Guards are overridden so requests pass without real auth.
 * Services are mocked to return test data.
 *
 * @module CasesE2ESpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { CasesModule } from '../src/cases/cases.module';
import { CasesService } from '../src/cases/cases.service';
import { CaseActivitiesService } from '../src/cases/case-activities.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { SupabaseService } from '../src/database/supabase.service';
import { Reflector } from '@nestjs/core';

const mockCaseResponse = {
  id: 'case-uuid-1',
  caseNumber: 'CASE-2026-0001',
  clientProfileId: 'client-profile-uuid',
  clientName: 'Test Client',
  assignedToId: null,
  assignedToName: null,
  practiceAreaId: 'pa-uuid',
  practiceAreaName: 'Corporate Law',
  serviceId: null,
  serviceName: null,
  title: 'Contract Dispute',
  description: null,
  status: 'pending',
  priority: 'medium',
  caseType: null,
  filingDate: null,
  closingDate: null,
  serviceRegistrationId: null,
  serviceRegistrationNumber: null,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

const mockActivityResponse = {
  id: 'activity-uuid-1',
  caseId: 'case-uuid-1',
  activityType: 'note_added',
  title: 'Filed motion',
  description: null,
  createdBy: 'staff-uuid',
  createdByName: 'Staff User',
  attachments: null,
  createdAt: '2026-01-15T10:00:00Z',
};

const mockCasesService = {
  createCase: jest.fn().mockResolvedValue(mockCaseResponse),
  getCases: jest.fn().mockResolvedValue({
    data: [mockCaseResponse],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  }),
  getCaseById: jest.fn().mockResolvedValue(mockCaseResponse),
  updateCase: jest.fn().mockResolvedValue(mockCaseResponse),
  updateCaseStatus: jest.fn().mockResolvedValue(mockCaseResponse),
  deleteCase: jest.fn().mockResolvedValue(undefined),
  assign: jest.fn().mockResolvedValue(mockCaseResponse),
  createCaseFromRegistration: jest.fn().mockResolvedValue(mockCaseResponse),
};

const mockCaseActivitiesService = {
  getCaseActivities: jest.fn().mockResolvedValue({
    data: [mockActivityResponse],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  }),
  addCaseActivity: jest.fn().mockResolvedValue(mockActivityResponse),
  createAutoActivity: jest.fn().mockResolvedValue(undefined),
};

describe('CasesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CasesModule],
    })
      .overrideProvider(SupabaseService)
      .useValue({ getAdminClient: jest.fn() })
      .overrideProvider(CasesService)
      .useValue(mockCasesService)
      .overrideProvider(CaseActivitiesService)
      .useValue(mockCaseActivitiesService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'staff-uuid',
            email: 'staff@arco.com',
            userType: 'admin',
            fullName: 'Staff User',
            phoneNumber: null,
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/cases → 201', () => {
    return request(app.getHttpServer())
      .post('/api/cases')
      .send({
        clientProfileId: 'client-profile-uuid',
        practiceAreaId: 'pa-uuid',
        title: 'Contract Dispute',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.caseNumber).toBe('CASE-2026-0001');
      });
  });

  it('GET /api/cases → 200', () => {
    return request(app.getHttpServer())
      .get('/api/cases?page=1&limit=20')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(1);
      });
  });

  it('GET /api/cases/:id → 200', () => {
    return request(app.getHttpServer())
      .get('/api/cases/case-uuid-1')
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe('case-uuid-1');
      });
  });

  it('PATCH /api/cases/:id → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/cases/case-uuid-1')
      .send({ title: 'Updated Title' })
      .expect(200);
  });

  it('PATCH /api/cases/:id/status → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/cases/case-uuid-1/status')
      .send({ status: 'active' })
      .expect(200);
  });

  it('PATCH /api/cases/:id/assign → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/cases/case-uuid-1/assign')
      .send({ assignedToId: 'attorney-uuid' })
      .expect(200);
  });

  it('DELETE /api/cases/:id → 204', () => {
    return request(app.getHttpServer())
      .delete('/api/cases/case-uuid-1')
      .expect(204);
  });

  it('POST /api/cases/from-registration/:id → 201', () => {
    return request(app.getHttpServer())
      .post('/api/cases/from-registration/reg-uuid')
      .send({})
      .expect(201);
  });

  it('GET /api/cases/:id/activities → 200', () => {
    return request(app.getHttpServer())
      .get('/api/cases/case-uuid-1/activities?page=1&limit=20')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(1);
      });
  });

  it('POST /api/cases/:id/activities → 201', () => {
    return request(app.getHttpServer())
      .post('/api/cases/case-uuid-1/activities')
      .send({
        activityType: 'note_added',
        title: 'Filed motion',
      })
      .expect(201);
  });
});
```

**Step 2: Run tests**

Run: `cd apps/api && pnpm jest test/cases.e2e-spec.ts --config test/jest-e2e.json --verbose`
Expected: All 10 tests PASS

**Step 3: Commit**

```bash
git add apps/api/test/cases.e2e-spec.ts
git commit -m "test(cases): add Cases controller e2e tests (10 tests)"
```

---

## Batch 5: E2E Tests — Auth Endpoints

### Task 6: Auth e2e tests

**Files:**
- Create: `apps/api/test/auth.e2e-spec.ts`
- Reference: `apps/api/src/auth/auth.controller.ts`
- Reference: `apps/api/src/auth/auth.module.ts`

**Step 1: Write the full e2e test file**

```typescript
/**
 * Auth Controller E2E Tests
 *
 * Tests full HTTP request pipeline for auth endpoints.
 * AuthService is mocked. Public routes bypass guards.
 *
 * @module AuthE2ESpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { SupabaseService } from '../src/database/supabase.service';
import { AdminWhitelistService } from '../src/database/admin-whitelist.service';
import { AuditService } from '../src/audit/audit.service';

const mockAuthService = {
  signup: jest.fn().mockResolvedValue({
    message: 'Please check your email to confirm your account.',
    email: 'client@example.com',
  }),
  signin: jest.fn().mockResolvedValue({
    accessToken: 'at',
    refreshToken: 'rt',
    user: {
      id: 'uuid',
      email: 'user@example.com',
      fullName: 'User',
      userType: 'client',
    },
  }),
  processOAuthCallback: jest.fn().mockResolvedValue({
    accessToken: 'at',
    refreshToken: 'rt',
    user: {
      id: 'uuid',
      email: 'user@gmail.com',
      fullName: 'OAuth User',
      userType: 'client',
    },
  }),
  refreshToken: jest.fn().mockResolvedValue({
    accessToken: 'new-at',
    refreshToken: 'new-rt',
    user: {
      id: 'uuid',
      email: 'user@example.com',
      fullName: 'User',
      userType: 'client',
    },
  }),
  requestPasswordReset: jest.fn().mockResolvedValue({
    message: 'If an account exists, a password reset link has been sent.',
  }),
  confirmPasswordReset: jest.fn().mockResolvedValue({
    message: 'Password updated successfully.',
  }),
  getCurrentUser: jest.fn().mockResolvedValue({
    id: 'uuid',
    email: 'user@example.com',
    fullName: 'User',
    userType: 'client',
  }),
  signout: jest.fn().mockResolvedValue({
    message: 'Signed out successfully.',
  }),
};

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(SupabaseService)
      .useValue({ getAdminClient: jest.fn(), getUserFromToken: jest.fn() })
      .overrideProvider(AdminWhitelistService)
      .useValue({ isAdminEmail: jest.fn().mockReturnValue(false) })
      .overrideProvider(AuditService)
      .useValue({ log: jest.fn() })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'uuid',
            email: 'user@example.com',
            userType: 'client',
            fullName: 'User',
            phoneNumber: null,
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/signup → 201', () => {
    return request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'client@example.com',
        password: 'SecureP@ss1',
        fullName: 'Client User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toContain('email');
      });
  });

  it('POST /api/auth/signin → 200', () => {
    return request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({ email: 'user@example.com', password: 'SecureP@ss1' })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBe('at');
      });
  });

  it('POST /api/auth/oauth/callback → 200', () => {
    return request(app.getHttpServer())
      .post('/api/auth/oauth/callback')
      .send({ accessToken: 'oauth-at', refreshToken: 'oauth-rt' })
      .expect(200)
      .expect((res) => {
        expect(res.body.user.email).toBe('user@gmail.com');
      });
  });

  it('POST /api/auth/refresh → 200', () => {
    return request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: 'old-rt' })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBe('new-at');
      });
  });

  it('POST /api/auth/password-reset/request → 200', () => {
    return request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send({ email: 'anyone@example.com' })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('password reset link');
      });
  });

  it('GET /api/auth/me → 200', () => {
    return request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('user@example.com');
      });
  });
});
```

**Step 2: Run tests**

Run: `cd apps/api && pnpm jest test/auth.e2e-spec.ts --config test/jest-e2e.json --verbose`
Expected: All 6 tests PASS

**Step 3: Commit**

```bash
git add apps/api/test/auth.e2e-spec.ts
git commit -m "test(auth): add Auth controller e2e tests (6 tests)"
```

---

## Batch 6: E2E Tests — Consultations Endpoints (Non-Payment)

### Task 7: Consultations e2e tests

**Files:**
- Create: `apps/api/test/consultations.e2e-spec.ts`
- Reference: `apps/api/src/consultations/consultations.controller.ts`
- Reference: `apps/api/src/consultations/consultations.module.ts`

**Step 1: Write the full e2e test file**

```typescript
/**
 * Consultations Controller E2E Tests (Non-Payment)
 *
 * Tests full HTTP request pipeline for non-payment consultation endpoints.
 * Payment endpoints (POST :id/pay, POST :id/confirm-payment) are skipped.
 *
 * @module ConsultationsE2ESpec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConsultationsModule } from '../src/consultations/consultations.module';
import { ConsultationsService } from '../src/consultations/consultations.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { SupabaseService } from '../src/database/supabase.service';
import { SafepayService } from '../src/payments/safepay.service';
import { ConfigService } from '@nestjs/config';

const mockBookingResponse = {
  id: 'booking-uuid-1',
  referenceNumber: 'CON-2026-0001',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phoneNumber: '+923001234567',
  practiceArea: 'Corporate Law',
  urgency: 'high',
  issueSummary: 'Need advice',
  relevantDates: null,
  opposingParty: null,
  additionalNotes: null,
  consultationFee: 50000,
  paymentStatus: 'pending',
  safepayTrackerToken: null,
  safepayTransactionRef: null,
  calcomBookingUid: null,
  calcomBookingId: null,
  bookingDate: null,
  bookingTime: null,
  meetingLink: null,
  bookingStatus: 'pending_payment',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

const mockConsultationsService = {
  createBooking: jest.fn().mockResolvedValue(mockBookingResponse),
  getBookingStatus: jest.fn().mockResolvedValue({
    referenceNumber: 'CON-2026-0001',
    bookingStatus: 'pending_payment',
    paymentStatus: 'pending',
    bookingDate: null,
    bookingTime: null,
    meetingLink: null,
    createdAt: '2026-01-15T10:00:00Z',
  }),
  handleCalcomWebhook: jest.fn().mockResolvedValue(null),
  getBookings: jest.fn().mockResolvedValue({
    data: [mockBookingResponse],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  }),
  getMyConsultations: jest.fn().mockResolvedValue({
    data: [mockBookingResponse],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  }),
  getBookingById: jest.fn().mockResolvedValue(mockBookingResponse),
  cancelBooking: jest.fn().mockResolvedValue({
    ...mockBookingResponse,
    bookingStatus: 'cancelled',
  }),
  initiatePayment: jest.fn(),
  confirmPayment: jest.fn(),
};

describe('ConsultationsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConsultationsModule],
    })
      .overrideProvider(SupabaseService)
      .useValue({ getAdminClient: jest.fn() })
      .overrideProvider(SafepayService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({ get: jest.fn() })
      .overrideProvider(ConsultationsService)
      .useValue(mockConsultationsService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'staff-uuid',
            email: 'staff@arco.com',
            userType: 'admin',
            fullName: 'Staff User',
            phoneNumber: null,
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/consultations → 201', () => {
    return request(app.getHttpServer())
      .post('/api/consultations')
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '+923001234567',
        practiceArea: 'Corporate Law',
        urgency: 'high',
        issueSummary: 'Need legal advice on partnership agreement',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.referenceNumber).toBe('CON-2026-0001');
      });
  });

  it('GET /api/consultations/status → 200', () => {
    return request(app.getHttpServer())
      .get(
        '/api/consultations/status?referenceNumber=CON-2026-0001&email=jane@example.com',
      )
      .expect(200)
      .expect((res) => {
        expect(res.body.referenceNumber).toBe('CON-2026-0001');
      });
  });

  it('POST /api/consultations/webhook/calcom → 200', () => {
    return request(app.getHttpServer())
      .post('/api/consultations/webhook/calcom')
      .send({
        triggerEvent: 'BOOKING_CREATED',
        payload: {
          uid: 'calcom-uid',
          id: 12345,
          startTime: '2026-03-15T10:00:00Z',
        },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.received).toBe(true);
      });
  });

  it('GET /api/consultations → 200', () => {
    return request(app.getHttpServer())
      .get('/api/consultations?page=1&limit=20')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(1);
      });
  });

  it('GET /api/consultations/my → 200', () => {
    return request(app.getHttpServer())
      .get('/api/consultations/my?page=1&limit=10')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(1);
      });
  });

  it('GET /api/consultations/:id → 200', () => {
    return request(app.getHttpServer())
      .get('/api/consultations/booking-uuid-1')
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe('booking-uuid-1');
      });
  });

  it('PATCH /api/consultations/:id/cancel → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/consultations/booking-uuid-1/cancel')
      .expect(200)
      .expect((res) => {
        expect(res.body.bookingStatus).toBe('cancelled');
      });
  });
});
```

**Step 2: Run tests**

Run: `cd apps/api && pnpm jest test/consultations.e2e-spec.ts --config test/jest-e2e.json --verbose`
Expected: All 7 tests PASS

**Step 3: Commit**

```bash
git add apps/api/test/consultations.e2e-spec.ts
git commit -m "test(consultations): add Consultations controller e2e tests, non-payment (7 tests)"
```

---

## Final Verification

### Task 8: Run all tests and verify

**Step 1: Run all unit tests**

Run: `cd apps/api && pnpm test --verbose`
Expected: All tests PASS (existing + new ~62 tests)

**Step 2: Run all e2e tests**

Run: `cd apps/api && pnpm jest --config test/jest-e2e.json --verbose`
Expected: All e2e tests PASS

**Step 3: Run TypeScript type check**

Run: `cd apps/api && pnpm tsc --noEmit`
Expected: No type errors

**Step 4: Final commit with all passing**

```bash
git add -A
git commit -m "test: complete HEAD TASK 13 — testing & validation (62 new tests)"
```
