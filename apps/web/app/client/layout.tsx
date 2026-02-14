import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import styles from './layout.module.css';

export const metadata = {
  title: 'Client Portal | AR&CO Law Firm',
};

export default function ClientLayout({
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
          <DashboardSidebar userType="client" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
