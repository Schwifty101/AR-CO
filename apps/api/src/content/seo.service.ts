import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

/** Generated SEO fields for a content post */
export interface SeoFields {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  readTime: string;
  excerpt: string;
}

/**
 * Service for auto-generating SEO fields from content
 *
 * Generates slug, meta title, meta description, read time, and excerpt
 * from the post title and content. All generated fields are meant to be
 * editable by admin before publishing.
 *
 * @example
 * ```typescript
 * const seo = await seoService.generateSeoFields('My Blog Post Title', '<p>Content...</p>');
 * // { slug: 'my-blog-post-title', metaTitle: 'My Blog Post Title | AR&CO Law', ... }
 * ```
 */
@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Generate all SEO fields from title and content
   *
   * @param title - The post title
   * @param content - The HTML content
   * @param existingExcerpt - Optional existing excerpt to use instead of auto-generated
   * @returns Generated SEO fields
   */
  async generateSeoFields(
    title: string,
    content: string,
    existingExcerpt?: string,
  ): Promise<SeoFields> {
    const slug = await this.generateUniqueSlug(title);
    const metaTitle = this.generateMetaTitle(title);
    const plainText = this.stripHtml(content);
    const excerpt = existingExcerpt || this.generateExcerpt(plainText);
    const metaDescription = this.generateMetaDescription(excerpt);
    const readTime = this.generateReadTime(plainText);

    return { slug, metaTitle, metaDescription, readTime, excerpt };
  }

  /**
   * Generate a URL-safe slug from title, ensuring uniqueness in DB
   *
   * @param title - The post title
   * @returns Unique slug string
   */
  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200);

    const adminClient = this.supabaseService.getAdminClient();

    // Check if slug exists
    const { data } = await adminClient
      .from('blog_posts')
      .select('slug')
      .like('slug', `${baseSlug}%`);

    if (!data || data.length === 0) {
      return baseSlug;
    }

    const existingSlugs = new Set(
      data.map((row: { slug: string }) => row.slug),
    );

    if (!existingSlugs.has(baseSlug)) {
      return baseSlug;
    }

    // Append suffix: -2, -3, etc.
    let counter = 2;
    while (existingSlugs.has(`${baseSlug}-${counter}`)) {
      counter++;
    }

    return `${baseSlug}-${counter}`;
  }

  /**
   * Generate meta title: title + " | AR&CO Law", truncated to 60 chars
   */
  generateMetaTitle(title: string): string {
    const suffix = ' | AR&CO Law';
    if (title.length + suffix.length <= 60) {
      return title + suffix;
    }
    return title.slice(0, 60 - suffix.length - 3) + '...' + suffix;
  }

  /**
   * Generate meta description from excerpt, truncated to 155 chars
   */
  generateMetaDescription(excerpt: string): string {
    if (excerpt.length <= 155) {
      return excerpt;
    }
    return excerpt.slice(0, 152) + '...';
  }

  /**
   * Generate read time estimate: wordCount / 200, rounded up
   */
  generateReadTime(plainText: string): string {
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
  }

  /**
   * Generate excerpt from first paragraph of plain text
   */
  private generateExcerpt(plainText: string): string {
    const firstParagraph = plainText.split(/\n\n/)[0] || plainText;
    if (firstParagraph.length <= 300) {
      return firstParagraph;
    }
    return firstParagraph.slice(0, 297) + '...';
  }

  /**
   * Strip HTML tags from content to get plain text
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
