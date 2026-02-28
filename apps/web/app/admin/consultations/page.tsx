'use client';

/**
 * Admin Consultations Page
 *
 * Displays all consultation bookings in a paginated, filterable table.
 * Uses the existing ConsultationGuestsTable component.
 *
 * @module AdminConsultationsPage
 *
 * @example
 * Accessible at /admin/consultations
 * Requires authentication and admin/staff user type
 */

import ConsultationGuestsTable from '@/components/admin/ConsultationGuestsTable';

export default function AdminConsultationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
        <p className="text-muted-foreground">
          View and manage all consultation bookings
        </p>
      </div>

      <ConsultationGuestsTable />
    </div>
  );
}
