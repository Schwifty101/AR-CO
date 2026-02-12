'use client';

/**
 * Admin Client Detail Page
 *
 * Displays comprehensive client information including profile details,
 * cases, documents, and invoices in a tabbed layout.
 *
 * @module AdminClientDetailPage
 *
 * @example
 * Accessible at /admin/clients/[id]
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  getClientById,
  getClientCases,
  getClientDocuments,
  getClientInvoices,
  type ClientResponse,
} from '@/lib/api/clients';
import {
  ProfileSkeleton,
  CasesTabContent,
  DocumentsTabContent,
  InvoicesTabContent,
  formatDate,
  formatCompanyType,
  type CaseRecord,
  type DocumentRecord,
  type InvoiceRecord,
} from './clientDetailTabs';

/**
 * Admin client detail page component
 *
 * Fetches and displays a single client's profile, cases, documents,
 * and invoices. Tabs are lazy-loaded on first selection.
 */
export default function AdminClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  // Client profile state
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab data state
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesLoaded, setCasesLoaded] = useState(false);

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesLoaded, setInvoicesLoaded] = useState(false);

  // Fetch client profile on mount
  useEffect(() => {
    async function loadClient() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getClientById(clientId);
        setClient(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load client';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  /** Fetch cases for this client (lazy-loaded on tab select) */
  const loadCases = useCallback(async () => {
    if (casesLoaded || casesLoading) return;
    try {
      setCasesLoading(true);
      const data = await getClientCases(clientId);
      setCases(data as CaseRecord[]);
      setCasesLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load cases');
    } finally {
      setCasesLoading(false);
    }
  }, [clientId, casesLoaded, casesLoading]);

  /** Fetch documents for this client (lazy-loaded on tab select) */
  const loadDocuments = useCallback(async () => {
    if (documentsLoaded || documentsLoading) return;
    try {
      setDocumentsLoading(true);
      const data = await getClientDocuments(clientId);
      setDocuments(data as DocumentRecord[]);
      setDocumentsLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setDocumentsLoading(false);
    }
  }, [clientId, documentsLoaded, documentsLoading]);

  /** Fetch invoices for this client (lazy-loaded on tab select) */
  const loadInvoices = useCallback(async () => {
    if (invoicesLoaded || invoicesLoading) return;
    try {
      setInvoicesLoading(true);
      const data = await getClientInvoices(clientId);
      setInvoices(data as InvoiceRecord[]);
      setInvoicesLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setInvoicesLoading(false);
    }
  }, [clientId, invoicesLoaded, invoicesLoading]);

  // Auto-load cases when client is loaded (default tab)
  useEffect(() => {
    if (client && !casesLoaded && !casesLoading) {
      loadCases();
    }
  }, [client, casesLoaded, casesLoading, loadCases]);

  /** Handle tab change to trigger lazy loading */
  const handleTabChange = (value: string) => {
    if (value === 'cases') {
      loadCases();
    } else if (value === 'documents') {
      loadDocuments();
    } else if (value === 'invoices') {
      loadInvoices();
    }
  };

  // Error / not-found state
  if (!isLoading && error) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/clients')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl font-semibold mb-2">Client Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error === 'Failed to fetch client'
                ? 'The client you are looking for does not exist or has been removed.'
                : error}
            </p>
            <Button onClick={() => router.push('/admin/clients')}>
              Return to Clients List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/clients')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              client?.fullName ?? 'Client Details'
            )}
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-64 mt-1" />
            ) : (
              'Client profile and associated records'
            )}
          </p>
        </div>
      </div>

      {/* Client Profile Card */}
      {isLoading ? (
        <ProfileSkeleton />
      ) : client ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{client.fullName}</CardTitle>
                <CardDescription>
                  Registered on {formatDate(client.createdAt)}
                </CardDescription>
              </div>
              {client.companyType && (
                <Badge variant="secondary">
                  {formatCompanyType(client.companyType)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{client.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{client.phoneNumber || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="text-sm">{client.companyName || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-sm">
                    {[client.address, client.city, client.country]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tax ID</p>
                  <p className="text-sm">{client.taxId || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p className="text-sm">{formatDate(client.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Tabs for Cases, Documents, Invoices */}
      {!isLoading && client && (
        <Tabs defaultValue="cases" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          <TabsContent value="cases">
            <CasesTabContent
              cases={cases}
              isLoading={casesLoading}
              isLoaded={casesLoaded}
            />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsTabContent
              documents={documents}
              isLoading={documentsLoading}
              isLoaded={documentsLoaded}
            />
          </TabsContent>
          <TabsContent value="invoices">
            <InvoicesTabContent
              invoices={invoices}
              isLoading={invoicesLoading}
              isLoaded={invoicesLoaded}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
