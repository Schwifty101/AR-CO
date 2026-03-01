import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { TestimonialsController } from './testimonials.controller';
import { LegalNewsController } from './legal-news.controller';
import { BlogService } from './blog.service';
import { GoogleDocsService } from './google-docs.service';
import { SeoService } from './seo.service';
import { TestimonialsService } from './testimonials.service';
import { LegalNewsService } from './legal-news.service';

/**
 * Content management module
 *
 * Manages blog posts, case studies (via content_type), testimonials, and legal news.
 * Integrates with Google Docs API for content creation and auto-generates SEO fields.
 *
 * @example
 * ```typescript
 * // Import in AppModule
 * import { ContentModule } from './content/content.module';
 *
 * @Module({ imports: [ContentModule] })
 * export class AppModule {}
 * ```
 */
@Module({
  controllers: [BlogController, TestimonialsController, LegalNewsController],
  providers: [
    BlogService,
    GoogleDocsService,
    SeoService,
    TestimonialsService,
    LegalNewsService,
  ],
  exports: [BlogService, TestimonialsService, LegalNewsService],
})
export class ContentModule {}
