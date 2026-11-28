import type { Metadata } from 'next';
import { AdminReviewsWorkspace } from '@/components/admin/AdminReviewsWorkspace';
import { AdminWorkspaceShell } from '@/components/admin/AdminWorkspaceShell';

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'Moderate applicant reviews across approved and pending queues.',
};

const AdminReviewsPage = () => {
  return (
    <AdminWorkspaceShell pageTitle="Reviews">
      <AdminReviewsWorkspace />
    </AdminWorkspaceShell>
  );
};

export default AdminReviewsPage;
