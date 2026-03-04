/**
 * Client Interactions Service
 *
 * CRM module for tracking client touchpoints (calls, emails, meetings, etc.).
 * Provides CRUD operations for staff to log and manage client interactions.
 *
 * @module ClientInteractionsService
 *
 * @example
 * ```typescript
 * const interaction = await service.logInteraction(
 *   'client-profile-uuid',
 *   { interactionType: 'call', subject: 'Follow-up on case' },
 *   currentUser,
 * );
 *
 * const upcoming = await service.getUpcomingInteractions({ page: 1, limit: 20 });
 * ```
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import type {
  CreateInteractionData,
  UpdateInteractionData,
  InteractionResponse,
  PaginatedInteractionsResponse,
} from '@repo/shared';

/** Select columns for interaction queries with staff name join */
const INTERACTION_SELECT = `
  id,
  client_profile_id,
  staff_user_id,
  interaction_type,
  subject,
  notes,
  scheduled_at,
  completed_at,
  created_at,
  updated_at,
  user_profiles!client_interactions_staff_user_id_fkey(full_name)
`;

/** @class ClientInteractionsService */
@Injectable()
export class ClientInteractionsService {
  private readonly logger = new Logger(ClientInteractionsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Log a new client interaction
   *
   * @param clientProfileId - UUID of the client_profiles row
   * @param dto - Interaction data (type, subject, notes, scheduledAt)
   * @param currentUser - Authenticated staff/admin/attorney user
   * @returns The created interaction response
   */
  async logInteraction(
    clientProfileId: string,
    dto: CreateInteractionData,
    currentUser: AuthUser,
  ): Promise<InteractionResponse> {
    const client = this.supabaseService.getAdminClient();

    const { data, error } = await client
      .from('client_interactions')
      .insert({
        client_profile_id: clientProfileId,
        staff_user_id: currentUser.id,
        interaction_type: dto.interactionType,
        subject: dto.subject,
        notes: dto.notes ?? null,
        scheduled_at: dto.scheduledAt ?? null,
      })
      .select(INTERACTION_SELECT)
      .single();

    if (error) {
      this.logger.error('Failed to log interaction', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return this.mapRow(data);
  }

  /**
   * Get paginated interactions for a specific client
   *
   * @param clientProfileId - UUID of the client_profiles row
   * @param pagination - Page and limit parameters
   * @returns Paginated list of interactions
   */
  async getClientInteractions(
    clientProfileId: string,
    pagination: { page: number; limit: number },
  ): Promise<PaginatedInteractionsResponse> {
    const client = this.supabaseService.getAdminClient();
    const { page, limit } = pagination;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await client
      .from('client_interactions')
      .select(INTERACTION_SELECT, { count: 'exact' })
      .eq('client_profile_id', clientProfileId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      this.logger.error('Failed to fetch client interactions', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return {
      data: (data ?? []).map((row) => this.mapRow(row)),
      total: count ?? 0,
      page,
      limit,
    };
  }

  /**
   * Get upcoming scheduled interactions (not yet completed)
   *
   * @param pagination - Page and limit parameters
   * @returns Paginated list of upcoming interactions sorted by scheduled date
   */
  async getUpcomingInteractions(pagination: {
    page: number;
    limit: number;
  }): Promise<PaginatedInteractionsResponse> {
    const client = this.supabaseService.getAdminClient();
    const { page, limit } = pagination;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await client
      .from('client_interactions')
      .select(INTERACTION_SELECT, { count: 'exact' })
      .not('scheduled_at', 'is', null)
      .is('completed_at', null)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .range(from, to);

    if (error) {
      this.logger.error('Failed to fetch upcoming interactions', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return {
      data: (data ?? []).map((row) => this.mapRow(row)),
      total: count ?? 0,
      page,
      limit,
    };
  }

  /**
   * Update an existing interaction
   *
   * @param interactionId - UUID of the interaction
   * @param dto - Fields to update
   * @returns Updated interaction
   */
  async updateInteraction(
    interactionId: string,
    dto: UpdateInteractionData,
  ): Promise<InteractionResponse> {
    const client = this.supabaseService.getAdminClient();

    const updateData: Record<string, unknown> = {};
    if (dto.interactionType !== undefined)
      updateData.interaction_type = dto.interactionType;
    if (dto.subject !== undefined) updateData.subject = dto.subject;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.scheduledAt !== undefined)
      updateData.scheduled_at = dto.scheduledAt;

    const { data, error } = await client
      .from('client_interactions')
      .update(updateData)
      .eq('id', interactionId)
      .select(INTERACTION_SELECT)
      .single();

    if (error) {
      this.logger.error('Failed to update interaction', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return this.mapRow(data);
  }

  /**
   * Mark an interaction as completed
   *
   * @param interactionId - UUID of the interaction
   * @returns Updated interaction with completedAt set
   */
  async completeInteraction(
    interactionId: string,
  ): Promise<InteractionResponse> {
    const client = this.supabaseService.getAdminClient();

    const { data, error } = await client
      .from('client_interactions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', interactionId)
      .select(INTERACTION_SELECT)
      .single();

    if (error) {
      this.logger.error('Failed to complete interaction', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return this.mapRow(data);
  }

  /** Map a DB row to InteractionResponse (snake_case -> camelCase) */
  private mapRow(row: Record<string, unknown>): InteractionResponse {
    const profile = row.user_profiles as { full_name: string } | null;
    return {
      id: row.id as string,
      clientProfileId: row.client_profile_id as string,
      staffUserId: row.staff_user_id as string,
      interactionType:
        row.interaction_type as InteractionResponse['interactionType'],
      subject: row.subject as string,
      notes: (row.notes as string) ?? null,
      scheduledAt: (row.scheduled_at as string) ?? null,
      completedAt: (row.completed_at as string) ?? null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      staffName: profile?.full_name ?? 'Unknown',
    };
  }
}
