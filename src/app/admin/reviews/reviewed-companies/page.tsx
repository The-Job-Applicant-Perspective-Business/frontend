import type { Metadata } from 'next';
import { AdminReviewedCompaniesWorkspace } from '@/components/admin/AdminReviewedCompaniesWorkspace';
import { AdminWorkspaceShell } from '@/components/admin/AdminWorkspaceShell';

export const metadata: Metadata = {
  title: 'Reviewed Companies',
  description: 'Manage reviewed company profiles and consolidate duplicate company reviews.',
};

const AdminReviewedCompaniesPage = () => {
  return (
    <AdminWorkspaceShell pageTitle="Reviewed companies">
      <AdminReviewedCompaniesWorkspace />
    </AdminWorkspaceShell>
  );
};

export default AdminReviewedCompaniesPage;
