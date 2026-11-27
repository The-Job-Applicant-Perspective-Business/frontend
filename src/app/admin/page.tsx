import type { Metadata } from 'next';
import { AdminDashboardOverview, AdminWorkspaceShell } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Platform traffic telemetry and moderation metrics for The Job Applicant Perspective.',
};

const AdminDashboardPage = () => {
  return (
    <AdminWorkspaceShell pageTitle="Dashboard">
      <AdminDashboardOverview />
    </AdminWorkspaceShell>
  );
};

export default AdminDashboardPage;
