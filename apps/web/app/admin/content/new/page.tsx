'use client';

/**
 * Admin New Content Post Page
 *
 * Form to create a new blog post or case study from a Google Doc URL.
 * Auto-fetches the document, generates SEO fields, and saves as draft.
 *
 * @module AdminNewContentPage
 *
 * @example
 * Accessible at /admin/content/new
 * Requires authentication and admin/staff user type
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ArrowLeft, Loader2, ChevronDown, Info, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { createPost, getCategories } from '@/lib/api/content';
import { ContentType } from '@repo/shared';
import type { CategoryResponse } from '@repo/shared';

/** Service account email for Google Doc sharing */
const SERVICE_ACCOUNT_EMAIL = 'ar-co-201@ar-co-485513.iam.gserviceaccount.com';

/** No category sentinel value used in the select dropdown */
const NO_CATEGORY = '__none__';

/** Copy-to-clipboard button for the service account email */
function CopyEmailButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SERVICE_ACCOUNT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-11 w-11 shrink-0 border-2 border-destructive/30"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <Copy className="h-5 w-5" />
      )}
    </Button>
  );
}

/**
 * Admin new content post page component
 *
 * @example
 * ```tsx
 * // Rendered at /admin/content/new
 * <NewContentPage />
 * ```
 */
export default function NewContentPage() {
  const router = useRouter();

  // Form state
  const [googleDocUrl, setGoogleDocUrl] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.BLOG);
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories loaded from API
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Validation
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load categories',
        );
      } finally {
        setIsLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  /**
   * Handle form submission — validate and create a new content post
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);

    if (!googleDocUrl.trim()) {
      setUrlError('Google Doc URL is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createPost({
        googleDocUrl: googleDocUrl.trim(),
        contentType,
        categoryId: categoryId === NO_CATEGORY ? undefined : categoryId,
        isFeatured,
      });
      toast.success('Post created successfully');
      router.push(`/admin/content/${response.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create post',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Post</h1>
          <p className="text-muted-foreground">
            Create a new blog post or case study from a Google Doc
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/content">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
          </Link>
        </Button>
      </div>

      {/* Format Guide */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Google Doc Format Guide</CardTitle>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
              </div>
              <CardDescription>
                How to structure your Google Doc for blog posts and case studies
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              {/* Share Requirement */}
              <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-6 space-y-3">
                <h4 className="font-extrabold text-lg text-destructive">Required: Share Your Google Doc</h4>
                <p className="text-base text-foreground">
                  Before importing, you <strong>must</strong> share your Google Doc as <strong>Viewer</strong> with the following service account:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-background border-2 border-destructive/30 px-4 py-3 text-base font-bold select-all tracking-wide">
                    {SERVICE_ACCOUNT_EMAIL}
                  </code>
                  <CopyEmailButton />
                </div>
                <p className="text-sm text-muted-foreground">
                  Open your Google Doc → Click <strong className="text-foreground">Share</strong> → Paste the email above → Set role to <strong className="text-foreground">Viewer</strong> → Click <strong className="text-foreground">Send</strong>
                </p>
              </div>

              {/* SEO Mapping Explanation */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-3">
                <h4 className="font-bold text-base">How Your Doc Becomes SEO</h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li><strong className="text-foreground">Document Title</strong> → Page title, URL slug, meta title (appends &quot;| AR&CO Law&quot;)</li>
                  <li><strong className="text-foreground">First paragraph</strong> → Meta description (first 155 chars) &amp; excerpt (first 300 chars)</li>
                  <li><strong className="text-foreground">Word count</strong> → Read time estimate (words ÷ 200)</li>
                  <li><strong className="text-foreground">All formatting</strong> → Bold, italic, links, lists, tables, and headings preserved as HTML</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blog Post Format */}
                <div className="space-y-3">
                  <h4 className="font-bold text-base">Blog Post Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Structure your Google Doc following this layout for optimal SEO results.
                  </p>
                  <div className="rounded-lg bg-muted p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed">
{`Your Blog Post Title
→ Keep under 55 characters
→ Include your main keyword naturally

[Opening paragraph — CRITICAL]
Summarize the entire post in 2-3
sentences. The first 155 characters
become your meta description shown
in Google search results.

Heading 2: First Section Title
Use 4-6 Heading 2s per post.
Include relevant keywords in headings.
Write 2-4 paragraphs per section.

• Use bullet lists for key points
• Bold important terms
• Add links to relevant resources

Heading 2: Second Section Title
Continue with your content...

Heading 3: Subsection (if needed)
Use Heading 3 for subsections under
a Heading 2.

Heading 2: Conclusion / Key Takeaways
Summarize main points and include
a call to action for the reader.`}
                  </div>
                </div>

                {/* Case Study Format */}
                <div className="space-y-3">
                  <h4 className="font-bold text-base">Case Study Template</h4>
                  <p className="text-sm text-muted-foreground">
                    The &quot;Key Facts&quot; section with bold labels is auto-extracted as structured metadata.
                  </p>
                  <div className="rounded-lg bg-muted p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed">
{`Case Study Title
→ Format: "[Outcome] for [Industry]"
   e.g. "Successful Merger for
   Textile Manufacturer"

[Opening paragraph — case summary]
2-3 sentences: who, what problem,
what result. First 155 chars become
the meta description.

Heading 2: Key Facts
Client: Company or Individual Name
Industry: e.g. Textiles, Banking
Duration: e.g. 6 months
Year: 2026
Practice Area: e.g. Corporate Law
Tags: Corporate Law, Mergers, SECP

→ Use Bold for each label above
→ All fields are auto-extracted

Heading 2: Challenge
What legal problem did the client
face? Context and stakes.

Heading 2: Our Approach
What strategy did AR&CO employ?
Key legal actions taken.

Heading 2: Outcome
Concrete results and achievements.
→ This section is auto-extracted
   as the case result.

Heading 2: Client Testimonial
(Optional) Direct quote from client.`}
                  </div>
                </div>
              </div>

              {/* SEO Best Practices */}
              <div className="rounded-lg border bg-muted/50 p-5 space-y-3">
                <h4 className="font-bold text-base">SEO Best Practices</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <p>• <strong className="text-foreground">Title:</strong> Under 55 characters with primary keyword</p>
                  <p>• <strong className="text-foreground">Opening paragraph:</strong> Under 155 chars for meta description</p>
                  <p>• <strong className="text-foreground">Headings:</strong> Use 4-6 Heading 2s with keywords</p>
                  <p>• <strong className="text-foreground">Word count:</strong> 800-2000 words (4-10 min read)</p>
                  <p>• <strong className="text-foreground">Links:</strong> 2-3 internal links, 1-2 external sources</p>
                  <p>• <strong className="text-foreground">Lists:</strong> Use bullets/numbers for scannability</p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Create Post Form */}
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>
            Paste a Google Doc URL and we will automatically fetch the content,
            generate a slug, and populate SEO fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google Doc URL */}
            <div className="space-y-2">
              <Label htmlFor="googleDocUrl">Google Doc URL *</Label>
              <Input
                id="googleDocUrl"
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                value={googleDocUrl}
                onChange={(e) => {
                  setGoogleDocUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
              />
              {urlError && (
                <p className="text-sm text-destructive">{urlError}</p>
              )}
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(v) => setContentType(v as ContentType)}
              >
                <SelectTrigger id="contentType">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContentType.BLOG}>Blog Post</SelectItem>
                  <SelectItem value={ContentType.CASE_STUDY}>
                    Case Study
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={isLoadingCategories}
              >
                <SelectTrigger id="category">
                  <SelectValue
                    placeholder={
                      isLoadingCategories
                        ? 'Loading categories...'
                        : 'Select a category'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>None</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={isFeatured}
                onCheckedChange={(checked) =>
                  setIsFeatured(checked === true)
                }
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Featured post
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Post...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/content')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
