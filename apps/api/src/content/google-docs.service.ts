import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, type docs_v1 } from 'googleapis';
import type { Configuration } from '../config/configuration';

/** Parsed content from a Google Doc */
export interface ParsedGoogleDoc {
  title: string;
  htmlContent: string;
  /** Case study metadata extracted from "Key Facts" section */
  caseStudyMetadata?: {
    outcome?: string;
    clientName?: string;
    duration?: string;
    year?: string;
    tags?: string[];
  };
}

/**
 * Service for fetching and converting Google Docs to HTML
 *
 * Uses a Google Cloud service account to read documents.
 * Converts the structured Google Docs JSON into clean HTML.
 *
 * @example
 * ```typescript
 * const parsed = await googleDocsService.fetchAndParse('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms');
 * // { title: 'My Blog Post', htmlContent: '<h2>Intro</h2><p>Content...</p>' }
 * ```
 */
@Injectable()
export class GoogleDocsService {
  private readonly logger = new Logger(GoogleDocsService.name);
  private docsClient: docs_v1.Docs | null = null;

  constructor(
    private readonly configService: ConfigService<Configuration>,
  ) {}

  /**
   * Extract Google Doc ID from various URL formats
   *
   * @param urlOrId - Google Doc URL or raw document ID
   * @returns The document ID
   * @throws {BadRequestException} If URL format is unrecognized
   *
   * @example
   * ```typescript
   * extractDocId('https://docs.google.com/document/d/1abc123/edit'); // '1abc123'
   * extractDocId('1abc123'); // '1abc123'
   * ```
   */
  extractDocId(urlOrId: string): string {
    // Already a raw ID (no slashes)
    if (!urlOrId.includes('/')) {
      return urlOrId.trim();
    }

    const match = urlOrId.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return match[1];
    }

    throw new BadRequestException(
      'Invalid Google Doc URL. Expected format: https://docs.google.com/document/d/{DOC_ID}/...',
    );
  }

  /**
   * Fetch a Google Doc and convert it to HTML
   *
   * @param docIdOrUrl - Google Doc ID or URL
   * @returns Parsed document with title, HTML content, and optional case study metadata
   * @throws {BadRequestException} If document cannot be fetched
   */
  async fetchAndParse(docIdOrUrl: string): Promise<ParsedGoogleDoc> {
    const docId = this.extractDocId(docIdOrUrl);
    this.logger.log(`Fetching Google Doc: ${docId}`);

    const client = this.getDocsClient();
    if (!client) {
      throw new BadRequestException(
        'Google Docs integration not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY env var.',
      );
    }

    try {
      const response = await client.documents.get({ documentId: docId });
      const doc = response.data;

      const title = doc.title || 'Untitled';
      const htmlContent = this.convertToHtml(doc);
      const caseStudyMetadata = this.extractCaseStudyMetadata(htmlContent);

      this.logger.log(`Successfully parsed Google Doc: ${title}`);
      return { title, htmlContent, caseStudyMetadata };
    } catch (error) {
      this.logger.error(`Failed to fetch Google Doc ${docId}`, error);
      throw new BadRequestException(
        'Failed to fetch Google Doc. Ensure the document is shared with the service account.',
      );
    }
  }

  /**
   * Convert Google Docs structured JSON to HTML
   */
  private convertToHtml(doc: docs_v1.Schema$Document): string {
    const content = doc.body?.content;
    if (!content) return '';

    const parts: string[] = [];
    let inList = false;

    for (const element of content) {
      if (element.paragraph) {
        const isBullet = !!element.paragraph.bullet;

        // Close list if we were in one and this isn't a bullet
        if (inList && !isBullet) {
          parts.push('</ul>');
          inList = false;
        }

        // Open list if this is a bullet and we're not in one
        if (isBullet && !inList) {
          parts.push('<ul>');
          inList = true;
        }

        parts.push(this.convertParagraph(element.paragraph));
      } else if (element.table) {
        if (inList) {
          parts.push('</ul>');
          inList = false;
        }
        parts.push(this.convertTable(element.table));
      }
    }

    // Close any open list
    if (inList) {
      parts.push('</ul>');
    }

    return parts.filter(Boolean).join('\n');
  }

  /**
   * Convert a Google Docs paragraph to HTML
   */
  private convertParagraph(paragraph: docs_v1.Schema$Paragraph): string {
    const style = paragraph.paragraphStyle?.namedStyleType;
    const elements = paragraph.elements || [];

    let text = '';
    for (const element of elements) {
      if (element.textRun) {
        text += this.convertTextRun(element.textRun);
      }
    }

    // Skip empty paragraphs
    if (!text.trim()) return '';

    // Handle horizontal rules (three dashes)
    if (text.trim() === '---' || text.trim() === '___') {
      return '<hr />';
    }

    // Map Google Docs heading styles to HTML tags
    switch (style) {
      case 'HEADING_1':
        return `<h1>${text}</h1>`;
      case 'HEADING_2':
        return `<h2>${text}</h2>`;
      case 'HEADING_3':
        return `<h3>${text}</h3>`;
      case 'HEADING_4':
        return `<h4>${text}</h4>`;
      default:
        // Check if this is a list item
        if (paragraph.bullet) {
          return `<li>${text}</li>`;
        }
        return `<p>${text}</p>`;
    }
  }

  /**
   * Convert a Google Docs text run to HTML with formatting
   */
  private convertTextRun(textRun: docs_v1.Schema$TextRun): string {
    let text = textRun.content || '';

    // Skip newline-only content
    if (text === '\n') return '';

    // Remove trailing newline and vertical tabs
    text = text.replace(/\n$/, '').replace(/\x0b/g, '');

    const style = textRun.textStyle;

    // Auto-link plain URLs that aren't already linked
    if (!style?.link?.url) {
      text = text.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1">$1</a>',
      );
    }

    if (!style) return text;

    // Apply formatting
    if (style.bold) text = `<strong>${text}</strong>`;
    if (style.italic) text = `<em>${text}</em>`;
    if (style.underline) text = `<u>${text}</u>`;
    if (style.strikethrough) text = `<s>${text}</s>`;

    // Handle links
    if (style.link?.url) {
      text = `<a href="${style.link.url}">${text}</a>`;
    }

    return text;
  }

  /**
   * Convert a Google Docs table to HTML
   */
  private convertTable(table: docs_v1.Schema$Table): string {
    const rows = table.tableRows || [];
    let html = '<table>';

    for (const row of rows) {
      html += '<tr>';
      for (const cell of row.tableCells || []) {
        const cellContent = (cell.content || [])
          .map((el) =>
            el.paragraph ? this.convertParagraph(el.paragraph) : '',
          )
          .filter(Boolean)
          .join('');
        html += `<td>${cellContent}</td>`;
      }
      html += '</tr>';
    }

    html += '</table>';
    return html;
  }

  /**
   * Extract case study metadata from "Key Facts" section in HTML
   */
  private extractCaseStudyMetadata(
    html: string,
  ): ParsedGoogleDoc['caseStudyMetadata'] | undefined {
    // Check if "Key Facts" section exists
    if (!html.includes('Key Facts')) return undefined;

    const metadata: NonNullable<ParsedGoogleDoc['caseStudyMetadata']> = {};

    // Extract outcome from "Outcome" section
    const outcomeMatch = html.match(
      /<h2>Outcome<\/h2>\s*([\s\S]*?)(?=<h[12]|$)/i,
    );
    if (outcomeMatch) {
      metadata.outcome = outcomeMatch[1]
        .replace(/<[^>]*>/g, '')
        .trim();
    }

    // Extract key facts (Client, Practice Area, Duration, Year, Tags)
    const extractField = (label: string): string | undefined => {
      const regex = new RegExp(
        `<strong>${label}:?</strong>\\s*(.+?)(?=<|$)`,
        'i',
      );
      const match = html.match(regex);
      return match ? match[1].trim() : undefined;
    };

    metadata.clientName = extractField('Client');
    metadata.duration = extractField('Duration');
    metadata.year = extractField('Year');

    const tagsStr = extractField('Tags');
    if (tagsStr) {
      metadata.tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    return metadata;
  }

  /**
   * Get or initialize the Google Docs API client
   */
  private getDocsClient(): docs_v1.Docs | null {
    if (this.docsClient) return this.docsClient;

    const keyBase64 = this.configService.get('google.serviceAccountKey', {
      infer: true,
    });

    if (!keyBase64) {
      this.logger.warn('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
      return null;
    }

    try {
      const credentials = JSON.parse(
        Buffer.from(keyBase64, 'base64').toString('utf-8'),
      );

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/documents.readonly'],
      });

      this.docsClient = google.docs({ version: 'v1', auth });
      return this.docsClient;
    } catch (error) {
      this.logger.error('Failed to initialize Google Docs client', error);
      return null;
    }
  }
}
