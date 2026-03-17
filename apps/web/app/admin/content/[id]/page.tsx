'use client';

/**
 * Admin Edit Content Post Page
 *
 * Edit a blog post or case study -- modify SEO fields, change status,
 * re-sync from Google Doc, or delete.
 *
 * @module AdminEditContentPage
 *
 * @example
 * Accessible at /admin/content/[id]
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState, use } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { updatePost, syncPost, deletePost, getCategories } from '@/lib/api/content';
import { getUsers, type UserProfile } from '@/lib/api/users';
import { getSessionToken } from '@/lib/api/auth-helpers';
import { ContentType, PostStatus } from '@repo/shared';
import type { ContentPostResponse, CategoryResponse } from '@repo/shared';
import { useAuth } from '@/lib/auth/use-auth';

/** No category sentinel value used in the select dropdown */
const NO_CATEGORY = '__none__';

/** Status badge colour map */
const STATUS_BADGE_CLASSES: Record<string, string> = {
  draft: 'bg-gray-500 text-white hover:bg-gray-500',
  published: 'bg-green-500 text-white hover:bg-green-500',
  archived: 'bg-yellow-500 text-white hover:bg-yellow-500',
};

/**
 * Fetch a single content post by ID via the admin posts endpoint.
 *
 * @param postId - UUID of the post to retrieve
 * @returns The matching ContentPostResponse or null if not found
 */
async function fetchPostById(
  postId: string,
): Promise<ContentPostResponse | null> {
  try {
    const token = await getSessionToken();
    const res = await fetch(`/api/content/posts/admin?page=1&limit=100`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: ContentPostResponse[] };
    return body.data?.find((p) => p.id === postId) ?? null;
  } catch {
    return null;
  }
}

/** Props for the edit content page (Next.js 16 async params) */
interface EditContentPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Admin edit content post page component
 *
 * @example
 * ```tsx
 * // Rendered at /admin/content/[id]
 * <EditContentPage params={Promise.resolve({ id: 'uuid' })} />
 * ```
 */
export default function EditContentPage({ params }: EditContentPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.userType === 'admin';

  // Data state
  const [post, setPost] = useState<ContentPostResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [authors, setAuthors] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Editable form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [categoryId, setCategoryId] = useState(NO_CATEGORY);
  const [contentType, setContentType] = useState<ContentType>(ContentType.BLOG);
  const [status, setStatus] = useState<PostStatus>(PostStatus.DRAFT);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  /**
   * Populate form fields from a post response object
   */
  const populateForm = (p: ContentPostResponse) => {
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt ?? '');
    setFeaturedImage(p.featuredImage ?? '');
    setAuthorId(p.authorId);
    setCategoryId(p.categoryId ?? NO_CATEGORY);
    setContentType(p.contentType);
    setStatus(p.status);
    setMetaTitle(p.metaTitle ?? '');
    setMetaDescription(p.metaDescription ?? '');
    setIsFeatured(p.isFeatured);
  };

  // Load post and categories on mount
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        setIsLoadingAuthors(isAdmin);

        const [fetchedPost, fetchedCategories, fetchedUsers] = await Promise.all([
          fetchPostById(id),
          getCategories(),
          isAdmin
            ? getUsers({
              page: 1,
              limit: 100,
              userTypes: ['admin', 'staff'],
            })
            : Promise.resolve(null),
        ]);

        if (!fetchedPost) {
          setError('Post not found');
          return;
        }

        setPost(fetchedPost);
        setCategories(fetchedCategories);
        if (fetchedUsers) {
          setAuthors(fetchedUsers.users);
        }
        populateForm(fetchedPost);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoadingAuthors(false);
        setIsLoading(false);
      }
    }

    load();
  }, [id, isAdmin]);

  /**
   * Save all editable fields to the backend
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updated = await updatePost(id, {
        title,
        slug,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || null,
        authorId: authorId && authorId !== post?.authorId ? authorId : undefined,
        categoryId: categoryId === NO_CATEGORY ? null : categoryId,
        contentType,
        status,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        isFeatured,
      });
      setPost(updated);
      populateForm(updated);
      toast.success('Post saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Re-sync content from the linked Google Doc
   */
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const synced = await syncPost(id);
      setPost(synced);
      populateForm(synced);
      toast.success('Post synced from Google Doc');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sync post');
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Delete the post after confirmation
   */
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.',
    );
    if (!confirmed) return;

    try {
      await deletePost(id);
      toast.success('Post deleted');
      router.push('/admin/content');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete post',
      );
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error / not found state ──
  if (error || !post) {
    return (
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/admin/content">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
          </Link>
        </Button>
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error || 'Post not found'}
        </div>
      </div>
    );
  }

  const selectedAuthorMissing =
    !!authorId && !authors.some((candidate) => candidate.id === authorId);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button variant="outline" size="sm" asChild className="mb-2">
            <Link href="/admin/content">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Content
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <p className="text-muted-foreground">
            Created {new Date(post.createdAt).toLocaleDateString()} | Views:{' '}
            {post.viewCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_BADGE_CLASSES[post.status] ?? ''}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
          {isAdmin && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── Basic Info Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Core post fields including title, slug, and category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isAdmin}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!isAdmin}
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post..."
              disabled={!isAdmin}
            />
          </div>

          {/* Featured Image URL */}
          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image URL</Label>
            <Input
              id="featuredImage"
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={!isAdmin}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="editAuthor">Author</Label>
              <Select
                value={authorId}
                onValueChange={setAuthorId}
                disabled={!isAdmin || isLoadingAuthors}
              >
                <SelectTrigger id="editAuthor">
                  <SelectValue
                    placeholder={isLoadingAuthors ? 'Loading authors...' : 'Select an author'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {selectedAuthorMissing && post.authorId && (
                    <SelectItem value={post.authorId}>
                      {post.authorName || 'Current author'}
                    </SelectItem>
                  )}
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.fullName} ({author.userType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="editCategory">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={!isAdmin}>
                <SelectTrigger id="editCategory">
                  <SelectValue placeholder="Select a category" />
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

            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="editContentType">Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(v) => setContentType(v as ContentType)}
                disabled={!isAdmin}
              >
                <SelectTrigger id="editContentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContentType.BLOG}>Blog Post</SelectItem>
                  <SelectItem value={ContentType.CASE_STUDY}>
                    Case Study
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="editFeatured"
              checked={isFeatured}
              onCheckedChange={(checked) => setIsFeatured(checked === true)}
              disabled={!isAdmin}
            />
            <Label htmlFor="editFeatured" className="cursor-pointer">
              Featured post
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* ── SEO Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
          <CardDescription>
            Search engine optimization fields for better discoverability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meta Title */}
          <div className="space-y-2">
            <Label htmlFor="metaTitle">
              Meta Title{' '}
              <span className="text-muted-foreground text-xs">
                ({metaTitle.length}/60)
              </span>
            </Label>
            <Input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={70}
              placeholder="SEO-friendly page title"
              disabled={!isAdmin}
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label htmlFor="metaDescription">
              Meta Description{' '}
              <span className="text-muted-foreground text-xs">
                ({metaDescription.length}/160)
              </span>
            </Label>
            <Textarea
              id="metaDescription"
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={170}
              placeholder="Concise description for search results..."
              disabled={!isAdmin}
            />
          </div>

          {/* Read Time (display only) */}
          {post.readTime && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Estimated Read Time</Label>
              <p className="text-sm">{post.readTime}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Status Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>Publication Status</CardTitle>
          <CardDescription>
            Control the visibility of this post
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editStatus">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as PostStatus)}
              disabled={!isAdmin}
            >
              <SelectTrigger id="editStatus" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PostStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={PostStatus.PUBLISHED}>Published</SelectItem>
                <SelectItem value={PostStatus.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {post.publishedAt && (
            <p className="text-sm text-muted-foreground">
              Published on{' '}
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Google Doc Card ── */}
      {post.googleDocUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Google Doc Source</CardTitle>
            <CardDescription>
              This post was imported from a Google Doc
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <a
                href={post.googleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline underline-offset-4 flex items-center gap-1"
              >
                Open Google Doc
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {(isAdmin || currentUser?.userType === 'attorney') && (
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-sync from Google Doc
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Content Preview Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>Content Preview</CardTitle>
          <CardDescription>
            Rendered HTML content of the post
          </CardDescription>
        </CardHeader>
        <CardContent>
          {post.content ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No content available. Try syncing from the Google Doc.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Danger Zone Card (admin only) ── */}
      {isAdmin && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions. Proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Post
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
