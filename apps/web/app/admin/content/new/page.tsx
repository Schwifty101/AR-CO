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
import { ArrowLeft, Loader2, ChevronDown, Info } from 'lucide-react';
import Link from 'next/link';
import { createPost, getCategories } from '@/lib/api/content';
import { ContentType } from '@repo/shared';
import type { CategoryResponse } from '@repo/shared';

/** No category sentinel value used in the select dropdown */
const NO_CATEGORY = '__none__';

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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
              {/* Blog Post Format */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Blog Post</h4>
                <p className="text-xs text-muted-foreground">
                  Any standard Google Doc. The document title becomes the post title.
                  All content is converted to HTML automatically.
                </p>
                <div className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap">
{`Document Title (becomes post title)

Heading 2 style → <h2>
Heading 3 style → <h3>

Normal paragraph text.

Bold, Italic, Underline preserved.
Links preserved.
Bullet lists preserved.
Tables preserved.
--- becomes a horizontal rule.`}
                </div>
              </div>

              {/* Case Study Format */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Case Study</h4>
                <p className="text-xs text-muted-foreground">
                  Include a &quot;Key Facts&quot; section with bold labels. Metadata is
                  auto-extracted from these fields.
                </p>
                <div className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap">
{`Case Study Title

Heading 2: Key Facts
Bold Client: Company Name
Bold Duration: 6 months
Bold Year: 2026
Bold Tags: Corporate Law, Mergers

Heading 2: Background
Description of the case...

Heading 2: Approach
How the firm handled it...

Heading 2: Outcome
Results achieved for the client.`}
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
