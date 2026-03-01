import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import {
  type CreateLegalNewsData,
  type LegalNewsResponse,
} from '@repo/shared';
import type { DbResult, DbListResult } from '../database/db-result.types';

/** Database row shape for the legal_news table */
interface LegalNewsRow {
  id: string;
  title: string;
  source: string | null;
  url: string | null;
  published_at: string;
  created_at: string;
}

/**
 * Service for managing legal news items
 *
 * Handles creation and retrieval of legal news headlines
 * displayed on the public website.
 *
 * @example
 * ```typescript
 * const news = await legalNewsService.getLatestNews(10);
 * // [{ id: '...', title: 'New Tax Law Amendment', source: 'Dawn', ... }]
 * ```
 */
@Injectable()
export class LegalNewsService {
  private readonly logger = new Logger(LegalNewsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new legal news item
   *
   * @param dto - News item data (title, source, url, publishedAt)
   * @returns Created news item
   */
  async createNewsItem(dto: CreateLegalNewsData): Promise<LegalNewsResponse> {
    this.logger.log(`Creating legal news item: ${dto.title}`);

    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('legal_news')
      .insert({
        title: dto.title,
        source: dto.source ?? null,
        url: dto.url ?? null,
        published_at: dto.publishedAt,
      })
      .select('*')
      .single()) as DbResult<LegalNewsRow>;

    if (error || !data) {
      this.logger.error('Failed to create legal news item', error);
      throw new InternalServerErrorException('Failed to create news item');
    }

    this.logger.log(`Legal news item created: ${data.id}`);
    return this.mapNewsRow(data);
  }

  /**
   * Get latest legal news items ordered by published date
   *
   * @param limit - Maximum number of items to return (default: 20)
   * @returns List of latest news items
   */
  async getLatestNews(limit = 20): Promise<LegalNewsResponse[]> {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = (await adminClient
      .from('legal_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)) as DbListResult<LegalNewsRow>;

    if (error) {
      this.logger.error('Failed to fetch legal news', error);
      throw new InternalServerErrorException('Failed to fetch news');
    }

    return (data ?? []).map((row) => this.mapNewsRow(row));
  }

  /**
   * Maps a database row (snake_case) to a LegalNewsResponse (camelCase)
   */
  private mapNewsRow(row: LegalNewsRow): LegalNewsResponse {
    return {
      id: row.id,
      title: row.title,
      source: row.source,
      url: row.url,
      publishedAt: row.published_at,
      createdAt: row.created_at,
    };
  }
}
