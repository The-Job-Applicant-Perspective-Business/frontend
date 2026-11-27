import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';

export const metadata: Metadata = {
  title: {
    default: 'The Job Applicant Perspective | Admin',
    template: '%s | The Job Applicant Perspective Admin',
  },
  description: 'Platform Administration Portal for The Job Applicant Perspective',
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#111827] antialiased">
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </div>
  );
};

export default AdminLayout;
