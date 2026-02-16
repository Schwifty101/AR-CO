import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import styles from './layout.module.css';

export const metadata = {
  title: 'Admin Dashboard | AR&CO Law Firm',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.atmosphereGlow} />
      <div className={styles.grainOverlay} />
      <div className={`${styles.content} flex min-h-screen flex-col`}>
        <DashboardHeader />
        <div className="flex flex-1">
          <DashboardSidebar userType="admin" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
