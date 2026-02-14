/**
 * Cases Controller
 *
 * Exposes REST endpoints for case management including CRUD operations,
 * attorney assignment, status updates, and case activity timeline.
 *
 * All routes are prefixed with /api/cases (global prefix in main.ts).
 *
 * @module CasesController
 *
 * @example
 * ```typescript
 * // Create a case (staff only)
 * POST /api/cases
 * Body: { clientProfileId, practiceAreaId, title, priority }
 *
 * // List cases (role-filtered)
 * GET /api/cases?page=1&limit=20&status=active&search=contract
 *
 * // Get case detail
 * GET /api/cases/:id
 *
 * // Update status (staff only)
 * PATCH /api/cases/:id/status
 * Body: { status: "resolved" }
 *
 * // Assign user to case (staff only)
 * PATCH /api/cases/:id/assign
 * Body: { assignedToId: "uuid" }
 *
 * // Get case activities
 * GET /api/cases/:id/activities?page=1&limit=20
 *
 * // Add activity (staff only)
 * POST /api/cases/:id/activities
 * Body: { activityType, title, description }
 * ```
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CaseActivitiesService } from './case-activities.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UserType } from '../common/enums/user-type.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  CreateCaseSchema,
  UpdateCaseSchema,
  UpdateCaseStatusSchema,
  AssignToSchema,
  CaseFiltersSchema,
  PaginationSchema,
  CreateCaseActivitySchema,
  type CreateCaseData,
  type UpdateCaseData,
  type UpdateCaseStatusData,
  type AssignToData,
  type CaseFilters,
  type PaginationParams,
  type CreateCaseActivityData,
  type CaseResponse,
  type PaginatedCasesResponse,
  type CaseActivityResponse,
  type PaginatedCaseActivitiesResponse,
} from '@repo/shared';

/**
 * REST controller for case management
 *
 * @class CasesController
 */
@Controller('cases')
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly caseActivitiesService: CaseActivitiesService,
  ) {}

  /**
   * Create a new case (staff only)
   *
   * @param user - The authenticated staff user
   * @param dto - Case creation data
   * @returns The created case with auto-generated case number
   */
  @Post()
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY)
  @HttpCode(HttpStatus.CREATED)
  async createCase(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateCaseSchema)) dto: CreateCaseData,
  ): Promise<CaseResponse> {
    return this.casesService.createCase(dto, user);
  }

  /**
   * Get paginated list of cases (role-filtered)
   * Staff sees all, clients see only their own cases.
   *
   * @param user - The authenticated user
   * @param pagination - Pagination parameters
   * @param filters - Optional filter criteria
   * @returns Paginated cases list
   */
  @Get()
  async getCases(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
    @Query(new ZodValidationPipe(CaseFiltersSchema))
    filters: CaseFilters,
  ): Promise<PaginatedCasesResponse> {
    return this.casesService.getCases(pagination, filters, user);
  }

  /**
   * Get a single case by ID
   *
   * @param id - The case UUID
   * @param user - The authenticated user
   * @returns The case detail with joined data
   */
  @Get(':id')
  async getCaseById(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<CaseResponse> {
    return this.casesService.getCaseById(id, user);
  }

  /**
   * Update case fields (staff only)
   *
   * @param id - The case UUID
   * @param user - The authenticated staff user
   * @param dto - Fields to update
   * @returns The updated case
   */
  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY)
  @HttpCode(HttpStatus.OK)
  async updateCase(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateCaseSchema)) dto: UpdateCaseData,
  ): Promise<CaseResponse> {
    return this.casesService.updateCase(id, dto, user);
  }

  /**
   * Update case status with auto-activity logging (staff only)
   *
   * @param id - The case UUID
   * @param user - The authenticated staff user
   * @param dto - New status
   * @returns The updated case
   */
  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY)
  @HttpCode(HttpStatus.OK)
  async updateCaseStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateCaseStatusSchema))
    dto: UpdateCaseStatusData,
  ): Promise<CaseResponse> {
    return this.casesService.updateCaseStatus(id, dto, user);
  }

  /**
   * Delete a case (admin only)
   *
   * @param id - The case UUID
   */
  @Delete(':id')
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCase(@Param('id') id: string): Promise<void> {
    return this.casesService.deleteCase(id);
  }

  /**
   * Assign a user (attorney/staff) to a case (staff only)
   *
   * @param id - The case UUID
   * @param user - The authenticated staff user
   * @param dto - Assignment data with assignedToId
   * @returns The updated case
   */
  @Patch(':id/assign')
  @Roles(UserType.ADMIN, UserType.STAFF)
  @HttpCode(HttpStatus.OK)
  async assign(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(AssignToSchema))
    dto: AssignToData,
  ): Promise<CaseResponse> {
    return this.casesService.assign(id, dto, user);
  }

  /**
   * Get paginated activities for a case
   * Verifies case access before returning activities.
   *
   * @param id - The case UUID
   * @param user - The authenticated user
   * @param pagination - Pagination parameters
   * @returns Paginated case activities
   */
  @Get(':id/activities')
  async getCaseActivities(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(PaginationSchema))
    pagination: PaginationParams,
  ): Promise<PaginatedCaseActivitiesResponse> {
    // Verify user has access to the case first
    await this.casesService.getCaseById(id, user);
    return this.caseActivitiesService.getCaseActivities(id, pagination);
  }

  /**
   * Add an activity to a case timeline (staff only)
   *
   * @param id - The case UUID
   * @param user - The authenticated staff user
   * @param dto - Activity data
   * @returns The created activity
   */
  @Post(':id/activities')
  @Roles(UserType.ADMIN, UserType.STAFF, UserType.ATTORNEY)
  @HttpCode(HttpStatus.CREATED)
  async addCaseActivity(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateCaseActivitySchema))
    dto: CreateCaseActivityData,
  ): Promise<CaseActivityResponse> {
    return this.caseActivitiesService.addCaseActivity(id, dto, user);
  }
}
