/**
 * Practice Areas Controller
 *
 * Exposes a read-only endpoint for listing practice areas.
 * Used by admin forms to populate practice area dropdowns.
 *
 * @module PracticeAreasController
 *
 * @example
 * ```
 * GET /api/practice-areas
 * Authorization: Bearer <token>
 *
 * Response: [{ "id": "uuid", "name": "Corporate Law" }, ...]
 * ```
 */

import { Controller, Get } from '@nestjs/common';
import { PracticeAreasService, type PracticeAreaRow } from './practice-areas.service';

/**
 * Controller for practice area endpoints
 *
 * @class PracticeAreasController
 */
@Controller('practice-areas')
export class PracticeAreasController {
  constructor(private readonly practiceAreasService: PracticeAreasService) {}

  /**
   * List all practice areas
   *
   * Returns all practice areas sorted by name.
   * Requires authentication (default guard).
   *
   * @returns Array of practice areas
   */
  @Get()
  async getPracticeAreas(): Promise<PracticeAreaRow[]> {
    return this.practiceAreasService.getPracticeAreas();
  }
}
