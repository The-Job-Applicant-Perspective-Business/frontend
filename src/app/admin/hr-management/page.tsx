import type { Metadata } from 'next';
import { AdminHrManagementWorkspace } from '@/components/admin/AdminHrManagementWorkspace';
import { AdminWorkspaceShell } from '@/components/admin/AdminWorkspaceShell';

export const metadata: Metadata = {
  title: 'HR Management',
  description: 'Manage registered employer HR accounts and company profiles.',
};

const AdminHrManagementPage = () => {
  return (
    <AdminWorkspaceShell pageTitle="HR management">
      <AdminHrManagementWorkspace />
    </AdminWorkspaceShell>
  );
};

export default AdminHrManagementPage;
