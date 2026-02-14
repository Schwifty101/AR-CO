/**
 * Practice Areas Service
 *
 * Handles retrieval of practice areas from the database.
 * Practice areas represent the firm's legal specializations
 * (Corporate Law, Tax Law, Immigration, etc.).
 *
 * @module PracticeAreasService
 *
 * @example
 * ```typescript
 * const areas = await practiceAreasService.getPracticeAreas();
 * // [{ id: 'uuid', name: 'Corporate Law' }, ...]
 * ```
 */

import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

/** Practice area row shape from the database */
export interface PracticeAreaRow {
  /** UUID primary key */
  id: string;
  /** Display name of the practice area */
  name: string;
}

/**
 * Service for retrieving practice areas
 *
 * @class PracticeAreasService
 */
@Injectable()
export class PracticeAreasService {
  private readonly logger = new Logger(PracticeAreasService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Fetch all practice areas ordered by name
   *
   * @returns Array of practice areas with id and name
   * @throws {InternalServerErrorException} If database query fails
   *
   * @example
   * ```typescript
   * const areas = await service.getPracticeAreas();
   * // [{ id: '...', name: 'Corporate Law' }, { id: '...', name: 'Tax Law' }]
   * ```
   */
  async getPracticeAreas(): Promise<PracticeAreaRow[]> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient
      .from('practice_areas')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch practice areas', error);
      throw new InternalServerErrorException('Failed to fetch practice areas');
    }

    return (data ?? []) as PracticeAreaRow[];
  }
}
