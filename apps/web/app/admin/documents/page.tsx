'use client';

/**
 * Admin Documents List Page
 *
 * Displays paginated list of all documents with filtering by document type.
 * Staff can download and delete documents.
 *
 * @module AdminDocumentsPage
 *
 * @example
 * Accessible at /admin/documents
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState, useCallback } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Download, Trash2 } from 'lucide-react';
import {
  getDocuments,
  downloadDocument,
  deleteDocument,
  DocumentType,
  type DocumentResponse,
} from '@/lib/api/documents';

/** Document type badge color mapping */
const DOC_TYPE_COLORS: Record<string, string> = {
  [DocumentType.CONTRACT]: 'bg-blue-500 text-white',
  [DocumentType.AGREEMENT]: 'bg-indigo-500 text-white',
  [DocumentType.COURT_FILING]: 'bg-red-500 text-white',
  [DocumentType.EVIDENCE]: 'bg-orange-500 text-white',
  [DocumentType.CORRESPONDENCE]: 'bg-yellow-600 text-white',
  [DocumentType.INVOICE_DOCUMENT]: 'bg-emerald-500 text-white',
  [DocumentType.CLIENT_ID]: 'bg-purple-500 text-white',
  [DocumentType.OTHER]: 'bg-gray-500 text-white',
};

/** Items per page */
const PAGE_SIZE = 20;

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., '1.5 MB' or '256 KB')
 */
function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'N/A';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/**
 * Format date string for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Admin documents list page component
 */
export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<DocumentResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const data = await getDocuments({
        page: currentPage,
        limit: PAGE_SIZE,
        ...(typeFilter ? { documentType: typeFilter } : {}),
      });

      setDocuments(data.documents);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, typeFilter]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleClearFilters = () => {
    setTypeFilter('');
    setCurrentPage(1);
  };

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const { signedUrl } = await downloadDocument(doc.id);
      window.open(signedUrl, '_blank');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download document');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await deleteDocument(deleteTarget.id);
      toast.success(`Document "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      await loadDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Manage all uploaded documents across clients and cases
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter documents by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type-filter">Document Type</Label>
              <Select
                value={typeFilter || 'all'}
                onValueChange={(value) => {
                  setTypeFilter(value === 'all' ? '' : (value as DocumentType));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.values(DocumentType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading documents...'
              : `Showing ${documents.length} of ${total} total documents`}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Case</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 8 }).map((__, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">No documents found</h3>
                            <p className="text-sm text-muted-foreground">
                              No documents match the current filters.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {doc.name}
                          </TableCell>
                          <TableCell>
                            <Badge className={DOC_TYPE_COLORS[doc.documentType] || DOC_TYPE_COLORS[DocumentType.OTHER]}>
                              {doc.documentType.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {doc.clientName || <span className="text-muted-foreground">N/A</span>}
                          </TableCell>
                          <TableCell>
                            {doc.caseTitle || <span className="text-muted-foreground">N/A</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatFileSize(doc.fileSize)}
                          </TableCell>
                          <TableCell>
                            {doc.uploadedByName || <span className="text-muted-foreground">Unknown</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(doc.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownload(doc)}
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget(doc)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!isLoading && documents.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This will
              permanently remove the file from storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
