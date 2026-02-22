import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export const metadata = {
  title: 'Admin Dashboard | AR&CO Law Firm',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <div className="flex min-h-screen flex-col">
        <DashboardHeader userType="admin" />
        <div className="flex flex-1">
          <DashboardSidebar userType="admin" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
