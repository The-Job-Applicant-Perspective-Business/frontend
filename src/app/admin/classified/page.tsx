import type { Metadata } from 'next';
import { AdminClassifiedWorkspace } from '@/components/admin/AdminClassifiedWorkspace';
import { AdminWorkspaceShell } from '@/components/admin/AdminWorkspaceShell';

export const metadata: Metadata = {
  title: 'Classified Jobs',
  description: 'Review, moderate, and publish classified job postings.',
};

const AdminClassifiedPage = () => {
  return (
    <AdminWorkspaceShell pageTitle="Classified jobs">
      <AdminClassifiedWorkspace />
    </AdminWorkspaceShell>
  );
};

export default AdminClassifiedPage;
