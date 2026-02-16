'use client';

/**
 * Admin Clients Page
 *
 * Tabbed page that provides two views:
 * - **Registered Clients** — existing clients with accounts (CRUD, search, filter)
 * - **Consultation Guests** — one-time consultation booking inquiries (read-only)
 *
 * The page header shows a dynamic subtitle based on the active tab.
 * A badge on the Consultation Guests tab shows the total count of bookings.
 *
 * @module AdminClientsPage
 *
 * @example
 * Accessible at /admin/clients
 * Requires authentication and admin/staff user type
 */

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import RegisteredClientsTable from '@/components/admin/RegisteredClientsTable';
import ConsultationGuestsTable from '@/components/admin/ConsultationGuestsTable';
import { getConsultations } from '@/lib/api/consultations';

/** Subtitle text displayed below the page title for each tab */
const TAB_SUBTITLES: Record<string, string> = {
  registered: 'Manage registered client accounts',
  consultations: 'View consultation booking inquiries',
};

/**
 * Admin clients page with tabbed layout for registered clients and consultation guests.
 *
 * @returns The admin clients page with Registered Clients and Consultation Guests tabs
 *
 * @example
 * ```tsx
 * // Rendered by Next.js at /admin/clients
 * <AdminClientsPage />
 * ```
 */
export default function AdminClientsPage() {
  const [activeTab, setActiveTab] = useState('registered');
  const [consultationCount, setConsultationCount] = useState<number | null>(null);

  // Fetch consultation count for the tab badge
  useEffect(() => {
    async function fetchCount() {
      try {
        const data = await getConsultations({ page: 1, limit: 1 });
        setConsultationCount(data.total);
      } catch {
        // Silently fail — badge just won't show
      }
    }
    fetchCount();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          {TAB_SUBTITLES[activeTab] ?? TAB_SUBTITLES.registered}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="registered">Registered Clients</TabsTrigger>
          <TabsTrigger value="consultations" className="gap-2">
            Consultation Guests
            {consultationCount !== null && consultationCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {consultationCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="registered">
          <RegisteredClientsTable />
        </TabsContent>
        <TabsContent value="consultations">
          <ConsultationGuestsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
