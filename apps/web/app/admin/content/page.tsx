'use client';

/**
 * Admin Content List Page
 *
 * Displays paginated list of all blog posts and case studies with filtering.
 * Staff can filter by content type, status, category, and search.
 *
 * @module AdminContentPage
 *
 * @example
 * Accessible at /admin/content
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { FileText, Plus, Trash2 } from 'lucide-react';
import {
  getAdminPosts,
  getCategories,
  deletePost,
} from '@/lib/api/content';
import type {
  ContentPostResponse,
  CategoryResponse,
} from '@/lib/api/content';
import { ContentType, PostStatus } from '@repo/shared';

/** Post status badge color mapping */
const STATUS_COLORS: Record<PostStatus, string> = {
  [PostStatus.DRAFT]: 'bg-gray-500 text-white',
  [PostStatus.PUBLISHED]: 'bg-green-500 text-white',
  [PostStatus.ARCHIVED]: 'bg-yellow-500 text-white',
};

/** Items per page */
const PAGE_SIZE = 20;

/**
 * Format a date string into a human-readable short format
 *
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "Mar 1, 2026")
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Admin content list page component
 */
export default function AdminContentPage() {
  const router = useRouter();

  // Data states
  const [posts, setPosts] = useState<ContentPostResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [activeTab, setActiveTab] = useState<ContentType>(ContentType.BLOG);
  const [statusFilter, setStatusFilter] = useState<PostStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load categories once on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        // Categories are non-critical; swallow quietly
      }
    }
    loadCategories();
  }, []);

  /** Fetch admin posts with current filters and pagination */
  const loadPosts = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const data = await getAdminPosts({
        page: currentPage,
        limit: PAGE_SIZE,
        contentType: activeTab,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(categoryFilter ? { categoryId: categoryFilter } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
      });

      setPosts(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load content';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, activeTab, statusFilter, categoryFilter, searchQuery]);

  // Refetch when page or filters change
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  /** Handle tab change between Blogs and Case Studies */
  const handleTabChange = (value: string) => {
    setActiveTab(value as ContentType);
    setCurrentPage(1);
    setStatusFilter('');
  };

  /** Clear all active filters */
  const handleClearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  /** Navigate to post detail page */
  const handleRowClick = (postId: string) => {
    router.push(`/admin/content/${postId}`);
  };

  /** Delete a post after confirmation */
  const handleDelete = async (
    e: React.MouseEvent,
    postId: string,
    postTitle: string,
  ) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await deletePost(postId);
      toast.success('Post deleted successfully');
      loadPosts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      toast.error(message);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content</h1>
          <p className="text-muted-foreground">
            Manage blog posts and case studies
          </p>
        </div>
        <Link href="/admin/content/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Content type tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value={ContentType.BLOG}>Blogs</TabsTrigger>
          <TabsTrigger value={ContentType.CASE_STUDY}>Case Studies</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter content by status, category, or search term
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  setStatusFilter(value === 'all' ? '' : (value as PostStatus));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(PostStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={categoryFilter || 'all'}
                onValueChange={(value) => {
                  setCategoryFilter(value === 'all' ? '' : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-input">Search</Label>
              <Input
                id="search-input"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === ContentType.BLOG ? 'Blog Posts' : 'Case Studies'}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading content...'
              : `Showing ${posts.length} of ${total} total posts`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/15 p-4 text-destructive">
              {error}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : posts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">
                              No content found
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              No posts match the current filters. Try adjusting
                              or clearing the filters above.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      posts.map((post) => (
                        <TableRow
                          key={post.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(post.id)}
                        >
                          <TableCell className="font-medium max-w-[300px] truncate">
                            {post.title}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[post.status]}>
                              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {post.categoryName || (
                              <span className="text-muted-foreground">Uncategorized</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {post.authorName || (
                              <span className="text-muted-foreground italic">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {post.publishedAt
                              ? formatDate(post.publishedAt)
                              : <span className="text-muted-foreground">--</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {post.viewCount}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => handleDelete(e, post.id, post.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              {!isLoading && posts.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
