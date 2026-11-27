import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Sign in to The Job Applicant Perspective Admin portal.',
};

const AdminLoginPage = () => {
  return <AdminLoginForm />;
};

export default AdminLoginPage;
