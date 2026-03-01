'use client';

/**
 * Case Documents Section Component
 *
 * Displays documents linked to a case with upload, download, and optional delete.
 * Used in both admin and client case detail pages.
 *
 * @module CaseDocumentsSection
 *
 * @example
 * ```typescript
 * <CaseDocumentsSection caseId="uuid" allowDelete />
 * <CaseDocumentsSection caseId="uuid" />
 * ```
 */

import { useEffect, useState, useRef, useCallback } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Upload, Download, Trash2, X } from 'lucide-react';
import {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  DocumentType,
  type DocumentResponse,
} from '@/lib/api/documents';

/** Props for CaseDocumentsSection */
interface CaseDocumentsSectionProps {
  /** Case UUID to filter and upload documents for */
  caseId: string;
  /** Whether to show delete action (admin/staff only) */
  allowDelete?: boolean;
}

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

/** Max file size: 10MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed file MIME types */
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
 * Case documents section with upload, download, and optional delete
 */
export function CaseDocumentsSection({ caseId, allowDelete = false }: CaseDocumentsSectionProps) {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState<DocumentType>(DocumentType.OTHER);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<DocumentResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDocuments({ caseId, page: 1, limit: 100 });
      setDocuments(data.documents);
    } catch {
      toast.error('Failed to load case documents');
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

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
    setShowUploadForm(false);
    setUploadFile(null);
    setUploadName('');
    setUploadType(DocumentType.OTHER);
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
        caseId,
      });
      toast.success('Document uploaded successfully');
      resetUploadForm();
      await loadDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>
                {isLoading ? 'Loading...' : `${documents.length} document${documents.length !== 1 ? 's' : ''} linked to this case`}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant={showUploadForm ? 'outline' : 'default'}
              onClick={() => showUploadForm ? resetUploadForm() : setShowUploadForm(true)}
            >
              {showUploadForm ? 'Cancel' : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inline Upload Form */}
          {showUploadForm && (
            <div className="border rounded-md p-4 space-y-3 bg-muted/30">
              <div className="space-y-2">
                <Label>File</Label>
                {uploadFile ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-background">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{uploadFile.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(uploadFile.size)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to browse (PDF, DOC, DOCX, JPG, PNG — max 10MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    placeholder="Enter document name"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={uploadType} onValueChange={(v) => setUploadType(v as DocumentType)}>
                    <SelectTrigger>
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
              </div>

              <Button onClick={handleUpload} disabled={isUploading || !uploadFile} size="sm">
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          )}

          {/* Document List */}
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No documents linked to this case yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/30 transition-colors"
                >
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{doc.uploadedByName || 'Unknown'}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge className={DOC_TYPE_COLORS[doc.documentType] || DOC_TYPE_COLORS[DocumentType.OTHER]} >
                    {doc.documentType.replace(/_/g, ' ')}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    {allowDelete && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(doc)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {allowDelete && (
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
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
      )}
    </>
  );
}
