'use client';

/**
 * Client Documents Page
 *
 * Displays a list of the authenticated client's documents with upload capability.
 * Includes upload dialog with file picker, name, type, and optional case association.
 *
 * @module ClientDocumentsPage
 *
 * @example
 * Accessible at /client/documents (requires authenticated client)
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/use-auth';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Upload, Download, X } from 'lucide-react';
import {
  getDocuments,
  uploadDocument,
  downloadDocument,
  DocumentType,
  type DocumentResponse,
} from '@/lib/api/documents';
import { getCases, type CaseResponse } from '@/lib/api/cases';

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

/** Max file size: 10MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed file types */
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

/**
 * Format file size for display
 */
function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'N/A';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Client documents page component
 */
export default function ClientDocumentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('');

  // Upload dialog state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState<DocumentType>(DocumentType.OTHER);
  const [uploadCaseId, setUploadCaseId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [clientCases, setClientCases] = useState<CaseResponse[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!authLoading) loadDocuments();
  }, [loadDocuments, authLoading]);

  // Load client's cases for the upload dialog dropdown
  useEffect(() => {
    if (authLoading) return;
    async function loadCases() {
      try {
        const data = await getCases({ page: 1, limit: 100 });
        setClientCases(data.cases);
      } catch {
        // Non-critical — cases dropdown will just be empty
      }
    }
    loadCases();
  }, [authLoading]);

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const { signedUrl } = await downloadDocument(doc.id);
      window.open(signedUrl, '_blank');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download document');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setUploadFile(file);
    if (!uploadName) {
      setUploadName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadName('');
    setUploadType(DocumentType.OTHER);
    setUploadCaseId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }
    if (!uploadName.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    try {
      setIsUploading(true);
      await uploadDocument(uploadFile, {
        name: uploadName.trim(),
        documentType: uploadType,
        ...(uploadCaseId ? { caseId: uploadCaseId } : {}),
      });
      toast.success('Document uploaded successfully');
      setShowUpload(false);
      resetUploadForm();
      await loadDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  // Redirect to signin when session is lost
  if (!authLoading && !user) {
    router.push('/auth/signin');
    return null;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your documents
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
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
              <Button
                variant="outline"
                onClick={() => { setTypeFilter(''); setCurrentPage(1); }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
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
                      <TableHead>Case</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((__, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">No documents found</h3>
                            <p className="text-sm text-muted-foreground">
                              You haven&apos;t uploaded any documents yet. Click &quot;Upload Document&quot; to get started.
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
                            {doc.caseTitle || <span className="text-muted-foreground">N/A</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatFileSize(doc.fileSize)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(doc.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc)}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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

      {/* Upload Dialog */}
      <Dialog
        open={showUpload}
        onOpenChange={(open) => {
          if (!open) {
            resetUploadForm();
          }
          setShowUpload(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Select a file and fill in the document details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* File picker */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">File</Label>
              {uploadFile ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{uploadFile.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatFileSize(uploadFile.size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setUploadFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </div>

            {/* Document name */}
            <div className="space-y-2">
              <Label htmlFor="doc-name">Document Name</Label>
              <Input
                id="doc-name"
                placeholder="Enter document name"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
              />
            </div>

            {/* Document type */}
            <div className="space-y-2">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select
                value={uploadType}
                onValueChange={(v) => setUploadType(v as DocumentType)}
              >
                <SelectTrigger id="doc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DocumentType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional case association */}
            <div className="space-y-2">
              <Label htmlFor="doc-case">Link to Case (Optional)</Label>
              <Select
                value={uploadCaseId || 'none'}
                onValueChange={(v) => setUploadCaseId(v === 'none' ? '' : v)}
              >
                <SelectTrigger id="doc-case">
                  <SelectValue placeholder="No case selected" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No case</SelectItem>
                  {clientCases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowUpload(false); resetUploadForm(); }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !uploadFile}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
