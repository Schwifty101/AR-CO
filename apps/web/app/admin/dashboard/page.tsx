'use client';

import { useAuth } from '@/lib/auth/use-auth';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || 'Admin'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Clients
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Cases
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending Appointments
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
      </div>
    </div>
  );
}
