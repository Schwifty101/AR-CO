/**
 * Pagination DTO
 *
 * Data Transfer Object for paginated queries.
 * Provides validation and defaults for page-based pagination.
 *
 * @module PaginationDto
 *
 * @example
 * ```typescript
 * import { PaginationDto } from './common/dto/pagination.dto';
 * import { Query } from '@nestjs/common';
 *
 * @Controller('cases')
 * export class CasesController {
 *   @Get()
 *   async findAll(@Query() pagination: PaginationDto) {
 *     // pagination.page defaults to 1
 *     // pagination.limit defaults to 20, max 100
 *     // pagination.sort defaults to 'created_at'
 *     // pagination.order defaults to 'desc'
 *
 *     const offset = (pagination.page - 1) * pagination.limit;
 *     const { data, error } = await supabase
 *       .from('cases')
 *       .select('*')
 *       .order(pagination.sort, { ascending: pagination.order === 'asc' })
 *       .range(offset, offset + pagination.limit - 1);
 *
 *     return { data, page: pagination.page, limit: pagination.limit };
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Query string examples
 * // GET /api/cases?page=2&limit=50
 * // GET /api/cases?sort=title&order=asc
 * // GET /api/cases (uses all defaults)
 * ```
 */

import { IsInt, IsOptional, IsString, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Pagination DTO with validation
 *
 * Validates and transforms query parameters for paginated endpoints.
 * All fields are optional with sensible defaults.
 *
 * @class PaginationDto
 */
export class PaginationDto {
  /**
   * Page number (1-indexed)
   * Must be a positive integer
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  /**
   * Number of items per page
   * Must be between 1 and 100
   * @default 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number = 20;

  /**
   * Field to sort by
   * Should match database column name
   * @default 'created_at'
   */
  @IsOptional()
  @IsString({ message: 'Sort must be a string' })
  sort: string = 'created_at';

  /**
   * Sort order (ascending or descending)
   * @default 'desc'
   */
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Order must be either "asc" or "desc"' })
  order: 'asc' | 'desc' = 'desc';
}
