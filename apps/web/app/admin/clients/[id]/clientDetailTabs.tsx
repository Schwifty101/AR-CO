'use client';

/**
 * Client Detail Tab Components
 *
 * Extracted tab content components for the admin client detail page.
 * Renders tables for cases, documents, and invoices associated with a client.
 *
 * @module ClientDetailTabs
 */

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/** Represents a case record returned by the aggregation endpoint */
export interface CaseRecord {
  id: string;
  case_number?: string;
  title?: string;
  status?: string;
  created_at?: string;
}

/** Represents a document record returned by the aggregation endpoint */
export interface DocumentRecord {
  id: string;
  title?: string;
  document_type?: string;
  created_at?: string;
}

/** Represents an invoice record returned by the aggregation endpoint */
export interface InvoiceRecord {
  id: string;
  invoice_number?: string;
  total_amount?: number;
  status?: string;
  due_date?: string;
}

/**
 * Format a date string into a human-readable format
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a company type enum value into a readable label
 *
 * @param companyType - Snake-case company type (e.g., "pvt_ltd")
 * @returns Human-readable label (e.g., "Pvt Ltd")
 */
export function formatCompanyType(companyType: string | null): string {
  if (!companyType) return '-';
  return companyType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format a currency amount with PKR prefix
 *
 * @param amount - Numeric amount
 * @returns Formatted currency string (e.g., "PKR 50,000")
 */
function formatCurrency(amount: number | undefined | null): string {
  if (amount == null) return '-';
  return `PKR ${amount.toLocaleString()}`;
}

/** Loading skeleton for the client profile card */
export function ProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Loading skeleton for tab table content */
function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 4 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Props for CasesTabContent */
interface CasesTabContentProps {
  cases: CaseRecord[];
  isLoading: boolean;
  isLoaded: boolean;
}

/**
 * Renders the cases tab content with a table of case records.
 *
 * @param props - Cases data, loading state, and loaded flag
 */
export function CasesTabContent({ cases, isLoading, isLoaded }: CasesTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cases</CardTitle>
        <CardDescription>Legal cases associated with this client</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : cases.length === 0 && isLoaded ? (
          <p className="text-center text-muted-foreground py-8">
            No cases found for this client.
          </p>
        ) : cases.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.case_number || '-'}
                    </TableCell>
                    <TableCell>{c.title || '-'}</TableCell>
                    <TableCell>
                      {c.status ? (
                        <Badge variant="outline">{c.status}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(c.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Props for DocumentsTabContent */
interface DocumentsTabContentProps {
  documents: DocumentRecord[];
  isLoading: boolean;
  isLoaded: boolean;
}

/**
 * Renders the documents tab content with a table of document records.
 *
 * @param props - Documents data, loading state, and loaded flag
 */
export function DocumentsTabContent({
  documents,
  isLoading,
  isLoaded,
}: DocumentsTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Documents uploaded for this client</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : documents.length === 0 && isLoaded ? (
          <p className="text-center text-muted-foreground py-8">
            No documents found for this client.
          </p>
        ) : documents.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.title || '-'}
                    </TableCell>
                    <TableCell>
                      {doc.document_type ? (
                        <Badge variant="outline">{doc.document_type}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(doc.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Props for InvoicesTabContent */
interface InvoicesTabContentProps {
  invoices: InvoiceRecord[];
  isLoading: boolean;
  isLoaded: boolean;
}

/**
 * Renders the invoices tab content with a table of invoice records.
 *
 * @param props - Invoices data, loading state, and loaded flag
 */
export function InvoicesTabContent({
  invoices,
  isLoading,
  isLoaded,
}: InvoicesTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Billing invoices for this client</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : invoices.length === 0 && isLoaded ? (
          <p className="text-center text-muted-foreground py-8">
            No invoices found for this client.
          </p>
        ) : invoices.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      {inv.invoice_number || '-'}
                    </TableCell>
                    <TableCell>{formatCurrency(inv.total_amount)}</TableCell>
                    <TableCell>
                      {inv.status ? (
                        <Badge variant="outline">{inv.status}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(inv.due_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
